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

data = {}

legendData = []

serData = []

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
    data = {}

    legendData = []

    serData = []
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
    fileURL = funcInjector.chooseFile(params)
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
        var arr = mySelection.options[index].value.substring(0, 15).split("");
        arr.splice(10, 0, " ");
        var newStr = arr.join("");
        let time = newStr
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
        html = html + `<option value=` + data[i].replace(" ", "") + `> ${temp} </option>`
    }
    html += "</select>"
    return html
}

function getPositionSelectorHTML(latitude, longitude) {
    let html = '<div class="tags">纬度</div> <select class="charts-selector"  id="latitudeselector" >'
    for (let i = 0; i < latitude.length; i += 1) {
        let temp = latitude[i]
        html = html + `<option value=` + temp + `> ${temp} </option>`
    }
    html += "</select>"
    html += '<div class="tags">经度</div> <select class="charts-selector"  id="longitudeselector" >'
    for (let i = 0; i < longitude.length; i += 1) {
        let temp = longitude[i]
        html = html + `<option value=` + temp + `> ${temp} </option>`
    }
    html += "</select>"
    html += `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="addPosition()" style = "margin-left: 1vh"> 添加 </button>`
    html += `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="clearPosition()" style = "margin-left: 1vh"> 清空 </button>`
    return html
}


function guide() {
    const driver = window.driver.js.driver;

    let config = {
        showProgress: true,
            closeBtnText: '关闭', // Text on the close button for this step 关闭按钮的文字
        nextBtnText: '下一个', // Next button text for this step 下一步按钮的文字
        prevBtnText: '上一个', // Previous button text for this step 上一步按钮文字
        doneBtnText:'完成',
        steps: [
        { element: '.file-select', popover: { title: '文件与图像选择区域', description: '此处选择数据源文件的类型和文件路径，分为四种类型,请在选择正确的类型后选取文件路径，根据需要选择可视化图像', side: "left", align: 'start' }},
        { element: '.file-info', popover: { title: '文件信息区域', description: '此处展现当前选择文件的具体信息', side: "bottom", align: 'start' }},
        { element: '.guide', popover: { title: '帮助按钮', description: '此按钮用于触发帮助弹窗，可多次点击', side: "bottom", align: 'start' }},
        { element: '.charts', popover: { title: '可视化区域', description: '此处展现当前的可视化图像信息，具有缩放、保存、数据视图、图例选择等功能', side: "bottom", align: 'start' }},
        { element: '.statistic-info', popover: { title: '统计数据', description: '此处展现当前选中数据因变量的统计信息', side: "bottom", align: 'start' }},
        { element: '.statistic-charts', popover: { title: '频数直方图', description: '此处展现当前选中数据因变量的频数直方图，如果有多种数据可以选择图例来进行转变', side: "left", align: 'start' }},
    ]
    }
    console.log(document.querySelector(".charts-selector").innerHTML)
    if(document.querySelector(".charts-selector").innerHTML != "") {
        config.steps.splice(2,0,  { element: '.charts-selector', popover: { title: '文件与图像选择区域', description: '此处选择数据源文件的类型和文件路径，分为四种类型,请在选择正确的类型后选取文件路径，根据需要选择可视化图像', side: "left", align: 'start' }})
    }

    let driverObj = driver(config);


    driverObj.drive();
}

function clearPosition() {
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
     chartDom = echarts.init(document.querySelector("#hisCharts"));
    chartDom.clear()
    document.getElementById('data-num').innerHTML = ''
    document.getElementById('data-max').innerHTML = ''
    document.getElementById('data-min').innerHTML =  ''
    document.getElementById('data-avg').innerHTML =  ''
    document.getElementById('data-sdev').innerHTML =   ''
    document.getElementById('data-var').innerHTML =  ''
    document.getElementById('data-median').innerHTML =  ''
    document.getElementById('data-exe').innerHTML = ''
    serData = []
    legendData = []
}

