// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    type: 0,pictype: 0,filename : ""
}

// 统计数据
// 该对象的所有属性setter均被绑定到页面
statics = {
    min: 0, max: 0, avg: 0, sdev: 0
}

// 异步获取数据，避免UI阻塞
async function getData() {
    let rawData

    switch (params.pictype) {
        case 0:
            rawData = funcInjector.GetLinearMapData(params)
            break
        case 1:
            rawData = funcInjector.GetHeatMapData(params)
            break
        case 2:
            rawData = funcInjector.GetContourMapData(params)
    }
    return JSON.parse(rawData)
}
//onchange="handleFiles(this.files)"
function getObjectURL(file) {
    var url = null;
    if (window.createObjcectURL != undefined) {
        url = window.createOjcectURL(file);
    } else if (window.URL != undefined) {
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) {
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

function fileChangeHandler(filename,path) {
    mdui.alert(getObjectURL(filename))
    params.filename = filename.name
    params.filepath = getObjectURL(filename)
    document.querySelector("#show-filename").innerHTML = filename.name
    document.querySelector("#show-filepath").innerHTML = path
}

function GetFile() {
    fileURL = funcInjector.chooseFile()
}

function DrawPic(pictype){
    //更新图片属性
    params.pictype = Number(pictype)
    //错误检查
    if(params.filename=="")
    {
        mdui.alert("请选择文件")
        return
    }
    //绘制图像
    getData()
        .then(rawData => {
            switch (params.pictype) {
                case 0:
                    drawLinearMapData(rawData)
                    break
                case 1:
                    drawHeatMapData(rawData)
                    break
                case 2:
                    drawContourMapData(rawData)
            }
        })
        .catch(e => {
            mdui.alert(e.toString())
        })
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





// 生成按钮组件
function getBottomListHtml(value1,value2)
{
    return `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="DrawPic('` + value2 + `')" style = "margin-bottom: 1vh"> ${value1} </button>`
}
//获取画图属性目录
function fetchFileList()
{

    params.filename=""
    document.querySelector("#show-filename").innerHTML=""
    //生成按钮组件
    bottontype = funcInjector.GetBottonType(params)
    bottontype = bottontype
        .toString()
        .slice(1, bottontype.toString().length - 1)
        .split(',')
    document.querySelector("#botton-type").innerHTML = bottontype[0]
    //mdui.$("#botton-list").mutation()
    html = ''
    for (let i = 1; i < bottontype.length; i+=2) {
        html = html  + getBottomListHtml(bottontype[i],bottontype[i+1]) +'<br>'
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


//画折线图
function drawLinearMapData(rawData){
    dataName = "ABC"
    let option = {
        toolbox: {
            show: true,
            feature: {
                dataZoom: {},
                saveAsImage: {}
            }
        },
        legend: {
            data: ['高度 (km) vs. '+dataName]
        }, tooltip: {
            trigger: 'axis', formatter: '高度(km) :'+dataName+' <br/>{b} : {c}'
        }, xAxis: {
            type: 'value', name: dataName
        }, yAxis: {
            type: 'category', axisLine: {onZero: false}, name: '高度 (km)', boundaryGap: false,
        }, visualMap: {
            dimension :0, calculable: true, realtime: true, inRange: {
                color: ['#313695', '#4575b4', '#74add1']
            }
        }, series: [{
            name: 'Altitude (km) vs. Value ()',
            type: 'line',
            symbolSize: 10,
            symbol: 'circle',
            smooth: true,
            lineStyle: {
                width: 3, shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 10, shadowOffsetY: 8
            },
            data: rawData
        }]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

