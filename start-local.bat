@echo off
setlocal
cd /d "%~dp0"

echo Hashimoto Keiba AI - Private Local Launcher
echo Repository stays Private. GitHub Pages is not required.
echo.

set "CURRENT_FILE=private-local.html"
set "LAUNCH_TARGET=%~dp0%CURRENT_FILE%"

echo Opening: %CURRENT_FILE%
echo Launch target: %LAUNCH_TARGET%
echo.

start "" "%LAUNCH_TARGET%"

exit /b 0
