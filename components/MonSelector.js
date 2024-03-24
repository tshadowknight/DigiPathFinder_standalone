
module.exports = MonSelector;

function MonSelector(containerId, callbacks, monData){
    this._containerId = containerId;
    this._monData = monData;
    this._filters = {
        text: "",
        types: {
            "free": true,
            "virus": true, 
            "vaccine": true,
            "data": true
        }, 
        levels: {
            "training_1": true,
            "training_2": true,
            "child": true,
            "adult": true,
            "perfect": true,
            "ultimate": true,
            "ultra": true,
        }
    }
    this._callbacks = callbacks;
}

MonSelector.prototype.toggle = function(selectedId){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(!selectorElem || selectorElem.classList.contains("hidden")){
        this.show(selectedId)
    } else {
        this.hide()
    }    
}

MonSelector.prototype.hide = function(context){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(selectorElem){
        selectorElem.classList.add("hidden");
    }    
}

MonSelector.prototype.show = function(selectedId){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);   

    content = "";
    content+= "<div class='mon_selector hidden'>";

    content+= "<div class='row controls'>";
    content+= "<input id='mon_search' value='"+_this._filters.text+"'></input>";

    //types filter

    content+= "<div class='row controls type_filter filter'>";
    content+= "<div class='label'>";
    content+= localizationData[currentLocale].app.label_types_filter;
    
    content+="</div>";
    content+="<div class='options'>";
    for(let id in commonFieldTranslations.type){
        let typeId = commonFieldTranslations.type[id];
        content+="<div class='filter_entry'>";
        content+="<div class='filter_label'>";
        content+=localizationData[currentLocale].app.types[typeId];
        content+="</div>";
        content+="<input data-type='types' data-typeid='"+typeId+"' value='"+localizationData[currentLocale].app.types[typeId]+"' type=checkbox "+(_this._filters.types[typeId] ? "checked" : "")+"></input>";
        content+="</div>";
    }  
    content+="</div>";
    content+="<div class='controls'>";
    content+="<i data-type='types' class='set_all fa fa-check-square' aria-hidden='true'></i>";
    content+="<i data-type='types' class='clear_all fa fa-square-o' aria-hidden='true'></i>";
    content+="</div>";
    content+="</div>";
    
    content+= "<div class='row controls level_filter filter'>";
    content+= "<div class='label'>";
    content+= localizationData[currentLocale].app.label_levels_filter;
    
    content+="</div>";

    //levels filter
    content+="<div class='options'>";
    for(let id in commonFieldTranslations.level){
        let levelId = commonFieldTranslations.level[id];
        content+="<div class='filter_entry'>";
        content+="<div class='filter_label'>";
        content+=localizationData[currentLocale].app.levels[levelId];
        content+="</div>";
        content+="<input data-type='levels' data-typeid='"+levelId+"' value='"+localizationData[currentLocale].app.levels[levelId]+"' type=checkbox "+(_this._filters.levels[levelId] ? "checked" : "")+"></input>";
        content+="</div>";
    }  
    content+="</div>";
    content+="<div class='controls'>";
    content+="<i data-type='levels' class='set_all fa fa-check-square' aria-hidden='true'></i>";
    content+="<i data-type='levels' class='clear_all fa fa-square-o' aria-hidden='true'></i>";
    content+="</div>";
    content+="</div>";  
    


    content+="</div>";

    content+= "<div id='list_container' class='row list'>";
    
    content+="</div>";

    content+="</div>";
    


    contentContainer.innerHTML = content;      
    contentContainer.querySelector(".mon_selector").classList.remove("hidden");
    _this.showList(_this.getSortedIds());
   
   
    
    contentContainer.querySelector("#mon_search").addEventListener("keyup", function(e){
        _this._filters.text = this.value;
        let currentIds = (_this.getSortedIds());
        _this.showList(currentIds);
        if(currentIds.length == 1 && e.keyCode == 13){
            if(_this._callbacks.selected){
                _this._callbacks.selected(currentIds[0]);
            }  
        }
    });
    
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(selectedId){
        selectorElem.querySelector(".entry[data-id='"+selectedId+"']").scrollIntoView();
    }

    const filterEntries = contentContainer.querySelectorAll(".filter_entry input");
    for(let entry of filterEntries){
        entry.addEventListener("change", function(){
            const type = this.getAttribute("data-type");
            const typeId = this.getAttribute("data-typeid");
            _this._filters[type][typeId] = this.checked * 1;
            _this.showList(_this.getSortedIds());
        })
    }

    function changeAllOfType(type, newVal){
        for(let key in _this._filters[type]){
            _this._filters[type][key] = newVal;
        }
        for(let entry of filterEntries){
            const entryType = entry.getAttribute("data-type");
            if(entryType == type){
                entry.checked = newVal;
            }
        }
    }

    const setAllEntries = contentContainer.querySelectorAll(".set_all");
    for(let entry of setAllEntries){
        entry.addEventListener("click", function(){
            const type = this.getAttribute("data-type");
            changeAllOfType(type, true);
            _this.showList(_this.getSortedIds());
        })
    }

    const clearAllEntries = contentContainer.querySelectorAll(".clear_all");
    for(let entry of clearAllEntries){
        entry.addEventListener("click", function(){
            const type = this.getAttribute("data-type");
            changeAllOfType(type, false);
            _this.showList(_this.getSortedIds());
        })
    }

