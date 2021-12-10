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
    if(taskId==0)
    {
        document.querySelector("#latLb-input").disabled=true
        document.querySelector("#lonLb-input").disabled=true
        document.querySelector("#height-selector").disabled=false
    }
    else
    {
        document.querySelector("#latLb-input").disabled=false
        document.querySelector("#lonLb-input").disabled=false
        document.querySelector("#height-selector").disabled=true
    }

})
bindGetter(params,'task','',()=>{
    return taskId
})
// bindNumberGetter(params,'time',"input[name=time-selector]:checked")
bindNumberGetter(params,'height',"#height-selector")
bindNumberGetter(params,'latLb',"#latLb-input")
bindNumberGetter(params,'lonLb',"#lonLb-input")

bindSetterWithFixed2(statics,'max','#data-max')
bindSetterWithFixed2(statics,'min','#data-min')
bindSetterWithFixed2(statics,'avg','#data-avg')
bindSetterWithFixed2(statics,'sdev','#data-sdev')

Object.defineProperty(params,'time',{
    set:(newVal)=>{
        document.querySelector("#show-time").innerHTML=newVal
    }
})

Object.defineProperty(limit, 'latLb', {
    set: (newVal) => {
        for (let d of document.querySelectorAll(".limit-latLb"))
            d.innerHTML = newVal.toString()
    },
    get: () => parseInt(document.querySelectorAll(".limit-latLb")[0].innerHTML)
})
Object.defineProperty(limit, 'lonLb', {
    set: (newVal) => {
        for (let d of document.querySelectorAll(".limit-lonLb"))
            d.innerHTML = newVal.toString()
    },
    get: () => parseInt(document.querySelectorAll(".limit-lonLb")[0].innerHTML)
})
Object.defineProperty(limit, 'latUb', {
    set: (newVal) => {
        for (let d of document.querySelectorAll(".limit-latUb"))
            d.innerHTML = newVal.toString()
    },
    get: () => parseInt(document.querySelectorAll(".limit-latUb")[0].innerHTML)
})
Object.defineProperty(limit, 'lonUb', {
    set: (newVal) => {
        for (let d of document.querySelectorAll(".limit-lonUb"))
            d.innerHTML = newVal.toString()
    },
    get: () => parseInt(document.querySelectorAll(".limit-lonUb")[0].innerHTML)
})
