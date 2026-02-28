# Logs Directory

## What's Here

This directory contains test execution logs written by the framework's logger ([src/utils/logger.ts](../src/utils/logger.ts)).

**Expected files:**
- `test-execution.log` - All test run logs (appends continuously)
- `README.md` - This file (preserves the directory in git)

**Auto-cleanup:** The [cleanup-logs.ts](../scripts/cleanup-logs.ts) script runs automatically before every test via `pretest` hook and keeps the log file clean:
- Trims to last 5,000 lines when file exceeds 10,000 lines
- ~10,000 lines = ~30 days of typical test activity

---

## What Should NOT Be Here

❌ **Screenshots** → Belong in `reports/test-results/screenshots/` (written by [base-page.ts](../src/common/base-page.ts))  
❌ **Date-stamped logs** → Old winston system (removed Feb 2026)  
❌ **Audit JSON files** → Old winston-daily-rotate-file metadata (removed Feb 2026)  
❌ **Debug files** → Clean up manually or add to `.gitignore`

---

## Manual Cleanup

If you need to manually clean logs:

```powershell
# Clear all logs
npm run cleanup:logs

# Or manually delete the log file
Remove-Item logs/test-execution.log
```

The logger will recreate `test-execution.log` automatically on the next test run.

---

## How Logging Works

**Write:**
- Tests use `Log.info()`, `Log.error()`, `Log.warn()`, `Log.debug()` from [src/utils/logger.ts](../src/utils/logger.ts)
- Each call appends a timestamped line to `test-execution.log` AND prints to console

**Format:**
```
2026-02-12 14:30:45 [12345] INFO  AutomationFramework - Test message here
```

**Read:**
```powershell
# View live logs (Windows)
Get-Content logs/test-execution.log -Wait -Tail 50

# Search logs
Select-String -Path logs/test-execution.log -Pattern "ERROR"
```

---

## Retention Policy

| Log Type | Retention | Method |
|----------|-----------|--------|
| Test execution logs | ~30 days worth (10k lines) | Line-based trimming |
| Agent activity logs | 30 days exact | Time-based filtering |

Both managed by [scripts/cleanup-logs.ts](../scripts/cleanup-logs.ts) via `pretest` hook.
