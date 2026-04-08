/**
 * Client Delivery Packaging Script
 *
 * Assembles a clean client-deliverable package from the framework.
 * Client gets: compiled dist/, their test specs, config, CI pipelines, scripts.
 * Client does NOT get: src/, agents, planning artifacts, internal docs, pipeline scripts.
 *
 * Usage:
 *   npx ts-node scripts/client-package.ts                    # Build + package
 *   npx ts-node scripts/client-package.ts --skip-build       # Package only (dist/ must exist)
 *   npx ts-node scripts/client-package.ts --client=acme      # Custom client name in output
 *   npx ts-node scripts/client-package.ts --out-dir=./output # Custom output directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ==================== CONFIGURATION ====================

const ROOT = process.cwd();

/** Parse CLI arguments */
function parseArgs(): { skipBuild: boolean; clientName: string; outDir: string } {
  const args = process.argv.slice(2);
  let skipBuild = false;
  let clientName = 'client';
  let outDir = path.join(ROOT, 'client-delivery');

  for (const arg of args) {
    if (arg === '--skip-build') skipBuild = true;
    if (arg.startsWith('--client=')) clientName = arg.split('=')[1]!;
    if (arg.startsWith('--out-dir=')) outDir = path.resolve(arg.split('=')[1]!);
  }

  return { skipBuild, clientName, outDir };
}

// ==================== FILES TO INCLUDE ====================

/** Directories to copy with their destination mapping */
const COPY_DIRS: Array<{ src: string; dest: string; exclude?: string[] }> = [
  { src: 'dist', dest: 'dist' },
  {
    src: 'tests',
    dest: 'tests',
    exclude: ['examples'],  // Internal examples -- not for client
  },
  { src: '.ci', dest: '.ci' },
  {
    src: 'scripts/setup',
    dest: 'scripts/setup',
  },
];

/** Individual files to copy (src -> dest relative to output dir) */
const COPY_FILES: Array<{ src: string; dest: string }> = [
  { src: 'playwright.config.ts', dest: 'playwright.config.ts' },
  { src: 'playwright.config.ci.ts', dest: 'playwright.config.ci.ts' },
  { src: 'config/environments/.env.example', dest: 'config/environments/.env.example' },
  { src: 'scripts/cleanup-logs.ts', dest: 'scripts/cleanup-logs.ts' },
  { src: 'src/selectors/SELECTOR_CATALOG.md', dest: 'src/selectors/SELECTOR_CATALOG.md' },
];

/** Directories to create empty (with .gitkeep) */
const EMPTY_DIRS = ['reports', 'logs', 'reports/test-results', 'tests/test-data/downloads'];

// ==================== CLIENT PACKAGE.JSON ====================

/** Scripts the client needs -- everything else is stripped */
const CLIENT_SCRIPTS: Record<string, string> = {
  'pretest': 'ts-node scripts/cleanup-logs.ts',
  'test': 'playwright test',
  'test:headed': 'playwright test --headed',
  'test:chrome': 'playwright test --project=chrome',
  'test:firefox': 'playwright test --project=firefox',
  'test:webkit': 'playwright test --project=webkit',
  'test:debug': 'playwright test --debug',
  'test:ui': 'playwright test --ui',
  'report': 'playwright show-report',
  'allure:generate': 'npx allure generate reports/allure-results --clean -o reports/allure-report',
  'allure:open': 'npx allure open reports/allure-report',
  'setup': 'npm install && npx playwright install',
  'setup:browsers': 'npx playwright install chromium firefox webkit',
  'clean': 'rimraf reports/* logs/* && node scripts/ensure-report-dirs.js',
  'cleanup:logs': 'ts-node scripts/cleanup-logs.ts',
  'typecheck': 'tsc --noEmit',
  'lint': 'eslint . --ext .ts',
  'format': 'prettier --write "**/*.{ts,json,md}"',
};

// ==================== IMPORT REWRITING ====================

/**
 * Patterns to rewrite in client files: change src/ imports -> dist/ imports.
 * Order matters -- more specific patterns must come first.
 */
