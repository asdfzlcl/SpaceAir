// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    task: 0, type: "", time: "", height: 0, latLb: 0.0, latUb: 0.0, lonLb: 0.0, lonUb: 0.0, filename: ""
}

// 数据限制
limit = {
    height: 0, latLb: -90, latUb: 90, lonLb: -180, lonUb: 180,
}

params_info={
    task: 0, type: "", time: "", height: 0, latLb: 0.0, latUb: 0.0, lonLb: 0.0, lonUb: 0.0, filename: ""
}
// 统计数据
// 该对象的所有属性setter均被绑定到页面
statics = {
    min: 0, max: 0, avg: 0, sdev: 0
}

// 异步获取数据，避免UI阻塞
async function getData() {
    let rawData
    switch (params.task) {
        case 0:
            rawData = funcInjector.GetHeatMapData(params)
            break
        case 1:
        case 2:
            rawData = funcInjector.GetContourMapData(params)
    }
    return JSON.parse(rawData)
}

function changePath() {
    funcInjector.changePath()
}


// 绑定提交参数事件
document.querySelector("#submit-param").onclick = () => {
    if(params.filename=="")
    {
        mdui.alert("请选择文件")
        return
    }
    getData()
        .then(rawData => {
            switch (params.task) {
                case 0:
                    drawHeatMap(rawData)
                    break
                case 1:
                case 2:
                    drawContourMapData(rawData)
            }
        })
        .catch(e => {
            mdui.alert(e.toString())
        })
}

// 通过value动态生成类型选择组件
function getTypeSelHtml(value, value_info,isChecked) {
    return `<label class="mdui-radio">
            <input type="radio" name="type-selector" value="${value}" onclick="fetchFileList()"
            ${isChecked ? "checked" : ""} />
            <i class="mdui-radio-icon"></i>
            ${value_info}
            </label>`
}

// 动态添加type组件
function fetchTypes() {
    let types = funcInjector.GetFileInfo()
    let info=funcInjector.GetFileInformation()

    types = types
        .toString()
        .slice(1, types.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    info = info
        .toString()
        .slice(1, info.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    let html = ""
    html = html + getTypeSelHtml(types[0],info[0], true)+'&#12288'
    for (let i = 1; i < types.length; i++) {
        html = html + getTypeSelHtml(types[i], info[i],false)+'&#12288'

    }
    mdui.$("#type-selector").append(html)
    mdui.$("#type-selector").mutation()
}
