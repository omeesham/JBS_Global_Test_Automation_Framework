@echo off
:: Restart loop for dev services — called by start-dev.bat
:: Usage: restart-loop.bat "ServiceName" "command to run"
setlocal

set "NAME=%~1"
set "CMD=%~2"

:loop
echo [%NAME%] Starting...
%CMD%
echo [%NAME%] Exited. Restarting in 3s...
timeout /t 3 /nobreak >nul
goto loop
