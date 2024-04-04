@echo off
cd ~/Downloads/animextract
bsi_anim.exe %1

For %%A in ("%1") do (
    Set Name=%%~nA
)

echo %Name%

node flipnscale.js ./%Name%.smd

del %Name%.smd

PAUSE
