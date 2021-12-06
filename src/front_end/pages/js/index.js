params = {
    task:0,
    type:"",
    time:0,
    height:0,
    days:0,
    year:0,
    latLb:0,
    latUb:0,
    lonLb:0,
    lonUb:0
}

// 绑定提交参数事件
document.querySelector("#submit-param").onclick=()=>{
    let data = funcInjector.GetData(params)
    mdui.alert(data.toString(),'Debug Message')
}
