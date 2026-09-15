@echo off
setlocal
set "ASTRO_DEV_BACKGROUND=1"
node "%~dp0..\node_modules\astro\bin\astro.mjs" dev %*
exit /b %ERRORLEVEL%
