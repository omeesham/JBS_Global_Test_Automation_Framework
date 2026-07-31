---
name: playwright-decorators-modern-only
description: "Playwright's babel transpiler compiles decorators as TC39 2023-05 (modern), ignores tsconfig experimentalDecorators — legacy-signature decorators typecheck but break at runtime"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e7690fd2-7dcb-4086-be6d-3093e49d4687
  modified: 2026-07-31T07:55:58.834Z
---

Playwright (verified on 1.58.2 in this repo) transpiles page objects/specs with its bundled babel, which registers `@babel/plugin-proposal-decorators` with `{version: "2023-05"}` (single hit in `node_modules/playwright/lib/transform/babelBundleImpl.js`). Playwright reads tsconfig only for `paths`/`baseUrl` — `experimentalDecorators: true` is ignored at runtime.

**Consequence**: a legacy-signature decorator (`(target, propertyKey, descriptor)`) passes `tsc --noEmit` under `experimentalDecorators: true` but receives modern args (`(value, context)`) at runtime → broken while typecheck is green.

**How to apply**: any decorator in `clients/*/src/` must use the modern form `(originalMethod, context: ClassMethodDecoratorContext)`, with `experimentalDecorators`/`emitDecoratorMetadata` turned OFF in the client tsconfig (TS 5+ then typechecks standard decorators). Always prove a decorator with a real spec run, never tsc alone. Found during the audit of PLAN_FIX_AT_SOURCE_NOT_WRAPPERS (2026-07-31). Related: [[fix-at-source-not-through-a-wrapper]].
