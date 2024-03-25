
//game file management
var fs = require('fs');
const os = require('os');
var pathLib = require('path');

function getResourcesFolder(){
    if(__dirname.match(/.*\.asar$/)){
        return pathLib.dirname(__dirname);
    } else {
        return __dirname;
    }
}

const requiredFiles = [
    "charname.mbe/Sheet1.csv",
    "digimon_farm_para.mbe/digimon.csv",
    "digimon_common_para.mbe/digimon.csv",
    "digimon_list.mbe/digimon.csv",
    "digimon_book_explanation.mbe/Sheet1.csv",
    "evolution_next_para.mbe/digimon.csv",
    "skill_name.mbe/Sheet1.csv",
    "skill_content_name.mbe/Sheet1.csv",
    "support_skill_name.mbe/Sheet1.csv",
    "support_skill_content_name.mbe/Sheet1.csv",
    "lvup_para.mbe/table.csv",
    "evolution_condition_para.mbe/digimon.csv",
    "mon_cpl.mbe/Coupling.csv",
    "map_encount_param.mbe/Field.csv",
    "field_area_para.mbe/Field_List.csv",
    "field_area_para_add.mbe/Field_List.csv",
    "fieldname.mbe/Sheet1.csv",
    "map_encount_param_add.mbe/Field.csv",
    "battle_command.mbe/Command.csv",
    "images"
];

function hasGameFiles(){
    let isKitValid = true;
    for(let file of requiredFiles){
        if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/unpacked', file))) {
            isKitValid = false;
        }
    }
    return isKitValid;
}

const requiredGameFiles = [
    "DSDBP.steam.mvgl",
];

function hasInstalledGameFiles(){
    let isKitValid = true;
    for(let file of requiredGameFiles){
        if (!fs.existsSync(pathLib.join(gameFilesPath, './resources', file))) {
            isKitValid = false;
        }
    }
    return isKitValid;
}

function checkDirectories(){
    if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data'))) {
        fs.mkdirSync(pathLib.join(getResourcesFolder(), './game_data'));
    }
    if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/packed'))) {
        fs.mkdirSync(pathLib.join(getResourcesFolder(), './game_data/packed'));
    }
    if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/unpacked'))) {
        fs.mkdirSync(pathLib.join(getResourcesFolder(), './game_data/unpacked'));
    }
}

var defaultGamePath = "C:/Program Files (x86)/Steam/steamapps/common/Digimon Story Cyber Sleuth Complete Edition";
var gameFilesPath = localStorage.getItem("DigiPathFinder_game_file_path") || defaultGamePath;

var potentialLoadError = false;

function runCmd(cmd){
    const process = require('child_process');   
    let potentialLoadError = false;
    let exitCode;
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

async function fetchGameFiles(){	
  
        const process = require('child_process');   
        if(!hasInstalledGameFiles()){
            return;
        }

        let cmd;
        if(os.platform() === "win32"){
            let cmdDir = pathLib.join(getResourcesFolder(), "DSCSTools/win")
            cmd = "\""+getResourcesFolder()+""+'\\DSCSTools\\win\\unpack_game_files.bat\" \"'+cmdDir+'\"  ';
            
            const mainExtractCmd = ".\\DSCSTools\\win\\DSCSToolsCLI.exe --extract \""+gameFilesPath+'/resources/DSDBP.steam.mvgl'+"\" .\\game_data\\packed";
            await runCmd(mainExtractCmd);
            if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/packed/data')) && !fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/packed/text'))  && !fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/packed/images'))) {
                setLoaderError(localizationData[currentLocale].app.warn_no_extract); 
                throw("Failed extract.");
            }
            
            let result = await runCmd(cmd);
        } else if(os.platform() === "linux"){
            let cmdDir = pathLib.join(getResourcesFolder(), "DSCSTools/linux")
            cmd =  "\""+getResourcesFolder()+""+'\\DSCSTools\\linux\\unpack_game_files.bat\"  \"'+cmdDir+'\" \"'+gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
        } else {
            setLoaderError("Unsupported platform."); 
            throw("Unsupported platform.");
        }

        

        
        fs.rm(pathLib.join(getResourcesFolder(), "game_data/packed"), { recursive: true, force: true });
        await cachceDDSImages();    
    
}

async function cachceDDSImages(){
    const digimonListData = await parseGameFile("digimon_list.mbe/digimon");
    DDSCache = {};
    for(let entry of digimonListData.data){
        const digimonId = entry[digimonListData.headerLookup["id"]];
        await convertDDSImage(digimonId);//prepopulate cache
    }
    fs.writeFileSync(pathLib.join(getResourcesFolder(), './game_data/', 'dds_cache.json'), JSON.stringify(DDSCache));
    
}

