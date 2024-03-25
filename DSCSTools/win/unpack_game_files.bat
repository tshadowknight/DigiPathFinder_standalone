cd %1

xcopy /s /Y ..\..\game_data\clean\text ..\..\game_data\unpacked

xcopy /s /Y ..\..\game_data\clean\data ..\..\game_data\unpacked



.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\digimon_list.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\evolution_next_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\digimon_farm_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\lvup_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\evolution_condition_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\digimon_common_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\mon_cpl.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\map_encount_param.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\map_encount_param_add.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\battle_command.mbe ..\..\game_data\unpacked


.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\field_area_para.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\data\field_area_para_add.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\skill_name.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\skill_content_name.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\charname.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\support_skill_name.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\support_skill_content_name.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\digimon_book_explanation.mbe ..\..\game_data\unpacked

.\DSCSToolsCLI.exe --mbeextract ..\..\game_data\packed\text\fieldname.mbe ..\..\game_data\unpacked


xcopy /s /Y ..\..\game_data\clean\images\ui_chara* ..\..\game_data\unpacked\images\

xcopy /s /Y ..\..\game_data\packed\images\ui_chara* ..\..\game_data\unpacked\images\