function addPosition() {
    try {

        let latitudeSelector = document.getElementById("latitudeselector")
        let index = latitudeSelector.selectedIndex
        let latitude = latitudeSelector.options[index].value
        let longitudeSelector = document.getElementById("longitudeselector")
        index = longitudeSelector.selectedIndex
        let longitude = longitudeSelector.options[index].value
        funcInjector.log(longitude)
        funcInjector.log(latitude)
        let positionTitle = Math.abs(latitude) + (latitude >= 0 ? "°N," : "°S,") + Math.abs(longitude) + (longitude >= 0 ? "°E" : "°W")
        for (i in serData) {
            if (serData[i].name == positionTitle) {
                mdui.alert("此坐标已添加，请勿重复添加")
                return
            }
          }
        legendData.push(positionTitle)
        serData.push({
            name: positionTitle,
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            data: getPositionedData(longitude, latitude)["data"]
        })
        drawPositionLinearMapData()
    } catch (e) {
        mdui.alert(e)
    }

}

function getPositionedData(longitude, latitude) {
    rawData = funcInjector.getPositionedData(Number(longitude), Number(latitude), params)
    return JSON.parse(rawData.toString())
}

function DrawPic(pictype) {
    try {
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
                data = {}
                legendData = []
                serData = []
                document.querySelector(".charts-selector").innerHTML = ""
                switch (params.pictype) {
                    case 0:
                        drawLinearMapData(rawData, "太阳指数一维图", "Time", "F10.7(sfu)", "F10.7(sfu)")
                        break
                    case 1:
                        drawLinearMapData(rawData, "地磁指数一维图", "Time", "Ap", "Ap")
                        break
                    case 2:
                        drawLinearMapData(rawData, "大气密度变化一维图", "Time", "Density (kg/m^3)", "Density (kg/m^3)")
                        break
                    case 3:
                        document.querySelector(".charts-selector").innerHTML = ""
                        longSeries = rawData["longSeries"]
                        latiSeries = rawData["latiSeries"]
                        let element = getPositionSelectorHTML(latiSeries, longSeries)
                        mdui.$(".charts-selector").append(element)
                        mdui.$(".charts-selector").mutation()
                        break
                    case 4:
                        drawHeatMapData(rawData, 0, 1100, "category", "电离层参数二维图", "Longitude(°)", "Latitude(°)", true, [
                            "Longitude(°)", "Latitude(°)", "TECU(TECU)"
                        ])
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
                        drawHeatMapData(rawData, -100, 0, "value", "临近空间环境二维图", "Time", "Altitude(km)", false, [
                            "Time", "Altitude(km)", "Temperature(°C)"
                        ])
                }
            })
            .catch(e => {
                mdui.alert(e.toString())
            })
    } catch (e) {
        mdui.alert(e.toString())
    }
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

