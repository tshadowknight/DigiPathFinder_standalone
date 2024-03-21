module.exports = DexPane;

function DexPane(containerId){
    this._containerId = containerId;
    this._activeId = -1;
}

DexPane.prototype.setActiveId = function(id){
    this._activeId = id;
}

DexPane.prototype.show = function(){
    const contentContainer = document.getElementById(this._containerId);
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
        evosReqs: {}
    };
    if(this._activeId != -1){
        monInfo = {
            id: this._activeId,
            name: localizationData[currentLocale].digimon[this._activeId],
            description: localizationData[currentLocale].digimonDesc[this._activeId],
            baseStats: getDigiData()[this._activeId].baseStats,
            moves: getDigiData()[this._activeId].moveDetails,
            evosReqs: getDigiData()[this._activeId].conditions,
        };
    }
    let content = "";

    content+="<div class='dex_pane_scroll'>"; 
    content+="<div class='dex_pane'>";
    content+="<div class='section'>";
    content+="<div class='name_desc'>";
    content+="<div class='row name_info'>";
    content+="<div class='banner'>";
    content+="<div class='icon dex_img_container'>";
    content+="<img class='dex_img'/>";
    content+="</div>";
    
    content+="<div class='name'>";
    content+=monInfo.name;
    content+="</div>";
    content+="</div>";
    
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

    content+="</div>";
    content+="</div>";
    


    contentContainer.innerHTML = content;

    if(monInfo.id != -1){
        setDDSImage(contentContainer.querySelector(".icon img"), monInfo.id);
    }
    
}

DexPane.prototype.arrayToTableContent = function(array){

    

    let result = "";
    for(var i=0; i<array.length; i++) {
        result += "<tr>";
        for(var j=0; j<array[i].length; j++){
            if(i == 0){
                result += "<th>"+array[i][j]+"</th>";
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
    content+="<div class='section'>";
    
    content+="<div class='section_header'>";
    
    content+=localizationData[currentLocale].app.DEX_header_moves;
    content+="</div>";
    content+="<div class='inner'>";
    content+="<div class='row moves'>";
    content+="<table id='moves_table' class='stats'>";  

    let tableContent = [];
    tableContent.push([localizationData[currentLocale].app.DEX_moves_label_name, localizationData[currentLocale].app.DEX_moves_label_level])
    
    let moves = monInfo.moves;
    let sortedMoves = [];
    for(let moveId in moves.inherited){
        //let row = [localizationData[currentLocale].moves[move]];
        //tableContent.push(row)
        sortedMoves.push({id: moveId, level: moves.inherited[moveId].level});
    }
    sortedMoves = sortedMoves.sort((a,b) => a.level - b.level);

    for(let entry of sortedMoves){
        tableContent.push([localizationData[currentLocale].moves[entry.id], entry.level]);
    }

    content+=this.arrayToTableContent(tableContent);

    content+="</table>";
    


    content+="</div>";

    content+="</div>";
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

    
    content+="<table id='evo_reqs_table' class='stats'>";  

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

    let tableContent = [];
    tableContent.push([
        localizationData[currentLocale].app.DEX_evos_label_level,
        localizationData[currentLocale].app.DEX_evos_label_HP,
        localizationData[currentLocale].app.DEX_evos_label_SP,
        localizationData[currentLocale].app.DEX_evos_label_ATK,
        localizationData[currentLocale].app.DEX_evos_label_DEF,        
        localizationData[currentLocale].app.DEX_evos_label_INT,        
        localizationData[currentLocale].app.DEX_evos_label_SPD,
        localizationData[currentLocale].app.DEX_evos_label_ABI,
        localizationData[currentLocale].app.DEX_evos_label_CAM,
        localizationData[currentLocale].app.DEX_evos_label_additional
    ])
    
    let requirements = monInfo.evosReqs;
    let row = [];
    for(let condition of condList){
        if(requirements[condition]){
            if(condition == "Other"){
                row.push( localizationData[currentLocale].app.DEX_evos_label_has_additional);
            } else {
                row.push(requirements[condition]);
            }
            
        } else {
            row.push("-");
        }
    }
    tableContent.push(row);

    content+=this.arrayToTableContent(tableContent);

    content+="</table>";
    


    content+="</div>";

    content+="</div>";
    content+="</div>";

    return content;
}

DexPane.prototype.showDigimon = function(id){
    this.setActiveId(id);
    this.show();
}