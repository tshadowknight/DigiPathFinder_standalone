
//game file management
if(isElectron()){
    module.exports = GameFileManagerTS;
}

function GameFileManagerTS(){


    const gameDataFolder = "game_data_TS";

    if(isElectron()){
        var fs = require('fs');
        var os = require('os');
        var pathLib = require('path');
    }


    GameFileManagerTS.prototype.getResourcesFolder = function(){
        if(__dirname.match(/.*\.asar$/)){
            return pathLib.dirname(__dirname);
        } else {
            return __dirname;
        }
    }

    const requiredFiles = [
         "main/digimon_status.mbe/00_digimon_status_data.csv",
    ];

    GameFileManagerTS.prototype.hasGameFiles = function(){
        let isKitValid = true;
        for(let file of requiredFiles){
            if (!fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked', file))) {
                isKitValid = false;
            }
        }
        return isKitValid;
    }

    const requiredGameFiles = [
        "app_0.dx11.mvgl",
        "app_text00.dx11.mvgl",
        "app_text01.dx11.mvgl",
    ];

    GameFileManagerTS.prototype.hasInstalledGameFiles = function(){
        let isKitValid = true;
        for(let file of requiredGameFiles){
            if (!fs.existsSync(pathLib.join(this.gameFilesPath, './gamedata', file))) {
                isKitValid = false;
            }
        }
        return isKitValid;
    }

    GameFileManagerTS.prototype.checkDirectories = function(){
        if (!fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder))) {
            fs.mkdirSync(pathLib.join(this.getResourcesFolder(), gameDataFolder));
        }
        if (!fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed'))) {
            fs.mkdirSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed'));
        }
        if (!fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked'))) {
            fs.mkdirSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked'));
        }
    }

    var defaultGamePath = "C:/Program Files (x86)/Steam/steamapps/common/Digimon Story Time Stranger Demo";
    GameFileManagerTS.prototype.gameFilesPath = localStorage.getItem("DigiPathFinder_game_file_path_TS") || defaultGamePath;

    GameFileManagerTS.prototype.updateGameFilesPath = function(path){
        this.gameFilesPath = path || defaultGamePath;
		localStorage.setItem("DigiPathFinder_game_file_path_TS", path || this.gameFilesPath);
    }

    var potentialLoadError = false;

    GameFileManagerTS.prototype.runCmd = function(cmd){
        const process = require('child_process');   
        let potentialLoadError = false;
        let exitCode;
        console.log(cmd);
        return new Promise(function(resolve, reject){
            var ls = process.exec(cmd);
            ls.stdout.on('data', function (data) {
                const batchResult = data.toString();
                console.log(data.toString());
                if(batchResult.indexOf("Error:") != -1){
                    potentialLoadError = true;
                }
            });
            ls.stderr.on('data', function (data) {
            console.log(data.toString());
            
            });
            ls.on('close', function (code) {
                exitCode = code;           
                finalize();
            });
            async function finalize(){
                resolve({
                    potentialLoadError: potentialLoadError,
                    exitCode: exitCode
                });
            }
        });
    }

    GameFileManagerTS.prototype.fetchGameFiles = async function(){	
    
            const process = require('child_process');   
            if(!this.hasInstalledGameFiles()){
                return;
            }
            const toolsFolder = "DSTSTools";

            let cmd;

            

            if(os.platform() === "win32"){
                let cmdDir = pathLib.join(this.getResourcesFolder(), toolsFolder, "/win");
                cmd = "\""+this.getResourcesFolder()+""+'\\'+toolsFolder+'\\win\\unpack_game_files.bat\" \"'+cmdDir+'\"  ';

                const exetractorPath = pathLib.join(this.getResourcesFolder(), toolsFolder, '/win/DSCSToolsCLI.exe');
                const dbFilePaths = [
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_0.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/main')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_text00.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/txt_jpn'), unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/txt_jpn')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_text01.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/txt_eng'), unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/txt_eng')},
                ]
              
                
                for(let pathInfo of dbFilePaths){
                    if(!fs.existsSync(pathInfo.unpacked)){
                        fs.mkdirSync(pathInfo.unpacked);
                    }
                    
                    const mainExtractCmd =  '"'+exetractorPath+'" --extract "' + pathInfo.in + '" "' + pathInfo.out + '"';
                    await this.runCmd(mainExtractCmd);
                }
                
                const requiredFiles = [
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/data'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/images'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/shaders'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/lua')
                ];

                let missingFiles = [];
                for(const entry of requiredFiles){
                    if(!fs.existsSync(entry)){
                        missingFiles.push(entry);
                    }
                }
                
                if (missingFiles.length) {
                    setLoaderError(localizationData[currentLocale].app.warn_no_extract); 
                    throw("Failed extract. Could not find '"+missingFiles.join(', ')+"' after extract.");
                }
                
                let result = await this.runCmd(cmd);
            } else if(os.platform() === "linux"){
                //let cmdDir = pathLib.join(this.getResourcesFolder(), toolsFolder, "/linux")
                //cmd =  "\""+this.getResourcesFolder()+""+'\\DSCSTools\\linux\\unpack_game_files.bat\"  \"'+cmdDir+'\" \"'+this.gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
                setLoaderError("Unsupported platform."); 
                throw("Unsupported platform.");
            } else {
                setLoaderError("Unsupported platform."); 
                throw("Unsupported platform.");
            }
            
            fs.rm(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/packed"), { recursive: true, force: true });
            await this.cachceDDSImages();    
        
    }

    GameFileManagerTS.prototype.cachceDDSImages = async function(){
        const convertedDir = pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked/images/converted");
        if(!fs.existsSync(convertedDir)){
            fs.mkdirSync(convertedDir);
        }
        const digimonListData = await this.parseGameFile("main/digimon_status.mbe/00_digimon_status_data");
        DDSCache = {};
        for(let entry of digimonListData.data){
            const digimonId = entry[digimonListData.headerLookup["id"]];
            const data = await convertDDSImage(digimonId);//prepopulate cache
            const imgId = String(digimonId).padStart(4, '0').replace(/^0/, 1);
            fs.writeFileSync(pathLib.join(convertedDir, "/ui_chara_icon_"+imgId+".png"), data);
        }
       //fs.writeFileSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/dds_cache.json'), JSON.stringify(DDSCacheTS));
    }

    GameFileManagerTS.prototype.parseGameFile = function(file){
        const _this = this;
        return new Promise(function(resolve, reject){
        
            
            const { parse } = require('csv-parse');
            const records = [];

            var csvData=[];
            fs.createReadStream(pathLib.join(_this.getResourcesFolder(), gameDataFolder, "/unpacked/"+file+".csv"))
                .pipe(parse({delimiter: ','}))
                .on('data', function(csvrow) {
                    //console.log(csvrow);
                    //do something with csvrow
                    records.push(csvrow);        
                })
                .on('end',function() {
                //do something with csvData
                    let headers = records.shift();
                    let headerLookup;
                    let fileKey = file+".csv";
                    if(hardDefinedHeadersTS[fileKey] && Object.keys(hardDefinedHeadersTS[fileKey]).length){
                        headerLookup = hardDefinedHeadersTS[fileKey]
                    } else {
                        throw "No header information for " + fileKey;
                    }

                    resolve({headerLookup: headerLookup, data: records});
                });
        });	
    }

    GameFileManagerTS.prototype.generateHeaders = async function(){
        let result = {};
        for(let file of requiredFiles){
            try {
                if(file != "images"){
                    result[file] = (await this.parseGameFile(file.replace(".csv", ""))).headerLookup;
                }
                
            } catch(e){
                
            }
            
        }
        console.log(result);
    }

    

    GameFileManagerTS.prototype.preparePathFinderData = async function(){
       if(!isElectron()){
            //const DDSCacheContent_A = await Promise.resolve($.get('https://tshadowknight.github.io/DigiPathFinder_standalone/dds_cache_a.txt'));
            //const DDSCacheContent_B = await Promise.resolve($.get('https://tshadowknight.github.io/DigiPathFinder_standalone/dds_cache_b.txt'));
            //DDSCache = JSON.parse(DDSCacheContent_A + DDSCacheContent_B);
            return await Promise.resolve($.getJSON('https://tshadowknight.github.io/DigiPathFinder_standalone/game_data/game_data.json'));
        }

        let digimonNames = {};
        let moveNames = {};
        let sigMoveNames = {};
        let moveDescriptions = {};
        const digimonListData = await this.parseGameFile("main/digimon_status.mbe/00_digimon_status_data");
        let validDigimon = {};

        const localizedStrings = [
            {
                locale: "English", 
                names: await this.parseGameFile("txt_eng/char_name.mbe/00_Sheet1"), 
                descriptions: await this.parseGameFile("txt_eng/digimon_profile.mbe/00_Sheet1"), 
                moveNames: await this.parseGameFile("txt_eng/skill_name.mbe/00_Sheet1"), 
                jogressMoveNames: await this.parseGameFile("txt_eng/jogress_skill_name.mbe/00_Sheet1"), 
                moveDescriptions: await this.parseGameFile("txt_eng/skill_explanation.mbe/00_Sheet1"), 
                autoMoveDescriptions: await this.parseGameFile("txt_eng/skill_auto_explanation.mbe/00_Sheet1"),  
                personalityNames: await this.parseGameFile("txt_eng/personality_name.mbe/00_Sheet1"),  
                itemNames: await this.parseGameFile("txt_eng/item_name.mbe/00_Sheet1"),  
                categoryNames: await this.parseGameFile("txt_eng/belong.mbe/00_Sheet1"),  
                classNames: await this.parseGameFile("txt_eng/digimon_class_name.mbe/00_Sheet1"),  
            },
            {
                locale: "Japanese", 
                names: await this.parseGameFile("txt_jpn/char_name.mbe/00_Sheet1"),
                descriptions: await this.parseGameFile("txt_jpn/digimon_profile.mbe/00_Sheet1"), 
                moveNames: await this.parseGameFile("txt_jpn/skill_name.mbe/00_Sheet1"), 
                jogressMoveNames: await this.parseGameFile("txt_jpn/jogress_skill_name.mbe/00_Sheet1"), 
                moveDescriptions: await this.parseGameFile("txt_jpn/skill_explanation.mbe/00_Sheet1"), 
                autoMoveDescriptions: await this.parseGameFile("txt_jpn/skill_auto_explanation.mbe/00_Sheet1"),   
                personalityNames: await this.parseGameFile("txt_jpn/personality_name.mbe/00_Sheet1"),  
                itemNames: await this.parseGameFile("txt_jpn/item_name.mbe/00_Sheet1"),  
                categoryNames: await this.parseGameFile("txt_jpn/belong.mbe/00_Sheet1"),  
                classNames: await this.parseGameFile("txt_jpn/digimon_class_name.mbe/00_Sheet1"),  
            }
        ];
        
        let strKeyLookup = {};
        let placeHolderNameLookup = {};//demo debug
        for(let entry of digimonListData.data){
            const dbId = entry[digimonListData.headerLookup["id"]];
            const strKey = entry[digimonListData.headerLookup["strKey"]];
            strKeyLookup[strKey] = dbId;
            placeHolderNameLookup[dbId] = strKey;
        }
        

        let evolutions = {};
        const evolutionData = await this.parseGameFile("main/evolution.mbe/01_evolution_to");
        for(let entry of evolutionData.data){
            const fromId = escapeHTML(entry[evolutionData.headerLookup["idFrom"]]);
            const toId = escapeHTML(entry[evolutionData.headerLookup["idTo"]]);
            validDigimon[fromId] = true; //remove filtering to accomodate more mod types
            validDigimon[toId] = true; //remove filtering to accomodate more mod types
            if(!evolutions[fromId]){
                evolutions[fromId] = {
                    prev: [],
                    next: []
                }
            }
            if(!evolutions[toId]){
                evolutions[toId] = {
                    prev: [],
                    next: []
                }
            }
            evolutions[fromId].next.push(toId);
            evolutions[toId].prev.push(fromId);
        }
        let skillTextIds = {};
        let digimonDescriptions = {};
        let personalityNames = {};
        let itemNames = {};
        let categoryNames = {};
        let classNames = {};

        function substituteDescriptionText(txt){
            return txt.replace(/\{.*?\}/g, "");
        }

        for(let entry of localizedStrings){
            const locale = entry.locale;
            if(!digimonNames[locale]){
                digimonNames[locale] = {};
            }
            for(let row of entry.names.data){
                const strKey = row[entry.names.headerLookup["strKey"]];      
                const dbId = strKeyLookup[strKey];          
                digimonNames[locale][dbId] = escapeHTML(row[entry.names.headerLookup["value"]]);		
            }

            if(!digimonDescriptions[locale]){
                digimonDescriptions[locale] = {};
            }
            for(let row of entry.descriptions.data){
                const strKey = row[entry.descriptions.headerLookup["strKey"]];                     
                let dbId = parseInt(strKey.replace(/^digimon_/, "").replace(/_profile$/, ""));
                digimonDescriptions[locale][dbId] = escapeHTML(row[entry.descriptions.headerLookup["value"]]);		
            }

            if(!moveNames[locale]){
                moveNames[locale] = {};
            }
            if(!sigMoveNames[locale]){
                sigMoveNames[locale] = {};
            }
            for(let row of entry.moveNames.data){
                const skillId = row[entry.moveNames.headerLookup["skillId"]];        
                skillTextIds[skillId] = skillId;//TS data does not need an additional translation layer   
                if(skillId.match(/^3.*/)){//only regular skills
                    moveNames[locale][skillId] = escapeHTML(row[entry.moveNames.headerLookup["value"]]);
                }                        		
                sigMoveNames[locale][skillId] = escapeHTML(row[entry.moveNames.headerLookup["value"]]);	                
            }

            for(let row of entry.jogressMoveNames.data){
                const skillId = row[entry.jogressMoveNames.headerLookup["skillId"]];        
                skillTextIds[skillId] = skillId;//TS data does not need an additional translation layer                         		
                sigMoveNames[locale][skillId] = escapeHTML(row[entry.jogressMoveNames.headerLookup["value"]]);	                
            }

            if(!moveDescriptions[locale]){
                moveDescriptions[locale] = {};
            }

            for(let row of entry.moveDescriptions.data){
                const skillId = row[entry.moveNames.headerLookup["skillId"]];   
                moveDescriptions[locale][skillId] = escapeHTML(substituteDescriptionText(row[entry.moveDescriptions.headerLookup["value"]]));	                
            }

            if(!personalityNames[locale]){
                personalityNames[locale] = {};
            }
            for(let row of entry.personalityNames.data){
                const id = row[entry.personalityNames.headerLookup["id"]];        
                personalityNames[locale][id] = row[entry.personalityNames.headerLookup["value"]];       
            }

            if(!itemNames[locale]){
                itemNames[locale] = {};
            }
            for(let row of entry.itemNames.data){
                const id = row[entry.itemNames.headerLookup["id"]];        
                itemNames[locale][id] = row[entry.itemNames.headerLookup["value"]];       
            }

            if(!categoryNames[locale]){
                categoryNames[locale] = {};
            }
            for(let row of entry.categoryNames.data){
                const id = row[entry.categoryNames.headerLookup["id"]];        
                categoryNames[locale][id] = row[entry.categoryNames.headerLookup["value"]];       
            }

            if(!classNames[locale]){
                classNames[locale] = {};
            }
            for(let row of entry.classNames.data){
                const id = row[entry.classNames.headerLookup["id"]];        
                classNames[locale][id] = row[entry.classNames.headerLookup["value"]];       
            }
        }

        let movesLearned = {};
        let movesLearnedDetail = {};
        let sigMoves = {};
        let baseStats = {};
        let evoConditions = {};
        let traits = {};
        let resistances = {};

        for(let entry of digimonListData.data){
            const dbId = entry[digimonListData.headerLookup["id"]];
            const strKey = entry[digimonListData.headerLookup["strKey"]];

            for(let entry of localizedStrings){
                const locale = entry.locale;
                if(!digimonNames[locale][dbId]){
                    digimonNames[locale][dbId] = escapeHTML(strKey.replace("char_", ""));
                }	
            }

            if(!movesLearned[dbId]){
                movesLearned[dbId] = [];
            }
            if(!movesLearnedDetail[dbId]){
                movesLearnedDetail[dbId] = {
                    inherited: {},
                    signature: {}
                };
            }

            const signatureMoveId =  entry[digimonListData.headerLookup["signatureSkillId"]];
            if(signatureMoveId != 0){
                movesLearnedDetail[dbId].signature[signatureMoveId] = {level: 1};
            }
            

            const signatureMoveId2 =  entry[digimonListData.headerLookup["signatureSkillId2"]];
            if(signatureMoveId2 != 0){
                movesLearnedDetail[dbId].signature[signatureMoveId2] = {level: 1};
            }  
        
 
            for(let i = 0; i < 4; i++){
                const moveId = entry[digimonListData.headerLookup["gSkill"+(i+1)+"Id"]];
                const learnLevel = entry[digimonListData.headerLookup["gSkill"+(i+1)+"Level"]];
                if(moveId != 0){
                    movesLearnedDetail[dbId].inherited[moveId] = {level: learnLevel};
                    movesLearned[dbId].push(moveId);
                }                
            }
               
            if(!baseStats[dbId]){
                baseStats[dbId] = {};
            }

          
            baseStats[dbId].level = commonFieldTranslationsTS.level[escapeHTML(entry[digimonListData.headerLookup["stageId"]])];

            baseStats[dbId].type = commonFieldTranslationsTS.type[escapeHTML(entry[digimonListData.headerLookup["typeId"]])];

            baseStats[dbId].baseHP = escapeHTML(entry[digimonListData.headerLookup["baseHP"]]);
            baseStats[dbId].baseSP = escapeHTML(entry[digimonListData.headerLookup["baseSP"]]);
            baseStats[dbId].baseATK = escapeHTML(entry[digimonListData.headerLookup["baseATK"]]);
            baseStats[dbId].baseDEF = escapeHTML(entry[digimonListData.headerLookup["baseDEF"]]);
            baseStats[dbId].baseINT = escapeHTML(entry[digimonListData.headerLookup["baseINT"]]);
            baseStats[dbId].baseSPI = escapeHTML(entry[digimonListData.headerLookup["baseSPI"]]);
            baseStats[dbId].baseSPD = escapeHTML(entry[digimonListData.headerLookup["baseSPD"]]);

            if(!traits[dbId]){
                traits[dbId] = [];
            }

            const traitsBaseIdx = digimonListData.headerLookup["traitsBaseIdx"];
            for(let i = 0; i < 41; i++){
                const hasTrait = entry[traitsBaseIdx + i] * 1;
                if(hasTrait){
                    traits[dbId].push(i);
                }
            }

            if(!resistances[dbId]){
                resistances[dbId] = {
                    attributes: {},
                    elements: {}
                };
            }

            resistances[dbId].elements["null"] = escapeHTML(entry[digimonListData.headerLookup["resNull"]]);
            resistances[dbId].elements["fire"] = escapeHTML(entry[digimonListData.headerLookup["resFire"]]);
            resistances[dbId].elements["water"] = escapeHTML(entry[digimonListData.headerLookup["resWater"]]);
            resistances[dbId].elements["grass"] = escapeHTML(entry[digimonListData.headerLookup["resGrass"]]);
            resistances[dbId].elements["ice"] = escapeHTML(entry[digimonListData.headerLookup["resIce"]]);
            resistances[dbId].elements["elec"] = escapeHTML(entry[digimonListData.headerLookup["resElec"]]);
            resistances[dbId].elements["ground"] = escapeHTML(entry[digimonListData.headerLookup["resGround"]]);
            resistances[dbId].elements["steel"] = escapeHTML(entry[digimonListData.headerLookup["resSteel"]]);
            resistances[dbId].elements["wind"] = escapeHTML(entry[digimonListData.headerLookup["resWind"]]);
            resistances[dbId].elements["light"] = escapeHTML(entry[digimonListData.headerLookup["resLight"]]);
            resistances[dbId].elements["dark"] = escapeHTML(entry[digimonListData.headerLookup["resDark"]]);

        }

        const evolutionConditionData = await this.parseGameFile("main/evolution.mbe/00_evolution_condition");
        for(let entry of evolutionConditionData.data){
            const dbId = entry[evolutionConditionData.headerLookup["dbId"]];
            if(!evoConditions[dbId]){
                evoConditions[dbId] = {};
            }

            evoConditions[dbId].TRank = escapeHTML(entry[evolutionConditionData.headerLookup["tamerLevel"]]);
            evoConditions[dbId].HP = escapeHTML(entry[evolutionConditionData.headerLookup["HP"]]);
            evoConditions[dbId].SP = escapeHTML(entry[evolutionConditionData.headerLookup["SP"]]);
            evoConditions[dbId].ATK = escapeHTML(entry[evolutionConditionData.headerLookup["ATK"]]);
            evoConditions[dbId].DEF = escapeHTML(entry[evolutionConditionData.headerLookup["DEF"]]);
            evoConditions[dbId].INT = escapeHTML(entry[evolutionConditionData.headerLookup["INT"]]);
            evoConditions[dbId].SPD = escapeHTML(entry[evolutionConditionData.headerLookup["SPD"]]);

            evoConditions[dbId].skillCountValor = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountValor"]]);
            evoConditions[dbId].skillCountPhilantropy = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountPhilantropy"]]);
            evoConditions[dbId].skillCountAmicable = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountAmicable"]]);
            evoConditions[dbId].skillCountWisdom = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountWisdom"]]);

            evoConditions[dbId].needsItem = escapeHTML(entry[evolutionConditionData.headerLookup["needsItem"]]);

            evoConditions[dbId].jogressIdA = escapeHTML(entry[evolutionConditionData.headerLookup["jogressDbIdA"]]);
            evoConditions[dbId].jogressPersonalityA = escapeHTML(entry[evolutionConditionData.headerLookup["jogressPersonalityA"]]);

            evoConditions[dbId].jogressIdB = escapeHTML(entry[evolutionConditionData.headerLookup["jogressDbIdB"]]);
            evoConditions[dbId].jogressPersonalityB = escapeHTML(entry[evolutionConditionData.headerLookup["jogressPersonalityB"]]);
        }

        

        /*
        
        const digmonDescData = await this.parseGameFile("digimon_book_explanation.mbe/Sheet1");
        for(let entry of digmonDescData.data){
            const entryId = entry[digmonDescData.headerLookup["ID"]];
            for(let locale in localizationConfig){
                if(!digimonDescriptions[locale]){
                    digimonDescriptions[locale] = {};
                }
                digimonDescriptions[locale][entryId] = escapeHTML(entry[digmonDescData.headerLookup[locale]]);	
            }		
        }

        let movesAvailable = {};
        let moveNames = {};
        

        

        const commonStatFields = ["level", "attribute","type"];
        const commonData = await this.parseGameFile("digimon_common_para.mbe/digimon");
        for(let entry of commonData.data){
            const digimonId = escapeHTML(entry[farmData.headerLookup["id"]]);
            if(!baseStats[digimonId]){
                baseStats[digimonId] = {};
            }
            for(let field of commonStatFields){
                baseStats[digimonId][field] =  commonFieldTranslations[field][escapeHTML(entry[commonData.headerLookup[field]])];
            }
        }

        let moveNamesFull = {};
        const moveNameData = await this.parseGameFile("skill_name.mbe/Sheet1");
        for(let entry of moveNameData.data){
            const entryId = escapeHTML(entry[moveNameData.headerLookup["ID"]]);		

            for(let locale in localizationConfig){
                if(!moveNamesFull[locale]){
                    moveNamesFull[locale] = {};
                }
                moveNamesFull[locale][entryId] = escapeHTML(entry[moveNameData.headerLookup[locale]]);	
            }				
        }

        for(let locale in localizationConfig){
            if(!moveNames[locale]){
                moveNames[locale] = {};
            }
            for(let moveId in movesAvailable){
                moveNames[locale][moveId] = moveNamesFull[locale][moveId];
            }
        }

        let moveDescriptions = {};
        const moveDescData = await this.parseGameFile("skill_content_name.mbe/Sheet1");
        for(let entry of moveDescData.data){
            const entryId = entry[moveDescData.headerLookup["ID"]];
            for(let locale in localizationConfig){
                if(!moveDescriptions[locale]){
                    moveDescriptions[locale] = {};
                }
                moveDescriptions[locale][entryId] = escapeHTML(entry[moveDescData.headerLookup[locale]]);	
            }		
        }
        
        let supportSkillNames = {};
        const supportSkillNameData = await this.parseGameFile("support_skill_name.mbe/Sheet1");
        for(let entry of supportSkillNameData.data){
            const entryId = entry[supportSkillNameData.headerLookup["ID"]];
            for(let locale in localizationConfig){
                if(!supportSkillNames[locale]){
                    supportSkillNames[locale] = {};
                }
                supportSkillNames[locale][entryId] = escapeHTML(entry[supportSkillNameData.headerLookup[locale]]);	
            }		
        }

        let supportSkillDescriptions = {};
        const supportSkillDescData = await this.parseGameFile("support_skill_content_name.mbe/Sheet1");
        for(let entry of supportSkillDescData.data){
            const entryId = entry[supportSkillDescData.headerLookup["ID"]];
            for(let locale in localizationConfig){
                if(!supportSkillDescriptions[locale]){
                    supportSkillDescriptions[locale] = {};
                }
                supportSkillDescriptions[locale][entryId] = escapeHTML(entry[supportSkillDescData.headerLookup[locale]]);	
            }		
        }

        //growth rates
        let levellUpGrowths = {};
        const growthRateData = await this.parseGameFile("lvup_para.mbe/table");
        for(let entry of growthRateData.data){
            const curveId = escapeHTML(entry[growthRateData.headerLookup["id"]]);
            levellUpGrowths[curveId] = {
                HP: escapeHTML(entry[growthRateData.headerLookup["HP"]]),
                SP: escapeHTML(entry[growthRateData.headerLookup["SP"]]),
                ATK: escapeHTML(entry[growthRateData.headerLookup["ATK"]]),
                DEF: escapeHTML(entry[growthRateData.headerLookup["DEF"]]),
                INT: escapeHTML(entry[growthRateData.headerLookup["INT"]]),
                SPD: escapeHTML(entry[growthRateData.headerLookup["SPD"]])
            };        		
        }

    //evo conditions 

    const evoCondTypes ={
            1: "LVL",
            2: "HP", 
            3: "SP",
            4: "ATK",
            5: "DEF",
            6: "INT",
            7: "SPD",
            8: "ABI",
            9: "CAM",
            10: "Other"
    }

    let evoConditions = {};
    const evoConditionData = await this.parseGameFile("evolution_condition_para.mbe/digimon");
    for(let entry of evoConditionData.data){
        const digimonId = escapeHTML(entry[evoConditionData.headerLookup["id"]]);
        let conditions = {};
        for(let i = 1; i <= 10; i++){
                let type = escapeHTML(entry[evoConditionData.headerLookup["condType"+i]]);
                if(type > 0){
                    const value = escapeHTML(entry[evoConditionData.headerLookup["condValue"+i]]);
                    if(type > 9){
                        type = 10;
                        conditions[evoCondTypes[type]] = 1;
                    } else {
                        conditions[evoCondTypes[type]] = value;
                    } 
                }                      
        }  		
        evoConditions[digimonId] = conditions;
    }


    //encounters
    let digimonIdToCouplings = {};
    let couplingIdsToDigimon = {};
    const couplingData = await this.parseGameFile("mon_cpl.mbe/Coupling");

    //hacky fix for inconsistent headers from unpacked game files, older version?
    couplingData.headerLookup["level1"] = 7;
    couplingData.headerLookup["level2"] = 8;
    couplingData.headerLookup["level3"] = 9;
    couplingData.headerLookup["level4"] = 10;
    couplingData.headerLookup["level5"] = 11;
    couplingData.headerLookup["level6"] = 12;

    for(let entry of couplingData.data){
            let couplingId =  escapeHTML(entry[couplingData.headerLookup["id"]]);
            for(let i = 1; i <= 6; i++){
                const digimonId = escapeHTML(entry[couplingData.headerLookup["digi"+i]]);
                const level = escapeHTML(entry[couplingData.headerLookup["level"+i]]);
                if(digimonId != -1){
                    if(!digimonIdToCouplings[digimonId]){
                        digimonIdToCouplings[digimonId] = {};
                    }
                    digimonIdToCouplings[digimonId][couplingId] = { level: level};
                    if(!couplingIdsToDigimon[couplingId]){
                        couplingIdsToDigimon[couplingId] = [];
                    }
                    couplingIdsToDigimon[couplingId].push(digimonId);
                }            
            }
    }


    let areaParaToFieldId = {};
    const fieldListData = await this.parseGameFile("field_area_para.mbe/Field_List");

    for(let entry of fieldListData.data){
            const areaPara = escapeHTML(entry[fieldListData.headerLookup["map"]]);
            const fieldId = escapeHTML(entry[fieldListData.headerLookup["field_name_id"]]);
            areaParaToFieldId[areaPara] = fieldId;
    }

    let areaParaToFieldIdHame = {};
    const fieldListDataHame = await this.parseGameFile("field_area_para_add.mbe/Field_List");

    for(let entry of fieldListDataHame.data){
            const areaPara = escapeHTML(entry[fieldListDataHame.headerLookup["map"]]);
            const fieldId = escapeHTML(entry[fieldListDataHame.headerLookup["field_name_id"]]);
            areaParaToFieldIdHame[areaPara] = fieldId;
    }

    let fieldNames = {};
    const fieldNameData = await this.parseGameFile("fieldname.mbe/Sheet1");
    for(let entry of fieldNameData.data){
        const entryId = entry[fieldNameData.headerLookup["ID"]];
        for(let locale in localizationConfig){
            if(!fieldNames[locale]){
                    fieldNames[locale] = {};
            }
            fieldNames[locale][entryId] = escapeHTML(entry[fieldNameData.headerLookup[locale]]);	
        }		
    }


    let digimonToEncounters = {};
    let digimonToUsedAreas = {}; 
    const encounterParamData = await this.parseGameFile("map_encount_param.mbe/Field");
    for(let entry of encounterParamData.data){
            const mapId = escapeHTML(entry[encounterParamData.headerLookup["map_id"]]);
            for(let i = 6; i <= 12; i++){
                let encounterParamParts = escapeHTML(entry[i]).split(" ");
                const couplingId = encounterParamParts[0];
                const rate = encounterParamParts[2];
                if(couplingIdsToDigimon[couplingId]){
                    for(let digimonId of couplingIdsToDigimon[couplingId]){
                        if(!digimonToEncounters[digimonId]){
                            digimonToEncounters[digimonId] = [];
                        }
                        if(!digimonToUsedAreas[digimonId]){
                            digimonToUsedAreas[digimonId] = {};                   
                        }
                        
                        let areaPara = mapId.substring(0, mapId.length - 2);
                        areaPara = "d" + areaPara.padStart(2, 0);
                        if(!digimonToUsedAreas[digimonId][areaPara+ "_" + i]){
                            digimonToUsedAreas[digimonId][areaPara+ "_" + i] = true;
                            digimonToEncounters[digimonId].push({
                                level: digimonIdToCouplings[digimonId][couplingId].level,
                                rate: rate,
                                mapId: mapId,
                                fieldNameId: areaParaToFieldId[areaPara]
                            });
                        }                    
                    }
                }            
            }
    }

    let digimonToEncountersHame = {};
    let digimonToUsedAreasHame = {}; 
    const encounterParamDataHame = await this.parseGameFile("map_encount_param_add.mbe/Field");
    for(let entry of encounterParamDataHame.data){
            const mapId = escapeHTML(entry[encounterParamDataHame.headerLookup["map_id"]]);
            for(let i = 6; i <= 12; i++){
                let encounterParamParts = escapeHTML(entry[i]).split(" ");
                const couplingId = encounterParamParts[0];
                const rate = encounterParamParts[2];
                if(couplingIdsToDigimon[couplingId]){
                    for(let digimonId of couplingIdsToDigimon[couplingId]){
                        if(!digimonToEncountersHame[digimonId]){
                            digimonToEncountersHame[digimonId] = [];
                        }
                        if(!digimonToUsedAreasHame[digimonId]){
                            digimonToUsedAreasHame[digimonId] = [];
                        }
                        
                        let areaPara = mapId.substring(0, mapId.length - 2);
                        areaPara = "d" + areaPara.padStart(2, 0);
                        if(!digimonToUsedAreasHame[digimonId][areaPara+ "_" + i]){
                            digimonToUsedAreasHame[digimonId][areaPara+ "_" + i] = true;
                            
                            digimonToEncountersHame[digimonId].push({
                                level: digimonIdToCouplings[digimonId][couplingId].level,
                                rate: rate,
                                mapId: mapId,
                                fieldNameId: areaParaToFieldIdHame[areaPara]
                            });
                        }
                    }
                }            
            }
    }

    
    
        let skillTextIds = {};
        const skillTextIdData = await this.parseGameFile("battle_command.mbe/Command");
        for(let entry of skillTextIdData.data){
            const skillId = escapeHTML(entry[skillTextIdData.headerLookup["ID"]]);
            const skillTextId = escapeHTML(entry[skillTextIdData.headerLookup["TextId"]]);
            skillTextIds[skillId] = skillTextId;
        }
        const maxLevel = 99;

        if (!fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, 'dds_cache.json'))) {
            showGameFileLoader(localizationData[currentLocale].app.loader_msg_imgs);
            await this.cachceDDSImages();
            hideGameFileLoader();
        } else {
            DDSCache = JSON.parse(fs.readFileSync(pathLib.join(this.getResourcesFolder(),  gameDataFolder, 'dds_cache.json')));
        }
        
        function getStatValueAtLevel(digimonId, levellUpGrowths, stat, level){
            try {
                let targetBaseStats = baseStats[digimonId];
                let baseStatValue = targetBaseStats["base"+stat];
                let growthType = targetBaseStats.growthType;
                let growthTable = levellUpGrowths[growthType];
                let growthAmount = growthTable[stat];
                statValue = Math.floor(baseStatValue * 1 + (growthAmount * (level - 1)));
            
                statValue/=100;
                if(stat == "HP"){  
                    statValue = Math.floor(statValue);
                    statValue*=10;
                } 
                return Math.floor(statValue);
            } catch(e){
                console.log("Error while calculating stats for Digimon "+digimonId+": " + e);
            }
            return 0;	
        }
*/  

    

        let digimonToEncounters = {};
        let digimonToEncountersHame = {};
        let digiData = {};
        for(let entry of digimonListData.data){
            const digimonId = entry[digimonListData.headerLookup["id"]];
            
            if(validDigimon[digimonId]){
                digiData[digimonId] = {
                    id: digimonId,
                    name: digimonNames["English"][digimonId] || placeHolderNameLookup[digimonId] || "",
                    moves: movesLearned[digimonId] || [],
                    neighBours: evolutions[digimonId] || {},
                    baseStats: baseStats[digimonId] || {},
                    moveDetails: movesLearnedDetail[digimonId] || {},
                    conditions: evoConditions[digimonId] || {},
                /*    maxBaseStats: {//used for checking difficult evolutions
                        "HP": getStatValueAtLevel(digimonId, levellUpGrowths, "HP", maxLevel),
                        "SP": getStatValueAtLevel(digimonId, levellUpGrowths, "SP", maxLevel),
                        "ATK": getStatValueAtLevel(digimonId, levellUpGrowths, "ATK", maxLevel),
                        "DEF": getStatValueAtLevel(digimonId, levellUpGrowths, "DEF", maxLevel),
                        "INT": getStatValueAtLevel(digimonId, levellUpGrowths,"INT", maxLevel),
                        "SPD": getStatValueAtLevel(digimonId, levellUpGrowths, "SPD", maxLevel),
                    },*/
                    encounters: {base: digimonToEncounters[digimonId] || [], hame: digimonToEncountersHame[digimonId] || []},
                    traits: traits[digimonId] || [],
                    resistances:  resistances[digimonId] || {}
                }
            }        
        }

        return {
            digiData: digiData, 
            //levellUpGrowths: levellUpGrowths, 
            //fieldNames: fieldNames, 
            moveNames: moveNames, 
            sigMoves: sigMoveNames, 
            moveDescriptions: moveDescriptions, 
            digimonNames: digimonNames, 
            digimonDescriptions: digimonDescriptions, 
           // supportSkillNames: supportSkillNames, 
           // supportSkillDescriptions: supportSkillDescriptions,
            skillTextIds: skillTextIds,
            personalityNames: personalityNames,
            itemNames: itemNames,
            categoryNames: categoryNames,
            classNames: classNames
        };
    }

}