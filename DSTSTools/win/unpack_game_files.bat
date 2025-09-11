cd %1

rem core database

rem evo info
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\evolution.mbe ..\..\game_data_TS\unpacked\main\
rem main monster db
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\digimon_status.mbe ..\..\game_data_TS\unpacked\main\

rem jpn strings
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\digimon_profile.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\char_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\

rem jpn strings
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\digimon_profile.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSCSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\char_name.mbe ..\..\game_data_TS\unpacked\txt_eng\

xcopy /s /Y ..\..\game_data_TS\packed\main\images\ui_chara* ..\..\game_data_TS\unpacked\images\