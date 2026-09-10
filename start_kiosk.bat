@echo off
chcp 65001 >nul 2>&1
title KITCHEN_UNIT - Kiosk Mode
color 0A

echo ========================================
echo        KITCHEN_UNIT
echo        Kiosk Mode
echo ========================================
echo.

cd /d "%~dp0"

:: Проверяем наличие сборки
if not exist "build" (
  echo [ERROR] Build not found!
  echo Please run: npm run build
  pause
  exit /b 1
)

:: Останавливаем предыдущие процессы
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im chrome.exe > nul 2>&1
timeout /t 2 /nobreak > nul

:: Запускаем сервер
echo Starting server...
start /B cmd /c "npx serve -s build -l 3000"
timeout /t 3 /nobreak > nul

:: Запускаем Chrome в киоск-режиме
echo Starting kiosk...
start chrome --kiosk --force-device-scale-factor=1 "http://localhost:3000"

echo.
echo ========================================
echo   KIOSK IS RUNNING
echo   To exit: Alt+F4
echo ========================================
echo.
echo Press any key to exit...
pause > nul

:: Очистка
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im chrome.exe > nul 2>&1