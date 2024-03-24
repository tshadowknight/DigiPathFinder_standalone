npx electron-forge make --arch="ia32"
cd out 
7zip\7za.exe a -tzip DigiPathFinder-win32-ia32.zip ../README.md DigiPathFinder-win32-ia32 -xr!DigiPathFinder-win32-ia32\resources\game_data\unpacked -xr!DigiPathFinder-win32-ia32\resources\game_data\packed -xr!"DigiPathFinder-win32-ia32\resources\game_data\dds_cache.json"
Move-Item -Force -Path DigiPathFinder-win32-ia32.zip -Destination "E:\Google Drive\DigiPathFinder Standalone\Releases"	
cd..