function parseGameFile(file){
	return new Promise(function(resolve, reject){
	
		
		const { parse } = require('csv-parse');
		const records = [];

		var csvData=[];
		fs.createReadStream(pathLib.join(getResourcesFolder(), "game_data/unpacked/"+file+".csv"))
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
                if(hardDefinedHeaders[fileKey] && Object.keys(hardDefinedHeaders[fileKey]).length){
                    headerLookup = hardDefinedHeaders[fileKey]
                } else {
                    throw "No header information for " + fileKey;
                }

                resolve({headerLookup: headerLookup, data: records});
            });
	});	
}

async function generateHeaders(){
    let result = {};
    for(let file of requiredFiles){
        try {
            if(file != "images"){
                result[file] = (await parseGameFile(file.replace(".csv", ""))).headerLookup;
            }
            
        } catch(e){
            
        }
        
    }
    console.log(result);
}

const commonFieldTranslations = {    
    attribute: {
        0: "neutral",
        1: "fire",
        2: "water",
        3: "plant",
        4: "electric",
        5: "earth",
        6: "wind",
        7: "light",
        8: "dark"
    },
    type: {
        0: "free",
        1: "virus", 
        2: "vaccine",
        3: "data"
    },
    level: {
        1: "training_1",
        2: "training_2",
        3: "child",
        4: "adult",
        5: "perfect",
        6: "ultimate",
        7: "ultra"
    }
};

