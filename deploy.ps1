npx electron-forge make --arch="ia32"
cd out 
7zip\7za.exe a -tzip DigiPathFinder-v4.0-win32-ia32.zip ../README.md DigiPathFinder-win32-ia32 
Move-Item -Force -Path DigiPathFinder-v4.0-win32-ia32.zip -Destination "E:\Google Drive\DigiPathFinder Standalone\Releases"	
cd..