// 参数数据
// 该对象的所有属性getter均被绑定到页面

params = {
    type: 0, pictype: 0, filename: "", filepath: ""
}

predictData = []

predictTimeData =[]

predictTitle = ""

predictXname = ""

predictYname = ""

predictTagname = ""
// 统计数据
// 该对象的所有属性setter均被绑定到页面
statics = {
    min: 0, max: 0, avg: 0, sdev: 0
}

data = {}

legendData = []

videoData = []

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

function  refreshHisList() {
    const hisFileList = JSON.parse(funcInjector.getHisFile(params).toString())
    removeChild("mdui-list-item mdui-ripple")
    removeChild("mdui-divider mdui-m-y-0")
    let hisFileHtml = getHisFileHtml(hisFileList)
    if (hisFileHtml == "") {
        document.getElementById("empty").style.display = "block";
        document.getElementById("bar").style.display = "none";
        let ele = document.querySelector(".hisbar")
        ele.setAttribute("display", "flex");
    } else {
        // document.querySelector(".hisbar")
        document.getElementById("empty").style.display = "none";
        document.getElementById("bar").style.display = "flex";

        document.querySelector(".mdui-list").innerHTML += hisFileHtml

    }
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
    refreshHisList()
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
    // try {
    //     var myChart = echarts.init(document.querySelector("#chart"));
    //     myChart.on('legendscroll', function (params) {
    //         mdui.alert(params.legendId);
    //         mdui.alert(params.scrollDataIndex);
    //
    //     });
    // }catch (e) {
    //     mdui.alert(e)
    // }
    const driver = window.driver.js.driver;

    let config = {
        showProgress: true,
        closeBtnText: '关闭', // Text on the close button for this step 关闭按钮的文字
        nextBtnText: '下一个', // Next button text for this step 下一步按钮的文字
        prevBtnText: '上一个', // Previous button text for this step 上一步按钮文字
        doneBtnText: '完成',
        steps: [
            {
                element: '.file-select',
                popover: {
                    title: '文件与数据类型选取模块',
                    description: '此模块选择数据源文件的类型和文件路径，分为四种类型,请在选择正确的类型后选取文件路径，根据需要选择可视化图像',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '.file-info',
                popover: {
                    title: '文件信息模块',
                    description: '此处展现当前选择文件的具体信息，包括文件名和文件路径',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.guide',
                popover: {
                    title: '帮助按钮',
                    description: '此按钮用于触发帮助弹窗，可多次点击',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.mdui-list',
                popover: {
                    title: '历史文件管理模块',
                    description: '此处归档了当前文件类型下的历史文件和历史日期，可以进行选取、打开和删除操作',
                    side: "bottom", 
                    align: 'start'
                }
            },
            {
                element: '.charts',
                popover: {
                    title: '数据可视化与检索模块',
                    description: '此处展现当前的可视化图像信息，具有缩放、保存、数据视图、图例选择等功能，并可根据需要检索指定范围内的数据',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.statistic-info',
                popover: {
                    title: '数据统计模块',
                    description: '此处展现当前选中数据因变量的统计信息',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.statistic-charts',
                popover: {
                    title: '频数直方图',
                    description: '此处展现当前选中数据因变量的频数直方图，如果有多种数据可以选择图例来进行转变',
                    side: "left",
                    align: 'start'
                }
            },
        ]
    }
    console.log(document.querySelector(".charts-selector").innerHTML)
    if (  document.getElementById("analyser").style.display != "none") {
        config.steps.splice(2, 0, {
            element: '.analyser',
            popover: {
                title: '智能分析模块',
                description: '此处在选择预测模型后，将根据训练的模型对选中数据范围未来三十天的数据进行预测并进行可视化呈现',
                side: "left",
                align: 'start'
            }
        })
    }

    if (document.querySelector(".charts-selector").innerHTML != "") {
        config.steps.splice(2, 0, {
            element: '.charts-selector',
            popover: {
                title: '图标数据选择区域',
                description: '对于个别类型的图表要进行数据的选取后才能进行绘图，此处用于选取数据范围',
                side: "left",
                align: 'start'
            }
        })
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
    document.getElementById('data-min').innerHTML = ''
    document.getElementById('data-avg').innerHTML = ''
    document.getElementById('data-sdev').innerHTML = ''
    document.getElementById('data-var').innerHTML = ''
    document.getElementById('data-median').innerHTML = ''
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

let mock = {
    "FEDformer": [
        121.81098175048828,
        117.04942321777344,
        113.26078033447266,
        111.93792724609375,
        110.58342742919922,
        110.67145538330078,
        111.13829803466797,
        111.6939468383789,
        113.59158325195312,
        112.35370635986328,
        111.11945343017578,
        113.97933197021484,
        114.9580307006836,
        116.50586700439453,
        117.62641143798828,
        119.545654296875,
        121.38289642333984,
        122.49871063232422,
        124.08092498779297,
        125.06856536865234,
        125.308349609375,
        125.63526916503906,
        126.06436920166016,
        123.80645751953125,
        123.51599884033203,
        122.89732360839844,
        121.7283706665039,
        121.13021087646484,
        120.89152526855469,
        121.62965393066406
    ],

    "Autoformer": [
        125.31439971923828,
        122.01432037353516,
        118.16681671142578,
        116.64823150634766,
        116.20630645751953,
        115.32735443115234,
        115.29231262207031,
        118.46873474121094,
        119.74394989013672,
        117.96725463867188,
        115.87474822998047,
        116.8329086303711,
        117.56797790527344,
        119.34788513183594,
        121.7526626586914,
        123.70939636230469,
        124.5642318725586,
        124.59980773925781,
        124.46920013427734,
        124.38663482666016,
        124.7287368774414,
        124.91915130615234,
        125.10669708251953,
        123.56586456298828,
        123.34343719482422,
        122.91493225097656,
        122.53739166259766,
        122.3756332397461,
        122.09210205078125,
        120.42366027832031
    ],

    "Informer": [
        126.4120101928711,
        125.6038818359375,
        122.48966217041016,
        122.59757995605469,
        122.1478042602539,
        121.94432067871094,
        121.63142395019531,
        122.04035949707031,
        122.94325256347656,
        120.31517028808594,
        120.01490783691406,
        121.71047973632812,
        122.75785064697266,
        122.84339141845703,
        122.8359375,
        121.71723175048828,
        122.01856231689453,
        121.31526184082031,
        123.51890563964844,
        124.19255065917969,
        124.48013305664062,
        125.1864013671875,
        124.77354431152344,
        126.25186920166016,
        122.7555923461914,
        121.49923706054688,
        123.8206787109375,
        123.85165405273438,
        123.81967163085938,
        123.80435180664062
    ],
    "FED": [
        6.848141670227051,
        6.46260929107666,
        8.005855560302734,
        9.338484764099121,
        11.257184982299805,
        9.46820068359375,
        7.4350996017456055,
        9.109694480895996,
        8.591089248657227,
        8.562639236450195,
        9.04946517944336,
        8.525562286376953,
        13.431148529052734,
        19.154207229614258,
        21.270130157470703,
        21.775585174560547,
        19.552230834960938,
        17.954952239990234,
        19.110994338989258,
        18.11455535888672,
        16.805612564086914,
        17.0845947265625,
        16.163846969604492,
        11.897706031799316,
        12.436088562011719,
        12.312108993530273,
        13.034724235534668,
        13.239091873168945,
        14.298291206359863,
        14.840378761291504
    ],

    "Auto": [
        9.089305877685547,
        10.940082550048828,
        12.280512809753418,
        13.640256881713867,
        14.14151668548584,
        14.160468101501465,
        13.93685245513916,
        13.45669174194336,
        14.835762023925781,
        14.849366188049316,
        16.195348739624023,
        15.837538719177246,
        16.605998992919922,
        15.806180000305176,
        17.518308639526367,
        15.895249366760254,
        16.189401626586914,
        17.001487731933594,
        17.84166145324707,
        17.972904205322266,
        16.827857971191406,
        17.627225875854492,
        18.223590850830078,
        18.267826080322266,
        18.60931968688965,
        18.62931251525879,
        18.917850494384766,
        19.152990341186523,
        18.590349197387695,
        11.557642936706543
    ],

    "In": [
        11.161011695861816,
        11.989208221435547,
        13.345709800720215,
        12.83635139465332,
        11.075940132141113,
        11.511602401733398,
        11.78509521484375,
        10.468847274780273,
        14.459511756896973,
        14.832328796386719,
        14.602109909057617,
        14.410181045532227,
        17.123991012573242,
        15.696053504943848,
        18.599552154541016,
        15.61136531829834,
        14.903421401977539,
        16.324832916259766,
        15.742531776428223,
        14.643206596374512,
        12.275882720947266,
        13.697108268737793,
        11.519715309143066,
        12.094161987304688,
        12.24470043182373,
        11.922170639038086,
        12.709283828735352,
        12.635740280151367,
        12.45536994934082,
        12.571897506713867
    ],
    "date": []
}



function predict30days() {
    try {

        if (predictData.length == 0 || predictTimeData.length == 0) {
            mdui.alert("请先选择文件与数据类型")
        } else {
            let rawdata = {}
            let mySelection = document.getElementById("model-selector")
            let index = mySelection.selectedIndex
            let model = mySelection.options[index].value
            let date = []
            let tempstr= predictTimeData[29].split("-")
            const lastDay = new Date(tempstr[0],tempstr[1],tempstr[2]);
            const timestamp = lastDay.getTime(); // 将日期转换为时间戳

            for (let i=0;i<30;i++) {
                const tempTimestamp = timestamp + 86400000 * i ; // 将时间戳增加1天
                const newDate = new Date(tempTimestamp);
                date.push(newDate.getFullYear() + "-" +newDate.getMonth()+ "-" +newDate.getDay())
            }
            let ret = {}
            var myspin1 = new SpinLoading('chart');

            if (params.pictype == 0) {
                switch (model) {
                    case "0":
                        myspin1.show()
                        pred("FEDformer", predictData, predictTimeData, 1)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()

                            })
                        break
                    case "1":
                        myspin1.show()
                        pred("Informer", predictData, predictTimeData, 1)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()
                            })
                        break
                    case "2":
                        myspin1.show()
                        pred("Autoformer", predictData, predictTimeData, 1)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()

                            })
                        break
                }
            } else {
                switch (model) {
                    case "0":
                        myspin1.show()
                        pred("FEDformer", predictData, predictTimeData, 2)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()

                            })
                        break
                    case "1":
                        myspin1.show()
                        pred("Informer", predictData, predictTimeData, 2)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()

                            })
                        break
                    case "2":
                        myspin1.show()
                        pred("Autoformer", predictData, predictTimeData, 2)
                            .then(function (ret) {
                                rawdata["x"] = predictTimeData.concat(date)
                                rawdata["y"] = predictData.concat(ret.data)
                                drawPredictionmap(rawdata, predictTitle, predictXname, predictYname, predictTagname)
                                myspin1.close()

                            })
                        break
                }
            }
        }
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

                        drawWorldHeatMapData(rawData, 0, 1100, "category", "电离层参数二维图", "Longitude(°)", "Latitude(°)", true, [
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
        mdui.alert(e)
    }
}


