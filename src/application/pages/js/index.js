// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    type: 0
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

function fileChangeHandler(filename) {
    params.filename = filename
    document.querySelector("#show-filename").innerHTML = filename
}

function DrawPic(bottomtype)
{

}

// 通过value动态生成文杰列表项
function getFileListHtml(value) {
    return `<div><li class="mdui-list-item mdui-ripple file-item" onclick="fileChangeHandler('` + value + `')">${value}</li>
<li class="mdui-divider"></li></div>`
}

// <button id="submit-param" className="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent">绘制图形
// </button>
function getBottomListHtml(value1,value2)
{
    return `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="DrawPic('` + value2 + `')" style = "margin-left:1vh;margin-bottom:1vh;margin-right:1vh"> ${value1} </button>`
}
//获取文件目录
function fetchFileList()
{
    document.querySelector("#file-list").innerHTML = ''
    params.filename=""
    let filelist = funcInjector.GetDictiontary(params)
    let files = []
    files = filelist
        .toString()
        .slice(1, filelist.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    let html = ""
    for (let i = 0; i < files.length; i++) html = html + getFileListHtml(filelist.get(i))
    mdui.$("#file-list").append(html)
    mdui.$("#file-list").mutation()
    params.filename=""
    document.querySelector("#show-filename").innerHTML=""
    bottontype = funcInjector.GetBottonType(params)
    bottontype = bottontype
        .toString()
        .slice(1, bottontype.toString().length - 1)
        .split(',')
    html = bottontype[0]+'<br />'
    for (let i = 1; i < bottontype.length; i+=2) {
        html = html  + getBottomListHtml(bottontype[i],bottontype[i+1])
    }
    document.querySelector("#botton-list").innerHTML = ''
    mdui.$("#botton-list").append(html)
    mdui.$("#botton-list").mutation()
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
    let info = funcInjector.GetFileInformation()
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
    html = html + getTypeSelHtml(types[0],info[0], true,)+'&#12288'
    for (let i = 1; i < types.length; i++) {
        html = html + '<br />' +getTypeSelHtml(types[i], info[i],false)+'&#12288'

    }
    mdui.$("#type-selector").append(html)
    mdui.$("#type-selector").mutation()
}


