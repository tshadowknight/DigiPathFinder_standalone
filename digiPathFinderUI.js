if(typeof process != 'undefined' && process.versions.hasOwnProperty('electron')){
	var pathLib = require('path');
	var parse_dds = require('./lib/parseDDS');
	var { parse } = require('path');
	var xhr = require('xhr')
	var decodeDXT = require('decode-dxt');
	var Jimp = require('jimp')
	var DDSUtils = require('./lib/DDSUtils');
	var DexPane = require('./components/DexPane');
	var MonSelector = require('./components/MonSelector');
	var fs_promise = require('fs').promises
}

const dexPane = new DexPane("details_pane");

function localizePage(){
	$(".digi_name_placeholder").each(function(){
		$(this).html(localizationData[currentLocale].digimon[$(this).data("digimonid")]);
	});
	$(".move_name_placeholder").each(function(){
		const digimonId = $(this).data("digimonid");
		const moveId = $(this).data("moveid");
		if(digimonId){			
			const moveLevel = getDigiData(digimonId).moveDetails.inherited[moveId].level;
			$(this).html(localizationData[currentLocale].moves[moveId] + "(Lv. "+moveLevel+")");
		} else {
			$(this).html(localizationData[currentLocale].moves[moveId]);
		}				
	});
	$("[data-appstring!='']").each(function(){
		$(this).html(localizationData[currentLocale].app[$(this).data("appstring")]);
	});
	$("[data-appstringhint!='']").each(function(){
		$(this).attr("title", localizationData[currentLocale].app[$(this).data("appstringhint")]);
	});
}