// 生成按钮组件
function getBottomListHtml(value1, value2) {
    return `<button id="submit-param" class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" onclick="DrawPic('` + value2 + `')" style = "margin-left: 1vh"> ${value1} </button>`
}


function removeChild(className) {
    var child = document.getElementsByClassName(className);
    child.removeNode = [];
    if (child.length != undefined) {
        var len = child.length;
        for (var i = 0; i < len; i++) {
            child.removeNode.push({
                parent: child[i].parentNode,
                inner: child[i].outerHTML,
                next: child[i].nextSibling
            });
        }
        for (var i = 0; i < len; i++) {
            child[0].parentNode.removeChild(child[0]);
        }
    } else {
        child.removeNode.push({
            parent: child.parentNode,
            inner: child.outerHTML,
            next: child.nextSibling
        });
        child.parentNode.removeChild(child);
    }
}

function getHisFileHtml(hisFile) {
    let html = ''
    try {
        for (let i = 0; i < hisFile.length; i++) {
            html +=
                `<label class="mdui-list-item mdui-ripple">
                <div class="mdui-list-item-content">   
                    <div class="mdui-list-item-title mdui-list-item-two-line">${hisFile[i].fileName}</div> 
                    <div class="mdui-list-item-text mdui-list-item-one-line">${hisFile[i].fileTime}</div>  
                </div>
                   
                <div class="mdui-checkbox">
                    <input type="checkbox" id = "checkbox"/>
                    <i class="mdui-checkbox-icon"></i>
                </div>
            </label>
   <div class = "mdui-divider mdui-m-y-0" > </div>
`
        }
        return html
    } catch (e) {
        mdui.alert(e)
    }
}

