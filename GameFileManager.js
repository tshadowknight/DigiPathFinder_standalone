
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

function fetchGameFiles(){	
    return new Promise(function(resolve, reject){
        const process = require('child_process');   

        let cmd;
        if(os.platform() === "win32"){
            let cmdDir = pathLib.join(getResourcesFolder(), "DSCSTools/win")
            cmd = "\""+getResourcesFolder()+""+'\\DSCSTools\\win\\unpack_game_files.bat\" \"'+cmdDir+'\" \"'+gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
        } else if(os.platform() === "linux"){
            let cmdDir = pathLib.join(getResourcesFolder(), "DSCSTools/linux")
            cmd =  "\""+getResourcesFolder()+""+'\\DSCSTools\\linux\\unpack_game_files.bat\"  \"'+cmdDir+'\" \"'+gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
        } else {
            setLoaderError("Unsupported platform."); 
            throw("Unsupported platform.");
        }

        var ls = process.exec(cmd);
        ls.stdout.on('data', function (data) {
            const batchResult = data.toString();
            console.log(data.toString());
            /*if(batchResult.indexOf("Error:") != -1){
                setLoaderError("Could not load the game files, please make sure the path is set correctly!");       
                reject();
            }*/
        });
        ls.stderr.on('data', function (data) {
          console.log(data.toString());
          
        });
        ls.on('close', function (code) {
           if (code == 0) {
                console.log('Stop');
                //fs.rm(pathLib.join(getResourcesFolder(), "game_data/packed"), { recursive: true, force: true });
                resolve();
           } else {
                console.log('Start');
           }             
        });
    });	
    
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
			  let headerLookup = {};
			  for(let i = 0; i < headers.length; i++){
				  headerLookup[headers[i]] = i;
			  }
			  
			  resolve({headerLookup: headerLookup, data: records});
			});
	});	
}

async function preparePathFinderData(){
	let digimonNames = {};
	const digimonListData = await parseGameFile("digimon_list.mbe/digimon");
    let validDigimon = {};
	const nameData = await parseGameFile("charname.mbe/Sheet1");
	
	
	let evolutions = {};
	const evolutionData = await parseGameFile("evolution_next_para.mbe/digimon");
	for(let entry of evolutionData.data){
		const digimonId = escapeHTML(entry[evolutionData.headerLookup["id"]]);
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
    const baseStatFields = ["memoryUse","growthType","unk3","baseHP","baseSP","baseATK","baseDEF","baseINT","baseSPD","maxLevel","equipSlots","supportSkill"];
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

   
    

    let digiData = {};
    for(let entry of digimonListData.data){
        const digimonId = entry[digimonListData.headerLookup["id"]];
        if(validDigimon[digimonId]){
            digiData[digimonId] = {
                id: digimonId,
                name: digimonNames[digimonId],
                moves: movesLearned[digimonId],
                neighBours: evolutions[digimonId],
                baseStats: baseStats[digimonId],
                moveDetails: movesLearnedDetail[digimonId],
                conditions: evoConditions[digimonId]
            }
        }        
    }

    return {digiData: digiData, levellUpGrowths: levellUpGrowths, moveNames: moveNames, sigMoves: moveNamesFull, moveDescriptions: moveDescriptions, digimonNames: digimonNames, digimonDescriptions: digimonDescriptions, supportSkillNames: supportSkillNames, supportSkillDescriptions: supportSkillDescriptions};
}