function showRoute(route){	
	var pathContent = "";
	if(route && route.length){	
		for(var i = 0; i < route.length; i++){
			var moves = [];
			Object.keys(pathFinder.wantedSkills).forEach(function(skillId){
				if(pathFinder.digiData[route[i]].moves && pathFinder.digiData[route[i]].moves.indexOf(skillId) != -1){
					moves.push(skillId);					
				}
			});
			if(moves.length){
				pathContent+="<div class='path_digi_node path_digi_node_move '>";
			} else {
				pathContent+="<div class='path_digi_node path_digi_node_regular flex-container'>";
			}
			
			pathContent+="<div class='digi_header flex-item flex-container'>";
			
			pathContent+="<div class='path_img_container'>";
			pathContent+="<img class='path_img' class='flex-item' data-digimonid='"+route[i]+"'/>";
			pathContent+="</div>";
			pathContent+="<div data-digimonid='"+route[i]+"' class='flex-item digi_name digi_name_placeholder'>";
			//pathContent+=pathFinder.digiData[route[i]].name;
			pathContent+="</div>";
			pathContent+="<div data-target='"+route[i]+"' class='db_link flex-item'>";
			pathContent+="<i class='fa fa-external-link' aria-hidden='true'></i>";
			pathContent+="</div>";
			
			pathContent+="</div>";
			pathContent+="<div class='flex-container moves_list'>";
			for(var j = 0; j < moves.length; j++){
				pathContent+="<center data-moveid='"+moves[j]+"' class='listed_move move_name_placeholder flex-item' data-digimonid='"+route[i]+"'></center>";
			}
			pathContent+="</div>";			
			pathContent+="<div title='Set as starting point' class='set_start_button' data-id='"+route[i]+"'><i class='fa fa-forward' aria-hidden='true'></i></div>";
			pathContent+="<div title='Ban from routes' class='set_banned_button' data-id='"+route[i]+"'><i class='fa fa-times' aria-hidden='true'></i></div>";
			pathContent+="</div>";
			if(i < route.length-1){
				if(pathFinder.digiData[route[i]].neighBours.prev.indexOf(String(route[i+1])) != -1){			
					pathContent+="<div class='path_arrow' style='color: #ff4f41'><i class='fa fa-chevron-down' aria-hidden='true' style='font-size:30px;'></i></div>";
				} else {
					let warnings = [];
					let maxStats = getDigiData(route[i]).maxBaseStats;
					let reqs =  getDigiData(route[i + 1]).conditions;
					for(let condType in reqs){
						if(reqs[condType]){
							if(condType == "Other"){
								warnings.push(localizationData[currentLocale].app.warn_special_evo);
								//warn_difficult_evo
							} else if(["LVL", "CAM", "ABI"].indexOf(condType) == -1){
								if(maxStats[condType] < reqs[condType]){
									warnings.push(localizationData[currentLocale].app.warn_difficult_evo+condType+"!");
								}
							}
						}
					}
					let warningElem = "";
					if(warnings.length){
						warningElem = "<div title='"+(warnings.join("\n"))+"' class='evo_warning'><i class='fa fa-warning' aria-hidden='true'></i></div>"
					}
					
					pathContent+="<div class='path_arrow' style='color:#3cb367'><i class='fa fa-chevron-down' aria-hidden='true' style='font-size:30px;'></i>"+warningElem+"</div>";
				}
			}
		}
	} else {
		pathContent = "<div data-appstring='no_path_warning' id='no_path_warning'>No route could be found with the current bans!</div>";
	}	
			
		
	$("#path_container_content").hide();
	$("#path_container_content").html(pathContent);
	$("#path_container_content").fadeIn("fast");

	let images = $("#path_container_content")[0].querySelectorAll(".path_img");
	for(let img of images){
		setDDSImage(img, img.getAttribute("data-digimonid"))
	}

	

	$(".set_start_button").on("click", function(){		
		var source = $(this).data("id");
		$("#start_digi").val(source);
		$("#start_digi").trigger("change");
		if(pathFinder.currentLookupMode == "digi"){
			findDigiRoute();
		} else {
			findSkillRoute();
		}				
	});
	$(".set_banned_button").on("click", function(){		
		pathFinder.bannedDigis[$(this).data("id")] = 1;
		if(pathFinder.currentLookupMode == "digi"){
			findDigiRoute();
		} else {
			findSkillRoute();
		}
		showBans();
	});
	$(".db_link").off().on("click", function(){				;
		//window.open(pathFinder.digiData[$(this).data("target")].url, '_blank');
		dexPane.showDigimon($(this).data("target"));
	});	
	
	$("#copy_to_clipboard").on("click", function(){		
		var copyContent = "";
		for(var i = 0; i < route.length; i++){
			var moves = [];
			Object.keys(pathFinder.wantedSkills).forEach(function(skillId){
				if(pathFinder.digiData[route[i]].moves && pathFinder.digiData[route[i]].moves.indexOf(skillId) != -1){
					moves.push(skillId);					
				}
			});
			copyContent+="*"+localizationData[currentLocale].digimon[route[i]]+"\n";
			
			for(var j = 0; j < moves.length; j++){
				copyContent+="\t>"+localizationData[currentLocale].moves[moves[j]]+"\n";
			}
			if(i < route.length-1){
				if(pathFinder.digiData[route[i]].neighBours.prev.indexOf(String(route[i+1])) != -1){	
					copyContent+=localizationData[currentLocale].app.txt_devolve_to+":\n";
				} else {
					copyContent+=localizationData[currentLocale].app.txt_evolve_to+":\n";	
				}
			}
			
		}
		if(copyContent!= ""){
			copyToClipboard(copyContent);
		}		
	});
	localizePage();
}

function copyToClipboard(val){
     var dummy = $('<textarea style="position: fixed; right: -500px;">').val(val).appendTo('body').select()
	document.execCommand('copy')
}