function deleteHisFile() {
    mdui.dialog({
        title: '请确认是否删除历史文件',
        buttons: [
            {
                text: '取消'
            },
            {
                text: '确认',
                onClick: function (inst) {
                    try {
                        var Splitter = browserRedirect() == "Win" ? '\\' : '/'
                        let fileList = document.querySelectorAll(".mdui-list-item")
                        let temp = []
                        for (let i = 0; i < fileList.length; i++) {
                            let checkboxDiv = fileList[i].lastElementChild
                            let checked = checkboxDiv.firstElementChild.checked
                            if (checked == true) {
                                let itemContent = fileList[i].firstElementChild

                                let line1 = itemContent.firstElementChild
                                let line2 = itemContent.lastElementChild

                                let filename = line1.innerHTML.replace("\n","")
                                let fileTime = line2.innerHTML.replace("\n","")

                                let dest = ""
                                if (params.type == 0) {
                                    dest = "." + Splitter + "data" + Splitter + "太阳和地磁指数" + Splitter + fileTime + Splitter + filename ;
                                } else if (params.type == 1) {
                                    dest = "." + Splitter + "data" + Splitter + "大气密度变化规律" + Splitter + fileTime + Splitter + filename;
                                } else if (params.type == 2) {
                                    dest = "." + Splitter + "data" + Splitter + "电离层参数" + Splitter + fileTime + Splitter + filename;
                                } else if (params.type == 3) {
                                    dest = "." + Splitter + "data" + Splitter + "临近空间环境" + Splitter + fileTime + Splitter + filename;
                                }
                                temp.push(dest)
                            }
                        }
                        let ret = funcInjector.deleteHisFile(temp)
                        if(ret == 0) {
                            mdui.snackbar({
                                message: '删除成功',
                                position: 'left-top',
                            });
                            fetchFileList()
                        } else {
                            mdui.snackbar({
                                message: '删除失败，请检查文件是否被其他进程占用',
                                position: 'left-top',
                            });
                            fetchFileList()
                        }
                    } catch (e) {
                        mdui.alert(e)
                    }

                }
            }
        ]
    });
}

