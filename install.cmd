@echo off
REM bainary-skill installer for Windows CMD.exe
REM
REM Usage:
REM   Global:        install.cmd
REM   Project-local: install.cmd --local
REM
REM One-liner:
REM   powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/BainaryTD/bainary-skill/main/install.cmd -OutFile install.cmd; .\install.cmd --local"

setlocal
set "MODE=%~1"
set "PS_INSTALL_URL=https://raw.githubusercontent.com/BainaryTD/bainary-skill/main/install.ps1"
set "TMP_INSTALL=%TEMP%\bainary-skill-install.ps1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-RestMethod '%PS_INSTALL_URL%' -OutFile '%TMP_INSTALL%'"
if errorlevel 1 (
  echo [install] Failed to download install.ps1
  exit /b 1
)

if /I "%MODE%"=="--local" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_INSTALL%" -Local
) else if /I "%MODE%"=="-Local" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_INSTALL%" -Local
) else if /I "%MODE%"=="--global" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_INSTALL%" -Global
) else if /I "%MODE%"=="-Global" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_INSTALL%" -Global
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_INSTALL%"
)

endlocal