function showBans(){
	var bansContent = "";
	Object.keys(pathFinder.bannedDigis).sort(function(a,b){return String(localizationData[currentLocale].digimon[a]).localeCompare(localizationData[currentLocale].digimon[b])}).forEach(function(id){
		bansContent+="<div class='ban_entry'><div data-digimonid='"+id+"' class='digi_name_placeholder banned_digi_name'></div><div style='width: 20px; display: inline-block;'><div data-id='"+id+"' class='remove_ban_button'><i class='fa fa-times' aria-hidden='true'></i></div></div></div>";
	});
	$("#bans_container").html(bansContent);
	$(".remove_ban_button").on("click", function(){		
		delete pathFinder.bannedDigis[$(this).data("id")];
		findSkillRoute();
		showBans();
	});	
	localizePage();
}

function showSkills(){
	var skillsContent = "";
	Object.keys(pathFinder.wantedSkills).forEach(function(id){
		skillsContent+="<div class='skill_entry  flex-item'><div data-moveid='"+id+"' class='move_name_placeholder'></div><div style='width: 20px; display: inline-block;'><div data-id='"+id+"' class='remove_skill_button'><i class='fa fa-times' aria-hidden='true'></i></div></div></div>";
	});
	$("#skills_container").html(skillsContent);
	$(".remove_skill_button").on("click", function(){		
		delete pathFinder.wantedSkills[$(this).data("id")];		
		showSkills();
		//findSkillRoute();
	});	
	localizePage();
}

var DDSCache = {};

async function convertDDSImage(digimonId){
	return new Promise(function(resolve, reject){
		const imgId = String(digimonId).padStart(4, '0').replace(/^0/, 1);
		const imagePath = pathLib.join(getResourcesFolder(), "./game_data/unpacked/images/ui_chara_icon_"+imgId+".img");
		xhr({
			uri: imagePath,
			responseType: 'arraybuffer'
		}, function (err, resp, data) {
			if(!err){
				
						
					var dds = parse_dds(data)
					console.log(dds.format)  // 'dxt1'
					console.log(dds.shape)   // [ width, height ]
					console.log(dds.images)  // [ ... mipmap level data ... ]
			
					// get the compressed texture data for gl.compressedTexImage2D
					
					let imageInfo = dds.images[0];
					let imageWidth = imageInfo.shape[0];
					let imageHeight = imageInfo.shape[1];
					let imageDataView = new DataView(data, imageInfo.offset, imageInfo.length);
			
					let rgbaData;
					
					let alignedWidth = Math.floor(imageWidth / 4) * 4;
					let alignedHeight = Math.floor(imageHeight / 4) * 4;

					if(dds.format){
						rgbaData = decodeDXT(imageDataView, alignedWidth, alignedHeight, dds.format);
					} else {
						const buffer= Buffer.from(data)
						
						const header = buffer.slice(0, 128);
						const headerInfo = DDSUtils.summarizeHeader(header);

						let imageData = buffer.slice(128);
						imageData = DDSUtils.correctFromDXGI(imageData, headerInfo.DXGIFormat);				

						rgbaData = imageData;
					}
					var image = new Jimp(imageWidth, imageHeight, async function (err, image) {
						image.bitmap.data = rgbaData;
						let dataUrl = await image.getBase64Async(Jimp.AUTO);
						DDSCache[digimonId] = dataUrl;
						resolve(dataUrl);
						
					});
				
			} else {
				resolve("");
			}		
		});	
	});
}

async function setDDSImage(elem, digimonId){
		
	let imgData;
	if(DDSCache[digimonId]){
		imgData = DDSCache[digimonId];
	} else {
		imgData = await convertDDSImage(digimonId);
	}

	if(imgData){
		elem.src = imgData;
		elem.style.display = "block";
	} else {
		elem.style.display = "none";
	}
}

