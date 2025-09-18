
if(isElectron()){
    module.exports = BanSelector;
}

function BanSelector(containerId, callbacks){
    const _this = this;
    this._containerId = containerId;
    this._currentSelection = {};
    this._callbacks = callbacks;
    this._maxSelection = 8;
    this._filters = {
        text: "",      
    }

    window.addEventListener("click", function(e){
        if(e.target.closest("#bans") == null && !e.target.classList.contains("ban_btn") && e.target.closest(".ban_selector") == null && !e.target.classList.contains("ban_selector_entry") && e.target.closest(".ban_selector_entry") == null){
            _this.hide();
        }
        //handleFilterHiding(e);
        
    });
}

BanSelector.prototype.setSelection = function(selection){
    this._currentSelection = structuredClone(selection);
}

BanSelector.prototype.notifySelected = function(){
    const _this = this;
    let result = {};
    for(let entry in _this._currentSelection){
        if(_this._currentSelection[entry]){
            result[entry] = true;
        }
    }
    if(_this._callbacks.selected){
        _this._callbacks.selected(result);
    }   
}

BanSelector.prototype.toggle = function(selectedId){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(!selectorElem || selectorElem.classList.contains("hidden")){
        this.show(selectedId)
    } else {
        this.hide()
    }    
}

BanSelector.prototype.hide = function(context){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(selectorElem){
        selectorElem.classList.add("hidden");
    }    
}

BanSelector.prototype.show = function(selectedId){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);   

    content = "";
    content+= "<div class='mon_selector skill_selector hidden'>";

    content+= "<div class='filter_overlay'>";

    content+="</div>";

    content+= "<div id='close_button' class='close_button'>";
    content+="<i class='fa fa-close' aria-hidden='true'  ></i>";
    content+="</div>";

    content+= "<div class='row controls filter_container'>";
    content+= "<input id='mon_search' value='"+_this._filters.text+"'></input>";

    content+="</div>";

    content+= "<div class='row filter_container buttons'>";

    content+="<div class='selector_control' id='clear_selection'>Clear</div>";

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
    });
    
    contentContainer.querySelector("#clear_selection").addEventListener("click", function(){
        _this._currentSelection = {};
        _this.updateCheckBoxes();
        _this.notifySelected(); 
    });
    

    contentContainer.querySelector("#close_button").addEventListener("click", function(){
        _this.hide();
    });
    //contentContainer.querySelector("#mon_search").focus();

    

    
    
}

BanSelector.prototype.getSortedIds = function(){
    const _this = this;
    let moveNames = localizationData[currentLocale].moves;
    let managedKeys = Object.keys(_this._currentSelection);
   

    return managedKeys;
}

BanSelector.prototype.updateCheckBoxes = function(managedKeys){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);
    const checkBoxes = contentContainer.querySelectorAll(".entry_select");
    for(let checkBox of checkBoxes){
        checkBox.disabled = false;
        checkBox.checked = false;
        const skillId = checkBox.getAttribute("data-id");
        if(_this._currentSelection[skillId]){
            checkBox.checked = true;
        } else if(Object.keys(_this._currentSelection).length >= _this._maxSelection){
            checkBox.disabled = true;
        }   

    }
}

BanSelector.prototype.showList = function(managedKeys){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);
    let moveNames = localizationData[currentLocale].moves;
    

    let content = "";
    content+= "<div class='scroll'>";
    for(let monId of managedKeys){
        content+= "<div class='entry ban_selector_entry' data-id='"+monId+"' tabindex=0>";
        

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
                    content+="<img data-id='"+monId+"' class='dex_img "+(isTSMode() ? "TS" : "")+"'/>";
                    content+="</div>";
                
                    content+="<div class='name'>";
                    content+= localizationData[currentLocale].digimon[monId];
                    content+="</div>";

                    content+="<input data-id='"+monId+"' class='entry_select' type='checkbox' "+(_this._currentSelection[monId] ? "checked" : "")+"></input>";        

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
            //check if image is still within rendered bound
            const scrollContainerBounds = scrollContainer.getBoundingClientRect();
            let topBound = scrollContainerBounds.top;
            let bottomBound = scrollContainerBounds.bottom;
            let monImgs = contentContainer.querySelectorAll(".icon img");
            for(let img of monImgs){
                if(!img.isRendered){
                    const imgBounds = img.getBoundingClientRect();
                    if(imgBounds.top <= bottomBound && imgBounds.top >= topBound - 80){ 
                        const monId = img.getAttribute("data-id");
                        img.isRendered = true;
                        if(monId != -1){
                            setDDSImage(img, monId);
                        }
                    }
                    
                }                
            }   
        }

        if(immediate){
            setImages();
        }
        imageRenderTimeout = setTimeout(setImages, 5);  
         
    }
    renderBlocks(true);

     let scrollTimeOut;
    
    if(!scrollContainer.scrollBound){
        scrollContainer.scrollBound = true;
        scrollContainer.addEventListener("scroll", function(){
            /*if(scrollTimeOut != null){
                clearTimeout(scrollTimeOut);
            }
            scrollTimeOut = setTimeout(renderBlocks, 10);    */     
            renderBlocks();
        });
    }

    _this.updateCheckBoxes();
    function updateEntrySelection(skillId, state){
        if(state){
            if(Object.keys(_this._currentSelection).length < _this._maxSelection){
                 _this._currentSelection[skillId] = true;
            }
        } else {
            _this._currentSelection[skillId] = false;
        }
       //  _this.showList(_this.getSortedIds());
       _this.updateCheckBoxes();
    }
    
    let monBtns = contentContainer.querySelectorAll(".entry");
    for(let entry of monBtns){
        entry.addEventListener("click", function(){         
            const skillId = this.getAttribute("data-id");   
            let newState = !(_this._currentSelection[skillId]);
            updateEntrySelection(skillId, newState);

            _this.notifySelected();  
                                                
        });
/*
        entry.addEventListener("keydown", function(e){
            if(e.keyCode == 13){
                if(_this._callbacks.selected){
                    _this._callbacks.selected(this.getAttribute("data-id"));
                } 
            }             
        });*/
    } 

}