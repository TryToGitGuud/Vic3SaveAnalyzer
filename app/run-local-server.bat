@echo off
setlocal
cd /d "%~dp0"
if exist "%~dp0runtime\node\node.exe" (
  "%~dp0runtime\node\node.exe" local-server.cjs
) else (
  node local-server.cjs
)
