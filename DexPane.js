module.exports = DexPane;

function DexPane(containerId){
    this._containerId = containerId;
    this._activeId = -1;
    this._lastScroll = 0;
}

DexPane.prototype.setActiveId = function(id){
    this._activeId = id;
}

DexPane.prototype.getMonInfo = function(monId){
    let monInfo = {
        id: -1,
        name: "???",
        description: "???",
        baseStats: {
            "memoryUse": 0,
            "growthType": 0,
            "unk3": 0,
            "baseHP": "???",
            "baseSP": "???",
            "baseATK": "???",
            "baseDEF": "???",
            "baseINT": "???",
            "baseSPD": "???",
            "maxLevel": 0,
            "equipSlots": 0,
            "supportSkill": -1
        },
        moves: [],
        evosReqs: {},
        neighBours: {prev: [], next: []}
    };
    if(monId != -1){
        monInfo = {
            id: monId,
            name: localizationData[currentLocale].digimon[monId],
            description: localizationData[currentLocale].digimonDesc[getDigiData()[monId].baseStats.profile],
            baseStats: getDigiData()[monId].baseStats,
            moves: getDigiData()[monId].moveDetails,
            evosReqs: getDigiData()[monId].conditions,
            neighBours: getDigiData()[monId].neighBours,

        };
    }
    return monInfo;
}


DexPane.prototype.show = function(context){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);
    let monInfo = this.getMonInfo(this._activeId);
    let content = "";

    content+="<div class='dex_pane_header'>"; 

    content+="<div class='row name_info'>";
    content+="<div class='banner'>";
    content+="<div class='icon dex_img_container'>";
    content+="<img data-id='"+monInfo.id+"' class='dex_img'/>";
    content+="</div>";
    
    content+="<div class='name'>";
    content+=monInfo.name;
    content+="</div>";
    content+="</div>";
    
    content+="</div>";

    content+="</div>";

    content+="<div class='dex_pane_scroll'>"; 
    content+="<div class='dex_pane'>";
    content+="<div class='section'>";


    content+="<div class='section_header'>";
   
    content+=localizationData[currentLocale].app.DEX_header_general;
    content+="</div>";

    content+="<div class='name_desc'>";
    

    const listedAttributes = [
        {
            item: "level",
            label: localizationData[currentLocale].app.DEX_general_level,
            localizer: localizationData[currentLocale].app.levels
        },
        {
            item: "type",
            label: localizationData[currentLocale].app.DEX_general_type,
            localizer: localizationData[currentLocale].app.types
        },
        {
            item: "attribute",
            label: localizationData[currentLocale].app.DEX_general_attribute,
            localizer: localizationData[currentLocale].app.attributes
        },
        {
            item: "memoryUse",
            label: localizationData[currentLocale].app.DEX_general_memoryUse
        },
        {
            item: "equipSlots",
            label: localizationData[currentLocale].app.DEX_general_equipSlots
        },        

    ];
    let tableContent = [];
    for(let attr of listedAttributes){
        let value = monInfo.baseStats[attr.item];
        if(attr.localizer){
            value = attr.localizer[value];
        } 
        tableContent.push(["<div class='row_label'>"+attr.label+"</div>", value]);
    }
    content+="<table id='general_table' class='stats'>";  
    content+=this.arrayToTableContent(tableContent, true);
    content+="</table>";

    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_general_support_skill;
    content+="</div>";

    content+="<div class='support_skill_container'>";
    content+="<div class='row'>";
    content+="<div class='label'>";
    content+=localizationData[currentLocale].supportSkills[monInfo.baseStats.supportSkill];
    content+="</div>";
    content+="<div class='value'>";
    content+=localizationData[currentLocale].supportSkillDesc[monInfo.baseStats.supportSkill];
    content+="</div>";
    content+="</div>";
    content+="</div>";

    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_general_description;
    content+="</div>";

    

    content+="<div class='row digi_desc'>";
    content+="<div class='desc'>";
    content+=monInfo.description;
    content+="</div>";
    content+="</div>";

    content+="</div>";
    content+="</div>";

    content+=this.createStatsBlock(monInfo);

    content+=this.createMovesBlock(monInfo);

    content+=this.createEvosBlock(monInfo);

    content+=this.createEncountersBlock(monInfo);

    

    content+="</div>";
    content+="</div>";
    


    contentContainer.innerHTML = content;   

    

    let monImgs = contentContainer.querySelectorAll(".icon img");
    for(let img of monImgs){
        const monId = img.getAttribute("data-id");
        if(monId != -1){
            setDDSImage(img, monId);
        }
    }    

    let dbLinks = contentContainer.querySelectorAll(".db_link");
    for(let link of dbLinks){
        link.addEventListener("click", function(){
            let monId = this.getAttribute("data-id");
            _this.showDigimon(monId, "evos");
        })
    }

    const scrollPane = contentContainer.querySelector(".dex_pane_scroll");
    scrollPane.scrollTop = this._lastScroll;
    scrollPane.addEventListener("scroll", function(){
        _this._lastScroll = this.scrollTop;
    });

    if(context){
        contentContainer.querySelector(".section ."+context).scrollIntoView()
    }
}

