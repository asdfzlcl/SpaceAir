let bindGetter = function(obj,attr,domSelector,
                          getter=()=>document.querySelector(domSelector).value){
    Object.defineProperty(obj, attr, {
        get: getter
    });
}
let bindNumberGetter = (obj,attr,domSelector)=>{
    Object.defineProperty(obj, attr, {
        get: ()=>parseInt(document.querySelector(domSelector).value)
    })
}
bindGetter(params,'type',"input[name=type-selector]:checked")
bindGetter(params,'days',"",()=>{
    let timeStr = document.querySelector("#date-input").value
    let date= new Date(Date.parse(timeStr.replace(/-/g,  "/")))
    let firstDayOfYear = new Date(`${date.getFullYear()}-01-01`)
    return Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000) + 2
})
bindGetter(params,'year',"",()=>{
    return parseInt(
        document.querySelector(
            "#date-input"
        ).value.slice(0,4)
    )
})
bindNumberGetter(params,'time',"input[name=time-selector]:checked")
bindNumberGetter(params,'height',"#height-input")
bindNumberGetter(params,'latLb',"#latLb-input")
bindNumberGetter(params,'latUb',"#latUb-input")
bindNumberGetter(params,'lonLb',"#lonLb-input")
bindNumberGetter(params,'lonUb',"#lonUb-input")
