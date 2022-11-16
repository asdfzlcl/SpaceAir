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
                    drawLinear2MapData(rawData)
                    break
                case 2:
                    drawLinearVerticalMapData(rawData)
                    break
                case 3:
                    drawHeatMapData(rawData)
                    break
                case 4:
                    drawTECUData(rawData)
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


//画两条折线图
function drawLinear2MapData(rawData){
    dataName = "电离层参数一维图"
    let option = {
        title: {
            text: '电离层参数一维图'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['15', '70']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'value',
            boundaryGap: false,
            data: rawData[0]
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '15',
                type: 'line',
                stack: 'Total',
                data: rawData[1]
            },
            {
                name: '70',
                type: 'line',
                stack: 'Total',
                data: rawData[2]
            },
        ]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

//垂直折线图
function drawLinearVerticalMapData(rawData){
    let option ={
        legend: {
            data: ['临近空间环境一维图','x']
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}km : {c}K'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} K'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} km'
            },
            data: rawData[0]
        },
        series: [
            {
                name: '临近空间环境一维图',
                type: 'line',
                symbolSize: 10,
                symbol: 'circle',
                smooth: true,
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(0,0,0,0.3)',
                    shadowBlur: 10,
                    shadowOffsetY: 8
                },
                data: [15, -50, -56.5, -46.5, -22.1, -2.5, -27.7, -55.7, -76.5]
            },
            {
                name: 'x',
                type: 'line',
                symbolSize: 10,
                symbol: 'circle',
                smooth: true,
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(0,0,0,0.3)',
                    shadowBlur: 10,
                    shadowOffsetY: 8
                },
                data: [15, -50, -56.5, -46.5, -22.1, -2.5, -27.7, -55.7, -76.5]
            }
        ]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}


//热力图
function drawContourMapData(rawData) {
    let option={
        //Todo:https://echarts.apache.org/examples/zh/editor.html?c=calendar-heatmap
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

function drawTECUData(rawData) {
    let option={
        //Todo:不会等高线
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}
