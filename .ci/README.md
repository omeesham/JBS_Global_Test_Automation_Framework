# CI/CD Configuration Files

This folder contains Continuous Integration and Continuous Deployment pipeline configurations.

## Files

### Jenkins Pipelines

- **Jenkinsfile.ubuntu** - Jenkins pipeline for Linux/Ubuntu environments  
- **Jenkinsfile.windows** - Jenkins pipeline for Windows environments

Both Jenkinsfiles support:
- Environment selection (dev/staging/production)
- Browser selection (chrome/firefox/webkit/all)
- Parallel execution
- HTML, JSON, JUnit, and Allure reporting
- Artifact archival
- Email notifications on failure

### Azure DevOps

- **azure-pipelines.yml** - Azure Pipelines configuration

Supports:
- Multi-environment testing (dev/staging/production)
- Cross-platform testing (Windows/Linux)
- Multi-browser testing (Chrome/Firefox/WebKit)
- Scheduled daily runs (2 AM)
- Pull request validation
- Test result publishing

## Usage

### Jenkins

Point Jenkins to this repository and specify:
- Ubuntu jobs: `.ci/Jenkinsfile.ubuntu`
- Windows jobs: `.ci/Jenkinsfile.windows`

### Azure DevOps

Azure Pipelines will automatically detect `.ci/azure-pipelines.yml` when configured.

### GitHub Actions

GitHub Actions workflows are located in `.github/workflows/` (separate from this folder).

## Environment Variables

All pipelines use `CI_ENV` (or `NODE_ENV`) to switch environments. Encore runs a single environment: e2e (default).
- `e2e` - Uses `clients/encore/.env.e2e`

## Reports

All pipelines generate:
- HTML reports: `reports/html-report/`
- Allure reports: `reports/allure-results/`
- JUnit XML: `reports/junit-results.xml`
- JSON results: `reports/test-results.json`