const IMPORT_REWRITES: Array<{ pattern: RegExp; replacement: string }> = [
  // tests/specs/**  -- depth 3 (../../../src/ -> ../../../dist/)
  { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/src\//g, replacement: "from '../../../dist/" },
  // tests/setup/**  -- depth 2 (../../src/ -> ../../dist/)
  { pattern: /from\s+['"]\.\.\/\.\.\/src\//g, replacement: "from '../../dist/" },
  // scripts/**      -- depth 1 (../src/ -> ../dist/)
  { pattern: /from\s+['"]\.\.\/src\//g, replacement: "from '../dist/" },

  // require('../../scripts/...') stays as-is (scripts ship to client)
  // require('../../src/...') -> require('../../dist/...')
  { pattern: /require\(\s*['"]\.\.\/\.\.\/src\//g, replacement: "require('../../dist/" },
];

// ==================== CLIENT TSCONFIG ====================

function generateClientTsconfig(): object {
  return {
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022', 'dom'],
      module: 'commonjs',
      moduleResolution: 'node',
      rootDir: './',
      noEmit: true,
      declaration: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: false,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      skipLibCheck: true,
      baseUrl: './',
      paths: {
        '@pages/*': ['dist/pages/*'],
        '@utils/*': ['dist/utils/*'],
        '@common/*': ['dist/common/*'],
        '@data/*': ['dist/data/*'],
        '@tests/*': ['tests/*'],
        '@config/*': ['config/*'],
        '@types/*': ['dist/framework-contracts/*'],
        '@selectors/*': ['dist/selectors/*'],
      },
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      resolveJsonModule: true,
    },
    include: [
      'tests/**/*.ts',
      'scripts/**/*.ts',
      'dist/**/*.d.ts',
    ],
    exclude: [
      'node_modules',
    ],
  };
}

// ==================== CLIENT GITIGNORE ====================

const CLIENT_GITIGNORE = `# Node / TypeScript
node_modules/
npm-debug.log
yarn-error.log
yarn.lock
pnpm-lock.yaml
*.tsbuildinfo

# Playwright
reports/test-results/
playwright-report/
playwright/.cache/
.playwright/

# Logs
logs/
*.log
!logs/.gitkeep
*.out

# Reports
reports/
!reports/.gitkeep
allure-results/
allure-report/
html-report/
screenshots/
!screenshots/.gitkeep

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# IDEs
.idea/
.vscode/

# Testing
coverage/

# Downloads
tests/test-data/downloads/
!tests/test-data/downloads/.gitkeep

# Credentials
*credentials*
*token*
`;

// ==================== CLIENT README ====================

function generateClientReadme(clientName: string): string {
  return `# Encore Test Automation Framework

## Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install chromium

# 3. Configure environment
cp config/environments/.env.example config/environments/.env.development
# Credentials are pre-configured — edit URLs if needed

# 4. Run tests
npm test                    # All tests
npm run test:chrome         # Chrome only
npm run test:headed         # UI visible
npm run test:debug          # Debug mode
\`\`\`

## Project Structure

\`\`\`
+-- dist/                   <- Compiled framework (JS + type definitions)
+-- tests/
|   +-- setup/              <- Test fixtures, global setup/teardown
|   +-- specs/              <- Test specifications
+-- config/
|   +-- environments/       <- Environment config (.env files)
+-- .ci/                    <- CI pipeline configs (Jenkins, Azure)
+-- scripts/                <- Utility scripts
+-- reports/                <- Test reports + Playwright artifacts (auto-generated)
|   +-- test-results/       <- Playwright artifacts (traces, screenshots, videos)
+-- logs/                   <- Execution logs (auto-generated)
\`\`\`

## Key Commands

| Command | Description |
|---------|-------------|
| \`npm test\` | Run all tests |
| \`npm run test:chrome\` | Chrome browser only |
| \`npm run test:headed\` | Run with browser visible |
| \`npm run test:debug\` | Debug mode with inspector |
| \`npm run report\` | Open HTML test report |
| \`npm run typecheck\` | Validate TypeScript |
| \`npm run clean\` | Clear reports/logs/results |

## Environment Configuration

Copy \`.env.example\` to \`.env.development\` and set:

- \`BASE_URL\` -- Application URL
- \`HOME_URL\` -- Post-login landing URL
- \`NAVIGATOR_USERNAME\` -- Microsoft SSO email
- \`NAVIGATOR_PASSWORD\` -- Microsoft SSO password
- \`NAVIGATOR_MFA_SECRET\` -- Base32 TOTP seed for MFA

## CI Integration

See \`.ci/README.md\` for Jenkins and Azure DevOps pipeline setup.
`;
}

// ==================== UTILITY FUNCTIONS ====================

/** Recursively copy a directory, optionally excluding subdirectories */
function copyDirRecursive(src: string, dest: string, excludeDirs: string[] = []): void {
  if (!fs.existsSync(src)) {
    console.warn(`  [WARN]  Source directory not found, skipping: ${src}`);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) {
        console.log(`    Excluding: ${entry.name}/`);
        continue;
      }
      copyDirRecursive(srcPath, destPath, []);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Copy a single file, creating parent directories as needed */
function copyFile(src: string, dest: string): void {
  const srcFull = path.join(ROOT, src);
  const destFull = path.join(dest);

  if (!fs.existsSync(srcFull)) {
    console.warn(`  [WARN]  Source file not found, skipping: ${src}`);
    return;
  }

  fs.mkdirSync(path.dirname(destFull), { recursive: true });
  fs.copyFileSync(srcFull, destFull);
}

/** Rewrite src/ imports to dist/ imports in all .ts files under a directory */
function rewriteImports(dir: string): void {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      rewriteImports(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      for (const { pattern, replacement } of IMPORT_REWRITES) {
        // Reset regex lastIndex for global patterns
        pattern.lastIndex = 0;
        if (pattern.test(content)) {
          pattern.lastIndex = 0;
          content = content.replace(pattern, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`    Rewrote imports: ${path.relative(dir, fullPath)}`);
      }
    }
  }
}

/** Generate a scrubbed package.json for client delivery */
function generateClientPackageJson(): object {
  const srcPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));

  return {
    name: srcPkg.name || 'encore-test-framework',
    version: srcPkg.version || '1.0.0',
    description: 'Playwright Test Automation Framework',
    private: true,
    license: 'UNLICENSED',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: CLIENT_SCRIPTS,
    keywords: srcPkg.keywords || [],
    engines: srcPkg.engines || { node: '>=18.0.0' },
    dependencies: srcPkg.dependencies || {},
    devDependencies: srcPkg.devDependencies || {},
  };
}

/** Create empty directory with .gitkeep */
function createEmptyDir(baseDir: string, relativePath: string): void {
  const dirPath = path.join(baseDir, relativePath);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, '.gitkeep'), '', 'utf-8');
}

// ==================== MAIN ====================

async function main(): Promise<void> {
  const { skipBuild, clientName, outDir } = parseArgs();

  console.log('+==========================================================+');
  console.log('|          Encore Framework -- Client Packager             |');
  console.log('+==========================================================+');
  console.log(`  Client:  ${clientName}`);
  console.log(`  Output:  ${outDir}`);
  console.log('');

  // Step 1: Build
  if (!skipBuild) {
    console.log('[build] Step 1/7: Building framework (tsc -p tsconfig.build.json)...');
    try {
      execSync('npx rimraf dist && npx tsc -p tsconfig.build.json', {
        cwd: ROOT,
        stdio: 'inherit',
      });
      console.log('  [OK] Build succeeded\n');
    } catch {
      console.error('  [ERR] Build failed. Fix TypeScript errors and retry.');
      process.exit(1);
    }
  } else {
    console.log('[skip] Step 1/7: Skipping build (--skip-build)\n');
    if (!fs.existsSync(path.join(ROOT, 'dist'))) {
      console.error('  [ERR] dist/ directory not found. Run build first or remove --skip-build.');
      process.exit(1);
    }
  }

  // Step 2: Clean output directory
  console.log('Step 2/7: Cleaning output directory...');
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });
  console.log('  [OK] Clean\n');

  // Step 3: Copy directories
  console.log('Step 3/7: Copying directories...');
  for (const dirSpec of COPY_DIRS) {
    const srcPath = path.join(ROOT, dirSpec.src);
    const destPath = path.join(outDir, dirSpec.dest);
    console.log(`  Copying: ${dirSpec.src}/ -> ${dirSpec.dest}/`);
    copyDirRecursive(srcPath, destPath, dirSpec.exclude || []);
  }
  console.log('  [OK] Directories copied\n');

  // Step 4: Copy individual files
  console.log('Step 4/7: Copying files...');
  for (const fileSpec of COPY_FILES) {
    console.log(`  Copying: ${fileSpec.src}`);
    copyFile(fileSpec.src, path.join(outDir, fileSpec.dest));
  }
  console.log('  [OK] Files copied\n');

  // Step 5: Generate config files
  console.log('Step 5/7: Generating client configs...');

  // package.json
  const clientPkg = generateClientPackageJson();
  fs.writeFileSync(
    path.join(outDir, 'package.json'),
    JSON.stringify(clientPkg, null, 2) + '\n',
    'utf-8'
  );
  console.log('  Generated: package.json');

  // tsconfig.json
  const clientTsconfig = generateClientTsconfig();
  fs.writeFileSync(
    path.join(outDir, 'tsconfig.json'),
    JSON.stringify(clientTsconfig, null, 2) + '\n',
    'utf-8'
  );
  console.log('  Generated: tsconfig.json');

  // .gitignore
  fs.writeFileSync(path.join(outDir, '.gitignore'), CLIENT_GITIGNORE, 'utf-8');
  console.log('  Generated: .gitignore');

  // README.md
  fs.writeFileSync(
    path.join(outDir, 'README.md'),
    generateClientReadme(clientName),
    'utf-8'
  );
  console.log('  Generated: README.md');

  // Create empty output directories
  for (const dir of EMPTY_DIRS) {
    createEmptyDir(outDir, dir);
  }
  console.log('  Created empty dirs: reports/, logs/, reports/test-results/, config/secrets/');
  console.log('  [OK] Configs generated\n');

  // Step 6: Rewrite imports (src/ -> dist/)
  console.log('Step 6/7: Rewriting imports (src/ -> dist/)...');
  rewriteImports(path.join(outDir, 'tests'));
  rewriteImports(path.join(outDir, 'scripts'));
  console.log('  [OK] Imports rewritten\n');

  // Step 7: Validate output
  console.log('[OK] Step 7/7: Validating package...');
  const errors: string[] = [];

  // Must exist
  const mustExist = [
    'dist/index.js',
    'dist/index.d.ts',
    'tests/setup/fixtures.ts',
    'package.json',
    'tsconfig.json',
    'playwright.config.ts',
    '.gitignore',
    'README.md',
  ];
  for (const f of mustExist) {
    if (!fs.existsSync(path.join(outDir, f))) {
      errors.push(`Missing required file: ${f}`);
    }
  }

  // Must NOT exist (IP protection + internal-only content)
  // Note: api-testing/ is omitted intentionally -- not copied by COPY_DIRS,
  //       but may be included in future client deliveries.
  const mustNotExist = [
    'src',
    'specs_planning',
    '.github',
    'export_test_cases',
    'tests/examples',
    'seed.spec.ts',
    'docs',
  ];
  for (const f of mustNotExist) {
    if (fs.existsSync(path.join(outDir, f))) {
      errors.push(`Proprietary content leaked: ${f}`);
    }
  }

  // Verify no src/ imports remain in client files
  const srcImportCheck = findSrcImports(path.join(outDir, 'tests'));
  const scriptImportCheck = findSrcImports(path.join(outDir, 'scripts'));
  if (srcImportCheck.length > 0) {
    errors.push(`Unrewritten src/ imports in tests: ${srcImportCheck.join(', ')}`);
  }
  if (scriptImportCheck.length > 0) {
    errors.push(`Unrewritten src/ imports in scripts: ${scriptImportCheck.join(', ')}`);
  }

  // Verify no source maps in dist/
  const sourceMaps = findFiles(path.join(outDir, 'dist'), '.js.map');
  if (sourceMaps.length > 0) {
    errors.push(`Source maps found in dist/ (IP leak): ${sourceMaps.length} files`);
  }

  if (errors.length > 0) {
    console.error('\n  [ERR] Validation failed:');
    for (const err of errors) {
      console.error(`    * ${err}`);
    }
    process.exit(1);
  }

  // Count files
  const fileCount = countFiles(outDir);

  console.log('  [OK] All validations passed\n');
  console.log('+==========================================================+');
  console.log('|                  Package Complete                       |');
  console.log('+==========================================================+');
  console.log(`  Output:     ${outDir}`);
  console.log(`  Files:      ${fileCount}`);
  console.log('');
  console.log('  To verify:');
  console.log(`    cd "${outDir}"`);
  console.log('    npm install');
  console.log('    npx playwright install chromium');
  console.log('    npx playwright test --project=chrome');
  console.log('');
}

// ==================== VALIDATION HELPERS ====================

/** Find .ts files that still import from src/ (should be rewritten to dist/) */
function findSrcImports(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSrcImports(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Match import from '...src/...' or require('...src/...')
      if (/(?:from\s+['"]|require\(\s*['"])(?:\.\.\/)*src\//.test(content)) {
        results.push(path.relative(dir, fullPath));
      }
    }
  }
  return results;
}

/** Find files with a specific extension recursively */
function findFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Count all files recursively */
function countFiles(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// Run
main().catch((err) => {
  console.error('[ERR] Packaging failed:', err);
  process.exit(1);
});
