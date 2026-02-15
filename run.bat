@echo off
setlocal

REM Start backend (use node directly to avoid nodemon spawn issues on some systems)
start "LinkVault Backend" cmd /k "cd /d %~dp0backend && node server.js"

REM Start frontend (runner loader avoids esbuild config spawn issues)
start "LinkVault Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --configLoader runner"

REM Wait a moment, then open the site
timeout /t 3 >nul
start http://localhost:5173

endlocal