async function preparePathFinderData(){
	let digimonNames = {};
	const digimonListData = await parseGameFile("digimon_list.mbe/digimon");
    let validDigimon = {};
	const nameData = await parseGameFile("charname.mbe/Sheet1");
	
	
	let evolutions = {};
	const evolutionData = await parseGameFile("evolution_next_para.mbe/digimon");
	for(let entry of evolutionData.data){
		const digimonId = escapeHTML(entry[evolutionData.headerLookup["id"]]);
        validDigimon[digimonId] = true; //remove filtering to accomodate more mod types
		if(!evolutions[digimonId]){
			evolutions[digimonId] = {
				prev: [],
				next: []
			}
		}
		for(let i = 1; i <=6 ; i++){
			let targetDigimonId = escapeHTML(entry[evolutionData.headerLookup["digi"+i]])
			if(targetDigimonId != 0){
                validDigimon[digimonId] = true;
                validDigimon[targetDigimonId] = true;
				evolutions[digimonId].next.push(targetDigimonId);
				if(!evolutions[targetDigimonId]){
					evolutions[targetDigimonId] = {
						prev: [],
						next: []
					}
				}
				evolutions[targetDigimonId].prev.push(digimonId);
			}
		}
	}

    for(let entry of nameData.data){
		let nameId = entry[nameData.headerLookup["ID"]];
		if(nameId < 2000){
			nameId = nameId.substr(1) * 1;
            if(validDigimon[nameId]){
                for(let locale in localizationConfig){
                    if(!digimonNames[locale]){
                        digimonNames[locale] = {};
                    }
    
                    digimonNames[locale][nameId] = escapeHTML(entry[nameData.headerLookup[locale]]);		
                }
            }		
		}		
	}

    let digimonDescriptions = {};
    const digmonDescData = await parseGameFile("digimon_book_explanation.mbe/Sheet1");
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
	let movesLearned = {};
    let movesLearnedDetail = {};
    let sigMoves = {};
    let baseStats = {};
    const baseStatFields = ["memoryUse","growthType","unk3","baseHP","baseSP","baseATK","baseDEF","baseINT","baseSPD","maxLevel","equipSlots","supportSkill", "profile"];
	const farmData = await parseGameFile("digimon_farm_para.mbe/digimon");
	for(let entry of farmData.data){
		const digimonId = escapeHTML(entry[farmData.headerLookup["id"]]);
		if(!movesLearned[digimonId]){
			movesLearned[digimonId] = [];
		}
        if(!movesLearnedDetail[digimonId]){
			movesLearnedDetail[digimonId] = {
                inherited: {},
                signature: {}
            };
		}
		for(let i = 1; i <=6 ; i++){
			let moveId = escapeHTML(entry[farmData.headerLookup["move"+i]]);
            let moveLevel = escapeHTML(entry[farmData.headerLookup["move"+i+"Level"]]);
			if(moveId != 0){
				movesAvailable[moveId] = true;
				movesLearned[digimonId].push(moveId);

                movesLearnedDetail[digimonId].inherited[moveId] = {level: moveLevel};
			}
		}

        for(let i = 1; i <=2 ; i++){
            let moveId = escapeHTML(entry[farmData.headerLookup["sMove"+i]]);
            let moveLevel = escapeHTML(entry[farmData.headerLookup["sMove"+i+"Level"]]);
			if(moveId != 0){
                movesLearnedDetail[digimonId].signature[moveId] = {level: moveLevel};
			}
        }

        if(!baseStats[digimonId]){
			baseStats[digimonId] = {};
		}
        for(let field of baseStatFields){
            baseStats[digimonId][field] =  escapeHTML(entry[farmData.headerLookup[field]]);
        }

        
	}

    

    const commonStatFields = ["level", "attribute","type"];
	const commonData = await parseGameFile("digimon_common_para.mbe/digimon");
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
	const moveNameData = await parseGameFile("skill_name.mbe/Sheet1");
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
    const moveDescData = await parseGameFile("skill_content_name.mbe/Sheet1");
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
    const supportSkillNameData = await parseGameFile("support_skill_name.mbe/Sheet1");
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
    const supportSkillDescData = await parseGameFile("support_skill_content_name.mbe/Sheet1");
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
    const growthRateData = await parseGameFile("lvup_para.mbe/table");
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
   const evoConditionData = await parseGameFile("evolution_condition_para.mbe/digimon");
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
   const couplingData = await parseGameFile("mon_cpl.mbe/Coupling");

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
   const fieldListData = await parseGameFile("field_area_para.mbe/Field_List");

   for(let entry of fieldListData.data){
        const areaPara = escapeHTML(entry[fieldListData.headerLookup["map"]]);
        const fieldId = escapeHTML(entry[fieldListData.headerLookup["field_name_id"]]);
        areaParaToFieldId[areaPara] = fieldId;
   }

   let areaParaToFieldIdHame = {};
   const fieldListDataHame = await parseGameFile("field_area_para_add.mbe/Field_List");

   for(let entry of fieldListDataHame.data){
        const areaPara = escapeHTML(entry[fieldListDataHame.headerLookup["map"]]);
        const fieldId = escapeHTML(entry[fieldListDataHame.headerLookup["field_name_id"]]);
        areaParaToFieldIdHame[areaPara] = fieldId;
   }

   let fieldNames = {};
   const fieldNameData = await parseGameFile("fieldname.mbe/Sheet1");
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
   const encounterParamData = await parseGameFile("map_encount_param.mbe/Field");
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
   const encounterParamDataHame = await parseGameFile("map_encount_param_add.mbe/Field");
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
    const skillTextIdData = await parseGameFile("battle_command.mbe/Command");
    for(let entry of skillTextIdData.data){
        const skillId = escapeHTML(entry[skillTextIdData.headerLookup["ID"]]);
        const skillTextId = escapeHTML(entry[skillTextIdData.headerLookup["TextId"]]);
        skillTextIds[skillId] = skillTextId;
    }
    const maxLevel = 99;

    if (!fs.existsSync(pathLib.join(getResourcesFolder(), './game_data/', 'dds_cache.json'))) {
        showGameFileLoader(localizationData[currentLocale].app.loader_msg_imgs);
        await cachceDDSImages();
        hideGameFileLoader();
    } else {
        DDSCache = JSON.parse(fs.readFileSync(pathLib.join(getResourcesFolder(), './game_data/', 'dds_cache.json')));
    }
    

    let digiData = {};
    for(let entry of digimonListData.data){
        const digimonId = entry[digimonListData.headerLookup["id"]];
        
        if(validDigimon[digimonId]){
            digiData[digimonId] = {
                id: digimonId,
                name: digimonNames[digimonId] || "",
                moves: movesLearned[digimonId] || [],
                neighBours: evolutions[digimonId] || {},
                baseStats: baseStats[digimonId] || {},
                moveDetails: movesLearnedDetail[digimonId] || {},
                conditions: evoConditions[digimonId] || {},
                maxBaseStats: {//used for checking difficult evolutions
                    "HP": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths, "HP", maxLevel),
                    "SP": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths, "SP", maxLevel),
                    "ATK": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths, "ATK", maxLevel),
                    "DEF": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths, "DEF", maxLevel),
                    "INT": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths,"INT", maxLevel),
                    "SPD": getStatValueAtLevel(baseStats[digimonId], levellUpGrowths, "SPD", maxLevel),
                },
                encounters: {base: digimonToEncounters[digimonId] || [], hame: digimonToEncountersHame[digimonId] || []}
            }
        }        
    }

    return {
        digiData: digiData, 
        levellUpGrowths: levellUpGrowths, 
        fieldNames: fieldNames, 
        moveNames: moveNames, 
        sigMoves: moveNamesFull, 
        moveDescriptions: moveDescriptions, 
        digimonNames: digimonNames, 
        digimonDescriptions: digimonDescriptions, 
        supportSkillNames: supportSkillNames, 
        supportSkillDescriptions: supportSkillDescriptions,
        skillTextIds: skillTextIds
    };
}

function getStatValueAtLevel(baseStats, levellUpGrowths, stat, level){
	let baseStatValue = baseStats["base"+stat];
	let growthType = baseStats.growthType;
	let growthTable = levellUpGrowths[growthType];
	let growthAmount = growthTable[stat];
	statValue = Math.floor(baseStatValue * 1 + (growthAmount * (level - 1)));

	statValue/=100;
	if(stat == "HP"){  
		statValue = Math.floor(statValue);
		statValue*=10;
	} 
	return Math.floor(statValue);
}