function demonstrateStat(datax, datay) {

    sampleDeviation = ecStat.statistics.deviation(datay);
    varianceValue = ecStat.statistics.sampleVariance(datay);
    maxValue = ecStat.statistics.max(datay);
    minValue = ecStat.statistics.min(datay);
    meanValue = ecStat.statistics.mean(datay);
    medianValue = ecStat.statistics.median(datay);
    sumValue = datay.length;
    document.getElementById('data-num').innerHTML = sumValue
    document.getElementById('data-max').innerHTML = (maxValue>0&&maxValue<0.01)?(new Big(maxValue).toExponential(2)):maxValue.toFixed(2)
    document.getElementById('data-min').innerHTML = (minValue>0&&minValue<0.01)?(new Big(minValue).toExponential(2)):minValue.toFixed(2)
    document.getElementById('data-avg').innerHTML =  (meanValue>0&&meanValue<0.01)&&meanValue<0.01?(new Big(meanValue).toExponential(2)):meanValue.toFixed(2)
    document.getElementById('data-sdev').innerHTML =  (sampleDeviation>0&&sampleDeviation<0.01)&&sampleDeviation<0.01?(new Big(sampleDeviation).toExponential(2)):sampleDeviation.toFixed(2)
    document.getElementById('data-var').innerHTML = (varianceValue>0&&varianceValue<0.01)?(new Big(varianceValue).toExponential(2)):varianceValue.toFixed(2)
    document.getElementById('data-median').innerHTML = (medianValue>0&&medianValue<0.01)?(new Big(medianValue).toExponential(2)):medianValue.toFixed(2)
    document.getElementById('data-exe').innerHTML =( (maxValue-minValue)>0&&(maxValue-minValue)<0.01)?(new Big((maxValue-minValue)).toExponential(2)):(maxValue-minValue).toFixed(2)
    echarts.registerTransform(ecStat.transform.histogram);
    echarts.registerTransform(ecStat.transform.clustering);
    let chartDom = echarts.init(document.querySelector("#hisCharts"));
    chartDom.clear()
    var bins = ecStat.histogram(datay);
    var option = {
        tooltip: {
            show: true
        },
        title: {
            text: "频数直方图",
            left: "center"
        },
        color: ['rgb(25, 183, 207)'],
        grid: {
            top: '10%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            // boundaryGap: '5%',
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min:function(value){
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom:[{ type:"inside"  }],
        yAxis: {},
        series: [{
            name: '频数',
            type: 'bar',
            barWidth: '99.3%',
            // barCategoryGap: 0,
            data: bins.data
        }]
    };

    chartDom.setOption(option);
    // var chart = echarts.init(document.getElementById('statCharts'));
    //
    // window.onresize = function () {
    //     chart.resize();
    // };

    // data =[
    //     [3.275154, 2.957587],
    //     [-3.344465, 2.603513],
    //     [0.355083, -3.376585],
    //     [1.852435, 3.547351],
    //     [-2.078973, 2.552013],
    //     [-0.993756, -0.884433],
    //     [2.682252, 4.007573],
    //     [-3.087776, 2.878713],
    //     [-1.565978, -1.256985],
    //     [2.441611, 0.444826],
    //     [-0.659487, 3.111284],
    //     [-0.459601, -2.618005],
    //     [2.17768, 2.387793],
    //     [-2.920969, 2.917485],
    //     [-0.028814, -4.168078],
    //     [3.625746, 2.119041],
    //     [-3.912363, 1.325108],
    //     [-0.551694, -2.814223],
    //     [2.855808, 3.483301],
    //     [-3.594448, 2.856651],
    //     [0.421993, -2.372646],
    //     [1.650821, 3.407572],
    //     [-2.082902, 3.384412],
    //     [-0.718809, -2.492514],
    //     [4.513623, 3.841029],
    //     [-4.822011, 4.607049],
    //     [-0.656297, -1.449872],
    //     [1.919901, 4.439368],
    //     [-3.287749, 3.918836],
    //     [-1.576936, -2.977622],
    //     [3.598143, 1.97597],
    //     [-3.977329, 4.900932],
    //     [-1.79108, -2.184517],
    //     [3.914654, 3.559303],
    //     [-1.910108, 4.166946],
    //     [-1.226597, -3.317889],
    //     [1.148946, 3.345138],
    //     [-2.113864, 3.548172],
    //     [0.845762, -3.589788],
    //     [2.629062, 3.535831],
    //     [-1.640717, 2.990517],
    //     [-1.881012, -2.485405],
    //     [4.606999, 3.510312],
    //     [-4.366462, 4.023316],
    //     [0.765015, -3.00127],
    //     [3.121904, 2.173988],
    //     [-4.025139, 4.65231],
    //     [-0.559558, -3.840539],
    //     [4.376754, 4.863579],
    //     [-1.874308, 4.032237],
    //     [-0.089337, -3.026809],
    //     [3.997787, 2.518662],
    //     [-3.082978, 2.884822],
    //     [0.845235, -3.454465],
    //     [1.327224, 3.358778],
    //     [-2.889949, 3.596178],
    //     [-0.966018, -2.839827],
    //     [2.960769, 3.079555],
    //     [-3.275518, 1.577068],
    //     [0.639276, -3.41284]
    // ]


    // echarts.registerTransform(ecStat.transform.clustering);
    // var CLUSTER_COUNT = 6;
    // var DIENSIION_CLUSTER_INDEX = 2;
    // var COLOR_ALL = [
    //     '#37A2DA', '#e06343', '#37a354', '#b55dba', '#b5bd48', '#8378EA', '#96BFFF'
    // ];
    // var pieces = [];
    // for (var i = 0; i < CLUSTER_COUNT; i++) {
    //     pieces.push({
    //         value: i,
    //         label: 'cluster ' + i,
    //         color: COLOR_ALL[i]
    //     });
    // }
    //
    // var option = {
    //     dataset: [{
    //         source: data
    //     }, {
    //         transform: {
    //             type: 'ecStat:clustering',
    //             print: true,
    //             config: {
    //                 clusterCount: CLUSTER_COUNT,
    //                 outputType: 'single',
    //                 outputClusterIndexDimension: DIENSIION_CLUSTER_INDEX
    //             }
    //         }
    //     }],
    //     tooltip: {
    //         position: 'top'
    //     },
    //     visualMap: {
    //         type: 'piecewise',
    //         top: 'middle',
    //         min: 0,
    //         max: CLUSTER_COUNT,
    //         left: 10,
    //         splitNumber: CLUSTER_COUNT,
    //         dimension: DIENSIION_CLUSTER_INDEX,
    //         pieces: pieces
    //     },
    //     grid: {
    //         left: 120
    //     },
    //     xAxis: {
    //     },
    //     yAxis: {
    //     },
    //     series: {
    //         type: 'scatter',
    //         encode: { tooltip: [0, 1] },
    //         symbolSize: 15,
    //         itemStyle: {
    //             borderColor: '#555'
    //         },
    //         datasetIndex: 1
    //     }
    // };
    //
    // chart.setOption(option);
}

function deepClone (obj) {
    let objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                //判断ojb子元素是否为对象，如果是，递归复制
                if (obj[key] && typeof obj[key] === "object") {
                    objClone[key] = deepClone(obj[key]);
                } else {
                    //如果不是，简单复制
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
};


function demonstratePositionedStat() {
    let tempData = deepClone(serData)
    let datay = []
    for(i in tempData) {
        let dataY = []
        for(j in tempData[i].data) {
            dataY.push(tempData[i].data[j][1])
            datay.push(tempData[i].data[j][1])
        }
        var bins = ecStat.histogram(dataY);
        tempData[i].type = 'bar'
        tempData[i].barWidth = '99.3%'
        tempData[i].data =bins.data
    }
    sampleDeviation = ecStat.statistics.deviation(datay);
    varianceValue = ecStat.statistics.sampleVariance(datay);
    maxValue = ecStat.statistics.max(datay);
    minValue = ecStat.statistics.min(datay);
    meanValue = ecStat.statistics.mean(datay);
    medianValue = ecStat.statistics.median(datay);
    sumValue = datay.length;
    document.getElementById('data-num').innerHTML = sumValue
    document.getElementById('data-max').innerHTML = maxValue.toFixed(2)
    document.getElementById('data-min').innerHTML = minValue.toFixed(2)
    document.getElementById('data-avg').innerHTML = meanValue.toFixed(2)
    document.getElementById('data-sdev').innerHTML = sampleDeviation.toFixed(2)
    document.getElementById('data-var').innerHTML = varianceValue.toFixed(2)
    document.getElementById('data-median').innerHTML = medianValue.toFixed(2)
    document.getElementById('data-exe').innerHTML = (maxValue - minValue).toFixed(2)
    echarts.registerTransform(ecStat.transform.histogram);
    echarts.registerTransform(ecStat.transform.clustering);
    let chartDom = echarts.init(document.querySelector("#hisCharts"));
    chartDom.clear()
    // var bins = ecStat.histogram(datay);
    var option = {
        tooltip: {
            show: true
        },
        legend: {
            type: 'scroll',
            data: legendData,
            top: "7%",
            selector: [
                {
                    // 全选
                    type: 'all',
                    // 可以是任意你喜欢的标题
                    title: '全选'
                },
                {
                    // 反选
                    type: 'inverse',
                    // 可以是任意你喜欢的标题
                    title: '反选'
                }
            ]
        },
        title: {
            text: "频数直方图",
            left: "center"
        },
        color: ['rgb(25, 183, 207)'],
        grid: {
            top: '15%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            // boundaryGap: '5%',
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min:function(value){
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom:[{ type:"inside"  }],
        yAxis: {},
        series: tempData
    };

    chartDom.setOption(option);
}

function demonstrateHeatStat(legendData,seriesData) {
    let tempData = deepClone(seriesData)
    let datay = []
    for(i in tempData) {
        let dataY = []
        for(j in tempData[i].data) {
            dataY.push(Number(tempData[i].data[j][2]))
            datay.push(Number(tempData[i].data[j][2]))
        }
        var bins = ecStat.histogram(dataY);
        tempData[i].type = 'bar'
        tempData[i].barWidth = '99.3%'
        tempData[i].data =bins.data
    }
    funcInjector.log(datay.toString())
    sampleDeviation = ecStat.statistics.deviation(datay);
    varianceValue = ecStat.statistics.sampleVariance(datay);
    maxValue = ecStat.statistics.max(datay);
    minValue = ecStat.statistics.min(datay);
    meanValue = ecStat.statistics.mean(datay);
    medianValue = ecStat.statistics.median(datay);
    sumValue = datay.length;
    funcInjector.log(typeof maxValue)
    document.getElementById('data-num').innerHTML = sumValue
    document.getElementById('data-max').innerHTML = Number(maxValue).toFixed(2)
    document.getElementById('data-min').innerHTML = Number(minValue).toFixed(2)
    document.getElementById('data-avg').innerHTML = Number(meanValue).toFixed(2)
    document.getElementById('data-sdev').innerHTML = Number(sampleDeviation).toFixed(2)
    document.getElementById('data-var').innerHTML =Number(varianceValue).toFixed(2)
    document.getElementById('data-median').innerHTML = Number(medianValue).toFixed(2)
    document.getElementById('data-exe').innerHTML = (maxValue - minValue).toFixed(2)
    echarts.registerTransform(ecStat.transform.histogram);
    echarts.registerTransform(ecStat.transform.clustering);
    let chartDom = echarts.init(document.querySelector("#hisCharts"));
    chartDom.clear()
    // var bins = ecStat.histogram(datay);
    var option = {
        tooltip: {
            show: true
        },
        legend: legendData,
        title: {
            text: "频数直方图",
            left: "center"
        },
        color: ['rgb(25, 183, 207)'],
        grid: {
            top: '16%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            // boundaryGap: '5%',
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min:function(value){
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom:[{ type:"inside"  }],
        yAxis: {},
        series: tempData
    };

    chartDom.setOption(option);
}
//画折线图
//原始数据 标题 横坐标 纵坐标
function drawLinearMapData(rawData, title, xname, yname, tagName) {
    demonstrateStat(rawData["x"], rawData["y"])
    funcInjector.log(sampleDeviation.toString())
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
            left: 'right',
            top: 'bottom',
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                    title: "缩放"
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
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#000', // x坐标轴的轴线颜色
                }
            },
            name: yname,
            type: 'value',
            // min:function(value){
            //     return value.min
            // },
            max: function (value) {
                return value.max
            },
            show: true,
            // axisLine: { onZero: false },
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            // boundaryGap: [0, '100%']
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
                name: tagName,
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                // itemStyle: {
                //     color: 'rgb(255, 70, 131)'
                // },
                // areaStyle: {
                //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //         {
                //             offset: 0,
                //             color: 'rgb(255, 158, 68)'
                //         },
                //         {
                //             offset: 1,
                //             color: 'rgb(255, 70, 131)'
                //         }
                //     ])
                // },
                data: rawData["y"]
            }
        ],

    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}


function drawPositionLinearMapData() {
    demonstratePositionedStat()
    try {
        let option = {
            tooltip: {
                trigger: 'axis',

            },
            legend: {
                type: 'scroll',
                // inactiveColor: "#fff",
                // inactiveBorderColor: "#000",
                data: legendData,
                top: "6%",
                selector: [
                    {
                        // 全选
                        type: 'all',
                        // 可以是任意你喜欢的标题
                        title: '全选'
                    },
                    {
                        // 反选
                        type: 'inverse',
                        // 可以是任意你喜欢的标题
                        title: '反选'
                    }
                ]
            },
            title: {
                left: 'center',
                // top: "bottom",
                text: "电离层参数二维图"
            },
            toolbox: {
                left: 'right',
                top: 'bottom',
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none',
                        title: ""
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
                name: "Time",
                type: 'category',
                axisLine: {
                    show: true,
                    onZero: false
                },

            },
            yAxis: {
                axisLine: {
                    show: true,
                },
                name: "TECU",
                type: 'value',
                boundaryGap: [0, '100%']
            },

            dataZoom: [
                {
                    bottom: "10%",
                    type: 'inside',
                    start: 0,
                    end: 50
                },
                {
                    start: 0,
                    end: 50
                }
            ],
            series: serData
        };
        let chartDom = echarts.init(document.querySelector("#chart"));
        chartDom.clear()
        chartDom.setOption(option)
    } catch (e) {
        mdui.alert(e)
    }

}

function testEchart() {
    funcInjector.log(getPositionedData(100.0, 5.0)["data"][0].toString())
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

//垂直折线图
function drawLinearVerticalMapData(rawData) {
    let seriesData = []
    let legendsData = []
    let dataX = [],dataY = []

    for (let i in rawData) {
        for(let j in rawData[i]) {
            dataX.push(rawData[i][j][0])
            dataY.push(rawData[i][j][1])
        }

        let temp = {
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
            data: rawData[i]
        }

        seriesData.push(temp)
        // legendsData.push(i)
    }

    demonstrateStat(dataY,dataX)
    let option = {
        legend: legendsData,
        toolbox: {
            left: 'right',
            top: 'bottom',
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none',
                    title: ""
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
        title: {
            text: "临近空间环境一维图",
            left: "center"
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{a} <br/>Temperature(°C):Altitude(km)' + ':' + '{c}'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            name: "温度(°C)",
            type: 'value',
            axisLine: {onZero: false},
            show: true,
            axisLine: {
                show: true,
            },
        },
        yAxis: {
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#000', // x坐标轴的轴线颜色
                }
            },
            name: "高度(千米)",
            type: 'category',
            axisLine: {onZero: false},

            boundaryGap: false,

        },
        series: seriesData
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}




//热力图
function drawHeatMapData(rawData, min, max, ytype, title, xTitle, yTitle, reverseY, schema) {
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

    let selectedtime = rawData["legend"][0]

    let legendData = {
            type: 'scroll',
            // inactiveColor: "#fff",
            // inactiveBorderColor: "#000",
            data: rawData["legend"],
        // selectedMode: 'single',
            top:"6.5%",
            selected: {
                selectedtime :true

        },
        selector: [
            {
                // 全选
                type: 'all',
                // 可以是任意你喜欢的标题
                title: '全选'
            },
            {
                // 反选
                type: 'inverse',
                // 可以是任意你喜欢的标题
                title: '反选'
            }
        ]
    }

        demonstrateHeatStat(legendData,seriesData)


    let option = {
        tooltip: {
            formatter: function (param) {
                var value = param.value;
                // prettier-ignore
                return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                    + schema[2] + " " + value[2]
                    + '</div>'
                    + param.seriesName + '<br>'
                    + schema[0] + '：' + value[0] + '<br>'
                    + schema[1] + '：' + value[1] + '<br>'
            }
        },
        legend: {
            width: "78%",
            type: 'scroll',
            // inactiveColor: "#fff",
            // inactiveBorderColor: "#000",
            // selector: ['all', 'inverse'] ,
            data: rawData["legend"],
            selectedMode: 'single'
        },
        title: {
            text: title,
            left: "center",
            top: "bottom"
        },
        toolbox: {
            left: 'right',
            top: 'bottom',
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none',
                    title: ""
                },
                saveAsImage: {
                    title: '另存为图像'
                }
            }
        },
        xAxis: {
            name: xTitle,
            type: 'category',
            show: true
        },
        yAxis: {
            axisLine: {
                show: true,

            },
            name: yTitle,
            type: ytype,
            show: true,
            inverse: reverseY

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
