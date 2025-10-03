
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

    const DLCIds = ["06", "17"];

    const requiredFiles = [
        // Evolution info
        "main/evolution.mbe/001_evolution_to.csv",
        "main/evolution.mbe/000_evolution_condition.csv",
        
        // Main monster database
        "main/digimon_status.mbe/000_digimon_status_data.csv",
        
        // Battle skills
        "main/battle_skill.mbe/000_battle_skill_list.csv",
        
        // Japanese text files
        "main/txt_jpn/digimon_profile.mbe/000_Sheet1.csv",
        "main/txt_jpn/char_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/skill_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/jogress_skill_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/skill_explanation.mbe/000_Sheet1.csv",
        "main/txt_jpn/skill_auto_explanation.mbe/000_Sheet1.csv",
        "main/txt_jpn/generation_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/digimon_type.mbe/000_Sheet1.csv",
        "main/txt_jpn/element.mbe/000_Sheet1.csv",
        "main/txt_jpn/personality_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/item_name.mbe/000_Sheet1.csv",
        "main/txt_jpn/belong.mbe/000_Sheet1.csv",
        "main/txt_jpn/digimon_class_name.mbe/000_Sheet1.csv",
        
        // English text files
        "main/txt_eng/digimon_profile.mbe/000_Sheet1.csv",
        "main/txt_eng/char_name.mbe/000_Sheet1.csv",
        "main/txt_eng/skill_name.mbe/000_Sheet1.csv",
        "main/txt_eng/jogress_skill_name.mbe/000_Sheet1.csv",
        "main/txt_eng/skill_explanation.mbe/000_Sheet1.csv",
        "main/txt_eng/skill_auto_explanation.mbe/000_Sheet1.csv",
        "main/txt_eng/generation_name.mbe/000_Sheet1.csv",
        "main/txt_eng/digimon_type.mbe/000_Sheet1.csv",
        "main/txt_eng/element.mbe/000_Sheet1.csv",
        "main/txt_eng/personality_name.mbe/000_Sheet1.csv",
        "main/txt_eng/item_name.mbe/000_Sheet1.csv",
        "main/txt_eng/belong.mbe/000_Sheet1.csv",
        "main/txt_eng/digimon_class_name.mbe/000_Sheet1.csv"
    ];
    GameFileManagerTS.prototype.hasGameFiles = function(){
        let isKitValid = true;
         
        if(fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked", "digi_data.json")) && fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, "unpacked", "images", "converted"))){
            return true;
        }
    
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

    var defaultGamePath = "C:/Program Files (x86)/Steam/steamapps/common/Digimon Story Time Stranger";
    GameFileManagerTS.prototype.gameFilesPath = localStorage.getItem("DigiPathFinder_game_file_path_TS_release") || defaultGamePath;

    GameFileManagerTS.prototype.updateGameFilesPath = function(path){
        this.gameFilesPath = path || defaultGamePath;
		localStorage.setItem("DigiPathFinder_game_file_path_TS_release", path || this.gameFilesPath);
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
                //let cmdDir = pathLib.join(this.getResourcesFolder(), toolsFolder, "/win");
                //cmd = "\""+this.getResourcesFolder()+""+'\\'+toolsFolder+'\\win\\unpack_game_files.bat\" \"'+cmdDir+'\"  ';

                const exetractorPath = pathLib.join(this.getResourcesFolder(), toolsFolder, '/win/DSTSToolsCLI.exe');
                const dbFilePaths = [
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_0.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/main')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/patch.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/patch') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/patch')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/patch_text00.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/patch/txt_jpn') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/patch/txt_jpn')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/patch_text01.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/patch/txt_eng') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/patch/txt_eng')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_text00.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/txt_jpn'), unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/main/txt_jpn')},
                    {in: pathLib.join(this.gameFilesPath, 'gamedata/app_text01.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/txt_eng'), unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/main/txt_eng')},
                ]

             
                for(let id of DLCIds){
                    dbFilePaths.push({in: pathLib.join(this.gameFilesPath, 'gamedata/addcont_'+id+'.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/addcont_'+id+'') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/addcont_'+id+'')});
                    dbFilePaths.push({in: pathLib.join(this.gameFilesPath, 'gamedata/addcont_'+id+'_text00.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/addcont_'+id+'/txt_jpn') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/addcont_'+id+'/txt_jpn')});
                    dbFilePaths.push({in: pathLib.join(this.gameFilesPath, 'gamedata/addcont_'+id+'_text01.dx11.mvgl'), out:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/addcont_'+id+'/txt_eng') , unpacked:pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/addcont_'+id+'/txt_eng')});
                }
                
                
                for(let pathInfo of dbFilePaths){
                    if(!fs.existsSync(pathInfo.unpacked)){
                        fs.mkdirSync(pathInfo.unpacked);
                    }
                    
                    const mainExtractCmd =  '"'+exetractorPath+'" --extract "' + pathInfo.in + '" "' + pathInfo.out + '"';
                    await this.runCmd(mainExtractCmd);
                }
                
                const requiredFiles = [
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/data/'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/images/'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/shaders/'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/main/lua/'),
                    pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/patch/data/'),
                ];

                for(let id of DLCIds){
                    requiredFiles.push(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/addcont_'+id+'/data'));
                }

                showGameFileLoader("Verifying unpack...");

                let retryCount = 0;
                const maxRetryCount = 50;
                let retryTime = 5;
                
                
                let missingFiles = [];
                for(const entry of requiredFiles){
                    if(!fs.existsSync(entry)){
                        missingFiles.push(entry);
                    }
                }
                while(missingFiles.length && retryCount++ < maxRetryCount){
                    console.log("Files missing on attempt " + retryCount);
                    await new Promise(resolve => setTimeout(resolve, retryTime * 1000));
                    missingFiles = [];
                    for(const entry of requiredFiles){
                        if(!fs.existsSync(entry)){
                            missingFiles.push(entry);
                        }
                    }
                }
                
                if (missingFiles.length) {
                    setLoaderError(localizationData[currentLocale].app.warn_no_extract); 
                    throw("Failed extract. Could not find '"+missingFiles.join(', ')+"' after extract.");
                }
                
                //let result = await this.runCmd(cmd);

                let regularSets = ["main", "patch"];
                let cmdParts = [];

                for(let entry of regularSets){
                    
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', entry, 'data', 'evolution.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', entry) + '"');
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', entry, 'data','digimon_status.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', entry) + '"');
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', entry, 'data','battle_skill.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', entry) + '"');
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', entry, 'data','battle_buff.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', entry) + '"');
                    cmdParts.push('xcopy /s /Y "'+pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', entry, 'ui_chara*')+ '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/') + '\\"');
                    addExtractTextArchiveCommands(entry);
                }

                for(let entry of DLCIds){
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', "addcont_"+entry, 'data','evolution_dlc'+entry+'.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', "addcont_"+entry) + '"');
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', "addcont_"+entry, 'data', 'digimon_status_dlc'+entry+'.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', "addcont_"+entry) + '"');
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', "addcont_"+entry, 'data', 'battle_skill_dlc'+entry+'.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', "addcont_"+entry + '"'));
                    cmdParts.push('"'+exetractorPath+'" --mbeextract "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', "addcont_"+entry, 'data', 'battle_buff_dlc'+entry+'.mbe') + '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/', "addcont_"+entry) + '"');
                    cmdParts.push('xcopy /s /Y "'+pathLib.join(this.getResourcesFolder(), gameDataFolder, '/packed/', "addcont_"+entry, 'ui_chara*')+ '" "' + pathLib.join(this.getResourcesFolder(), gameDataFolder, '/unpacked/') + '\\"');
                    addExtractTextArchiveCommands('addcont_' + entry, "_dlc" + entry);
                }
                
                function addExtractTextArchiveCommands(set, mbeSuffix){                
                    if(!mbeSuffix){
                        mbeSuffix = "";
                    }
                    const locales = ["txt_jpn", "txt_eng"]
                    const mbeFiles = [
                        'digimon_profile',
                        'char_name',
                        'skill_name',
                        'jogress_skill_name',
                        'skill_explanation',
                        'skill_auto_explanation',
                        'generation_name',
                        'digimon_type',
                        'element',
                        'personality_name',
                        'item_name',
                        'belong',
                        'digimon_class_name',
                        'buff_name',
                        'status_name'
                    ];

                    for(let locale of locales){ 
                        for(let mbeFile of mbeFiles){
                            cmdParts.push(
                                '"' + exetractorPath + '" --mbeextract "' + 
                                pathLib.join(this.getResourcesFolder(), gameDataFolder, 'packed', set, locale, 'text', mbeFile + mbeSuffix + ".mbe") + 
                                '" "' + 
                                pathLib.join(this.getResourcesFolder(), gameDataFolder, 'unpacked', set, locale) + '"'
                            );
                        }
                    }
                    
                }

                for(let cmd of cmdParts){
                    console.log("!!" + cmd);
                    await this.runCmd(cmd);
                }
                
            } else if(os.platform() === "linux"){
                //let cmdDir = pathLib.join(this.getResourcesFolder(), toolsFolder, "/linux")
                //cmd =  "\""+this.getResourcesFolder()+""+'\\DSCSTools\\linux\\unpack_game_files.bat\"  \"'+cmdDir+'\" \"'+this.gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
                setLoaderError("Unsupported platform."); 
                throw("Unsupported platform.");
            } else {
                setLoaderError("Unsupported platform."); 
                throw("Unsupported platform.");
            }
            
            showGameFileLoader("Cleaning up unpack...");
            fs.rm(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/packed"), { recursive: true, force: true });
            showGameFileLoader("Processing images...");
            await this.cachceDDSImages();  
            showGameFileLoader("Done!");
        
    }

    GameFileManagerTS.prototype.cachceDDSImages = async function(){
        const convertedDir = pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked/images/converted");
        if(!fs.existsSync(convertedDir)){
            fs.mkdirSync(convertedDir);
        }
        
        const digimonListData = await this.parseGameFile("main/digimon_status.mbe/000_digimon_status_data");
        DDSCache = {};
        for(let entry of digimonListData.data){
            const digimonId = entry[digimonListData.headerLookup["scriptId"]];
            const data = await convertDDSImage(digimonId);//prepopulate cache
            const imgId = String(digimonId).padStart(4, '0').replace(/^0/, 1);
            fs.writeFileSync(pathLib.join(convertedDir, "/ui_chara_icon_"+imgId+".png"), data);
        }
       //fs.writeFileSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, '/dds_cache.json'), JSON.stringify(DDSCacheTS));
    }

    GameFileManagerTS.prototype.parseGameFile = async function(file){
        const _this = this;

            let defaultFileData;
           
            let fileInfo = {
                mbe: null, 
                resouceFile: null,
                localeId: ""
            };
           
            let fileParts = file.split("/");
            if(file.match(/^txt_*/)){
               fileInfo.localeId = fileParts[0];
               defaultFileData = await this.parseGameFileDirect("main/"+file, file);
            } else {
                defaultFileData = await this.parseGameFileDirect(file, file);
            }
            fileInfo.resouceFile = fileParts[2];
            fileInfo.mbe = fileParts[1].replace(".mbe", "");

            let normalSets = ["main", "patch"];

            let orderedDataSets = [];

            for(let entry of normalSets){
                try {
                    const data = (await this.parseGameFileDirect(entry+"/"+ (fileInfo.localeId ? fileInfo.localeId + "/" : "") +fileInfo.mbe+".mbe"+"/"+fileInfo.resouceFile)).data;
                    orderedDataSets.push(data);
                } catch(e){
                    console.log("Could not get file content: " + (e.message|| e))
                }                
            }

            for(let entry of DLCIds){
                try {
                    const data = (await this.parseGameFileDirect("addcont_"+entry+"/"+ (fileInfo.localeId ? fileInfo.localeId + "/" : "") +fileInfo.mbe+"_dlc"+entry+".mbe"+"/"+fileInfo.resouceFile)).data;
                    orderedDataSets.push(data);
                } catch(e){
                    console.log("Could not get file content: " + (e.message|| e))
                }
            }

            let mergedData = [];

            if(isNaN(orderedDataSets[0][0][0])){
                //string key data
                let lookup = {};
                for(let set of orderedDataSets){
                    for(let row of set){
                        const id = row[0];    
                        lookup[id] = row;
                    }
                }
                mergedData = Object.values(lookup);
            } else {
                //int key data
                for(let set of orderedDataSets){
                    for(let row of set){
                        const idx = row[0];
                        mergedData[idx] = row;
                    }
                }

                mergedData = mergedData.filter(x => x);
            }
            
           
            return {headerLookup: defaultFileData.headerLookup, data: mergedData};
    }   

    GameFileManagerTS.prototype.parseGameFileDirect = function(file, headerRef){
        const _this = this;
        return new Promise(function(resolve, reject){
            const { parse } = require('csv-parse');
            const records = [];

            var csvData=[];
            try {
                const stream = fs.createReadStream(pathLib.join(_this.getResourcesFolder(), gameDataFolder, "/unpacked/"+file+".csv"));
            
                // Add error handler for the stream
                stream.on('error', function(error) {
                    reject(error);
                });

                stream
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
                        if(headerRef){                        
                            let fileKey = headerRef+".csv";
                            if(hardDefinedHeadersTS[fileKey] && Object.keys(hardDefinedHeadersTS[fileKey]).length){
                                headerLookup = hardDefinedHeadersTS[fileKey]
                            } else {
                                throw "No header information for " + fileKey;
                            }
                        }                    

                        resolve({headerLookup: headerLookup, data: records});
                    });
            } catch(e){
                reject(e);
            }           
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

    

    GameFileManagerTS.prototype.preparePathFinderData = async function(forceReload){
       if(!isElectron()){
            //const DDSCacheContent_A = await Promise.resolve($.get('https://tshadowknight.github.io/DigiPathFinder_standalone/dds_cache_a.txt'));
            //const DDSCacheContent_B = await Promise.resolve($.get('https://tshadowknight.github.io/DigiPathFinder_standalone/dds_cache_b.txt'));
            //DDSCache = JSON.parse(DDSCacheContent_A + DDSCacheContent_B);
           
            return await Promise.resolve($.getJSON(resourceProvider + 'game_data_TS/unpacked/digi_data.json?cacheBust='+versionId));
                       
        } else {
            if(!forceReload){
                if(fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked", "digi_data.json")) && fs.existsSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, "unpacked", "images", "converted"))){
                    return await Promise.resolve($.getJSON(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked", "digi_data.json")));
                }
            }
        }

        
        let digimonNames = {};
        let moveNames = {};
        let sigMoveNames = {};
        let moveDescriptions = {};
        let autoMoveDescriptions = {};
        const digimonListData = await this.parseGameFile("main/digimon_status.mbe/000_digimon_status_data");
        let validDigimon = {};

        const localizedStrings = [
            {
                locale: "English", 
                names: await this.parseGameFile("txt_eng/char_name.mbe/000_Sheet1"), 
                descriptions: await this.parseGameFile("txt_eng/digimon_profile.mbe/000_Sheet1"), 
                moveNames: await this.parseGameFile("txt_eng/skill_name.mbe/000_Sheet1"), 
                jogressMoveNames: await this.parseGameFile("txt_eng/jogress_skill_name.mbe/000_Sheet1"), 
                moveDescriptions: await this.parseGameFile("txt_eng/skill_explanation.mbe/000_Sheet1"), 
                autoMoveDescriptions: await this.parseGameFile("txt_eng/skill_auto_explanation.mbe/000_Sheet1"),  
                personalityNames: await this.parseGameFile("txt_eng/personality_name.mbe/000_Sheet1"),  
                itemNames: await this.parseGameFile("txt_eng/item_name.mbe/000_Sheet1"),  
                categoryNames: await this.parseGameFile("txt_eng/belong.mbe/000_Sheet1"),  
                classNames: await this.parseGameFile("txt_eng/digimon_class_name.mbe/000_Sheet1"),  
                elementNames: await this.parseGameFile("txt_eng/element.mbe/000_Sheet1"),  
                buffNames: await this.parseGameFile("txt_eng/buff_name.mbe/000_Sheet1"),  
                statusNames: await this.parseGameFile("txt_eng/status_name.mbe/000_Sheet1"),  
                typeNames: await this.parseGameFile("txt_eng/digimon_type.mbe/000_Sheet1"),  
            },
            {
                locale: "Japanese", 
                names: await this.parseGameFile("txt_jpn/char_name.mbe/000_Sheet1"),
                descriptions: await this.parseGameFile("txt_jpn/digimon_profile.mbe/000_Sheet1"), 
                moveNames: await this.parseGameFile("txt_jpn/skill_name.mbe/000_Sheet1"), 
                jogressMoveNames: await this.parseGameFile("txt_jpn/jogress_skill_name.mbe/000_Sheet1"), 
                moveDescriptions: await this.parseGameFile("txt_jpn/skill_explanation.mbe/000_Sheet1"), 
                autoMoveDescriptions: await this.parseGameFile("txt_jpn/skill_auto_explanation.mbe/000_Sheet1"),   
                personalityNames: await this.parseGameFile("txt_jpn/personality_name.mbe/000_Sheet1"),  
                itemNames: await this.parseGameFile("txt_jpn/item_name.mbe/000_Sheet1"),  
                categoryNames: await this.parseGameFile("txt_jpn/belong.mbe/000_Sheet1"),  
                classNames: await this.parseGameFile("txt_jpn/digimon_class_name.mbe/000_Sheet1"),  
                elementNames: await this.parseGameFile("txt_jpn/element.mbe/000_Sheet1"),
                buffNames: await this.parseGameFile("txt_jpn/buff_name.mbe/000_Sheet1"),  
                statusNames: await this.parseGameFile("txt_eng/status_name.mbe/000_Sheet1"),  
                typeNames: await this.parseGameFile("txt_eng/digimon_type.mbe/000_Sheet1"),  
            }
        ];
        
        let strKeyLookup = {};
        let placeHolderNameLookup = {};//demo debug
        for(let entry of digimonListData.data){
            const dbId = entry[digimonListData.headerLookup["id"]];
            const strKey = entry[digimonListData.headerLookup["strKey"]];
            if(!strKeyLookup[strKey]){
                strKeyLookup[strKey] = [];
            }
            strKeyLookup[strKey].push(dbId);
            placeHolderNameLookup[dbId] = strKey;
        }
        

        let evolutions = {};
        const evolutionData = await this.parseGameFile("main/evolution.mbe/001_evolution_to");
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
        let elementNames = {};
        let buffNames = {};
        let statusNames = {};
        let typeNames = {};
        let jogressSkills = {};

        function substituteDescriptionText(txt){
            return txt.replace(/\{.*?\}/g, "");
        }

        for(let entry of localizedStrings){
            const locale = entry.locale;
            if(!digimonNames[locale]){
                digimonNames[locale] = {};
            }
            for(let row of entry.names.data){
                const strKey = row[entry.names.headerLookup["id"]];      
                const dbIds = strKeyLookup[strKey];       
                if(dbIds){
                    for(let dbId of dbIds){
                        digimonNames[locale][dbId] = escapeHTML(row[entry.names.headerLookup["value"]]);	
                    } 
                }                                 	
            }

            if(!digimonDescriptions[locale]){
                digimonDescriptions[locale] = {};
            }
            for(let row of entry.descriptions.data){
                const strKey = row[entry.descriptions.headerLookup["id"]];                     
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
                const skillId = row[entry.moveNames.headerLookup["id"]];        
                skillTextIds[skillId] = skillId;//TS data does not need an additional translation layer   
                if(skillId.match(/^3.*/)){//only regular skills
                    moveNames[locale][skillId] = escapeHTML(row[entry.moveNames.headerLookup["value"]]);
                }                        		
                sigMoveNames[locale][skillId] = escapeHTML(row[entry.moveNames.headerLookup["value"]]);	                
            }

            for(let row of entry.jogressMoveNames.data){
                const skillId = row[entry.jogressMoveNames.headerLookup["id"]];        
                skillTextIds[skillId] = skillId;//TS data does not need an additional translation layer                         		
                sigMoveNames[locale][skillId] = escapeHTML(row[entry.jogressMoveNames.headerLookup["value"]]);	                
            }

            if(!moveDescriptions[locale]){
                moveDescriptions[locale] = {};
            }

            for(let row of entry.moveDescriptions.data){
                const skillId = row[entry.moveNames.headerLookup["id"]];   
                moveDescriptions[locale][skillId] = escapeHTML(substituteDescriptionText(row[entry.moveDescriptions.headerLookup["value"]]));	                
            }

            if(!autoMoveDescriptions[locale]){
                autoMoveDescriptions[locale] = {};
            }

            for(let row of entry.autoMoveDescriptions.data){
                const skillId = row[entry.autoMoveDescriptions.headerLookup["id"]];   
                autoMoveDescriptions[locale][skillId] = escapeHTML((row[entry.autoMoveDescriptions.headerLookup["value"]]));	                
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

            if(!elementNames[locale]){
                elementNames[locale] = {};
            }
            for(let row of entry.elementNames.data){
                const id = row[entry.elementNames.headerLookup["id"]];        
                elementNames[locale][id] = row[entry.elementNames.headerLookup["value"]];       
            }
            
            if(!buffNames[locale]){
                buffNames[locale] = {};
            }
            for(let row of entry.buffNames.data){
                const id = row[entry.buffNames.headerLookup["id"]];        
                buffNames[locale][id] = row[entry.buffNames.headerLookup["value"]];       
            }

            if(!statusNames[locale]){
                statusNames[locale] = {};
            }
            for(let row of entry.statusNames.data){
                const id = row[entry.statusNames.headerLookup["id"]];        
                statusNames[locale][id] = row[entry.statusNames.headerLookup["value"]];       
            }

            if(!typeNames[locale]){
                typeNames[locale] = {};
            }
            for(let row of entry.typeNames.data){
                const id = row[entry.typeNames.headerLookup["id"]];        
                typeNames[locale][id] = row[entry.typeNames.headerLookup["value"]];       
            }
            
        }

        
        const skillData = await this.parseGameFile("main/battle_skill.mbe/000_battle_skill_list");

        let skillDataLookup = {};

        const buffSetData =  await this.parseGameFile("main/battle_skill.mbe/002_buff_set");
        const buffSetLookup = {};
        for(let entry of buffSetData.data){
            const id = escapeHTML(entry[buffSetData.headerLookup["setId"]]);
            buffSetLookup[id] = [];
            for(let i = 0; i <=10; i++){
                buffSetLookup[id].push({
                    effect: escapeHTML(entry[buffSetData.headerLookup["buff"+i+"_eff"]]) * 1,
                    rate: escapeHTML(entry[buffSetData.headerLookup["buff"+i+"_rate"]]) * 1,
                    changePercent: escapeHTML(entry[buffSetData.headerLookup["buff"+i+"_changePercent"]]) * 1,
                    turnOverride: escapeHTML(entry[buffSetData.headerLookup["buff"+i+"_turnOverride"]]) * 1,
                });
            }
        }

        function retrieveBuffset(id){
            if(id == 0){
                return null;
            }
            return buffSetLookup[id];
        }

        for(let entry of skillData.data){
            const skillId = escapeHTML(entry[skillData.headerLookup["skillId"]]);
            
            skillDataLookup[skillId] = {
                // Core skill properties
                skillId: parseInt(entry[skillData.headerLookup["skillId"]]) || 0,
                skillFixedDescId: parseInt(entry[skillData.headerLookup["skillFixedDescId"]]) || 0,
                effectId: parseInt(entry[skillData.headerLookup["effectId"]]) || 0,
                
                // Damage properties
                dmgType: parseInt(entry[skillData.headerLookup["dmgType"]]) || 0, // 0:none/self, 1: physical, 2: magic, 4: fixed damage, 5:fixed %, 11: 'Major Damage'
                power: parseInt(entry[skillData.headerLookup["power"]]) || 0,
                element: parseInt(entry[skillData.headerLookup["element"]]) || 0,
                increasedDmgAgainstClass: parseInt(entry[skillData.headerLookup["increasedDmgAgainstClass"]]) || 0,

                // Additional properties
                additionalProperty: parseInt(entry[skillData.headerLookup["additionalProperty"]]) || 0,    
                additionalProperty_1: parseInt(entry[skillData.headerLookup["additionalProperty_1"]]) || 0,  
                
                // Target and mechanics
                targetType: parseInt(entry[skillData.headerLookup["targetType"]]) || 0,
                minHits: parseInt(entry[skillData.headerLookup["minHits"]]) || 1,
                maxHits: parseInt(entry[skillData.headerLookup["maxHits"]]) || 1,
                accuracy: parseFloat(entry[skillData.headerLookup["accuracy"]]) || 100,
                
                // Critical and special effects
                alwaysHits: parseInt(entry[skillData.headerLookup["alwaysHits"]]) || 0,
                critRate: parseInt(entry[skillData.headerLookup["critRate"]]) || 0,
                HPDrain: parseInt(entry[skillData.headerLookup["HPDrain"]]) || 0,
                SPDrain: parseInt(entry[skillData.headerLookup["SPDrain"]]) || 0,
                recoil: parseInt(entry[skillData.headerLookup["recoil"]]) || 0,
                
                // Conditional modifiers
                skillConditionalType: parseInt(entry[skillData.headerLookup["skillConditionalType"]]) || 0, 
                skillEffectIfConditional: parseInt(entry[skillData.headerLookup["skillEffectIfConditional"]]) || 0,
                skillConditionalArg: parseInt(entry[skillData.headerLookup["skillConditionalArg"]]) || 0,
                skillEffectArg: parseInt(entry[skillData.headerLookup["skillEffectArg"]]) || 0,
                
                // Unknown/reserved fields
                unknown_0: entry[skillData.headerLookup["???_0"]] || 0, // 1-0 range
                unknown_1: entry[skillData.headerLookup["???_1"]] || 0,
                
                // Empty/reserved slots
                empty_0: entry[skillData.headerLookup["empty_0"]] || null,
                empty_1: entry[skillData.headerLookup["empty_1"]] || null,

                buffset_0: retrieveBuffset(parseInt(entry[skillData.headerLookup["buffSet_0"]]) || 0),
                buffset_1: retrieveBuffset(parseInt(entry[skillData.headerLookup["buffSet_1"]]) || 0),
                buffset_2: retrieveBuffset(parseInt(entry[skillData.headerLookup["buffSet_2"]]) || 0),
                buffset_3: retrieveBuffset(parseInt(entry[skillData.headerLookup["buffSet_3"]]) || 0),
                buffset_4: retrieveBuffset(parseInt(entry[skillData.headerLookup["buffSet_4"]]) || 0),
            };
            
            let jogressIdA = parseInt(entry[skillData.headerLookup["jogressIdA"]]) || 0;
            let jogressIdB = parseInt(entry[skillData.headerLookup["jogressIdB"]]) || 0;
            if(jogressIdA != -1 && jogressIdB != -1){
                if(!jogressSkills[jogressIdA]){
                    jogressSkills[jogressIdA] = [];
                }
                jogressSkills[jogressIdA].push({
                    skillId: parseInt(entry[skillData.headerLookup["skillId"]]) || 0,
                    other: jogressIdB
                });

                if(!jogressSkills[jogressIdB]){
                    jogressSkills[jogressIdB] = [];
                }
                jogressSkills[jogressIdB].push({
                    skillId: parseInt(entry[skillData.headerLookup["skillId"]]) || 0,
                    other: jogressIdA
                });
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
                    signature: {},
                    jogress: {}
                };
            }

            for(let i = 1; i <= 12; i++){
                const signatureMoveId =  entry[digimonListData.headerLookup["signatureSkillId" + i]];
                if(signatureMoveId != 0){
                    movesLearnedDetail[dbId].signature[signatureMoveId] = {level: 1};
                }
            }
 
            for(let i = 0; i < 4; i++){
                const moveId = entry[digimonListData.headerLookup["gSkill"+(i+1)+"Id"]];
                const learnLevel = entry[digimonListData.headerLookup["gSkill"+(i+1)+"Level"]];
                if(moveId != 0){
                    movesLearnedDetail[dbId].inherited[moveId] = {level: learnLevel};
                    movesLearned[dbId].push(moveId);
                }                
            }

            const monJogressSkills = jogressSkills[dbId];
            if(monJogressSkills){
                for(let entry of monJogressSkills){
                     movesLearnedDetail[dbId].jogress[entry.skillId] = {level: 1, other: entry.other};
                }
            }
               
            if(!baseStats[dbId]){
                baseStats[dbId] = {};
            }

            baseStats[dbId].fieldGuideId = escapeHTML(entry[digimonListData.headerLookup["fieldGuideId"]]);
            baseStats[dbId].scriptId = escapeHTML(entry[digimonListData.headerLookup["scriptId"]]);
          
            baseStats[dbId].level = commonFieldTranslationsTS.level[escapeHTML(entry[digimonListData.headerLookup["stageId"]])];

            baseStats[dbId].type = commonFieldTranslationsTS.type[escapeHTML(entry[digimonListData.headerLookup["typeId"]])];

            baseStats[dbId].basePersonality = escapeHTML(entry[digimonListData.headerLookup["basePersonality"]]);

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
                const hasTrait = entry[traitsBaseIdx + i] == "true" ? true : false;
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

           // "0","Vaccine"
            //"1","Data"
            //"2","Virus"

            if(baseStats[dbId].type == "Vaccine"){  
                resistances[dbId].attributes["data"] = 1;
                resistances[dbId].attributes["virus"] = 3;
            }

            if(baseStats[dbId].type == "Data"){  
                resistances[dbId].attributes["virus"] = 1;
                resistances[dbId].attributes["vaccine"] = 3;
            }

            if(baseStats[dbId].type == "Virus"){  
                resistances[dbId].attributes["vaccine"] = 1;
                resistances[dbId].attributes["data"] = 3;
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

        const evolutionConditionData = await this.parseGameFile("main/evolution.mbe/000_evolution_condition");
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
            evoConditions[dbId].SPI = escapeHTML(entry[evolutionConditionData.headerLookup["SPI"]]);

            evoConditions[dbId].skillCountValor = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountValor"]]);
            evoConditions[dbId].skillCountPhilantropy = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountPhilantropy"]]);
            evoConditions[dbId].skillCountAmicable = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountAmicable"]]);
            evoConditions[dbId].skillCountWisdom = escapeHTML(entry[evolutionConditionData.headerLookup["skillCountWisdom"]]);

            evoConditions[dbId].talent = escapeHTML(entry[evolutionConditionData.headerLookup["talent"]]);

            evoConditions[dbId].needsItem = escapeHTML(entry[evolutionConditionData.headerLookup["needsItem"]]);

            evoConditions[dbId].jogressIdA = escapeHTML(entry[evolutionConditionData.headerLookup["jogressDbIdA"]]);
            evoConditions[dbId].jogressPersonalityA = escapeHTML(entry[evolutionConditionData.headerLookup["jogressPersonalityA"]]);

            evoConditions[dbId].jogressIdB = escapeHTML(entry[evolutionConditionData.headerLookup["jogressDbIdB"]]);
            evoConditions[dbId].jogressPersonalityB = escapeHTML(entry[evolutionConditionData.headerLookup["jogressPersonalityB"]]);
        }

        
    

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
                    resistances:  resistances[digimonId] || {},
                }
            }        
        }
        const cacheData = {
            digiData: digiData, 
            //levellUpGrowths: levellUpGrowths, 
            //fieldNames: fieldNames, 
            moveNames: moveNames, 
            sigMoves: sigMoveNames, 
            moveDescriptions: moveDescriptions, 
            autoMoveDescriptions: autoMoveDescriptions,
            digimonNames: digimonNames, 
            digimonDescriptions: digimonDescriptions, 
           // supportSkillNames: supportSkillNames, 
           // supportSkillDescriptions: supportSkillDescriptions,
            skillTextIds: skillTextIds,
            personalityNames: personalityNames,
            itemNames: itemNames,
            categoryNames: categoryNames,
            classNames: classNames,
            skillData: skillDataLookup,
            elementNames: elementNames,
            buffNames: buffNames,
            statusNames: statusNames,
            typeNames: typeNames,
            jogressSkills: jogressSkills
        };

        fs.writeFileSync(pathLib.join(this.getResourcesFolder(), gameDataFolder, "/unpacked", "digi_data.json"), JSON.stringify(cacheData));

        return cacheData;
    }

}