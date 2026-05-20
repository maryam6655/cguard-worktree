@echo off
cd /d "C:\Users\HOME\Desktop\C Guard\c-guard-frontend.worktrees\copilot-worktree-2026-05-12T20-26-09"
echo Installing dependencies...
npm install
echo.
echo Starting dev server...
npm run dev -- --host
pause
