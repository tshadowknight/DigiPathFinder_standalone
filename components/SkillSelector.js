
if(isElectron()){
    module.exports = SkillSelector;
}

function SkillSelector(containerId, callbacks){
    const _this = this;
    this._containerId = containerId;
    this._currentSelection = {};
    this._callbacks = callbacks;
    this._maxSelection = 8;
    this._filters = {
        text: "",      
    }

    window.addEventListener("click", function(e){
        if(e.target.closest("#skill") == null && !e.target.classList.contains("skill_btn") && e.target.closest(".skill_selector") == null && !e.target.classList.contains("skill_selection_entry") && e.target.closest(".skill_selection_entry") == null){
            _this.hide();
        }
        //handleFilterHiding(e);
        
    });
}

SkillSelector.prototype.toggle = function(selectedId){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(!selectorElem || selectorElem.classList.contains("hidden")){
        this.show(selectedId)
    } else {
        this.hide()
    }    
}

SkillSelector.prototype.hide = function(context){
    const contentContainer = document.getElementById(this._containerId);
    const selectorElem = contentContainer.querySelector(".mon_selector");
    if(selectorElem){
        selectorElem.classList.add("hidden");
    }    
}

SkillSelector.prototype.show = function(selectedId){
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
         if(_this._callbacks.selected){
            _this._callbacks.selected(_this._currentSelection);
        }   
    });
    

    contentContainer.querySelector("#close_button").addEventListener("click", function(){
        _this.hide();
    });
    //contentContainer.querySelector("#mon_search").focus();

    

    
    
}

SkillSelector.prototype.getSortedIds = function(){
    const _this = this;
    let moveNames = localizationData[currentLocale].moves;
    let managedKeys = Object.keys(moveNames);
    managedKeys = managedKeys.sort((a, b) => {        
       
        return String(managedKeys[a]).localeCompare(String(managedKeys[b]));
    });

    managedKeys = managedKeys.filter(x => {
        const name = moveNames[x];
        let isValid = true;
        if(_this._currentSelection[x]){
            return true;
        }
        if(_this._filters.text){
            if(String(name).toLowerCase().indexOf(String(_this._filters.text).toLowerCase()) == -1){
                isValid = false;
            }
        }        
        return isValid;
    });

    return managedKeys;
}

SkillSelector.prototype.updateCheckBoxes = function(managedKeys){
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

SkillSelector.prototype.showList = function(managedKeys){
    const _this = this;
    const contentContainer = document.getElementById(this._containerId);
    let moveNames = localizationData[currentLocale].moves;
    

    let content = "";
    content+= "<div class='scroll'>";
    for(let skillId of managedKeys){
        content+= "<div class='entry skill_selection_entry' data-id='"+skillId+"' tabindex=0>";
        content+="<div class='name'>";
        content+= moveNames[skillId];
        content+="</div>";

        content+="<input data-id='"+skillId+"' class='entry_select' type='checkbox' "+(_this._currentSelection[skillId] ? "checked" : "")+"></input>";        

        content+="</div>";
    }
    content+="</div>";

    contentContainer.querySelector("#list_container").innerHTML = content;
    const scrollContainer = contentContainer.querySelector("#list_container .scroll");

   
    _this.updateCheckBoxes();
    function updateEntrySelection(skillId, state){
        if(state){
            if(Object.keys(_this._currentSelection).length < _this._maxSelection){
                 _this._currentSelection[skillId] = true;
            }
        } else {
            delete _this._currentSelection[skillId];
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

            if(_this._callbacks.selected){
               _this._callbacks.selected(_this._currentSelection);
            }   
                                                
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