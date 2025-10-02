cd %1

rem core database

rem evo info
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\evolution.mbe ..\..\game_data_TS\unpacked\main\
rem main monster db
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\digimon_status.mbe ..\..\game_data_TS\unpacked\main\

.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\battle_skill.mbe ..\..\game_data_TS\unpacked\main\	

.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\main\data\battle_buff.mbe ..\..\game_data_TS\unpacked\main\	

rem jpn strings
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\digimon_profile.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\char_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\skill_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\jogress_skill_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\skill_explanation.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\skill_auto_explanation.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\generation_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\digimon_type.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\element.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\personality_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\item_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\belong.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\digimon_class_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\buff_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_jpn\text\status_name.mbe ..\..\game_data_TS\unpacked\txt_jpn\



rem eng strings
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\digimon_profile.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\char_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\skill_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\jogress_skill_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\skill_explanation.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\skill_auto_explanation.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\generation_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\digimon_type.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\element.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\personality_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\item_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\belong.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\digimon_class_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\buff_name.mbe ..\..\game_data_TS\unpacked\txt_eng\
.\DSTSToolsCLI.exe --mbeextract ..\..\game_data_TS\packed\txt_eng\text\status_name.mbe ..\..\game_data_TS\unpacked\txt_eng\


xcopy /s /Y ..\..\game_data_TS\packed\main\images\ui_chara* ..\..\game_data_TS\unpacked\images\