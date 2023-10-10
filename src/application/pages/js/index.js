// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    type: 0, pictype: 0, filename: "", filepath: ""
}

// 统计数据
// 该对象的所有属性setter均被绑定到页面
statics = {
    min: 0, max: 0, avg: 0, sdev: 0
}

data = {

}

const PicType = {
    Time_F10: 0, Time_Ap: 1, Time_Density: 2, TIME_TECU: 3, Location_TECU: 4, Temp_Height: 5, Time_Altitude: 6
}

// window.addEventListener("error",(e) => {
//     alert(e.error)
//     funcInjector.log('errorMessage: ' + e); // 异常信息
// },true)
//
window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
    funcInjector.log('errorMessage: ' + errorMessage); // 异常信息
    funcInjector.log('scriptURI: ' + scriptURI.toString()); // 异常文件路径
    funcInjector.log('lineNo: ' + lineNo.toString()); // 异常行号
    funcInjector.log('columnNo: ' + columnNo.toString()); // 异常列号
    funcInjector.log('error: ' + error.toString()); // 异常堆栈信息
};

// 异步获取数据，避免UI阻塞
async function getData() {
    let rawData
    switch (params.pictype) {
        case PicType.Time_F10:
            rawData = funcInjector.getTime_F10Data(params)
            break
        case PicType.Time_Ap:
            rawData = funcInjector.getTime_ApData(params)
            break
        case PicType.Time_Density:
            rawData = funcInjector.getTime_DensityData(params)
            break
        case PicType.Location_TECU:
            rawData = funcInjector.getLocation_TECUData(params)
            break
        case PicType.TIME_TECU:
            rawData = funcInjector.getPositionSelection(params)
            break
        case PicType.Temp_Height:
            rawData = funcInjector.getTemp_HeightData(params)
            break
        case PicType.Time_Altitude:
            rawData = funcInjector.getTime_AltitudeData(params)
            break
    }
    return JSON.parse(rawData.toString())
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


function browserRedirect() {
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
    if (isWin) return "Win"
    return "other";
}

function GetFile() {
    fileURL = funcInjector.chooseFile()
    document.querySelector(".file-detail").style.display = 'inline'
    document.querySelector(".file-path").innerHTML = fileURL
    var Splitter = browserRedirect() == "Win" ? '\\' : '/'
    last = fileURL.lastIndexOf(Splitter)
// 截取文件名称和后缀
    fileName = fileURL.substring(last + 1)
    params.filename = fileName
    params.filepath = fileURL
    document.querySelector(".file-name").innerHTML = fileName
}

function renewEcharts() {
    try {
        let mySelection = document.getElementById("chartselector")
        let index = mySelection.selectedIndex
        var arr = mySelection.options[index].value.substring(0,15).split("");
        arr.splice(10, 0, " ");
        var newStr = arr.join("");
        let time = newStr
        funcInjector.log(time)
        drawLinearVerticalMapData(data[time])
    } catch (e) {
        mdui.alert(e)
    }


    //生成按钮
}


function getSelectorHTML(data) {
    let html = ' <select class="charts-selector"  id="chartselector" onchange="renewEcharts()">'
    for (let i = 0; i < data.length; i += 1) {
        let temp = data[i]
        html = html + `<option value=` + data[i].replace(" ","") + `> ${temp} </option>`
    }
    html += "</select>"
    return html
}

function getPositionSelectorHTML(latitude,longitude) {
    let html = '纬度 <select class="charts-selector"  id="latitudeselector" >'
    for (let i = 0; i < latitude.length; i += 1) {
        let temp = latitude[i]
        html = html + `<option value=` + latitude[i] + `> ${temp} </option>`
    }
    html += "</select>"
    html += '经度 <select class="charts-selector"  id="longitudeselector" >'
    for (let i = 0; i < longitude.length; i += 1) {
        let temp = longitude[i]
        html = html + `<option value=` + longitude[i] + `> ${temp} </option>`
    }
    html += "</select>"
    html += `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="clearPosition()" style = "margin-left: 1vh"> 清空 </button>`
    html += `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="addPosition()" style = "margin-left: 1vh"> 添加 </button>`
    return html
}


function clearPosition() {

}

function addPosition() {

}

function getPositionedData(longitude,latitude) {
    rawData = funcInjector.getPositionedData(longitude,latitude,params)
    return JSON.parse(rawData.toString())
}

function DrawPic(pictype) {
    //更新图片属性
    params.pictype = Number(pictype)
    funcInjector.log('pictype: ' + Number(pictype));
    //错误检查
    if (params.filename == "") {
        mdui.alert("请选择文件")
        return
    }
    //绘制图像
    getData()
        .then(rawData => {
            document.querySelector(".charts-selector").innerHTML = ""
            switch (params.pictype) {
                case 0:
                    drawLinearMapData(rawData, "太阳地磁指数一维图", "Time(Year)", "F10.7(sfu)")
                    break
                case 1:
                    drawLinearMapData(rawData, "电离层参数一维图", "Time(Year)", "Ap")
                    break
                case 2:
                    drawLinearMapData(rawData, "电离层参数一维图", "Time(Year)", "Density (kg/m^3)")
                    break
                case 3:
                    document.querySelector(".charts-selector").innerHTML = ""
                    longSeries = rawData["longSeries"]
                    latiSeries = rawData["latiSeries"]
                    let element =getPositionSelectorHTML(latiSeries,longSeries)
                    mdui.$(".charts-selector").append(element)
                    mdui.$(".charts-selector").mutation()
                    break
                case 4:
                    drawHeatMapData(rawData, 0, 1100, "category")
                    break

                case 5:
                    document.querySelector(".charts-selector").innerHTML = ""
                    data = rawData["timeSeries"]
                    let legends = []
                    for (i in data) {
                        let temp = i + "("
                        for (j in data[i]) {
                            temp += j
                        }
                        temp += ")"
                        legends.push(temp)
                    }
                    let html = getSelectorHTML(legends)
                    mdui.$(".charts-selector").append(html)
                    mdui.$(".charts-selector").mutation()
                    let mySelection = document.getElementById("chartselector")
                    let index = mySelection.selectedIndex
                    var arr = mySelection.options[index].value.substring(0, 15).split("");
                    arr.splice(10, 0, " ");
                    var newStr = arr.join("");
                    let time = newStr
                    funcInjector.log(time)
                    drawLinearVerticalMapData(data[time])

                    break
                case 6:
                    drawHeatMapData(rawData, -100, 0, "value")
            }
        })
        .catch(e => {
            mdui.alert(e.toString())
        })
}


// 生成按钮组件
function getBottomListHtml(value1, value2) {
    return `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="DrawPic('` + value2 + `')" style = "margin-left: 1vh"> ${value1} </button>`
}

//获取画图属性目录
function fetchFileList() {

    let mySelection = document.getElementById("selector")
    let index = mySelection.selectedIndex
    params.filename = ""
    params.type = mySelection.options[index].value
    document.querySelector(".file-name").innerHTML = ""
    document.querySelector(".file-path").innerHTML = ""
    //生成按钮组件
    bottontype = funcInjector.GetBottonType(params)
    bottontype = bottontype
        .toString()
        .slice(1, bottontype.toString().length - 1)
        .split(',')
    // document.querySelector("#botton-type").innerHTML = bottontype[0]
    //mdui.$("#botton-list").mutation()
    html = ''
    for (let i = 1; i < bottontype.length; i += 2) {
        html = html + getBottomListHtml(bottontype[i], bottontype[i + 1])
    }
    document.querySelector(".file-list").innerHTML = ''
    mdui.$(".file-list").append(html)
    mdui.$(".file-list").mutation()
}

// 通过value动态生成选择子项
function getTypeSelHtml(value, value_info) {
    return ` <option value=${value}> ${value_info}</option>`
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
    html = getTypeSelHtml(types[0], info[0])
    for (let i = 1; i < types.length; i++) {
        html = html + getTypeSelHtml(types[i], info[i])
    }
    document.getElementById('selector').innerHTML = html
    mdui.$("#selector").mutation()
}


//画折线图
//原始数据 标题 横坐标 纵坐标
function drawLinearMapData(rawData, title, xname, yname) {
    let option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: title
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                    title: ""
                },
                restore: {
                    title: '还原配置项'
                },
                dataView: {
                    title: '数据视图工具',
                    lang: ['数据视图', '关闭', '刷新'],
                    backgroundColor: "f2eef9",

                },
                saveAsImage: {
                    title: '另存为图像'
                }
            }
        },
        xAxis: {
            name: xname,
            type: 'category',
            boundaryGap: false,
            data: rawData["x"]
        },
        yAxis: {
            name: yname,
            type: 'value',
            axisLabel: {
                formatter: function (value) {
                    var res = value.toString();
                    var numN1 = 0;
                    var numN2 = 1;
                    var num1 = 0;
                    var num2 = 0;
                    var t1 = 1;
                    for (var k = 0; k < res.length; k++) {
                        if (res[k] == ".")
                            t1 = 0;
                        if (t1)
                            num1++;
                        else
                            num2++;
                    }

                    if (Math.abs(value) < 1 && res.length > 4) {
                        for (var i = 2; i < res.length; i++) {
                            if (res[i] == "0") {
                                numN2++;
                            } else if (res[i] == ".")
                                continue;
                            else
                                break;
                        }
                        var v = parseFloat(value);
                        v = v * Math.pow(10, numN2);
                        return v.toString() + "e-" + numN2;
                    } else if (num1 > 4) {
                        if (res[0] == "-")
                            numN1 = num1 - 2;
                        else
                            numN1 = num1 - 1;
                        var v = parseFloat(value);
                        v = v / Math.pow(10, numN1);
                        if (num2 > 4)
                            v = v.toFixed(4);
                        return v.toString() + "e" + numN1;
                    } else
                        return parseFloat(value);
                }
            },
            boundaryGap: [0, '100%']
        },

        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 10
            },
            {
                start: 0,
                end: 10
            }
        ],
        series: [
            {
                name: 'F10.7指数',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: 'rgb(255, 70, 131)'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 158, 68)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(255, 70, 131)'
                        }
                    ])
                },
                data: rawData["y"]
            }
        ],

    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