function openHisFile() {
    let fileList = document.querySelectorAll(".mdui-list-item")
    let temp = []
    let count = 0;
    for (let i = 0; i < fileList.length; i++) {
        let checkboxDiv = fileList[i].lastElementChild
        let checked = checkboxDiv.firstElementChild.checked
        if (checked == true) {
            count ++
        }
    }
    if (params.type != 2  && count > 1 ) {
        mdui.alert("不可打开一个以上的文件")
    } else if (count == 0) {
        mdui.alert("请选择文件")
    }
    else if (params.type != 2){
        mdui.dialog({
            title: '是否打开此文件' ,
            buttons: [
                {
                    text: '取消'
                },
                {
                    text: '确认',
                    onClick: function (inst) {
                        try {
                            var Splitter = browserRedirect() == "Win" ? '\\' : '/'

                            let temp = []
                            for (let i = 0; i < fileList.length; i++) {
                                let checkboxDiv = fileList[i].lastElementChild
                                let checked = checkboxDiv.firstElementChild.checked
                                if (checked == true) {
                                    let itemContent = fileList[i].firstElementChild
                                    let line1 = itemContent.firstElementChild
                                    let line2 = itemContent.lastElementChild
                                    let filename = line1.innerHTML.replace("\n", "")
                                    let fileTime = line2.innerHTML.replace("\n", "")
                                    let dest = ""
                                    if (params.type == 0) {
                                        dest = "." + Splitter + "data" + Splitter + "太阳和地磁指数" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 1) {
                                        dest = "." + Splitter + "data" + Splitter + "大气密度变化规律" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 2) {
                                        dest = "." + Splitter + "data" + Splitter + "电离层参数" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 3) {
                                        dest = "." + Splitter + "data" + Splitter + "临近空间环境" + Splitter + fileTime + Splitter + filename;
                                    }
                                    temp.push(dest)
                                }
                            }
                            let fileURL = temp[0]
                            document.querySelector(".file-detail").style.display = 'inline'
                            document.querySelector(".file-path").innerHTML = fileURL
                            var Splitter = browserRedirect() == "Win" ? '\\' : '/'
                            last = fileURL.lastIndexOf(Splitter)
                            fileName = fileURL.substring(last + 1)
                            params.filename = fileName
                            params.filepath = fileURL
                            document.querySelector(".file-name").innerHTML = fileName

                        } catch (e) {
                            mdui.alert(e)
                        }
                    }

                }]
        });
    } else if(params.type == 2) {
        mdui.dialog({
            title: '是否合并以上文件并打开合并文件' ,
            buttons: [
                {
                    text: '取消'
                },
                {
                    text: '确认',
                    onClick: function (inst) {
                        try {
                            var Splitter = browserRedirect() == "Win" ? '\\' : '/'

                            let temp = []
                            for (let i = 0; i < fileList.length; i++) {
                                let checkboxDiv = fileList[i].lastElementChild
                                let checked = checkboxDiv.firstElementChild.checked
                                if (checked == true) {
                                    let itemContent = fileList[i].firstElementChild
                                    let line1 = itemContent.firstElementChild
                                    let line2 = itemContent.lastElementChild
                                    let filename = line1.innerHTML.replace("\n", "")
                                    let fileTime = line2.innerHTML.replace("\n", "")
                                    let dest = ""
                                    if (params.type == 0) {
                                        dest = "." + Splitter + "data" + Splitter + "太阳和地磁指数" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 1) {
                                        dest = "." + Splitter + "data" + Splitter + "大气密度变化规律" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 2) {
                                        dest = "." + Splitter + "data" + Splitter + "电离层参数" + Splitter + fileTime + Splitter + filename;
                                    } else if (params.type == 3) {
                                        dest = "." + Splitter + "data" + Splitter + "临近空间环境" + Splitter + fileTime + Splitter + filename;
                                    }
                                    temp.push(dest)
                                }
                            }
                            let fileURL = temp[0]
                            document.querySelector(".file-detail").style.display = 'inline'
                            document.querySelector(".file-path").innerHTML = fileURL
                            var Splitter = browserRedirect() == "Win" ? '\\' : '/'
                            last = fileURL.lastIndexOf(Splitter)
                            fileName = fileURL.substring(last + 1)
                            params.filename = fileName
                            params.filepath = fileURL
                            document.querySelector(".file-name").innerHTML = fileName

                        } catch (e) {
                            mdui.alert(e)
                        }
                    }

                }]
        });

    }

}