/*
    contentContainer.querySelector("#reset_types").addEventListener("click", function(){
        _this._filters.types = {
            "free": true,
            "virus": true, 
            "vaccine": true,
            "data": true
        };
        _this.show();
    });

    contentContainer.querySelector("#clear_types").addEventListener("click", function(){
        _this._filters.types = {
            "free": false,
            "virus": false, 
            "vaccine": false,
            "data": false
        };
        _this.show();
    });
*/
    

    contentContainer.querySelector("#mon_search").focus();

    

    window.addEventListener("click", function(e){
        if(e.target.closest(".control_block") == null && !e.target.classList.contains("digi_btn")){
            _this.hide();
        }
    })
}

MonSelector.prototype.getSortedIds = function(){
    const _this = this;
    let monDisplayList = structuredClone(this._monData);
    let managedKeys = Object.keys(monDisplayList);
    managedKeys = managedKeys.sort((a, b) => String(localizationData[currentLocale].digimon[a]).localeCompare(localizationData[currentLocale].digimon[b]))

    managedKeys = managedKeys.filter(x => {
        const name = localizationData[currentLocale].digimon[x];
        let isValid = true;
        if(_this._filters.text){
            if(name.toLowerCase().indexOf(_this._filters.text) == -1){
                isValid = false;
            }
        }
        const type = getDigiData(x).baseStats.type;
        if(!_this._filters.types[type]){
            isValid = false;
        }

        const level = getDigiData(x).baseStats.level;
        if(!_this._filters.levels[level]){
            isValid = false;
        }
        return isValid;
    });
    return managedKeys;
}

MonSelector.prototype.showList = function(managedKeys){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);

    

    let content = "";
    content+= "<div class='scroll'>";
    for(let monId of managedKeys){
        content+= "<div class='entry' data-id='"+monId+"' tabindex=0>";
        
        

        content+="</div>";
    }
    content+="</div>";

    contentContainer.querySelector("#list_container").innerHTML = content;
    const scrollContainer = contentContainer.querySelector("#list_container .scroll");

    let imageRenderTimeout;

    function renderBlocks(immediate){
        for(let monId of managedKeys){
            const targetContainer = contentContainer.querySelector(".entry[data-id='"+monId+"']");
           
            const scrollContainerBounds = scrollContainer.getBoundingClientRect();
            let topBound = scrollContainerBounds.top;
            let bottomBound = scrollContainerBounds.bottom;
    
            const targetBounds = targetContainer.getBoundingClientRect();
    
            
    
            if(targetBounds.top <= bottomBound && targetBounds.top >= topBound - 80){                
                if(targetContainer.querySelector(".icon") == null){//do not refresh entries that haven't gone out of render
                    let content = "";
                    content+="<div class='icon dex_img_container'>";
                    content+="<img data-id='"+monId+"' class='dex_img'/>";
                    content+="</div>";
                
                    content+="<div class='name'>";
                    content+= localizationData[currentLocale].digimon[monId];
                    content+="</div>";
                    targetContainer.innerHTML = content;
                }                                
            } else {
                targetContainer.innerHTML = "";
            }          
            
        }
        if(imageRenderTimeout != null){
            clearTimeout(imageRenderTimeout);
        }

        function setImages(){
            let monImgs = contentContainer.querySelectorAll(".icon img");
            for(let img of monImgs){
                if(!img.isRendered){
                    const monId = img.getAttribute("data-id");
                    img.isRendered = true;
                    if(monId != -1){
                        setDDSImage(img, monId);
                    }
                }                
            }   
        }

        if(immediate){
            setImages();
        }
        imageRenderTimeout = setTimeout(setImages, 100);  
         
    }
    renderBlocks(true);

    let scrollTimeOut;
    
    if(!scrollContainer.scrollBound){
        scrollContainer.scrollBound = true;
        scrollContainer.addEventListener("scroll", function(){
            if(scrollTimeOut != null){
                clearTimeout(scrollTimeOut);
            }
            scrollTimeOut = setTimeout(renderBlocks, 10);         
        })
    }
    
    
    let monBtns = contentContainer.querySelectorAll(".entry");
    for(let entry of monBtns){
        entry.addEventListener("click", function(){
            if(_this._callbacks.selected){
                _this._callbacks.selected(this.getAttribute("data-id"));
            }  
        })

        entry.addEventListener("keydown", function(e){
            if(e.keyCode == 13){
                if(_this._callbacks.selected){
                    _this._callbacks.selected(this.getAttribute("data-id"));
                } 
            }             
        })
    } 

}