function createControls(){
	var content = "";
	
	
	content+="<div class='control_section'>";
	content+="<div data-appstring='header_digimon' class='header'>Digimon</div>";
	content+="<div class='control_block' >";	
	content+="<div class='control_title'><span class data-appstring='start_digimon'>Start Digimon</span>";
	content+="<div id='start_digi_db_link' class='db_link flex-item'>";
	content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
	content+="</div>";
	content+="</div>";

	content+="<div class='digi_btn' id='start_digi_btn'>";		
	content+="</div>";	

	content+="<div class='' id='start_digi'>";		
	content+="</div>";	

	content+="<div class='digi_icon_container'>";
	content+="<img class='controls_digi_icon digi_icon' id='start_digi_icon' class='flex-item'/>";
	content+="</div>";
	content+="</div>";
	content+="<div class='controls_arrow' ><i class='fa fa-chevron-right' aria-hidden='true' style='font-size:30px;'></i></div>";
	content+="<div class='control_block' >";
	content+="<div class='control_title'><span data-appstring='end_digimon'>End Digimon</span>";
	content+="<div id='end_digi_db_link' class='db_link flex-item'>";
	content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
	content+="</div>";
	content+="<div class='digi_btn' id='end_digi_btn'>";		
	content+="None";
	content+="</div>";	

	content+="<div class='' id='end_digi'>";		
	content+="</div>";	
	content+="<div class='digi_icon_container'>";
	content+="<img class='controls_digi_icon digi_icon' id='end_digi_icon' class='flex-item'/>";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='control_section'>";
	content+="<div data-appstring='header_skills' class='header'>Skills (Max. 8)</div>";
	content+="<div class='skill_controls flex-container'>";
	content+="<select class='digi_select flex-item' id='end_move'>";
	
	content+="</select>";
	//content+="<div class='go_button' id='add_skill'>Add</div>";
	//content+="<div class='go_button' id='find_move_path' style='margin-left: 2px;'>Go!</div>";

	content+="<div id='skills_container'></div>";
	content+="</div>";
	content+="</div>";
	content+="<div class='control_section flex-container'>";
	content+="<div style='margin-right: 5px;' data-appstring='header_bans' class='header'>Bans</div>";
	content+="<div id='bans_container'></div>";
	content+="</div>";
	content+="</div>";
	
	$("#controls").html(content);
	
	
	
	
	populateMoveList();
	populateDigimonList("start_digi_btn", "start_digi", true);
	populateDigimonList("end_digi_btn", "end_digi");
	//secondary control pane
	content = "";
	
	content+="<div id='path_tools' class='flex-container'>";		
	content+="<div class='flex-item flex-container' id='find_move_path'>";
	content+="<div data-appstring='calculate_path' class='flex-item'>";
	//content+="Calculate Path";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="<div data-appstringhint='hint_copy' title='Copy the current path to text' id='copy_to_clipboard'><i class='fa fa-files-o' aria-hidden='true'></i></div>";
	
	$("#path_tools_container").html(content);
	
	localizePage();
	
	$("#find_digi_path").on("click", function(){
		findDigiRoute();
	});
	$("#path_tools").on("click", function(){
		findSkillRoute();
	});	
	$("#DNA_ban").on("click", function(){
		pathFinder.defaultBans.DNA.applied = $(this)[0].checked;
	});	
	$("#end_move").on("change", function(){
		if($(this).val() != -1){
			if(Object.keys(pathFinder.wantedSkills).length < 8){
				pathFinder.wantedSkills[$(this).val()] = 1;			
			}
			showSkills();
		}		
	});		
	
	$("#locale_select").on("change", function(){
		currentLocale = $(this).val();
		localStorage.setItem("DigiPathFinder_locale", currentLocale);
		populateMoveList();
		populateDigimonList("start_digi");
		populateDigimonList("end_digi", true);
		localizePage();
	});
	
	

	$(".db_link").off().on("click", function(){				;
		//window.open(pathFinder.digiData[$(this).data("target")].url, '_blank');
		dexPane.showDigimon($(this).data("target"));
	});

	
	$("#load_hider").hide();	
}

var currentPathSelections = {

}

