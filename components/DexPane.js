if(isElectron()){
    module.exports = DexPane;
}

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
        let name;
        const digiData = getDigiData(monId);
        if(digiData.isUndefined){
            name = localizationData[currentLocale].app.DEF_undef_mon + monId;
        } else {
            name = localizationData[currentLocale].digimon[monId];
        }
        let description = localizationData[currentLocale].digimonDesc[digiData.baseStats.profile] || localizationData[currentLocale].digimonDesc[monId]
        
        monInfo = {
            id: monId,
            name: name,
            description: description,
            baseStats: digiData.baseStats,
            moves: digiData.moveDetails,
            evosReqs: digiData.conditions,
            neighBours: digiData.neighBours,
            traits: digiData.traits,
            resistances: digiData.resistances,
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

    content+= "<div id='close_dex_pane_button' class='close_button'>";
    content+="<i class='fa fa-close' aria-hidden='true'></i>";
    content+="</div>";

    content+="<div class='row name_info'>";
    content+="<div class='banner'>";
    content+="<div class='icon dex_img_container'>";
    content+="<img data-id='"+monInfo.id+"' class='dex_img "+(isTSMode() ? "TS" : "")+"'/>";
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
    
    let listedAttributes;
    if(isTSMode()){
        listedAttributes = [
            {
                item: "level",
                label: localizationData[currentLocale].app.DEX_general_level,
                localizer: localizationData[currentLocale].app.levelsTS
            },
            {
                item: "type",
                label: localizationData[currentLocale].app.DEX_general_type,
                localizer: localizationData[currentLocale].app.typesTS
            },
            /*{
                item: "attribute",
                label: localizationData[currentLocale].app.DEX_general_attribute,
                localizer: localizationData[currentLocale].app.attributesTS
            },
            {
                item: "memoryUse",
                label: localizationData[currentLocale].app.DEX_general_memoryUse
            },
            {
                item: "equipSlots",
                label: localizationData[currentLocale].app.DEX_general_equipSlots
            },   */     

        ];
    } else {    
        listedAttributes = [
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
    }
   
    let tableContent = [];
    for(let attr of listedAttributes){
        let value = monInfo.baseStats[attr.item];
        if(attr.localizer){
            value = attr.localizer[value];
        } 
        tableContent.push(["<div class='row_label'>"+attr.label+"</div>", value || "???"]);
    }
    if(isTSMode()){
        tableContent.push(["<div class='row_label'>"+localizationData[currentLocale].app.DEX_general_category+"</div>", localizationData[currentLocale].categoryNames[this._activeId] || "???"]);

        let traitString = [];
        for(let entry of monInfo.traits){
            traitString.push(localizationData[currentLocale].classNames[entry]);
        }
        tableContent.push(["<div class='row_label'>"+localizationData[currentLocale].app.DEX_general_traits+"</div>", traitString.join(", ") || "???"]);

        tableContent.push(["<div class='row_label'>"+localizationData[currentLocale].app.DEX_general_default_pers+"</div>", localizationData[currentLocale].personalityNames[monInfo.baseStats.basePersonality] || "???"]);
        
    }
    content+="<table id='general_table' class='stats'>";  
    content+=this.arrayToTableContent(tableContent, true);
    content+="</table>";

    if(!isTSMode()){

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
    }
    

    content+="<div class='section_sub_header'>";
    
    content+=localizationData[currentLocale].app.DEX_general_description;
    content+="</div>";

    

    content+="<div class='row digi_desc'>";
    content+="<div class='desc'>";
    content+=monInfo.description || "???";
    content+="</div>";
    content+="</div>";

    content+="</div>";
    content+="</div>";

    content+=this.createStatsBlock(monInfo);

    content+=this.createMovesBlock(monInfo);

    content+=this.createEvosBlock(monInfo);

    if(!isTSMode()){
        content+=this.createEncountersBlock(monInfo);
    }
    

    

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

    contentContainer.querySelector("#close_dex_pane_button").addEventListener("click", function(){
        $("#content")[0].classList.remove("details_view");
    });

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

DexPane.prototype.arrayToFlexContent = function(array, headless) {
    if (!array || array.length === 0) return "";
    let result = "";

    const numColumns = array[0].length;
    result += '<div class="evo_reqs_flex">';
    
    // Generate each column
    for (let colIndex = 0; colIndex < numColumns; colIndex++) {
        result += '<div class="block">';
        
        // Generate cells for this column
        for (let rowIndex = 0; rowIndex < array.length; rowIndex++) {
            const isHeader = !headless && rowIndex === 0;
            const cellClass = isHeader ? 'label' : 'value';
            const cellValue = array[rowIndex][colIndex] || '';
            
            result += `<div class="${cellClass}">${cellValue}</div>`;
        }
        
        result += '</div>';
    }
    
    result += '</div>';
   
    return result;
};

DexPane.prototype.createStatsBlock = function(monInfo){
    let content = "";
    content+="<div class='section'>";
   
    content+="<div class='section_header'>";
   
    content+=localizationData[currentLocale].app.DEX_header_stats;
    content+="</div>";
    content+="<div class='inner'>";

    let stats = [     
      
    ]

    stats.push({item: "baseHP", label:localizationData[currentLocale].app.DEX_label_baseHP});          
    stats.push({item: "baseSP", label: localizationData[currentLocale].app.DEX_label_baseSP});
    stats.push({item: "baseATK", label: localizationData[currentLocale].app.DEX_label_baseATK});
    stats.push({item: "baseDEF", label:localizationData[currentLocale].app.DEX_label_baseDEF});
    stats.push( {item: "baseINT", label: localizationData[currentLocale].app.DEX_label_baseINT});
    if(isTSMode()){
        stats.push( {item: "baseSPI", label: localizationData[currentLocale].app.DEX_label_baseSPI});
    }
    stats.push( {item: "baseSPD", label:localizationData[currentLocale].app.DEX_label_baseSPD});
   
    
    


    let tableContent = [];
    if(isTSMode()){
        content+="<div class='section_sub_header'>";
    
        content+=localizationData[currentLocale].app.DEX_stats_base;
        content+="</div>";

        content+="<div class='row stats'>";
       // content+="<table class='stats level_up_ts'>";   

        let header = [];
        let data = [];

        for(let stat of stats){    
            header.push(stat.label);
            data.push(monInfo.baseStats[stat.item]);
        }

        tableContent.push(header);
        tableContent.push(data);



    } else {
        content+="<div class='row stats'>";
       // content+="<table class='stats level_up'>";   
        tableContent.push(["", localizationData[currentLocale].app.DEX_label_lv1,localizationData[currentLocale].app.DEX_label_lv50, localizationData[currentLocale].app.DEX_label_lv99]); 
    

        function getStatValueAtLevel(stat, level){
            try {
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
            } catch(e){

            }
            return "??";
        }

        for(let stat of stats){           
            let row = [];
            row.push(stat.label);
            row.push(getStatValueAtLevel(stat, 1));
        
            row.push(getStatValueAtLevel(stat, 50));
            row.push(getStatValueAtLevel(stat, 99));
            
            
            tableContent.push(row);
        }
        }
    content+=this.arrayToFlexContent(tableContent);

   // content+="</table>";
    content+="</div>";   

    const effectivenessIcons = {
        0: {icon: "ui_icon_effst_00", colorFilter: null},//none,
        1: {icon: "ui_icon_effst_01", colorFilter: "brightness(0) saturate(100%) invert(79%) sepia(81%) saturate(2892%) hue-rotate(181deg) brightness(94%) contrast(89%)"},//weak,
        2: {icon: "ui_icon_effst_02", colorFilter: "brightness(0) saturate(100%) invert(34%) sepia(56%) saturate(1347%) hue-rotate(208deg) brightness(86%) contrast(94%)"},//double weak,
        3: {icon: "ui_icon_effst_03", colorFilter: "brightness(0) saturate(100%) invert(56%) sepia(37%) saturate(572%) hue-rotate(300deg) brightness(91%) contrast(101%)"},//resist,
        4: {icon: "ui_icon_effst_04", colorFilter: "brightness(0) saturate(100%) invert(28%) sepia(57%) saturate(1888%) hue-rotate(321deg) brightness(94%) contrast(108%)"},//immune,
    }

    if(isTSMode()){

        const createAttributeView = () => {

             let tableContent = [];
            content+="<div class='section_sub_header'>";
        
            content+=localizationData[currentLocale].app.DEX_stats_res_attribute;
            content+="</div>";

            content+="<div class='row stats'>";
            
            const attributes = [
                {
                    id: "vaccine",
                    icon: "ui_icon_type_000"
                },
                {
                    id: "data",
                    icon: "ui_icon_type_020"
                },
                {
                    id: "virus",
                    icon: "ui_icon_type_040"
                },
                {
                    id: "free",
                    icon: "ui_icon_type_060"
                },
                {
                    id: "variable",
                    icon: "ui_icon_type_080"
                },
                {
                    id: "unknown",
                    icon: "ui_icon_type_100"
                },
                {
                    id: "no_data",
                    icon: "ui_icon_type_120"
                }
            ];

            

          //  content+="<table class='stats effectiveness level_up_ts'>";   
            let header = [];
            let data = [];

            for(let attribute of attributes){    
                header.push("<img class='effectiveness_icon' style='filter: brightness(0) saturate(100%) invert(25%) sepia(0%) saturate(602%) hue-rotate(231deg) brightness(96%) contrast(91%);' src='img/ui_icon/"+attribute.icon+".png'></img>");
                const resistance = monInfo.resistances.attributes[attribute.id] || 0;
                const iconInfo = effectivenessIcons[resistance];
                data.push("<img class='effectiveness_icon' style='filter: "+iconInfo.colorFilter+";' src='img/ui_icon/"+iconInfo.icon+".png'></img>");
            }

            tableContent.push(header);
            tableContent.push(data);

            content+=this.arrayToFlexContent(tableContent);


         //   content+="</table>";
            content+="</div>";

        }
        createAttributeView();

        const createElementalView = () => {
            
            let tableContent = [];
            content+="<div class='section_sub_header'>";
        
            content+=localizationData[currentLocale].app.DEX_stats_res_element;
            content+="</div>";

            content+="<div class='row stats'>";

            const elements = [
                        {
                    id: "fire",
                    icon: "ui_icon_skill_001"
                },
                {
                    id: "water", 
                    icon: "ui_icon_skill_004"
                },
                {
                    id: "grass",
                    icon: "ui_icon_skill_003"
                },
                {
                    id: "ice",
                    icon: "ui_icon_skill_002"
                },
                {
                    id: "elec",
                    icon: "ui_icon_skill_005"
                },
                {
                    id: "ground",
                    icon: "ui_icon_skill_008"
                },
                {
                    id: "steel",
                    icon: "ui_icon_skill_006"
                },
                {
                    id: "wind",
                    icon: "ui_icon_skill_007"
                },
                {
                    id: "light",
                    icon: "ui_icon_skill_009"
                },
                {
                    id: "dark",
                    icon: "ui_icon_skill_010"
                },
                {
                    id: "null",
                    icon: "ui_icon_skill_000"
                },
            ]

            

         //   content+="<table class='stats effectiveness level_up_ts'>";   
            let header = [];
            let data = [];

            for(let element of elements){    
                header.push("<img class='effectiveness_icon' src='img/ui_icon/"+element.icon+".png'></img>");
                const resistance = monInfo.resistances.elements[element.id];
                const iconInfo = effectivenessIcons[resistance];
                data.push("<img class='effectiveness_icon' style='filter: "+iconInfo.colorFilter+";' src='img/ui_icon/"+iconInfo.icon+".png'></img>");
            }

            tableContent.push(header);
            tableContent.push(data);

            content+=this.arrayToFlexContent(tableContent);


          //  content+="</table>";
            content+="</div>";
        }
        createElementalView();
    }

    content+="</div>";
    content+="</div>";

    return content;

}

DexPane.templateKeys = {
    "inflict_phys": 1014,
    "inflict_magic": 1015,
    "hits": 25,
    "hits_range": 26,
    "drain_hp_sp": 32,
    "drain_sp": 31,
    "drain_hp": 30,
    "hit_rate": 28,
    "crit_rate": 29,
    "recoil": 33,
    "always_hits": 27,
    "trait_damage": 102,
    "chance_apply": 73,
    "chance_of": 74,
    "n_turn_boost": 85,
    "n_turn_reduction": 86,
    "reduction": 87,
    "resistance_down": 79,
   

    //conditional effect
    "user_is": 52,
    "target_is_affected": 53,
    "state": 54,
    "target_is": 55,
    "target_is_element": 56,
    "generation_is_greater": 57,
    "generation_is_lower": 58,
    "target_has_acted": 59,
    "target_has_not_acted": 60,
    "target_is_above_HP": 61,
    "target_is_below_HP": 62,
    "target_is_above_SP": 63,
    "target_is_below_SP": 64,
    "target_is_KOed": 65,

    "damage_bonus": 66,
    "increased_damage": 67,
    "crit_rate": 68,
    "recover_HP": 69,
    "recover_SP": 70,
    "recover_HP_SP": 71,
    "reduce_target_SP": 72,
    "chance_apply_status": 73,
    "chance_of_effect": 74,
    "effect": 75,
    "removes_status": 76,

    
    "boost_to": 88,
    "reduction_to": 89,
    "crt_rate": 68,

    //additional properties
    "low_greater": 35,
    "all_low_greater": 36,
    "low_lower": 37,
    "all_low_lower": 38,
    "more_KO_greater": 39,
    "ally_KO_greater": 40,
    "more_use_greater": 41,
    "more_rounds_greater": 42,
    "more_buffs_greater": 42,

    "nullify_compat": 45,
    "invert_buffs": 46,
    "steal_buffs": 47,
    "overheal": 48,
    "consume_all_SP": 49,
    "nullify_attr_compat": 50,
    "attack_treated_as": 51,
};

//no resource found to map these strings, might just be hardcoded?
DexPane.prototype.getBuffAutoDescriptionTemplate = function(buffId){
    const templateStrings = localizationData[currentLocale].autoMoveDescriptions;
    if(buffId <= 14){
        return templateStrings[DexPane.templateKeys["chance_apply"]];
    }

    if(buffId >= 25 && buffId <= 32){//buffs
        return templateStrings[DexPane.templateKeys["chance_of"]];  
    }

    if(buffId >= 33 && buffId <= 40){//debuffs
         return templateStrings[DexPane.templateKeys["chance_of"]];    
    }

    if(buffId >= 63 && buffId <= 73){//resistance down
         return templateStrings[DexPane.templateKeys["reduction"]];    
    }

    if(buffId >= 118){
        return templateStrings[DexPane.templateKeys["chance_apply"]];
    }

    if(buffId >= 105 && buffId <= 107){//direct strings
         return "{d1}";    
    }

    if(buffId >= 85 && buffId <= 105){//effect application
         return templateStrings[DexPane.templateKeys["chance_apply"]];    
    }

    return "UNMAPPED_EFFECT {d1} at rate {d2}";
}


DexPane.prototype.substituteTokens = function(templateString, tokens){
    let result = templateString;
    for(let token in tokens){
        result = result.replace(token, tokens[token]);
    }       
    result = result.replace(/\{.*?\}/g, "");//clean up untranslated tokens
    return result;
}

DexPane.prototype.getMoveDesc = function(skillId, other){
    const skillTextId = getSkillTextIdInfo()[skillId]
    if(!isTSMode()){
        return localizationData[currentLocale].moveDesc[skillTextId];
    } else {

        let jogressString = "";
        if(other){
            jogressString = "[" + localizationData[currentLocale].app.DEX_require_DNA +" " + localizationData[currentLocale].digimon[other] + "]";
        }
        
        const skillInfo = cachedGameData.skillData[skillId];
        if(skillInfo.skillFixedDescId * 1){
            return jogressString + "<br>" + localizationData[currentLocale].moveDesc[skillInfo.skillFixedDescId].replace(/[(\r\n]/g, "<br>").replace(/(<br\s*\/?>){2,}/gi, '<br>');;
        } else {
            let descParts = [];
            descParts.push(jogressString);
            const templateStrings = localizationData[currentLocale].autoMoveDescriptions;
            const targetType  = templateStrings[skillInfo.targetType];
            descParts.push(targetType);

            let hitsString = "";
            if(skillInfo.minHits > 1 && skillInfo.maxHits > 1){
                let templateString;
                if(skillInfo.minHits == skillInfo.maxHits){
                    templateString = templateStrings[DexPane.templateKeys["hits"]];
                } else {
                    templateString = templateStrings[DexPane.templateKeys["hits_range"]];
                }
                let tokens = {
                    "{d0}": skillInfo.minHits,
                    "{d1}": skillInfo.maxHits,
                };
                hitsString = this.substituteTokens(templateString, tokens);
            }
            
            if(skillInfo.dmgType == 1){
                let templateString = templateStrings[DexPane.templateKeys["inflict_phys"]];
                let tokens = {
                    "{d1}": localizationData[currentLocale].elementNames[skillInfo.element],
                    "{d0}": skillInfo.power,
                    "{d2}": hitsString
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }
             if(skillInfo.dmgType == 2){
                let templateString = templateStrings[DexPane.templateKeys["inflict_magic"]];
                let tokens = {
                    "{d1}": localizationData[currentLocale].elementNames[skillInfo.element],
                    "{d0}": skillInfo.power,
                    "{d2}": hitsString
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }
            
            const conditionstring = this.resolveSkillConditionals(skillInfo);
            if(conditionstring){
               descParts.push(conditionstring);     
            }

            //skip buffset 0, which is used for conditional activation checks
            for(let i = 1; i < 5; i++){
                const buffset = skillInfo["buffset_"+i];
                if(buffset){
                    for(let entry of buffset){
                        if(entry.effect != 0){
                            let d1 = localizationData[currentLocale].buffNames[entry.effect];
                            if(entry.effect >= 33 && entry.effect <= 40){//debuffs
                                if(entry.changePercent){
                                    let d0 = localizationData[currentLocale].statusNames[entry.effect - 31];//align debuffs with entries from buff_name.mbe (send help)
                                    d1 = this.substituteTokens(
                                        templateStrings[DexPane.templateKeys["n_turn_reduction"]], 
                                        {
                                            "{n0}": entry.changePercent,
                                            "{d0}" : d0,
                                            "{n1}": (entry.turnOverride == 0 ? 3 : entry.turnOverride)
                                        }
                                    )
                                }
                                let templateString = this.getBuffAutoDescriptionTemplate(entry.effect);
                                let tokens = {
                                    "{d1}": d1,
                                    "{d2}": entry.rate + "%"
                                };
                                descParts.push(this.substituteTokens(templateString, tokens));
                            } else if(entry.effect >= 25 && entry.effect <= 32){//buffs
                                if(entry.changePercent){
                                    let d0 = localizationData[currentLocale].statusNames[entry.effect - 23];//align debuffs with entries from buff_name.mbe (send help)
                                    d1 = this.substituteTokens(
                                        templateStrings[DexPane.templateKeys["n_turn_boost"]], 
                                        {
                                            "{n0}": entry.changePercent,
                                            "{d0}" : d0,
                                            "{n1}": (entry.turnOverride == 0 ? 3 : entry.turnOverride)
                                        }
                                    )
                                }
                                let templateString = this.getBuffAutoDescriptionTemplate(entry.effect);
                                let tokens = {
                                    "{d1}": d1,
                                    "{d2}": entry.rate + "%"
                                };
                                descParts.push(this.substituteTokens(templateString, tokens));
                            } else if(entry.effect >= 63 && entry.effect <= 73){//attribute down
                                
                                let d0 = localizationData[currentLocale].elementNames[entry.effect - 63];//align attribute down entries with entries from element.mbe (send help)
                                d0 = this.substituteTokens(
                                    templateStrings[DexPane.templateKeys["resistance_down"]], 
                                    {                         
                                        "{d0}" : d0,
                                    }
                                )
                                let templateString = this.getBuffAutoDescriptionTemplate(entry.effect);
                                let tokens = {
                                    "{n0}": entry.rate,
                                    "{d0}" : d0,
                                };
                                descParts.push(this.substituteTokens(templateString, tokens) + ".");
                            } else {
                                let templateString = this.getBuffAutoDescriptionTemplate(entry.effect);
                                let tokens = {
                                    "{d1}": d1,
                                    "{d2}": entry.rate + "%"
                                };
                                descParts.push(this.substituteTokens(templateString, tokens));
                            }                           
                        }
                    }
                }                
            }

            /*
            "nullify_compat": 45,
            "invert_buffs": 46,
            "steal_buffs": 47,
            "overheal": 48,
            "consume_all_SP": 49,
            "nullify_attr_compat": 50,
            "attack_treated_as": 51, */

            if(skillInfo.additionalProperty * 1){

                switch(skillInfo.additionalProperty * 1){
                    case 1: 
                    case 2:
                    case 4:
                        break;
                    case 3:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["nullify_compat"]], {}));
                        break;
                    case 5:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["invert_buffs"]], {}));
                        break;
                    case 6:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["steal_buffs"]], {}));
                        break;   
                    case 7:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["overheal"]], {}));
                        break;  
                    case 8:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["consume_all_SP"]], {}));
                        break;   
                    case 9:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["nullify_attr_compat"]], {}));
                        break;       
                    case 10:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["attack_treated_as"]], {"d0": localizationData[currentLocale].typeNames[0]}));
                        break;      
                    case 11:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["attack_treated_as"]], {"d0": localizationData[currentLocale].typeNames[1]}));
                        break;        
                    case 12:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["attack_treated_as"]], {"d0": localizationData[currentLocale].typeNames[2]}));
                        break;     
                    case 13:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["attack_treated_as"]], {"d0": localizationData[currentLocale].typeNames[3]}));
                        break;      
                    case 14:
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["attack_treated_as"]], {"d0": localizationData[currentLocale].typeNames[4]}));
                        break;  
                }
            }

            /*
            "low_greater": 35,
            "all_low_greater": 36,
            "low_lower": 37,
            "all_low_lower": 38,
            "more_KO_greater": 39,
            "ally_KO_greater": 40,
            "more_use_greater": 41,
            "more_rounds_greater": 42,
            "more_buffs_greater": 42, */

             if(skillInfo.additionalProperty_1 * 1){
                switch(skillInfo.additionalProperty_1 * 1){
                    case 1: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["low_greater"]], {"{d0}": "HP"}));
                        break;    
                    case 2: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["all_low_greater"]], {"{d0}": "HP"}));
                        break;   
                    case 3: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["low_lower"]], {"{d0}": "HP"}));
                        break;    
                    case 4: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["all_low_lower"]], {"{d0}": "HP"}));
                        break; 
                        
                    case 5: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["low_greater"]], {"{d0}": "SP"}));
                        break;    
                    case 6: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["all_low_greater"]], {"{d0}": "SP"}));
                        break;   
                    case 7: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["low_lower"]], {"{d0}": "SP"}));
                        break;    
                    case 8: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["all_low_lower"]], {"{d0}": "SP"}));
                        break;    
                    
                    case 9: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["more_KO_greater"]], {}));
                        break;   
                    case 10: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["ally_KO_greater"]], {}));
                        break;     
                    case 11: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["more_use_greater"]], {}));
                        break;
                    case 12: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["more_rounds_greater"]], {}));
                        break;  
                    case 13: 
                        descParts.push(this.substituteTokens(templateStrings[DexPane.templateKeys["more_buffs_greater"]], {}));
                        break;   
                }                
            }           

            if(skillInfo.HPDrain * 1 && skillInfo.SPDrain * 1 && skillInfo.HPDrain * 1 == skillInfo.SPDrain * 1){
                let templateString = templateStrings[DexPane.templateKeys["drain_hp_sp"]];
                let tokens = {
                    "{d0}": skillInfo.HPDrain,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            } else if(skillInfo.HPDrain * 1){
                let templateString = templateStrings[DexPane.templateKeys["drain_hp"]];
                let tokens = {
                    "{d0}": skillInfo.HPDrain,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            } else if(skillInfo.SPDrain * 1){
                let templateString = templateStrings[DexPane.templateKeys["drain_sp"]];
                let tokens = {
                    "{d0}": skillInfo.SPDrain,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }

            if(skillInfo.accuracy != 100){
                let templateString = templateStrings[DexPane.templateKeys["hit_rate"]];
                let tokens = {
                    "{d0}": skillInfo.accuracy,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }

            if(skillInfo.alwaysHits * 1 && skillInfo.power > 0){
                let templateString = templateStrings[DexPane.templateKeys["always_hits"]];
                let tokens = {
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }

            if(skillInfo.critRate > 5){
                let templateString = templateStrings[DexPane.templateKeys["crit_rate"]];
                let tokens = {
                    "{d0}": skillInfo.critRate,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }

            if(skillInfo.increasedDmgAgainstClass != -1){
                let templateString = templateStrings[DexPane.templateKeys["trait_damage"]];
                let tokens = {
                    "{d0}": localizationData[currentLocale].classNames[skillInfo.increasedDmgAgainstClass],
                };
                descParts.push(this.substituteTokens(templateString, tokens));   
            }

            if(skillInfo.recoil > 0){
                let templateString = templateStrings[DexPane.templateKeys["recoil"]];
                let tokens = {
                    "{d0}": skillInfo.recoil,
                };
                descParts.push(this.substituteTokens(templateString, tokens));
            }


            return descParts.join("<br>").replace(/[\r\n]/g, "").replace(/(<br\s*\/?>){2,}/gi, '<br>').replace(/\[nol\]\<br\>/g, "");
        }
    }
}

DexPane.prototype.resolveSkillConditionals = function(skillInfo){ 
    let conditionsString = this.resolveConditions(skillInfo) 
    let effectsString = this.resolveEffects(skillInfo); 
    if(!conditionsString){
        return "";
    }
    if(conditionsString && !effectsString){
        effectsString ="[nol]";
    }
    return conditionsString + " " + effectsString;
}



DexPane.prototype.resolveConditions = function(skillInfo){
    const templateStrings = localizationData[currentLocale].autoMoveDescriptions;

     function getRequiredBuffs(){
        const result = [];
        const buffset = skillInfo["buffset_0"];
        const requiredBuffs = [];
        for(let entry of buffset){
            if(entry.effect != 0){
                result.push(entry.effect);
            }
        }
        return result;
    }

    let conditionString = "";
    if(skillInfo.skillConditionalType && skillInfo.skillEffectIfConditional){
       
        if(skillInfo.skillConditionalType == 1){
            const requiredBuffs = getRequiredBuffs();
            if(requiredBuffs.length == 1){   
                const buff = requiredBuffs[0];
                let d0 = "";
                
                if(buff >= 25 && buff <= 32){//buffs                            
                    d0 = localizationData[currentLocale].statusNames[buff - 23];

                    d0 = this.substituteTokens( 
                        templateStrings[DexPane.templateKeys["boost_to"]], 
                        {
                            "{d0}": d0,
                        }
                    );
                } 

                conditionString = this.substituteTokens( 
                    templateStrings[DexPane.templateKeys["user_is"]], 
                    {
                        "{d0}": d0,
                    }
                );
                
                
            }
        }

        if(skillInfo.skillConditionalType == 2){
            const requiredBuffs = getRequiredBuffs();
            if(requiredBuffs.length == 1){   
                const buff = requiredBuffs[0];
                let d0 = "";
                
                if(buff >= 33 && buff <= 40){//buffs                            
                    d0 = localizationData[currentLocale].statusNames[buff - 31];

                    d0 = this.substituteTokens( 
                        templateStrings[DexPane.templateKeys["reduction_to"]], 
                        {
                            "{d0}": d0,
                        }
                    );
                } 

                conditionString = this.substituteTokens( 
                    templateStrings[DexPane.templateKeys["target_is_affected"]], 
                    {
                        "{d0}": d0,
                    }
                );
                
                
            }
        }        
        
        if(skillInfo.skillConditionalType == 3){
            let d0 = localizationData[currentLocale].typeNames[skillInfo.skillConditionalArg];            
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is"]], 
                {
                    "{d0}": d0,
                }
            );           
        } 
        
        if(skillInfo.skillConditionalType == 4){
            let d0 = localizationData[currentLocale].elementNames[skillInfo.skillConditionalArg];            
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_element"]], 
                {
                    "{d0}": d0,
                }
            );           
        }  

        if(skillInfo.skillConditionalType == 5){
            let d0 = "";        
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["generation_is_greater"]], 
                {
    
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 6){
            let d0 = "";             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["generation_is_lower"]], 
                {
    
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 7){
            let d0 = "";             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_has_acted"]], 
                {
    
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 8){
            let d0 = "";             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_has_not_acted"]], 
                {
    
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 9){
            let d0 = skillInfo.skillConditionalArg;             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_above_HP"]], 
                {
                    "{d0}": d0
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 10){
            let d0 = skillInfo.skillConditionalArg;             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_below_HP"]], 
                {
                    "{d0}": d0
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 11){
            let d0 = skillInfo.skillConditionalArg;             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_above_SP"]], 
                {
                    "{d0}": d0
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 12){
            let d0 = skillInfo.skillConditionalArg;             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_below_SP"]], 
                {
                    "{d0}": d0
                }
            );           
        } 

        if(skillInfo.skillConditionalType == 13){
            let d0 = "";             
           
            conditionString = this.substituteTokens( 
                templateStrings[DexPane.templateKeys["target_is_KOed"]], 
                {
    
                }
            );           
        } 
    }
    return conditionString;
}


/*


    "damage_bonus": 66,
    "increased_damage": 67,
    "crit_rate": 68,
    "recover_HP": 69,
    "recover_SP": 70,
    "recover_HP_SP": 71,
    "reduce_target_SP": 72,
    "chance_apply_status": 73,
    "chance_of_effect": 74,
    "effect": 75,
    "removes_status": 76, 
*/

DexPane.prototype.resolveEffects = function(skillInfo){
    const templateStrings = localizationData[currentLocale].autoMoveDescriptions;
    let effectString = "";

    if(skillInfo.skillEffectIfConditional == 1){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["damage_bonus"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 2){
        let d0 = "";
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["increased_damage"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 3){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["crt_rate"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 5){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["recover_HP"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 6){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["recover_SP"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 7){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["recover_HP_SP"]], 
            {
                "{d0}": d0,
            }
        );
    }

    if(skillInfo.skillEffectIfConditional == 8){
        let d0 = skillInfo.skillEffectArg;
        effectString = this.substituteTokens( 
            templateStrings[DexPane.templateKeys["reduce_target_SP"]], 
            {
                "{d0}": d0,
            }
        );
    }


    if(effectString != ""){
        effectString+="\n";
    }
    return effectString;
}

DexPane.prototype.createMovesBlock = function(monInfo){
    let content = "";
    

    
    content+="<div class='section moves'>";
    
    content+="<div class='section_header'>";    
    content+=localizationData[currentLocale].app.DEX_header_moves;
    content+="</div>";
    content+="<div class='inner'>";

    if(isTSMode()){
        content+="<div class='section_sub_header wip_warning'>";    
        content+=localizationData[currentLocale].app.DEX_skills_WIP;
        content+="</div>";
    }

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
        tableContent.push([nameContent, this.getMoveDesc(entry.id) || "---"]);
    }

    let jogressMoves = monInfo.moves.jogress;
    for(let id in jogressMoves){
        const entry = jogressMoves[id];
        let nameContent = "<div class='skill_entry'>" + localizationData[currentLocale].sigMoves[getSkillTextIdInfo()[id]] + "</div>";
        tableContent.push([nameContent, this.getMoveDesc(id, entry.other) || "---"]);
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
        let nameContent = "<div class='skill_entry "+(isWanted ? "wanted" : "")+"'>" + localizationData[currentLocale].sigMoves[getSkillTextIdInfo()[entry.id]] + "</div>";
        tableContent.push([nameContent, this.getMoveDesc(entry.id) || "---", entry.level]);
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
    let condList = [];
    let labels = [];

    if(isTSMode()){
         condList.push("TRank");
        condList.push("HP");
        condList.push("SP");
        condList.push("ATK");
        condList.push("DEF");
        condList.push("INT");
        condList.push("SPD");
        if (isTSMode()) {
            condList.push("SPI");
        }
        condList.push("skillCountValor");
        condList.push("skillCountPhilantropy");
        condList.push("skillCountAmicable");
        condList.push("skillCountWisdom");
        condList.push("needsItem");
        condList.push("jogress");
    } else {
        condList.push("LVL");
        condList.push("HP");
        condList.push("SP");
        condList.push("ATK");
        condList.push("DEF");
        condList.push("INT");
        condList.push("SPD");
        if (isTSMode()) {
            condList.push("SPI");
        }
        condList.push("ABI");
        condList.push("CAM");
        condList.push("Other");

       
    }
    
     labels = {
            "LVL": localizationData[currentLocale].app.DEX_evos_label_level,
            "HP": localizationData[currentLocale].app.DEX_evos_label_HP,
            "SP": localizationData[currentLocale].app.DEX_evos_label_SP,
            "ATK": localizationData[currentLocale].app.DEX_evos_label_ATK,
            "DEF": localizationData[currentLocale].app.DEX_evos_label_DEF,        
            "INT": localizationData[currentLocale].app.DEX_evos_label_INT,        
            "SPD": localizationData[currentLocale].app.DEX_evos_label_SPD,
            "ABI": localizationData[currentLocale].app.DEX_evos_label_ABI,
            "CAM": localizationData[currentLocale].app.DEX_evos_label_CAM,
            "Other": localizationData[currentLocale].app.DEX_evos_label_additional,
            "SPI": localizationData[currentLocale].app.DEX_evos_label_SPI,
            "skillCountValor": "<img src='img/ui_icon/ui_icon_personal00_00.png' class='effectiveness_icon valor inline'>" + localizationData[currentLocale].app.DEX_evos_label_valor_count,
	        "skillCountPhilantropy": "<img src='img/ui_icon/ui_icon_personal00_01.png' class='effectiveness_icon love inline'>" + localizationData[currentLocale].app.DEX_evos_label_philantropy_count,
	        "skillCountAmicable": "<img src='img/ui_icon/ui_icon_personal00_02.png' class='effectiveness_icon friendship inline'>" + localizationData[currentLocale].app.DEX_evos_label_amicability_count,
	        "skillCountWisdom": "<img src='img/ui_icon/ui_icon_personal00_03.png' class='effectiveness_icon wisdom inline'>" + localizationData[currentLocale].app.DEX_evos_label_wisdom_count,
            "needsItem": localizationData[currentLocale].app.DEX_evos_label_item,
            "jogress": localizationData[currentLocale].app.DEX_evos_label_jogress,
            "TRank": localizationData[currentLocale].app.DEX_evos_label_t_rank,
        }

        

    content+="<div class='evo_reqs_flex'>";

    let requirements = monInfo.evosReqs;
    let row = [];
    for(let condition of condList){
        let blockContent = "";
        let hasContent = true;
        blockContent+="<div class='block'>"
        blockContent+="<div class='label condition'>"
        blockContent+=labels[condition];
        blockContent+="</div>";
        let errorClass = "";
        if(maxStats){
            if(maxStats[condition] < requirements[condition]){
                errorClass = "difficult";
            }
        }
        blockContent+="<div class='value "+errorClass+"'>"
        if(condition == "jogress"){
            if(requirements.jogressIdA * 1 && requirements.jogressIdB * 1){
                blockContent+=localizationData[currentLocale].digimon[requirements.jogressIdA] + " ("+localizationData[currentLocale].personalityNames[requirements.jogressPersonalityA]+")" + "<br>" + localizationData[currentLocale].digimon[requirements.jogressIdB]  + " ("+localizationData[currentLocale].personalityNames[requirements.jogressPersonalityB]+")" ;
            } else {
                hasContent = false;
                blockContent+=("-");
            }
         } else {                
            if(requirements[condition] * 1){
                if(condition == "needsItem"){    
                     blockContent+=localizationData[currentLocale].itemNames[requirements.needsItem] || "???";
                } else if(condition == "Other"){
                    blockContent+= (localizationData[currentLocale].app.DEX_evos_label_has_additional) || "???";
                } else {
                    blockContent+=(requirements[condition]) || "???";
                }
                
            } else {
                hasContent = false;
                blockContent+=("-");
            }
        }
        blockContent+="</div>";
        blockContent+="</div>";
        if(hasContent){
            content+=blockContent;
        }
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

    if( monInfo.neighBours.prev.length){    
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
            content+="<img data-id='"+monId+"' class='dex_img "+(isTSMode() ? "TS" : "")+"'/>";
            content+="</div>";
            
            content+="<div class='name'>";
            content+=targetMonInfo.name;

            content+="<div data-id='"+monId+"' class='db_link flex-item'>";
            content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
            content+="</div>";

            content+="</div>";
            content+="</div>";

            if(isTSMode()){
            // content+="<table id='evo_reqs_table' class='stats'>";  

                content+="<div class='evo_reqs_flex previous'>";

                let requirements = monInfo.evosReqs;
                let row = [];
            
                content+="<div class='block'>"
                content+="<div class='label condition'>"
                content+=localizationData[currentLocale].app.DEX_general_default_pers;
                content+="</div>";
                
                content+="<div class='value'>"
                content+=localizationData[currentLocale].personalityNames[targetMonInfo.baseStats.basePersonality];
                content+="</div>";
                content+="</div>";
                

                content+="</div>";
            
            //   content+="</table>";
            }
            
            content+="</div>";
        }
        content+="</div>";

        content+="</div>";
    }

    if( monInfo.neighBours.next.length){    
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
            content+="<img data-id='"+monId+"' class='dex_img "+(isTSMode() ? "TS" : "")+"'/>";
            content+="</div>";
            
            content+="<div class='name'>";
            content+=targetMonInfo.name;

            content+="<div data-id='"+monId+"'  class='db_link flex-item'>";
            content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
            content+="</div>";

            content+="</div>";
            
            content+="</div>";

        

            content+=this.createEvoReqs(targetMonInfo, getDigiData(monInfo.id).maxBaseStats);
        
        
            content+="</div>";
        }
        content+="</div>";
        content+="</div>";
        content+="</div>";
    }


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
    if(isTSMode()){
        content+="<div class='enc_block'>";
        content+="<div class='section_sub_header'>";
        
        content+=localizationData[currentLocale].app.DEX_encounters_TS;
        content+="</div>";

    
        content+=createEncountersTable(getDigiData(monInfo.id).encounters.TS || []);
        content+="</div>";
    } else {
        content+="<div class='enc_block'>";
        content+="<div class='section_sub_header'>";
        
        content+=localizationData[currentLocale].app.DEX_encounters_base;
        content+="</div>";

    
        content+=createEncountersTable(getDigiData(monInfo.id).encounters.base);
        content+="</div>";
        content+="<div class='enc_block'>";
        content+="<div class='section_sub_header'>";
        
        content+=localizationData[currentLocale].app.DEX_encounters_hame;
        content+="</div>";

        
        content+=createEncountersTable(getDigiData(monInfo.id).encounters.hame);
        content+="</div>";
    }
    
    content+="</div>";

    content+="</div>";

    content+="</div>";


    return content;
}


DexPane.prototype.showDigimon = function(id, context){
    $("#content")[0].classList.add("details_view");
    this.setActiveId(id);
    this.show(context);
}