function testEchart() {
    getPositionedData(100.0,5.0)
    //  <input type="radio" name="type-selector" value="0" onclick="fetchFileList()"
    // />
    //  <i class="mdui-radio-icon"></i>
    //  1
    //  </label>
    //  <label class="mdui-radio">
    //  <input type="radio" name="type-selector" value="1" onclick="fetchFileList()"
    // />
    //  <i class="mdui-radio-icon"></i>
    //  2
    //  </label>
    //  `
    //  mdui.$("#radio").append(html)
    //  mdui.$("#radio").mutation()
}

//画两条折线图
function drawLinear2MapData(rawData) {
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
function drawLinearVerticalMapData(rawData) {
    let seriesData = []
    let legendsData = []
    for (let i in rawData) {
        funcInjector.log(i.toString())
            let temp =  {
                name: i,
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
                data:  rawData[i]
            }
            seriesData.push(temp)
            // legendsData.push(i)
    }
    let option = {
        legend: legendsData,
        toolbox: {
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none',
                    title: ""
                },
                restore: {
                    title: '还原配置项'
                },
                dataView: {
                    title: '数据视图工具',
                    lang: ['数据视图', '关闭', '刷新'],
                    backgroundColor: "f2eef9",

                },
                saveAsImage: {
                    title: '另存为图像'
                }
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: 'Temperature : <br/>{b}km : {c}°C'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            axisLine: { onZero: false },
            axisLabel: {
                formatter: '{value} °C'
            }
        },
        yAxis: {
            type: 'category',
            axisLine: { onZero: false },
            axisLabel: {
                formatter: '{value} km'
            },
            boundaryGap: false,

        },
        series: seriesData
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}



//热力图
function drawHeatMapData(rawData,min,max,ytype) {
    let seriesData = []
    for (let i in rawData) {
        funcInjector.log(i.toString())
        if (i != "legend") {
            funcInjector.log(i.toString())
            let temp = {
                emphasis: {
                    itemStyle: {
                        borderColor: '#333',
                        borderWidth: 1
                    }
                },
                progressive: 1000,
                animation: false
            }
            temp.name = i
            temp.type = 'heatmap'
            temp.data = rawData[i]
            seriesData.push(temp)
        }
    }

    let option = {
        tooltip: {},
        legend: {
            type: 'scroll',
            // selector: ['all', 'inverse'] ,
            data: rawData["legend"],
            selectedMode: 'single'
        },
        toolbox: {
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none',
                    title: ""
                },
                restore: {
                    title: '还原配置项'
                },
                dataView: {
                    title: '数据视图工具',
                    lang: ['数据视图', '关闭', '刷新'],
                    backgroundColor: "f2eef9",

                },
                saveAsImage: {
                    title: '另存为图像'
                }
            }
        },
        xAxis: {
            type: 'category',
            show: true
        },
        yAxis: {
            type: ytype,
            axisLine: { onZero: false },
            show: true,
        },
        visualMap: {
            min: min,
            max: max,
            calculable: true,
            realtime: true,
            inRange: {
                color: [
                    '#313695',
                    '#4575b4',
                    '#74add1',
                    '#abd9e9',
                    '#e0f3f8',
                    '#ffffbf',
                    '#fee090',
                    '#fdae61',
                    '#f46d43',
                    '#d73027',
                    '#a50026'
                ]
            }
        },
        series: seriesData

    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

function drawTECUData(rawData) {
    let option = {
        //Todo:不会等高线
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}