function populateDigimonList(btnTarget, target, prepopulate){
	var content = "";
	var digimonNames = localizationData[currentLocale].digimon;
	
	const btn = document.querySelector("#"+btnTarget);
	
	function updateSelection(monId){
		setDDSImage(btn.closest(".control_block").querySelector(".digi_icon"), monId);
		btn.innerHTML = digimonNames[monId];
		const link = btn.closest(".control_block").querySelector(".db_link");
		$(link).data("target", monId);
		link.style.display = "inline";
		selector.hide()
		currentPathSelections[target] = monId
	}

	

	let selector = new MonSelector(target, {
		selected: function(monId){
			updateSelection(monId);
		}
	}, getFullDigiData());

	btn.addEventListener("click", function(){
		selector.toggle(currentPathSelections[target]);
	});

	if(prepopulate){
		updateSelection(Object.keys(digimonNames).sort(function(a,b){return String(digimonNames[a]).localeCompare( digimonNames[b])})[0]);
	}
}


function populateMoveList(){
	var content = "";
	var moveNames = localizationData[currentLocale].moves;
	content+="<option value='-1'></option>";
	Object.keys(moveNames).sort(function(a,b){return String(moveNames[a]).localeCompare(moveNames[b])}).forEach(function(id){
		content+="<option value='"+id+"'>"+moveNames[id]+"</option>";
	});	
	var currentVal = $("#end_move").val();
	$("#end_move").html(content);
	$("#end_move").val(currentVal);
}

function findDigiRoute(source, target){
	findSkillRoute();
}

var overlayTimer;
var path;
var digiWorker;
var pathsTried = 0;
var totalPaths = 1;
function findSkillRoute(){
	$("#path_container_content").fadeOut("fast");
	overlayTimer = (new Date).getTime();
	$("#overlay").fadeIn("fast");
	var source = currentPathSelections["start_digi"];
	var target = currentPathSelections["end_digi"];
	digiWorker = new Worker('digiPathWorker.js');
	digiWorker.postMessage([pathFinder.getParams(), source, target, cachedGameData]);
	digiWorker.onmessage = function(e) {
		pathFinder.currentLookupMode = "skill";		
		if(e.data.type == "result"){
			path = e.data.data;
			clearOverlay();
		} else if(e.data.type == "progress_init"){
			totalPaths = e.data.data || 1;
			pathsTried = 0;
			displayProgress();
			$("#progress_display").fadeIn("fast");
		} else if(e.data.type == "progress_update"){
			pathsTried = e.data.data;
			displayProgress();
		}		
	}	
}


function displayProgress(){	
	var percent = String(Math.floor((pathsTried / totalPaths * 100)));
	$("#progress_display").html(percent.padStart(3, "0"));
}

function clearOverlay(){
	if((new Date).getTime() - overlayTimer > 500){
		showRoute(path);
		$("#overlay").fadeOut("fast");
		$("#progress_display").fadeOut("fast");
		$("#progress_goal").html("");
		$("#progress_current").html("");
	} else {
		setTimeout(function(){
			clearOverlay();
		}, 50);
	}
}

var pathFinder;

var localizationConfig = {
	English: {
		app: "appStrings_en.json"
	},
	Chinese: {
		app: "appStrings_ch.json"
	},
	Korean: {
		app: "appStrings_ko.json"
	},
	German: {
		app: "appStrings_de.json"
	},
	/*JPN: {
		moves: "moveNames_jp.json",
		digimon: "digiNames_jp.json",
		app: "appStrings_jp.json"	
	}*/
}

var preferredLocale = localStorage.getItem("DigiPathFinder_locale");
var currentLocale = preferredLocale || "English";
if(!localizationConfig[currentLocale]){
	currentLocale =  "English";
}

var localizationData = {
	English: {
		moves: {},
		digimon: {},
		app: {}
	},
	Chinese: {
		moves: {},
		digimon: {},
		app: {}
	},
	Korean: {
		moves: {},
		digimon: {},
		app: {}
	},
	German: {
		moves: {},
		digimon: {},
		app: {}
	},
	/*JPN: {
		moves: {},
		digimon: {},
		app: {}
	}*/
};



