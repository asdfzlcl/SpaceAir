let bindGetter = function(obj,attr,domSelector,
                          getter=()=>document.querySelector(domSelector).value){
    Object.defineProperty(obj, attr, {
        get: getter
    });
}

let bindSetterWithFixed2 = function(obj,attr,domSelector,
                          setter=(newVal)=>document.querySelector(domSelector).innerHTML=newVal.toFixed(2)){
    Object.defineProperty(obj, attr, {
        set:setter
    });
}

let bindNumberGetter = (obj,attr,domSelector)=>{
    Object.defineProperty(obj, attr, {
        get: ()=>parseInt(document.querySelector(domSelector).value)
    })
}

bindGetter(params,'type',"input[name=type-selector]:checked")
let taskId = 0
mdui.$('#head-tab').on('change.mdui.tab',(event)=>{
    taskId = event._detail.index
})
bindGetter(params,'task','',()=>{
    return taskId
})
bindNumberGetter(params,'time',"input[name=time-selector]:checked")
bindNumberGetter(params,'height',"#height-input")
bindNumberGetter(params,'latLb',"#latLb-input")
bindNumberGetter(params,'latUb',"#latUb-input")
bindNumberGetter(params,'lonLb',"#lonLb-input")
bindNumberGetter(params,'lonUb',"#lonUb-input")

bindSetterWithFixed2(statics,'max','#data-max')
bindSetterWithFixed2(statics,'min','#data-min')
bindSetterWithFixed2(statics,'avg','#data-avg')
bindSetterWithFixed2(statics,'sdev','#data-sdev')


Object.defineProperty(limit,'latLb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-latLb"))
            d.innerHTML=newVal.toString()
    }
})
Object.defineProperty(limit,'latUb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-latUb"))
            d.innerHTML=newVal.toString()
    }
})
Object.defineProperty(limit,'lonLb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-lonLb"))
            d.innerHTML=newVal.toString()
    }
})
Object.defineProperty(limit,'lonUb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-lonUb"))
            d.innerHTML=newVal.toString()
    }
})
Object.defineProperty(limit,'heightLb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-heightLb"))
            d.innerHTML=newVal.toString()
    }
})
Object.defineProperty(limit,'heightUb',{
    set:(newVal)=>{
        for(let d of document.querySelectorAll(".limit-heightUb"))
            d.innerHTML=newVal.toString()
    }
})
