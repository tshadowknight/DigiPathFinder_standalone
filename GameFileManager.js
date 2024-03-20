
//game file management
var fs = require('fs');
const os = require('os');

const requiredFiles = [
    "charname.mbe/Sheet1.csv",
    "digimon_farm_para.mbe/digimon.csv",
    "digimon_list.mbe/digimon.csv",
    "evolution_next_para.mbe/digimon.csv",
    "skill_name.mbe/Sheet1.csv",
    "images"
];

function hasGameFiles(){
    let isKitValid = true;
    for(let file of requiredFiles){
        if (!fs.existsSync('./game_data/unpacked/'+file)) {
            isKitValid = false;
        }
    }
    return isKitValid;
}

function checkDirectories(){
    if (!fs.existsSync('./game_data')) {
        fs.mkdirSync('./game_data');
    }
    if (!fs.existsSync('./game_data/packed')) {
        fs.mkdirSync('./game_data/packed');
    }
    if (!fs.existsSync('./game_data/unpacked')) {
        fs.mkdirSync('./game_data/unpacked');
    }
}

var defaultGamePath = "C:/Program Files (x86)/Steam/steamapps/common/Digimon Story Cyber Sleuth Complete Edition";
var gameFilesPath = localStorage.getItem("DigiPathFinder_game_file_path") || defaultGamePath;

function fetchGameFiles(){	
    return new Promise(function(resolve, reject){
        const process = require('child_process');   

        let cmd;
        if(os.platform() === "win32"){
            cmd = 'DSCSTools\\win\\unpack_game_files.bat \"'+gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
        } else if(os.platform() === "linux"){
            cmd = 'DSCSTools\\linux\\unpack_game_files.bat \"'+gameFilesPath+'/resources/DSDBP.steam.mvgl'+'\" ';
        } else {
            setLoaderError("Unsupported platform."); 
            throw("Unsupported platform.");
        }

        var ls = process.exec(cmd);
        ls.stdout.on('data', function (data) {
            const batchResult = data.toString();
            console.log(data.toString());
            if(batchResult.indexOf("Error:") != -1){
                setLoaderError("Could not load the game files, please make sure the path is set correctly!");       
                reject();
            }
        });
        ls.stderr.on('data', function (data) {
          console.log(data.toString());
          
        });
        ls.on('close', function (code) {
           if (code == 0) {
                console.log('Stop');
                fs.rm('./game_data/packed', { recursive: true, force: true });
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
		fs.createReadStream("game_data/unpacked/"+file+".csv")
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
	const nameData = await parseGameFile("charname.mbe/Sheet1");
	
	for(let entry of nameData.data){
		let nameId = entry[nameData.headerLookup["ID"]];
		if(nameId < 2000){
			nameId = nameId.substr(1) * 1;
    
            for(let locale in localizationConfig){
                if(!digimonNames[locale]){
                    digimonNames[locale] = {};
                }

                digimonNames[locale][nameId] = entry[nameData.headerLookup[locale]];		
            }
			
		}
		
	}
	let evolutions = {};
	const evolutionData = await parseGameFile("evolution_next_para.mbe/digimon");
	for(let entry of evolutionData.data){
		const digimonId = entry[evolutionData.headerLookup["id"]];
		if(!evolutions[digimonId]){
			evolutions[digimonId] = {
				prev: [],
				next: []
			}
		}
		for(let i = 1; i <=6 ; i++){
			let targetDigimonId = entry[evolutionData.headerLookup["digi"+i]]
			if(targetDigimonId != 0){
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

	let movesAvailable = {};
	let moveNames = {};
	let movesLearned = {};
	const farmData = await parseGameFile("digimon_farm_para.mbe/digimon");
	for(let entry of farmData.data){
		const digimonId = entry[farmData.headerLookup["id"]];
		if(!movesLearned[digimonId]){
			movesLearned[digimonId] = [];
		}
		for(let i = 1; i <=6 ; i++){
			let moveId = entry[farmData.headerLookup["move"+i]];
			if(moveId != 0){
				movesAvailable[moveId] = true;
				movesLearned[digimonId].push(moveId);
			}
		}
	}

	let moveNamesFull = {};
	const moveNameData = await parseGameFile("skill_name.mbe/Sheet1");
	for(let entry of moveNameData.data){
		const moveId = entry[moveNameData.headerLookup["ID"]];		

        for(let locale in localizationConfig){
            if(!moveNamesFull[locale]){
                moveNamesFull[locale] = {};
            }
            moveNamesFull[locale][moveId] = entry[moveNameData.headerLookup[locale]];	
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

    let digiData = {};
    for(let entry of digimonListData.data){
        const digimonId = entry[digimonListData.headerLookup["id"]];
        digiData[digimonId] = {
            id: digimonId,
            name: digimonNames[digimonId],
            moves: movesLearned[digimonId],
            neighBours: evolutions[digimonId]
        }
    }

    return {digiData: digiData, moveNames: moveNames, digimonNames: digimonNames};
}