function showGameFileLoader(msg){
	let elem = document.getElementById("game_file_loader");
	if(!elem){
		elem = document.createElement("div");
		elem.id = "game_file_loader";
	}
	elem.classList.remove("hidden");
	elem.innerHTML = msg;
	document.body.append(elem);

	document.getElementById("particles").classList.add("game_loader");
}

function setLoaderError(error){
	let elem = document.getElementById("game_file_loader");
	if(elem){
		elem.innerHTML = error;
	}
}

function hideGameFileLoader(){
	let elem = document.getElementById("game_file_loader");
	if(elem){
		elem.classList.add("hidden");
	}

	document.getElementById("particles").classList.remove("game_loader");
}

function createOptions(){
	let elem = document.getElementById("options_pane");
	let content = "";
	content+="<div id='options_container'>";

	content+="<div class='row locale'>";
	content+="<div class='label'>";
	content+=localizationData[currentLocale].app.label_language;
	content+="</div>"
	content+="<div class='value'>";
	content+="<select id='appLang'>";
	for(let option in localizationConfig){
		content+="<option value='"+option+"' "+((option == currentLocale) ? "selected" : "")+">"+option+"</option>";
	}
	content+="</select>"

	content+="<button id='applyLocale'>";
	content+="Apply"
	content+="</button>"
	content+="This will reload the app."
	content+="</div>"
	content+="</div>"

	if(isElectron()){
		content+="<div class='row'>";
		content+="<div class='label'>";
		content+=localizationData[currentLocale].app.game_path;
		content+="</div>"
		content+="<div class='value'>";
		content+="<input id='gameFilesPath' value='"+gameFilesPath+"'></input>";
		content+="</div>"
		content+="<div class='value'>";
		content+="<i title='Set to default' class='fa fa-refresh' id='refresh_path' aria-hidden='true'></i>";
		content+="</div>"
		content+="</div>"

		content+="<div class='row no_files'>";
		if(!hasInstalledGameFiles()){
			content+="<div class='label no_files'>";
			content+=localizationData[currentLocale].app.no_game_files;
			content+="</div>"
		}

		
		
		content+="</div>"

		

		content+="<div class='row'>";
		content+="<div class='label'>";
		content+="<div id='reload_btn'>";
		content+=localizationData[currentLocale].app.reload_game_files;
		content+="</div>"
		content+="</div>"
		
	}
	


	
	
	elem.innerHTML = content;

	if(isElectron()){
		elem.querySelector("#gameFilesPath").addEventListener("change", function(){
			gameFilesPath = this.value;
			localStorage.setItem("DigiPathFinder_game_file_path", gameFilesPath);
			createOptions();
			refreshWarnings();
		});

		elem.querySelector("#refresh_path").addEventListener("click", function(){
			gameFilesPath = defaultGamePath;
			localStorage.setItem("DigiPathFinder_game_file_path", gameFilesPath);
			createOptions();
			refreshWarnings();
		});

		elem.querySelector("#reload_btn").addEventListener("click", function(){
			toggleOptions();
			$("#load_hider").show();	
			initPathFinder(true)
			refreshWarnings();
		});
	}
	elem.querySelector("#appLang").addEventListener("click", function(){
		localStorage.setItem("DigiPathFinder_locale", this.value);
		populateMoveList();
		populateDigimonList("start_digi_btn", "start_digi", true);
		populateDigimonList("end_digi_btn","end_digi");
		localizePage();
	});

	elem.querySelector("#applyLocale").addEventListener("click", function(){
		location.reload()
	});

	
}

function refreshWarnings(){
	if(isElectron()){
		if(!hasInstalledGameFiles()){
			$("#no_game_files_warning").show();	
		} else {
			$("#no_game_files_warning").hide();	
		}
	} else {
		$("#no_game_files_warning").hide();	
	}
}

