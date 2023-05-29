@echo off
setlocal

if "%1"=="" (
    echo Usage: %0 port
    exit /b 1
)

set port=%1

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%port%') do (
    taskkill /f /pid %%a
)

echo Task on port %port% has been killed.