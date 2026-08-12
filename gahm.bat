@echo off
title GAHM Dev Menu
cd /d "%~dp0"

rem ------------------------------------------------------------
rem  GAHM - Wildlife Conflict Risk Engine
rem  Dev helper menu: launch, dependencies, tests, update, uninstall
rem  Requires Node.js 20+ and npm (bundled with Node)
rem ------------------------------------------------------------

if exist "%~dp0app\package.json" (
    set "_appdir=%~dp0app"
) else if exist "%~dp0package.json" (
    set "_appdir=%~dp0"
) else (
    echo [ERROR] The app folder with package.json was not found next to this script.
    echo         Expected: %~dp0app\package.json or %~dp0package.json
    pause
    exit /b 1
)
cd /d "%_appdir%"

:menu
cls
echo.
echo  ==================================================================
echo    GAHM - Wildlife Conflict Risk Engine      ^|  Developer Menu
echo  ==================================================================
echo.
echo    [1]  Launch the demo       Start dev server: http://localhost:5173
echo    [2]  Test dependencies     Node/npm check + install packages
echo    [3]  Run tests             Lint + type-check + production build
echo    [4]  Update                Verify, refresh packages, git commit
echo    [5]  Uninstall             Remove node_modules, dist, local git
echo    [6]  Quit
echo.
choice /c 123456 /n /m "  Choose an option [1-6]: "
set _opt=%errorlevel%
if "%_opt%"=="6" goto :quit
if "%_opt%"=="5" call :uninstall
if "%_opt%"=="4" call :update
if "%_opt%"=="3" call :tests
if "%_opt%"=="2" call :checkdeps
if "%_opt%"=="1" call :launch
goto :menu

rem ============================================================
rem  Option 1 - Launch
rem ============================================================
:launch
cls
call :checknode
if not "%_node_ok%"=="1" goto :nodemsg
if exist node_modules goto :have_deps
echo Dependencies not installed yet. Installing now...
call npm install
if errorlevel 1 goto :installfail
:have_deps
echo.
echo Starting the GAHM demo at http://localhost:5173
echo Open that address in your browser. Press Ctrl+C here to stop the server.
echo.
call npm run dev
echo.
echo Dev server stopped.
pause
goto :eof
:nodemsg
echo Cannot launch: Node.js was not found. Install Node.js 20+ from https://nodejs.org
pause
goto :eof
:installfail
echo Dependency install failed. Check your internet connection and try option 2 again.
pause
goto :eof

rem ============================================================
rem  Option 2 - Test dependencies
rem ============================================================
:checkdeps
cls
echo Checking the GAHM demo dependencies
echo -----------------------------------
echo.
call :checknode
where npm >nul 2>nul
if errorlevel 1 goto :npmmissing
echo npm version:
call npm --version
echo.
if exist node_modules goto :deps_ok
echo node_modules folder is missing. Installing dependencies now...
call npm install
if errorlevel 1 goto :installfail
:deps_ok
echo Installed packages:
call npm ls --depth=0
echo.
echo Dependency check complete - everything looks ready.
echo Tip: option 1 launches the app, option 3 runs the full test suite.
pause
goto :eof
:npmmissing
echo [ERROR] npm was not found on PATH. Install Node.js 20+ which bundles npm.
if not "%_node_ok%"=="1" echo Note: Node.js was also not found - same cause.
pause
goto :eof

rem ============================================================
rem  Option 3 - Run tests
rem ============================================================
:tests
cls
echo Running the GAHM test suite: lint + type-check + production build
echo -----------------------------------------------------------------
echo.
echo --- 1/2 Lint (oxlint) ---
call npm run lint
if errorlevel 1 goto :testfail
echo.
echo --- 2/2 Build (tsc + vite) ---
call npm run build
if errorlevel 1 goto :testfail
echo.
echo All checks passed - the demo is build-clean.
pause
goto :eof
:testfail
echo.
echo [FAILED] A check failed - see the messages above.
pause
goto :eof

rem ============================================================
rem  Option 4 - Update
rem ============================================================
:update
cls
echo Updating the GAHM demo
echo ----------------------
echo.
echo --- Step 1/2 Verify the code still passes (lint + build) ---
call npm run verify
if errorlevel 1 goto :updatefail
echo.
echo --- Step 2/2 Refresh installed packages ---
call npm update
echo.
echo Checking for anything still outdated (informational only):
call npm outdated
echo.
if exist .git goto :git_repo
echo No local git repository was found - skipping commit and push.
echo To deploy updates: push the app folder to GitHub, Netlify/Vercel redeploys automatically.
goto :update_done
:git_repo
echo Git repository found - creating a commit and pushing now...
call npm run update
:update_done
echo.
echo Update finished.
pause
goto :eof
:updatefail
echo.
echo [FAILED] Verification failed - update was aborted so the demo stays stable.
echo Fix the errors above, then run option 3 for details.
pause
goto :eof

rem ============================================================
rem  Option 5 - Uninstall
rem ============================================================
:uninstall
cls
echo Uninstalling the GAHM demo
echo --------------------------
echo.
echo This PERMANENTLY removes from the app folder:
echo   - node_modules   installed packages (several hundred MB)
echo   - dist           build output
echo   - .git .netlify   local git history and Netlify settings, if present
echo.
echo Your source code (src, package.json, docs) is NOT touched.
echo Any hosted site on Netlify/Vercel stays live until you delete it in their dashboard.
echo.
choice /c yn /n /m "Type y to uninstall for real, n to cancel: "
if errorlevel 2 goto :eof
echo.
call npm run uninstall-demo
echo.
echo Uninstall complete. Reinstall anytime with option 2.
pause
goto :eof

rem ============================================================
rem  Shared helper - check Node.js
rem  Sets _node_ok=1 when Node is available, stays 0 otherwise
rem ============================================================
:checknode
set _node_ok=0
where node >nul 2>nul
if errorlevel 1 goto :no_node
for /f "tokens=1 delims=." %%v in ('node -v') do set _major=%%v
set _major=%_major:v=%
echo Node.js %_major%.x found.
if %_major% LSS 20 echo   [WARNING] Node %_major% is below the recommended 20+ - upgrade if possible.
set _node_ok=1
goto :eof
:no_node
echo [ERROR] Node.js was not found on PATH.
echo Install Node.js 20 or newer from https://nodejs.org then reopen this menu.
goto :eof

rem ============================================================
rem  Quit
rem ============================================================
:quit
cls
echo Goodbye - thank you for demoing GAHM!
endlocal
exit /b