function toggleOptions(){
	let elem = document.getElementById("options_pane");
	if(elem.style.display == "none" || elem.style.display == ""){
		elem.style.display = "flex";
		createOptions();
	} else {
		elem.style.display = "none";
	}
	
}

var cachedGameData;

function getFullDigiData(){
	if(cachedGameData){
		return cachedGameData.digiData;
	} 
	return {};
}

function getDigiData(digiId){
	if(cachedGameData){
		if(cachedGameData.digiData[digiId]){
			return cachedGameData.digiData[digiId];
		} else {
			return {
				id: digiId,
                name: null,
                moves: [],
                neighBours: {},
                baseStats: {},
                moveDetails: {},
                conditions: {},
                maxBaseStats: {//used for checking difficult evolutions
                    "HP": 0,
                    "SP": 0,
                    "ATK": 0,
                    "DEF": 0,
                    "INT": 0,
                    "SPD": 0,
                },
                encounters: {base: [], hame: []},
				isUndefined: true
			};
		}		
	}
	return {};
}

function getGrowthCurveInfo(){
	if(cachedGameData){
		return cachedGameData.levellUpGrowths;
	}
	return {};
}

function getSkillTextIdInfo(){
	if(cachedGameData){
		return cachedGameData.skillTextIds;
	}
	return {};
}

function initPathFinder(forceReload){
	if(forceReload){
		cachedGameData = null;
	}

	if(isElectron()){
		checkDirectories();
		if(!hasGameFiles() || forceReload){
			showGameFileLoader(localizationData[currentLocale].app.loader_msg);
			fetchGameFiles().then(function(){
				phase2();
			});
			
		} else {
			phase2();
		}
	} else {
		$("#standalone_version_link").show();
		$("#standalone_version_link a").html(localizationData[currentLocale].app.standalone_link)
		showGameFileLoader(localizationData[currentLocale].app.loader_msg_web);
		phase2();
	}
	

	function phase2(){		
		pathFinder = new DigiPathFinder();

		let gameData;
		if(cachedGameData){
			gameData = cachedGameData;
			finalize();
		} else {
			preparePathFinderData().then(function(data){
				gameData = data;
				cachedGameData = data;
				finalize();
			});
		}

		function finalize(){
			
			for(let locale in localizationConfig){
				localizationData[locale].moves = gameData.moveNames[locale];
				localizationData[locale].moveDesc = gameData.moveDescriptions[locale];
				localizationData[locale].digimon = gameData.digimonNames[locale];
				localizationData[locale].digimonDesc = gameData.digimonDescriptions[locale];
				localizationData[locale].supportSkills = gameData.supportSkillNames[locale];
				localizationData[locale].supportSkillDesc = gameData.supportSkillDescriptions[locale];
				localizationData[locale].sigMoves = gameData.sigMoves[locale];
				localizationData[locale].fieldNames = gameData.fieldNames[locale];
			}	


			pathFinder.init(gameData, createControls);	

			hideGameFileLoader();
			$("#worker_cancel").on("click", function(){	
				if(digiWorker){
					digiWorker.terminate();			
				}
				$("#overlay").fadeOut("fast");		
			});
			
		}
	}
}

$(document).ready(function(){

	$("#options").on("click", function(){
		toggleOptions();
	});

	var deferreds = [];
	Object.keys(localizationConfig).forEach(function(locale){
		/*deferreds.push($.getJSON(localizationConfig[locale].moves, function(data){
			localizationData[locale].moves = data;
		}));
		deferreds.push($.getJSON(localizationConfig[locale].digimon, function(data){
			localizationData[locale].digimon = data;
		}));*/
		deferreds.push($.getJSON("appStrings/"+localizationConfig[locale].app, function(data){
			localizationData[locale].app = data;
		}));
	});
	$.when.apply($, deferreds).then(function(){
		particlesJS.load('particles', 'particles.json', function() {
			console.log('callback - particles.js config loaded');
		});	
		initPathFinder();	
		refreshWarnings();
	});	
});