DexPane.prototype.arrayToTableContent = function(array, headless){
    let headerElem;
    if(headless){
        headerElem = "td";
    } else {
        headerElem = "th";
    }  

    let result = "";
    for(var i=0; i<array.length; i++) {
        result += "<tr>";
        for(var j=0; j<array[i].length; j++){
            if(i == 0){
                result += "<"+headerElem+">"+array[i][j]+"</"+headerElem+">";
            } else {
                result += "<td>"+array[i][j]+"</td>";
            }            
        }
        result += "</tr>";
    }
    return result;
}

DexPane.prototype.createStatsBlock = function(monInfo){
    let content = "";
    content+="<div class='section'>";
   
    content+="<div class='section_header'>";
   
    content+=localizationData[currentLocale].app.DEX_header_stats;
    content+="</div>";
    content+="<div class='inner'>";

    let stats = [     
        {item: "baseHP", label:localizationData[currentLocale].app.DEX_label_baseHP},
        {item: "baseSP", label: localizationData[currentLocale].app.DEX_label_baseSP},
        {item: "baseATK", label: localizationData[currentLocale].app.DEX_label_baseATK},
        {item: "baseDEF", label:localizationData[currentLocale].app.DEX_label_baseDEF},
        {item: "baseINT", label: localizationData[currentLocale].app.DEX_label_baseINT},
        {item: "baseSPD", label:localizationData[currentLocale].app.DEX_label_baseSPD},
    ]

    content+="<div class='row stats'>";
    content+="<table class='stats level_up'>";   


    let tableContent = [];
    tableContent.push(["", localizationData[currentLocale].app.DEX_label_lv1,localizationData[currentLocale].app.DEX_label_lv50, localizationData[currentLocale].app.DEX_label_lv99]);

    function getStatValueAtLevel(stat, level){
        let baseStatValue = monInfo.baseStats[stat.item];
        let growthType = monInfo.baseStats.growthType;
        let growthTable = getGrowthCurveInfo()[growthType];
        let growthAmount = growthTable[stat.item.replace("base", "")]//hacky!
        statValue = Math.floor(baseStatValue * 1 + (growthAmount * (level - 1)));

        statValue/=100;
        if(stat.item == "baseHP"){  
            statValue = Math.floor(statValue);
            statValue*=10;
        } 
        return Math.floor(statValue);
    }

    for(let stat of stats){   


        
        let row = [];
        row.push(stat.label);
        row.push(getStatValueAtLevel(stat, 1));
        row.push(getStatValueAtLevel(stat, 50));
        row.push(getStatValueAtLevel(stat, 99));
        tableContent.push(row);
    }

    content+=this.arrayToTableContent(tableContent);

    content+="</table>";
    


    content+="</div>";

    content+="</div>";
    content+="</div>";

    return content;
}


