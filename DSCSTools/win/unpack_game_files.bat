cd DSCSTools\win

.\DSCSToolsCLI.exe --extract %1 ..\..\game_data\packed

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\digimon_list.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\evolution_next_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\digimon_farm_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\skill_name.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\charname.mbe ..\..\game_data\unpacked

xcopy /s /Y ..\..\game_data\clean\images\ui_chara* ..\..\game_data\unpacked\images\

xcopy /s /Y ..\..\game_data\packed\images\ui_chara* ..\..\game_data\unpacked\images\