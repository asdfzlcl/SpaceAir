let bindGetter = function(obj,attr,domSelector,
                          getter=()=>{
                              let mySelection =  document.querySelector(domSelector)
                             return mySelection.options[mySelection.selectedIndex].value
                            }
                          ){
    Object.defineProperty(obj, attr, {
        get: getter
    });
}

bindGetter(params,'type',"#selector")