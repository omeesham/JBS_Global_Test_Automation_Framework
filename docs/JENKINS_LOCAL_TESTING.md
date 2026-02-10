# Jenkins Local Testing Guide

**Last Updated:** 2026-02-10
**Purpose:** Test Jenkins integration locally without Git dependency
**Audience:** Framework developers and QA engineers testing Jenkins setup

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Options](#setup-options)
4. [Option A: Direct Filesystem Copy](#option-a-direct-filesystem-copy-local-testing)
5. [Option B: Local Git Repository](#option-b-local-git-repository-production-ready)
6. [Expected Output](#expected-output)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Overview

This guide helps you **test Jenkins integration locally** before deploying to production. It supports two scenarios:

- **Local Testing (No Git):** Copy framework files directly to Jenkins workspace
- **Production Testing (With Git):** Use local Git repository with SCM checkout

Both scenarios work with the same Jenkinsfile thanks to flexible checkout logic.

---

## Prerequisites

### Required Software

- ✅ **Jenkins installed locally** (Windows or Ubuntu)
- ✅ **Node.js** (v18 or higher)
- ✅ **Framework files** at: `C:\Users\rutvi\projects\hybrid_framework` (or custom path)

### Jenkins Setup

1. **Start Jenkins:**
   ```batch
   # Windows
   net start jenkins

   # Ubuntu
   sudo systemctl start jenkins
   ```

2. **Access Jenkins UI:**
   - Open browser: `http://localhost:8080`
   - Login with admin credentials

3. **Install Required Plugins:**
   - Navigate to: **Manage Jenkins → Plugin Manager → Available**
   - Install:
     - Pipeline
     - JUnit Plugin
     - HTML Publisher Plugin
     - Git Plugin (optional for Option B)

---

## Setup Options

Choose the approach that fits your testing needs:

| Option | Use Case | Git Required | Jenkinsfile Used |
|--------|----------|--------------|------------------|
| **A** | Quick local testing | ❌ No | Custom inline script |
| **B** | Production-ready testing | ✅ Yes | `.ci/Jenkinsfile.windows` |

---

## Option A: Direct Filesystem Copy (Local Testing)

**Best for:** Quick validation without Git setup

### Step 1: Create Jenkins Job

1. **Jenkins Dashboard → New Item**
2. **Enter name:** `hybrid-framework-local-test`
3. **Select:** Pipeline
4. **Click:** OK

### Step 2: Configure Pipeline Script

1. **Pipeline section → Definition:** Pipeline script
2. **Paste this script:**

   ```groovy
   pipeline {
       agent { label 'built-in' }

       parameters {
           choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Environment to run tests against')
           choice(name: 'BROWSER', choices: ['chromium', 'chrome', 'firefox', 'webkit'], description: 'Browser to run tests')
       }

       environment {
           NODE_ENV = "${params.ENVIRONMENT}"
           PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\ms-playwright"
       }

       stages {
           stage('Checkout') {
               steps {
                   // Copy from local filesystem
                   bat '''
                       echo ==========================================
                       echo Copying framework from local path
                       echo Source: C:\\Users\\rutvi\\projects\\hybrid_framework
                       echo Target: %WORKSPACE%
                       echo ==========================================
                       xcopy /E /I /Y "C:\\Users\\rutvi\\projects\\hybrid_framework\\*" "%WORKSPACE%"
                   '''

                   // Display build info (no Git required)
                   bat '.ci\\git-info.bat'
               }
           }

           stage('Install Dependencies') {
               steps {
                   bat 'node --version'
                   bat 'npm --version'
                   bat 'npm clean-install'
               }
           }

           stage('Install Playwright Browsers') {
               steps {
                   bat 'npx playwright install --with-deps'
               }
           }

           stage('Run Tests') {
               steps {
                   bat """
                       set NODE_ENV=${params.ENVIRONMENT}
                       npx playwright test --config=playwright.config.ci.ts --project=${params.BROWSER}
                   """
               }
           }
       }

       post {
           always {
               junit 'reports/junit-results.xml'
               publishHTML([
                   allowMissing: false,
                   alwaysLinkToLastBuild: true,
                   keepAll: true,
                   reportDir: 'reports/html-report',
                   reportFiles: 'index.html',
                   reportName: 'Playwright HTML Report'
               ])
               archiveArtifacts artifacts: 'reports/**,test-results/**', allowEmptyArchive: true
           }
       }
   }
   ```

   **For Ubuntu/Linux:**
   - Replace `bat` with `sh`
   - Replace backslashes (`\`) with forward slashes (`/`)
   - Replace `xcopy` with `cp -r`
   - Example: `sh 'cp -r /home/user/projects/hybrid_framework/* $WORKSPACE'`

3. **Click:** Save

### Step 3: Run Build

1. **Click:** Build with Parameters
2. **Select:**
   - **ENVIRONMENT:** dev
   - **BROWSER:** chromium
3. **Click:** Build
4. **Monitor:** Console Output

### Step 4: Verify Results

**Check console output for:**
```
✓ Copying framework from local path
✓ Git info unavailable (timeout or not a git repo)  ← Expected, non-blocking
✓ npm clean-install completed
✓ Tests passed
```

**View reports:**
- **JUnit Report:** Jenkins → Job → Test Results
- **HTML Report:** Jenkins → Job → Playwright HTML Report

---

## Option B: Local Git Repository (Production-Ready)

**Best for:** Testing with production Jenkinsfile

### Step 1: Verify Git Repository

1. **Check Git status:**
   ```batch
   cd C:\Users\rutvi\projects\hybrid_framework
   git status
   ```

2. **Ensure committed changes:**
   ```batch
   git log -1
   # Should show latest commit
   ```

### Step 2: Create Jenkins Job

1. **Jenkins Dashboard → New Item**
2. **Enter name:** `hybrid-framework-git-test`
3. **Select:** Pipeline
4. **Click:** OK

### Step 3: Configure SCM

1. **Pipeline section → Definition:** Pipeline script from SCM
2. **SCM:** Git
3. **Repository URL:** `file:///C:/Users/rutvi/projects/hybrid_framework`
   - **Ubuntu:** `file:///home/user/projects/hybrid_framework`
   - **Note:** Use forward slashes even on Windows
4. **Branch Specifier:** `*/main` (or your branch name)
5. **Script Path:** `.ci/Jenkinsfile.windows`
   - **Ubuntu:** `.ci/Jenkinsfile.ubuntu`
6. **Click:** Save

### Step 4: Run Build

1. **Click:** Build with Parameters
2. **Select:**
   - **ENVIRONMENT:** dev
   - **BROWSER:** chromium
3. **Click:** Build
4. **Monitor:** Console Output

### Step 5: Verify Results

**Check console output for:**
```
✓ Checked out from SCM (Git repository)
==========================================
Git Repository Information
==========================================
Last Commit: b287e5f refactor: Organize repository structure
Branch: main
Commit Hash: b287e5f
==========================================
✓ Tests passed
```

---

## Expected Output

### With Git (Option B)

```
[Checkout] Running shell script
+ Checked out from SCM (Git repository)
==========================================
Git Repository Information
==========================================
Last Commit: b287e5f refactor: Organize repository structure
Branch: main
Commit Hash: b287e5f
==========================================

[Install Dependencies] Running shell script
+ node --version
v20.11.0
+ npm --version
10.4.0
+ npm clean-install
...

[Run Tests] Running shell script
Running 5 tests using 1 worker
  ✓ Login with valid credentials (5.2s)
  ✓ Home page loads successfully (2.1s)
...
5 passed (12.3s)
```

### Without Git (Option A)

```
[Checkout] Running shell script
==========================================
Copying framework from local path
Source: C:\Users\rutvi\projects\hybrid_framework
Target: C:\ProgramData\Jenkins\.jenkins\workspace\hybrid-framework-local-test
==========================================
15 File(s) copied
==========================================
Git Repository Information
==========================================
Last Commit: Git info unavailable (timeout or not a git repo)
Branch: unknown
Commit Hash: unknown
==========================================

[Install Dependencies] Running shell script
+ node --version
v20.11.0
...
[Rest same as Option B]
```

**Key Difference:**
- Option A shows "Git info unavailable" (expected and safe)
- Option B shows actual commit info from repository

**Both scenarios:**
- ✅ Continue successfully
- ✅ Run tests
- ✅ Generate reports
- ✅ Complete without blocking errors

---

## Troubleshooting

### Issue: "ERROR: script returned exit code 128"

**Cause:** Old Jenkinsfile without flexible checkout

**Solution:**
1. Ensure you're using the **updated Jenkinsfiles** from this repository
2. Check `.ci/Jenkinsfile.windows` has:
   ```groovy
   script {
       try {
           checkout scm
           echo "✓ Checked out from SCM (Git repository)"
       } catch (Exception e) {
           echo "⚠ SCM checkout skipped (local testing mode)"
       }
   }
   ```

3. If using Option A (filesystem copy), remove `checkout scm` entirely

---

### Issue: "xcopy: File not found"

**Cause:** Incorrect source path in pipeline script

**Solution:**
1. Verify framework path exists:
   ```batch
   dir "C:\Users\rutvi\projects\hybrid_framework"
   ```

2. Update pipeline script with correct path:
   ```groovy
   bat 'xcopy /E /I /Y "YOUR_ACTUAL_PATH\\*" "%WORKSPACE%"'
   ```

---

### Issue: "npm: command not found"

**Cause:** Node.js not in Jenkins PATH

**Solution:**
1. **Manage Jenkins → Global Tool Configuration → NodeJS**
2. **Add NodeJS → Name:** NodeJS 20
3. **Install automatically:** Check
4. **Version:** 20.11.0
5. **Save**

6. **Update Jenkinsfile to use NodeJS tool:**
   ```groovy
   tools {
       nodejs 'NodeJS 20'
   }
   ```

---

### Issue: Tests fail locally but pass in Jenkins

**Cause:** Different environment configurations

**Solution:**
1. **Check `.env.development` file exists** in framework root
2. **Verify environment variables:**
   ```batch
   # In Jenkins pipeline
   bat 'set | findstr PLAYWRIGHT'
   ```

3. **Compare with local:**
   ```batch
   # On your machine
   set | findstr PLAYWRIGHT
   ```

---

### Issue: Playwright browsers not found

**Cause:** Browsers installed in wrong location

**Solution:**
1. **Check browser path in Jenkinsfile:**
   ```groovy
   environment {
       PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\ms-playwright"
   }
   ```

2. **Verify browsers installed:**
   ```batch
   # In Jenkins console output
   npx playwright install --with-deps
   # Should show: Chromium 120.0.6099.28 (playwright build v1095) downloaded to ...
   ```

---

## Next Steps

### After Successful Local Testing

1. **Deploy to Production Jenkins:**
   - Use Option B setup (Pipeline from SCM)
   - Configure actual Git repository URL (GitHub, GitLab, Bitbucket)
   - Set up credentials for private repositories

2. **Configure Webhooks (Optional):**
   - GitHub: Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-server/github-webhook/`
   - Triggers: Push events, Pull request events

3. **Set Up Scheduled Builds (Optional):**
   - Job → Configure → Build Triggers → Build periodically
   - Schedule: `H 2 * * *` (daily at 2 AM)

4. **Client Deployment:**
   - Share `.ci/Jenkinsfile.windows` or `.ci/Jenkinsfile.ubuntu`
   - Provide setup instructions from `JENKINS_CI_SETUP.md`
   - Guide clients to use Option B (SCM checkout)

---

## Additional Resources

- **Main CI Setup Guide:** [JENKINS_CI_SETUP.md](JENKINS_CI_SETUP.md)
- **Framework Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Requirements:** [REQUIREMENTS.md](../REQUIREMENTS.md)
- **Jenkins Pipeline Syntax:** https://www.jenkins.io/doc/book/pipeline/syntax/
- **Playwright CI Docs:** https://playwright.dev/docs/ci

---

## Summary: Quick Reference

| Scenario | Command | Expected Outcome |
|----------|---------|------------------|
| **Local Test (No Git)** | Use Option A pipeline | Git info unavailable (non-blocking) |
| **Local Test (With Git)** | Use Option B with local repo | Shows commit info |
| **Production Deploy** | Use Option B with remote repo | Full SCM checkout |
| **Troubleshooting** | Check console output | Verify stage completion |

**Key Takeaway:** The updated Jenkinsfiles support both local testing and production deployment seamlessly. No Git dependency required for testing!

---

**End of Document**