DexPane.prototype.createMovesBlock = function(monInfo){
    let content = "";
    content+="<div class='section moves'>";
    
    content+="<div class='section_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_moves;
    content+="</div>";
    content+="<div class='inner'>";

    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_moves_signature;
    content+="</div>";

    content+="<div class='row moves'>";
    content+="<table id='moves_table' class='stats'>";  

    let tableContent = [];
    tableContent.push([localizationData[currentLocale].app.DEX_moves_label_name, localizationData[currentLocale].app.DEX_general_description])
    
    let sigMoves = monInfo.moves.signature;
    let sortedSigMoves = [];
    for(let moveId in sigMoves){
        //let row = [localizationData[currentLocale].moves[move]];
        //tableContent.push(row)
        sortedSigMoves.push({id: moveId});
    }
    for(let entry of sortedSigMoves){
        let nameContent = "<div class='skill_entry'>" + localizationData[currentLocale].sigMoves[getSkillTextIdInfo()[entry.id]] + "</div>";
        tableContent.push([nameContent, localizationData[currentLocale].moveDesc[getSkillTextIdInfo()[entry.id]]]);
    }

    content+=this.arrayToTableContent(tableContent);

    content+="</table>";
    
    

    content+="</div>";


    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_moves_inheritable;
    content+="</div>";

    content+="<div class='row moves'>";
    content+="<table id='moves_table' class='stats'>";  

    tableContent = [];
    tableContent.push([localizationData[currentLocale].app.DEX_moves_label_name, localizationData[currentLocale].app.DEX_general_description, localizationData[currentLocale].app.DEX_moves_label_level])
    
    let moves = monInfo.moves;
    let sortedMoves = [];
    for(let moveId in moves.inherited){
        //let row = [localizationData[currentLocale].moves[move]];
        //tableContent.push(row)
        sortedMoves.push({id: moveId, level: moves.inherited[moveId].level});
    }
    sortedMoves = sortedMoves.sort((a,b) => a.level - b.level);

    for(let entry of sortedMoves){
        let isWanted = pathFinder.wantedSkills[entry.id];
        let nameContent = "<div class='skill_entry "+(isWanted ? "wanted" : "")+"'>" + localizationData[currentLocale].moves[getSkillTextIdInfo()[entry.id]] + "</div>";
        tableContent.push([nameContent, localizationData[currentLocale].moveDesc[getSkillTextIdInfo()[entry.id]], entry.level]);
    }

    content+=this.arrayToTableContent(tableContent);

    content+="</table>";
    
    

    content+="</div>";

    content+="</div>";
    content+="</div>";

    return content;
}

DexPane.prototype.createEvoReqs = function(monInfo, maxStats){
    let content = "";
    const condList = [
        "LVL",
        "HP", 
        "SP",
        "ATK",
        "DEF",
        "INT",
        "SPD",
        "ABI",
        "CAM",
        "Other"
    ];

    const labels = {
        "LVL": localizationData[currentLocale].app.DEX_evos_label_level,
        "HP": localizationData[currentLocale].app.DEX_evos_label_HP,
        "SP": localizationData[currentLocale].app.DEX_evos_label_SP,
        "ATK": localizationData[currentLocale].app.DEX_evos_label_ATK,
        "DEF": localizationData[currentLocale].app.DEX_evos_label_DEF,        
        "INT": localizationData[currentLocale].app.DEX_evos_label_INT,        
        "SPD": localizationData[currentLocale].app.DEX_evos_label_SPD,
        "ABI": localizationData[currentLocale].app.DEX_evos_label_ABI,
        "CAM": localizationData[currentLocale].app.DEX_evos_label_CAM,
        "Other": localizationData[currentLocale].app.DEX_evos_label_additional
    }
        

    content+="<div class='evo_reqs_flex'>";

    let requirements = monInfo.evosReqs;
    let row = [];
    for(let condition of condList){
        content+="<div class='block'>"
        content+="<div class='label'>"
        content+=labels[condition];
        content+="</div>";
        let errorClass = "";
        if(maxStats){
            if(maxStats[condition] < requirements[condition]){
                errorClass = "difficult";
            }
        }
        content+="<div class='value "+errorClass+"'>"
        if(requirements[condition]){
            if(condition == "Other"){
                content+= (localizationData[currentLocale].app.DEX_evos_label_has_additional);
            } else {
                content+=(requirements[condition]);
            }
            
        } else {
            content+=("-");
        }
        content+="</div>";
        content+="</div>";
    }

    content+="</div>";

    return content;
}


