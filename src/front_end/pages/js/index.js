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
// 异步获取数据，避免UI阻塞
async function getData(){
    let rawData = funcInjector.GetHeatMapData(params);
    return JSON.parse(rawData)
}

// 绑定提交参数事件
document.querySelector("#submit-param").onclick=()=>{
    mdui.$("#submit-param").prop('disabled',true)
    document.querySelector('#submit-spinner').style.visibility = 'visible'
    getData()
        .then(e=> {
            alert(JSON.stringify(e))
            mdui.$("#submit-param").prop('disabled',false)
            document.querySelector('#submit-spinner').style.visibility = 'hidden'
        })
        .catch(e=> {
            alert(e.toString())
            mdui.$("#submit-param").prop('disabled',false)
            document.querySelector('#submit-spinner').style.visibility = 'hidden'
        })
}

// 通过value动态生成组件
function getTypeSelHtml(value,isChecked){
    return `<label class="mdui-radio">
<input type="radio" name="type-selector" value="${value}"
${isChecked?"checked":""} />
<i class="mdui-radio-icon"></i>
${value}
</label>`
}

// 动态添加type组件
function fetchTypes(){
    let types = funcInjector.GetTypeList()
    types = types
        .toString()
        .slice(1,types.toString().length-1)
        .replace(/\s+/g,'')
        .split(',')
    let html = ""
    html = html + getTypeSelHtml(types[0], true)
    for (let i = 1; i < types.length; i++)
        html = html + getTypeSelHtml(types[i], false)
    mdui.$("#type-selector").append(html)
    mdui.$("#type-selector").mutation()
}



