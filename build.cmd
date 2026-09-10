@echo off
chcp 65001 >nul 2>&1
title KITCHEN_UNIT - Build
color 0A

echo ========================================
echo        KITCHEN_UNIT
echo   Building Production Version
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Проверка наличия картинок в assets...
if not exist "src\assets\background.png" (
  echo [ВНИМАНИЕ] background.png не найден!
)
if not exist "src\assets\scale.png" (
  echo [ВНИМАНИЕ] scale.png не найден!
)
if not exist "src\assets\slider.png" (
  echo [ВНИМАНИЕ] slider.png не найден!
)
echo.

echo [2/3] Удаление старой сборки...
if exist "build" (
  rmdir /s /q build
  echo Готово.
)
echo.

echo [3/3] Сборка проекта...
call npm run build

if %errorlevel% equ 0 (
  echo.
  echo ========================================
  echo   СБОРКА УСПЕШНО ЗАВЕРШЕНА!
  echo   Папка build готова к использованию
  echo ========================================
  echo.
  echo Запустите start-kiosk.cmd для киоск-режима
) else (
  echo.
  echo [ОШИБКА] Сборка не удалась!
)

echo.
pause