DexPane.prototype.createEvosBlock = function(monInfo){
    let content = "";
    content+="<div class='section evos'>";
    
    content+="<div class='section_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_evos;
    content+="</div>";
    content+="<div class='inner'>";
    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_evos_reqs;
    content+="</div>";
    content+="<div class='row evos'>";

    
    //content+="<table id='evo_reqs_table' class='stats'>";  

    content+=this.createEvoReqs(monInfo);

   // content+="</table>";
    


    content+="</div>";

    content+="</div>";

    content+="<div class='row evos_summary'>";
    content+="<div class='section_prev'>";

    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_evos_previous;
    content+="</div>";

    content+="<div class='evo_entries'>";
    for(let monId of monInfo.neighBours.prev){
        let targetMonInfo = this.getMonInfo(monId)
        content+="<div class='evo_entry'>";

        content+="<div class='row'>";
        content+="<div class='icon dex_img_container'>";
        content+="<img data-id='"+monId+"' class='dex_img'/>";
        content+="</div>";
        
        content+="<div class='name'>";
        content+=targetMonInfo.name;

        content+="<div data-id='"+monId+"' class='db_link flex-item'>";
        content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
        content+="</div>";

        content+="</div>";
        content+="</div>";

        /*content+="<table id='evo_reqs_table' class='stats'>";  

        content+=this.createEvoReqs(targetMonInfo);
    
        content+="</table>";*/
        content+="</div>";
    }
    content+="</div>";

    content+="</div>";

    content+="<div class='section_next'>";
    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_evos_next;
    content+="</div>";

    content+="<div class='evo_entries'>";
    for(let monId of monInfo.neighBours.next){
        let targetMonInfo = this.getMonInfo(monId)
        content+="<div class='evo_entry'>";

        content+="<div class='row'>";
        content+="<div class='icon dex_img_container'>";
        content+="<img data-id='"+monId+"' class='dex_img'/>";
        content+="</div>";
        
        content+="<div class='name'>";
        content+=targetMonInfo.name;

        content+="<div data-id='"+monId+"'  class='db_link flex-item'>";
        content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
        content+="</div>";

        content+="</div>";
        
        content+="</div>";

      

        content+=this.createEvoReqs(targetMonInfo, getDigiData()[monInfo.id].maxBaseStats);
    
       
        content+="</div>";
    }
    content+="</div>";
    content+="</div>";
    content+="</div>";
    content+="</div>";

    return content;
}

DexPane.prototype.createEncountersBlock = function(monInfo){
    const _this = this;
    let content = "";
    content+="<div class='section encounters'>";
    
    content+="<div class='section_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_encounters;
    content+="</div>";
    content+="<div class='inner'>";
  
    content+="<div class='row encounters'>";

    function createEncountersTable(encounters){
        let content = "";
        content+="<table id='encounters_table' class='stats'>";  

        let tableContent = [];
        tableContent.push([localizationData[currentLocale].app.DEX_encounters_area, localizationData[currentLocale].app.DEX_encounters_level, localizationData[currentLocale].app.DEX_encounters_rate]);
    
        let compressedEncounters = {};
        for(let entry of encounters){
            let key = entry.fieldNameId + "_" + entry.level;
            if(!compressedEncounters[key]){
                compressedEncounters[key] = {
                    rate: 0,
                    level: entry.level,
                    fieldNameId: entry.fieldNameId,
                    fieldName: localizationData[currentLocale].fieldNames[entry.fieldNameId]
                }
            }
            compressedEncounters[key].rate+=entry.rate * 1;
        }
        let sortedKeys = Object.keys(compressedEncounters);
        sortedKeys = sortedKeys.sort((a, b) => {
            let aVal = compressedEncounters[a];
            let bVal = compressedEncounters[b];
            if(aVal.fieldName != bVal.fieldName){
                return aVal.fieldName.localeCompare(bVal.fieldName);
            } else {
                return aVal.level - bVal.level;
            }
        });
    
        for(let key of sortedKeys){
            const entry = compressedEncounters[key];
            let row = [];
            row.push(entry.fieldName);
            row.push(entry.level);
            row.push(entry.rate+"%");
            tableContent.push(row);
        }
    
        content+=_this.arrayToTableContent(tableContent);
    
        content+="</table>";
        return content;
    }
    content+="<div class='enc_block'>";
    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_encounters_base;
    content+="</div>";

   
    content+=createEncountersTable(getDigiData()[monInfo.id].encounters.base);
    content+="</div>";
    content+="<div class='enc_block'>";
    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_encounters_hame;
    content+="</div>";

    
    content+=createEncountersTable(getDigiData()[monInfo.id].encounters.hame);
    content+="</div>";
    content+="</div>";

    content+="</div>";

    content+="</div>";


    return content;
}


DexPane.prototype.showDigimon = function(id, context){
    this.setActiveId(id);
    this.show(context);
}