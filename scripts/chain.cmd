@echo off
REM scripts\chain.cmd — run a chained command string using cmd.exe so `&&` works reliably
REM Usage: scripts\chain.cmd "command1 && command2 && command3"

if "%~1"=="" (
  echo Usage: %~nx0 "command1 && command2"
  exit /b 1
)

cmd /c "%~1"