//获取画图属性目录
function fetchFileList() {
    document.querySelector(".charts-selector").innerHTML = ""
    const hisFileList = JSON.parse(funcInjector.getHisFile(params).toString())
    removeChild("mdui-list-item mdui-ripple")
    removeChild("mdui-divider mdui-m-y-0")
    predictData = []
    predictTimeData = []
    let hisFileHtml = getHisFileHtml(hisFileList)
    if (hisFileHtml == "") {
        document.getElementById("empty").style.display = "block";
        document.getElementById("bar").style.display = "none";
        let ele = document.querySelector(".hisbar")
        ele.setAttribute("display", "flex");
    } else {
        // document.querySelector(".hisbar")
        document.getElementById("empty").style.display = "none";
        document.getElementById("bar").style.display = "flex";
        document.querySelector(".mdui-list").innerHTML += hisFileHtml
    }

    if (params.type != 0) {
        document.getElementById("analyser").style.display = "none";
    } else  {
        document.getElementById("analyser").style.display = "flex";
    }


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
    document.getElementById('data-max').innerHTML = (maxValue > 0 && maxValue < 0.01) ? (new Big(maxValue).toExponential(2)) : maxValue.toFixed(2)
    document.getElementById('data-min').innerHTML = (minValue > 0 && minValue < 0.01) ? (new Big(minValue).toExponential(2)) : minValue.toFixed(2)
    document.getElementById('data-avg').innerHTML = (meanValue > 0 && meanValue < 0.01) && meanValue < 0.01 ? (new Big(meanValue).toExponential(2)) : meanValue.toFixed(2)
    document.getElementById('data-sdev').innerHTML = (sampleDeviation > 0 && sampleDeviation < 0.01) && sampleDeviation < 0.01 ? (new Big(sampleDeviation).toExponential(2)) : sampleDeviation.toFixed(2)
    document.getElementById('data-var').innerHTML = (varianceValue > 0 && varianceValue < 0.01) ? (new Big(varianceValue).toExponential(2)) : varianceValue.toFixed(2)
    document.getElementById('data-median').innerHTML = (medianValue > 0 && medianValue < 0.01) ? (new Big(medianValue).toExponential(2)) : medianValue.toFixed(2)
    document.getElementById('data-exe').innerHTML = ((maxValue - minValue) > 0 && (maxValue - minValue) < 0.01) ? (new Big((maxValue - minValue)).toExponential(2)) : (maxValue - minValue).toFixed(2)
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
            type: 'category',
            boundaryGap: true,
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min: function (value) {
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom: [{type: "inside"}],
        yAxis: {
            show:true
            // offset:10,
            // axisLine: {
            //     onZero:false
            //
            // }
        },
        series: [{
            name: '频数',
            type: 'bar',
            barWidth: '99.3%',
            barCategoryGap: 0,
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

function deepClone(obj) {
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
    for (i in tempData) {
        let dataY = []
        for (j in tempData[i].data) {
            dataY.push(tempData[i].data[j][1])
            datay.push(tempData[i].data[j][1])
        }
        var bins = ecStat.histogram(dataY);
        tempData[i].type = 'bar'
        tempData[i].barWidth = '99.3%'
        tempData[i].data = bins.data
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
            type:'category',
            boundaryGap: true,
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min: function (value) {
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom: [{type: "inside"}],
        yAxis: {},
        series: tempData
    };

    chartDom.setOption(option);
}

function demonstrateHeatStat(legendData, seriesData) {
    let tempData = deepClone(seriesData)
    let datay = []
    for (i in tempData) {
        let dataY = []
        for (j in tempData[i].data) {
            dataY.push(Number(tempData[i].data[j][2]))
            datay.push(Number(tempData[i].data[j][2]))
        }
        var bins = ecStat.histogram(dataY);
        tempData[i].type = 'bar'
        tempData[i].barWidth = '99.3%'
        tempData[i].data = bins.data
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
    document.getElementById('data-var').innerHTML = Number(varianceValue).toFixed(2)
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
            type:'category',
            boundaryGap: true,
            scale: true, //这个一定要设，不然barWidth和bins对应不上
            axisLabel: {
                formatter: function (value) {
                    return value
                }
            },
            min: function (value) {
                return value.min
            },
            max: function (value) {
                return value.max
            },
        },
        dataZoom: [{type: "inside"}],
        yAxis: {},
        series: tempData
    };

    chartDom.setOption(option);
}

function drawPredictionmap(rawData, title, xname, yname, tagName) {
    try {
        demonstrateStat(rawData["x"], rawData["y"])
        document.getElementById('table-title').innerHTML = title + "统计数据"
        let maxValue = ecStat.statistics.max(rawData["y"]);
        let minValue = ecStat.statistics.min(rawData["y"]);

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
            visualMap: {
                show: false,
                dimension: 0,
                pieces: [
                    {
                        lte: 30,
                        color: 'green'
                    },

                    {
                        gt: 30,
                        lte: 60,
                        color: 'red'
                    },
                    // {
                    //     gt: 8,
                    //     lte: 14,
                    //     color: 'green'
                    // },
                    // {
                    //     gt: 14,
                    //     lte: 17,
                    //     color: 'red'
                    // },
                    // {
                    //     gt: 17,
                    //     color: 'green'
                    // }

                ],
                realtime: true,
                formatter: function (value) {
                    let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : value.toFixed(2)
                    return ret;                  // 范围标签显示内容。
                }
            },
            toolbox: {
                left: 'right',
                top: 'bottom',
                feature: {
                    dataZoom: {
                        title: '数据缩放工具',
                        // yAxisIndex: 'none',
                        title: "缩放"
                    },

                    dataView: {
                        title: '数据视图工具',
                        lang: ['数据视图', '关闭', '刷新'],
                        backgroundColor: "f2eef9",

                    },
                    saveAsImage: {
                        title: '另存为图像',
                        excludeComponents  : ['toolbox','dataZoom']
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
                        let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : value.toFixed(2)
                        return ret;
                    }
                },
                // boundaryGap: [0, '100%']
            },

            dataZoom: [

                {
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'slider',
                    yAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'none'
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
    } catch (e) {
        mdui.alert(e)
    }
}

//画折线图
//原始数据 标题 横坐标 纵坐标
function drawLinearMapData(rawData, title, xname, yname, tagName) {
    demonstrateStat(rawData["x"], rawData["y"])
    document.getElementById('table-title').innerHTML = title + "统计数据"
    let maxValue = ecStat.statistics.max(rawData["y"]);
    let minValue = ecStat.statistics.min(rawData["y"]);
    predictData = rawData["y"].slice(-30)
    predictTimeData = rawData["x"].slice(-30)
    predictTitle = title.substring(0, 4) + "预测图";
    predictXname = xname
    predictYname = yname
    predictTagname = tagName

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
        visualMap: {
            min: minValue,
            max: maxValue,
            calculable: true,
            realtime: true,
            inRange: {
                color: [
                    '#313695',
                    '#4575b4',
                    '#6496b6',
                    '#97c1ce',
                    '#a4c2cc',
                    '#ffffbf',
                    '#fee090',
                    '#fdae61',
                    '#f46d43',
                    '#d73027',
                    '#a50026'
                ]
            },
            formatter: function (value) {
                let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : value.toFixed(2)
                return ret;                  // 范围标签显示内容。
            }
        },
        toolbox: {
            left: 'right',
            top: 'bottom',
            feature: {
                dataZoom: {
                    title: '数据缩放工具',
                    // yAxisIndex: 'none',
                    title: "缩放"
                },

                dataView: {
                    title: '数据视图工具',
                    lang: ['数据视图', '关闭', '刷新'],
                    backgroundColor: "f2eef9",

                },
                saveAsImage: {
                    title: '另存为图像',
                    excludeComponents  : ['toolbox','dataZoom']
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
                    let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : value.toFixed(2)
                    return ret;
                }
            },
            // boundaryGap: [0, '100%']
        },

        dataZoom: [

            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'inside',
                yAxisIndex: 0,
                filterMode: 'none'
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
    document.getElementById('table-title').innerHTML = "电离层参数一维图统计数据"
    demonstratePositionedStat()
    let tempData = deepClone(serData)
    let datay = []
    for (i in tempData) {
        let dataY = []
        for (j in tempData[i].data) {
            dataY.push(tempData[i].data[j][1])
            datay.push(tempData[i].data[j][1])
        }
        var bins = ecStat.histogram(dataY);
        tempData[i].type = 'bar'
        tempData[i].barWidth = '99.3%'
        tempData[i].data = bins.data
    }
    let maxValue = ecStat.statistics.max(datay);
    let minValue = ecStat.statistics.min(datay);

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
                text: "电离层参数一维图"
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
                        title: '另存为图像',
                        excludeComponents  : ['toolbox','dataZoom']
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
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'slider',
                    yAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none'
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'none'
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


function shuffle(array) {
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function drawWorldMap() {
    var chart = echarts.init(document.querySelector("#chart"));
    chart.setOption({
        series: [{
            type: 'map',
            map: 'world',
            nameMap:{
                "Afghanistan": "阿富汗",
                "Albania": "阿尔巴尼亚",
                "Algeria": "阿尔及利亚",
                "Angola": "安哥拉",
                "Argentina": "阿根廷",
                "Armenia": "亚美尼亚",
                "Australia": "澳大利亚",
                "Austria": "奥地利",
                "Azerbaijan": "阿塞拜疆",
                "Bahamas": "巴哈马",
                "Bahrain": "巴林",
                "Bangladesh": "孟加拉国",
                "Belarus": "白俄罗斯",
                "Belgium": "比利时",
                "Belize": "伯利兹",
                "Benin": "贝宁",
                "Bhutan": "不丹",
                "Bolivia": "玻利维亚",
                "Bosnia and Herz.": "波斯尼亚和黑塞哥维那",
                "Botswana": "博茨瓦纳",
                "Brazil": "巴西",
                "British Virgin Islands": "英属维京群岛",
                "Brunei": "文莱",
                "Bulgaria": "保加利亚",
                "Burkina Faso": "布基纳法索",
                "Burundi": "布隆迪",
                "Cambodia": "柬埔寨",
                "Cameroon": "喀麦隆",
                "Canada": "加拿大",
                "Cape Verde": "佛得角",
                "Cayman Islands": "开曼群岛",
                "Central African Rep.": "中非共和国",
                "Chad": "乍得",
                "Chile": "智利",
                "China": "中国",
                "Colombia": "哥伦比亚",
                "Comoros": "科摩罗",
                "Congo": "刚果",
                "Costa Rica": "哥斯达黎加",
                "Croatia": "克罗地亚",
                "Cuba": "古巴",
                "Cyprus": "塞浦路斯",
                "Czech Rep.": "捷克共和国",
                "Côte d'Ivoire": "科特迪瓦",
                "Dem. Rep. Congo": "刚果民主共和国",
                "Dem. Rep. Korea": "朝鲜",
                "Denmark": "丹麦",
                "Djibouti": "吉布提",
                "Dominican Rep.": "多米尼加共和国",
                "Ecuador": "厄瓜多尔",
                "Egypt": "埃及",
                "El Salvador": "萨尔瓦多",
                "Equatorial Guinea": "赤道几内亚",
                "Eritrea": "厄立特里亚",
                "Estonia": "爱沙尼亚",
                "Ethiopia": "埃塞俄比亚",
                "Falkland Is.": "福克兰群岛",
                "Fiji": "斐济",
                "Finland": "芬兰",
                "Fr. S. Antarctic Lands": "所罗门群岛",
                "France": "法国",
                "Gabon": "加蓬",
                "Gambia": "冈比亚",
                "Georgia": "格鲁吉亚",
                "Germany": "德国",
                "Ghana": "加纳",
                "Greece": "希腊",
                "Greenland": "格陵兰",
                "Guatemala": "危地马拉",
                "Guinea": "几内亚",
                "Guinea-Bissau": "几内亚比绍",
                "Guyana": "圭亚那",
                "Haiti": "海地",
                "Honduras": "洪都拉斯",
                "Hungary": "匈牙利",
                "Iceland": "冰岛",
                "India": "印度",
                "Indonesia": "印度尼西亚",
                "Iran": "伊朗",
                "Iraq": "伊拉克",
                "Ireland": "爱尔兰",
                "Isle of Man": "马恩岛",
                "Israel": "以色列",
                "Italy": "意大利",
                "Jamaica": "牙买加",
                "Japan": "日本",
                "Jordan": "约旦",
                "Kazakhstan": "哈萨克斯坦",
                "Kenya": "肯尼亚",
                "Korea": "韩国",
                "Kuwait": "科威特",
                "Kyrgyzstan": "吉尔吉斯斯坦",
                "Lao PDR": "老挝",
                "Latvia": "拉脱维亚",
                "Lebanon": "黎巴嫩",
                "Lesotho": "莱索托",
                "Liberia": "利比里亚",
                "Libya": "利比亚",
                "Lithuania": "立陶宛",
                "Luxembourg": "卢森堡",
                "Macedonia": "马其顿",
                "Madagascar": "马达加斯加",
                "Malawi": "马拉维",
                "Malaysia": "马来西亚",
                "Maldives": "马尔代夫",
                "Mali": "马里",
                "Malta": "马耳他",
                "Mauritania": "毛利塔尼亚",
                "Mauritius": "毛里求斯",
                "Mexico": "墨西哥",
                "Moldova": "摩尔多瓦",
                "Monaco": "摩纳哥",
                "Mongolia": "蒙古",
                "Montenegro": "黑山共和国",
                "Morocco": "摩洛哥",
                "Mozambique": "莫桑比克",
                "Myanmar": "缅甸",
                "Namibia": "纳米比亚",
                "Nepal": "尼泊尔",
                "Netherlands": "荷兰",
                "New Caledonia": "新喀里多尼亚",
                "New Zealand": "新西兰",
                "Nicaragua": "尼加拉瓜",
                "Niger": "尼日尔",
                "Nigeria": "尼日利亚",
                "Norway": "挪威",
                "Oman": "阿曼",
                "Pakistan": "巴基斯坦",
                "Panama": "巴拿马",
                "Papua New Guinea": "巴布亚新几内亚",
                "Paraguay": "巴拉圭",
                "Peru": "秘鲁",
                "Philippines": "菲律宾",
                "Poland": "波兰",
                "Portugal": "葡萄牙",
                "Puerto Rico": "波多黎各",
                "Qatar": "卡塔尔",
                "Reunion": "留尼旺",
                "Romania": "罗马尼亚",
                "Russia": "俄罗斯",
                "Rwanda": "卢旺达",
                "S. Geo. and S. Sandw. Is.": "南乔治亚和南桑威奇群岛",
                "S. Sudan": "南苏丹",
                "San Marino": "圣马力诺",
                "Saudi Arabia": "沙特阿拉伯",
                "Senegal": "塞内加尔",
                "Serbia": "塞尔维亚",
                "Sierra Leone": "塞拉利昂",
                "Singapore": "新加坡",
                "Slovakia": "斯洛伐克",
                "Slovenia": "斯洛文尼亚",
                "Solomon Is.": "所罗门群岛",
                "Somalia": "索马里",
                "South Africa": "南非",
                "Spain": "西班牙",
                "Sri Lanka": "斯里兰卡",
                "Sudan": "苏丹",
                "Suriname": "苏里南",
                "Swaziland": "斯威士兰",
                "Sweden": "瑞典",
                "Switzerland": "瑞士",
                "Syria": "叙利亚",
                "Tajikistan": "塔吉克斯坦",
                "Tanzania": "坦桑尼亚",
                "Thailand": "泰国",
                "Togo": "多哥",
                "Tonga": "汤加",
                "Trinidad and Tobago": "特立尼达和多巴哥",
                "Tunisia": "突尼斯",
                "Turkey": "土耳其",
                "Turkmenistan": "土库曼斯坦",
                "U.S. Virgin Islands": "美属维尔京群岛",
                "Uganda": "乌干达",
                "Ukraine": "乌克兰",
                "United Arab Emirates": "阿拉伯联合酋长国",
                "United Kingdom": "英国",
                "United States": "美国",
                "Uruguay": "乌拉圭",
                "Uzbekistan": "乌兹别克斯坦",
                "Vanuatu": "瓦努阿图",
                "Vatican City": "梵蒂冈城",
                "Venezuela": "委内瑞拉",
                "Vietnam": "越南",
                "W. Sahara": "西撒哈拉",
                "Yemen": "也门",
                "Yugoslavia": "南斯拉夫",
                "Zaire": "扎伊尔",
                "Zambia": "赞比亚",
                "Zimbabwe": "津巴布韦"
            }
        }]
    });
}


function testEchart() {
    try {

    } catch (e) {
        mdui.alert(e)
    }
}

//垂直折线图
function drawLinearVerticalMapData(rawData) {
    document.getElementById('table-title').innerHTML = "临近空间环境一维图"
    let seriesData = []
    let legendsData = []
    let dataX = [], dataY = []

    for (let i in rawData) {
        for (let j in rawData[i]) {
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


    demonstrateStat(dataY, dataX)
    minValue = ecStat.statistics.min(dataX);
    meanValue = ecStat.statistics.mean(dataX);
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
                    title: '另存为图像',
                    excludeComponents  : ['toolbox','dataZoom']
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
        visualMap: {
            min: minValue,
            max: maxValue,
            dimension: 0,
            calculable: true,
            realtime: true,
            formatter: function (value) {                 //标签的格式化工具。
                return value;                    // 范围标签显示内容。
            }
        },
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'inside',
                yAxisIndex: 0,
                filterMode: 'none'
            }
        ],
        // grid: {
        //     left: '3%',
        //     right: '4%',
        //     bottom: '3%',
        //     containLabel: true
        // },
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

function drawHeatMapData(rawData, min, max, ytype, title, xTitle, yTitle, reverseY, schema) {
    let seriesData = []
    document.getElementById('table-title').innerHTML = title + "统计数据"
    for (let i in rawData) {
        if (i != "legend") {
            let temp = {
                emphasis: {
                    itemStyle: {
                        borderColor: '#333',
                        borderWidth: 1
                    }
                },
                progressive: 500,
                animation: false,
                type:'heatmap',
                name:i,
                data : rawData[i],
            }
            seriesData.push(temp)
        }
    }

    legendData = rawData["legend"]

    let selectedtime = rawData["legend"][0]

    let legendData = {
        type: 'scroll',
        // inactiveColor: "#fff",
        // inactiveBorderColor: "#000",
        data: rawData["legend"],
        // selectedMode: 'single',
        top: "6.5%",
        selected: {
            selectedtime: true

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

    demonstrateHeatStat(legendData, seriesData)
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
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                height: 12,
                filterMode: 'none'
            },
            {
                type: 'slider',
                yAxisIndex: 0,
                right: "2%",
                filterMode: 'none'
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none'
            },
            {
                type: 'inside',
                yAxisIndex: 0,
                filterMode: 'none'
            }
        ],
        //
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
                    title: '另存为图像',
                    excludeComponents  : ['toolbox','dataZoom']
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
//监听地图滚动缩放事件
    chartDom.clear()
    chartDom.setOption(option)

}


//热力图
function drawWorldHeatMapData(rawData, min, max, ytype, title, xTitle, yTitle, reverseY, schema) {
    videoData = rawData["legend"]
    let seriesData = []

    let element = `<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" id="test"
                          onclick="getVideo()"> 动态展示 </button>`
    mdui.$(".charts-selector").append(element)
    mdui.$(".charts-selector").mutation()

    document.getElementById('table-title').innerHTML = title + "统计数据"
    for (let i in rawData) {
        if (i != "legend") {
            let temp = {
                emphasis: {
                    itemStyle: {
                        borderColor: '#333',
                        borderWidth: 1
                    }
                },
                progressive: 3000,
                animation: false,
                type:'heatmap',
                name:i,
                // zlevel: 99,
                // coordinateSystem :'geo',
                data : rawData[i],
                itemStyle: {
                    opacity: 0.7
                }
            }
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
        top: "6.5%",
        selected: {
            selectedtime: true

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

    demonstrateHeatStat(legendData, seriesData)
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
            geo: {
                map: 'world',
                // left: 0,
                // right: 0,
                // top: 0,
                left: "15%", top: "10%", right: "15%", bottom: "10%",
                center: [0, 0],
                // center:undefined,
                boundingCoords: [
                    // 定位左上角经纬度
                    [-180, 90],
                    // 定位右下角经纬度
                    [180, -90]
                ],
                scaleLimit: {
                    min:1
                },
                aspectScale : 1.5,
                zoom: 1,
                silent: true,
                roam: 'scale',
//                 layoutCenter: ['50%', '50%'],
// // 如果宽高比大于 1 则宽度为 100，如果小于 1 则高度为 100，保证了不超过 100x100 的区域
//                 layoutSize: "200%",
                itemStyle: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                }
            },
            legend: {
                width: "78%",
                // type: 'scroll',
                id : 'series00',
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
                    saveAsImage: {
                        title: '另存为图像',
                        excludeComponents  : ['toolbox','dataZoom']
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
            grid: {
                show: true,                                 //是否显示图表背景网格
                left: '15%',                                    //图表距离容器左侧多少距离
                right: '15%',                                //图表距离容器右侧侧多少距离
                bottom: '10%',
                top: '10%',//图表距离容器上面多少距离
                           //图表距离容器下面多少距离
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

    option.geo.center = undefined
    let chartDom = echarts.init(document.querySelector("#chart"));
//监听地图滚动缩放事件
        chartDom.clear()
    window.addEventListener("resize",function(){
        chartDom.resize();
    });
        chartDom.setOption(option)

}

function base64ToBlob(code) {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}
function saveAsImage() {
    let chartDom = echarts.init(document.querySelector("#chart"));

    let content = chartDom.getDataURL({
        backgroundColor: '#fff'
    });
    return content

    // let aLink = document.createElement('a');
    // let blob = this.base64ToBlob(content);
    //
    // return blob
    // let evt = document.createEvent("HTMLEvents");
    // evt.initEvent("click", true, true);
    // aLink.download = "line.png";
    // aLink.href = URL.createObjectURL(blob);
    // aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
}

function getVideo() {

    try {
        let chartDom = echarts.init(document.querySelector("#chart"));
        let imageList = []
        let timeList = []
        const element = document.getElementById('chart');


   // const mask = document.createElement('div');
   //      mask.style.position = 'absolute';
   //      mask.style.top = '0';
   //      mask.style.left = '0';
   //      mask.style.width = '100%';
   //      mask.style.height = '100%';
   //      mask.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 设置遮罩层的颜色和透明度
   //      element.appendChild(mask);
        for (let i in videoData) {
            setTimeout(() => {
                chartDom.dispatchAction({
                    type: 'legendSelect',
                    // 图例名称
                    name: videoData[i]
                });
            }, 1000*i)
        }
        // setTimeout(() => {
        //     mask.remove()
        //     // funcInjector.createVideo(imageList,timeList)
        // }, 1000*(videoData.length+1))
    } catch (e) {
        mdui.alert(e)
    }
}
