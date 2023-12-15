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
    hisFileList.sort()
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
    clearPosition()
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
    if(params.pictype == PicType.Time_Density) {
        DrawPic( PicType.Time_Density)
    }
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
    // let mainLogo =`<img src="./static/logo.png" className="main-logo"  style=>`

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
        let temp = getPositionedData(longitude, latitude)["data"]
        let temp1 = []
        temp.forEach((item) => {
            // 空数组newList2 不包含item为false ,取反为true 执行数组添加操作
            // 如果数组包含了 item为true 取反为false 不执行数组添加操作
            let included = false
            for (let i = 0;i<temp1.length;i++) {
                if (temp1[i][0] == item[0]) {
                    included = true
                }
            }
            if (!included) {
                temp1.push(item)
            }
        })

        serData.push({
            name: positionTitle,
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            data: temp1,
            roam:false,
        })
        drawPositionLinearMapData()
    } catch (e) {
        mdui.alert(e)
    }
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
            var myspin1 = new SpinLoading('chart','正在预测中...');

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
    else if (count == 1){
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
                            clearPosition()
                            // var img = document.createElement("img");
                            // // margin-left: 48%;
                            // // transform: translateX(-50%) translateY(-50%);
                            // // margin-top: 20%;
                            // // opacity: 0.4;
                            // // width: 23%;
                            //
                            // img.style.marginLeft = "48%"
                            // img.style.marginTop = "-22%"
                            // img.className = "main-logo"
                            // img.src = "./static/logo.png"
                            // let chart =document.querySelector("#chart");
                            // removeChild(chart)
                            // chart.appendChild(img)

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
    } else if(params.type == 2 && count > 1 ) {
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
                            let fileURL =  funcInjector.mergeTECUFiles(temp)
                            document.querySelector(".file-detail").style.display = 'inline'
                            document.querySelector(".file-path").innerHTML = fileURL
                            var Splitter = browserRedirect() == "Win" ? '\\' : '/'
                            last = fileURL.lastIndexOf(Splitter)
                            fileName = fileURL.substring(last + 1)
                            params.filename = fileName
                            params.filepath = fileURL
                            document.querySelector(".file-name").innerHTML = fileName
                            refreshHisList()
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
    let hisFileList = JSON.parse(funcInjector.getHisFile(params).toString())
    hisFileList= hisFileList.reverse()
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

function demonstrateStat( datay) {

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
            left: "center",
        },
        color: ['rgb(25, 183, 207)'],
        grid: {
            top: '13%',
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


function demonstratePositionedStat(params,maxValue) {
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
    funcInjector.log(JSON.stringify(params))
    let chart = echarts.init(document.querySelector("#chart"));
    let rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent // 获取y轴刻度最值
    let min = rangeY[0]
    let max = rangeY[1]
    if (params.batch && params.batch[1].start != null) {
        starty =Math.round((params.batch[0].start * datay.length)/100);
        endy =Math.round( (params.batch[0].end * datay.length)/100) + 1;
        datay = datay.slice(starty, endy)
        // let max = Math.ceil((maxValue *params.batch[1].end) /100)
        // let min =Math.floor((maxValue *params.batch[1].start) /100)
        datay = datay.filter(num => num>=min && num <= max)
    } else if (params.batch && params.batch[0].start != null) {
        // if(params.batch[0].dataZoomId == "xInsider") {
        //     starty = Math.round((params.batch[0].start * datay.length) / 100)
        //     endy = Math.round((params.batch[0].end * datay.length) / 100) + 1
        //     funcInjector.log(starty.toString())
        //     funcInjector.log(endy.toString())
        //     demonstrateStat(datay.slice(starty, endy))
        // }
        demonstrateStat(datay)
    } else if (params.batch && params.batch[0].startValue != null) {
        datay = datay.slice(params.batch[0].startValue, params.batch[0].endValue)
        datay = datay.filter(num => num>=params.batch[1].startValue && num <= params.batch[1].endValue)
    } else if(JSON.stringify(params) != "{}"){
        if (params.dataZoomId == "xSlider") {
            starty =Math.round((params.start * datay.length )/100)
            endy =Math.round( (params.end * datay.length)/100) +1
            datay = datay.slice(starty, endy)
        }
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
            top: "8%",
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
            top: '20%',
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

function  demonstrateWorldStat(legendData, seriesData, name) {
    let tempData = deepClone(seriesData)
    let datay = []
    for (i in tempData) {
        let hisdata = []
        for (j in tempData[i].data) {
            if(tempData[i].name == name) {
                datay.push(Number(tempData[i].data[j][2]))
            }
            hisdata.push(Number(tempData[i].data[j][2]))
        }
        var bins = ecStat.histogram(hisdata);
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
            top: '20%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type:'category',
            animation:false,
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

function  demonstrateHeatStat(legendData, seriesData, name,rangeX,rangeY) {
    let tempData = deepClone(seriesData)
    let datay = []
    for (i in tempData) {
        let hisdata = []
        for (j in tempData[i].data) {
            if(tempData[i].name == name) {
                datay.push(Number(tempData[i].data[j][2]))
            }
            hisdata.push(Number(tempData[i].data[j][2]))
        }
        var bins = ecStat.histogram(hisdata);
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
            top: '20%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type:'category',
            animation:false,
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
        demonstrateStat( rawData["y"])
        clearListener()
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
                // formatter: function (value) {
                //     let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : new Big(value).toFixed(2)
                //     return ret;                  // 范围标签显示内容。
                // }
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
                // max: function (value) {
                //     return value.max
                // },
                show: true,
                // axisLine: { onZero: false },
                axisLabel: {
                    formatter: function (value) {
                        let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : new Big(value).toFixed(2)
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
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    moveOnMouseMove:false
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'none',
                    moveOnMouseMove:false
                }
            ],
            series: [
                {
                    name: tagName,
                    type: 'line',
                    symbol: 'none',
                    sampling: 'lttb',
                    roam:false,
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
        chartDom.on('dataZoom', function (params) {
            try {

                funcInjector.log(JSON.stringify(params))
                let chart = echarts.init(document.querySelector("#chart"));
                let rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent // 获取y轴刻度最值
                let min = rangeY[0]
                let max = rangeY[1]
                if (params.batch && params.batch[1].start != null) {
                    let datay = rawData["y"]
                    starty =Math.round((params.batch[0].start * datay.length)/100);
                    endy =Math.round( (params.batch[0].end * datay.length)/100) + 1;
                    funcInjector.log(endy.toString())
                    datay = datay.slice(starty, endy)
                    // let max = Math.ceil((maxValue *params.batch[1].end) /100)
                    // let min =Math.floor((maxValue *params.batch[1].start) /100)
                    datay = datay.filter(num => num>=min && num <= max)
                    demonstrateStat(datay)
                } else if (params.batch && params.batch[0].start != null) {
                    let datay = rawData["y"]
                    // if(params.batch[0].dataZoomId == "xInsider") {
                    //     starty = Math.round((params.batch[0].start * datay.length) / 100)
                    //     endy = Math.round((params.batch[0].end * datay.length) / 100) + 1
                    //     funcInjector.log(starty.toString())
                    //     funcInjector.log(endy.toString())
                    //     demonstrateStat(datay.slice(starty, endy))
                    // }
                    // demonstrateStat(datay)
                    demonstrateStat(datay)
                } else if (params.batch && params.batch[0].startValue != null) {
                    let datay = rawData["y"].slice(params.batch[0].startValue, params.batch[0].endValue)
                    datay = datay.filter(num => num>=params.batch[1].startValue && num <= params.batch[1].endValue)
                    demonstrateStat(datay)
                } else {
                    if (params.dataZoomId == "xSlider") {
                        starty =Math.round((params.start * rawData["x"].length )/100)
                        endy =Math.round( (params.end * rawData["x"].length)/100) +1
                        funcInjector.log(starty.toString())
                        funcInjector.log(endy.toString())
                        demonstrateStat( rawData["y"].slice(starty, endy))
                    }
                    // else if(params.dataZoomId == "ySlider") {
                    //     let max = (maxValue *params.end) /100
                    //     let min = (maxValue *params.start) /100
                    //     let datay = rawData["y"]
                    //
                    //     starty =Math.round((params.start * datay.length )/100);
                    //     endy =Math.round( (params.end * datay.length)/100) +1 ;
                    //     demonstrateStat(datay.slice(starty, endy))
                    // }
                }

            } catch (e) {
            }
        });
    } catch (e) {
        mdui.alert(e)
    }
}

function transferToNumber(inputNumber) {
    if (isNaN(inputNumber)) {
        return inputNumber
    }
    inputNumber = '' + inputNumber
    inputNumber = parseFloat(inputNumber)
    let eformat = inputNumber.toExponential() // 转换为标准的科学计数法形式（字符串）
    let tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/) // 分离出小数值和指数值
    let number = inputNumber.toFixed(Math.max(0, (tmpArray[1] || '').length - tmpArray[2]))
    return number
}

//画折线图
//原始数据 标题 横坐标 纵坐标
function drawLinearMapData(rawData, title, xname, yname, tagName) {
    try {
        let chartDom = echarts.init(document.querySelector("#chart"));
        clearListener()
        demonstrateStat(rawData["y"])
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
                },
                formatter(params) {
                    try {
                        var relVal = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            let value = params[i].value
                            let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : new Big(value).toFixed(2)
                            //遍历出来的值一般是字符串，需要转换成数字，再进项tiFixed四舍五入
                            relVal += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + Number(ret)
                        }
                        return relVal;
                    } catch (e) {
                        mdui.alert(e)
                    }
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
                    let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : new Big(value).toFixed(2)
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
                        excludeComponents: ['toolbox', 'dataZoom']
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
                        let ret = (value > 0 && value < 0.01) ? (new Big(value).toExponential(2)) : new Big(value).toFixed(2)
                        return ret;
                    }
                },
                // boundaryGap: [0, '100%']
            },
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    id: "xSlider"
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    id: "xInsider",
                    moveOnMouseMove:false
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'none',
                    id: "yInsider",
                    moveOnMouseMove:false
                }
            ],
            series: [
                {
                    name: tagName,
                    type: 'line',
                    symbol: 'none',
                    sampling: 'lttb',
                    roam: false,
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
        chartDom.on('dataZoom', function (params) {
            try {
                funcInjector.log(JSON.stringify(params))
                let rangeY = chartDom.getModel().getComponent('yAxis').axis.scale._extent // 获取y轴刻度最值
                let min = rangeY[0]
                let max = rangeY[1]
                if (params.batch && params.batch[1].start != null) {
                    let datay = rawData["y"]
                    starty = Math.round((params.batch[0].start * datay.length) / 100);
                    endy = Math.round((params.batch[0].end * datay.length) / 100) + 1;
                    funcInjector.log(endy.toString())
                    datay = datay.slice(starty, endy)
                    // let max = Math.ceil((maxValue *params.batch[1].end) /100)
                    // let min =Math.floor((maxValue *params.batch[1].start) /100)
                    datay = datay.filter(num => num >= min && num <= max)
                    demonstrateStat(datay)
                } else if (params.batch && params.batch[0].start != null) {
                    let datay = rawData["y"]
                    // if(params.batch[0].dataZoomId == "xInsider") {
                    //     starty = Math.round((params.batch[0].start * datay.length) / 100)
                    //     endy = Math.round((params.batch[0].end * datay.length) / 100) + 1
                    //     funcInjector.log(starty.toString())
                    //     funcInjector.log(endy.toString())
                    //     demonstrateStat(datay.slice(starty, endy))
                    //     }
                    demonstrateStat(datay)
                } else if (params.batch && params.batch[0].startValue != null) {
                    let datay = rawData["y"].slice(params.batch[0].startValue, params.batch[0].endValue)
                    datay = datay.filter(num => num >= params.batch[1].startValue && num <= params.batch[1].endValue)
                    demonstrateStat(datay)
                } else {
                    if (params.dataZoomId == "xSlider") {
                        starty = Math.round((params.start * rawData["x"].length) / 100)
                        endy = Math.round((params.end * rawData["x"].length) / 100) + 1
                        funcInjector.log(starty.toString())
                        funcInjector.log(endy.toString())
                        demonstrateStat(rawData["y"].slice(starty, endy))
                    }
                    // else if(params.dataZoomId == "ySlider") {
                    //     let max = (maxValue *params.end) /100
                    //     let min = (maxValue *params.start) /100
                    //     let datay = rawData["y"]
                    //
                    //     starty =Math.round((params.start * datay.length )/100);
                    //     endy =Math.round( (params.end * datay.length)/100) +1 ;
                    //     demonstrateStat(datay.slice(starty, endy))
                    // }
                }

            } catch (e) {
            }
        });

        chartDom.clear()
        chartDom.setOption(option)
    } catch (e) {
        mdui.alert(e)
    }
}


function drawPositionLinearMapData() {
    let chartDom = echarts.init(document.querySelector("#chart"));
    document.getElementById('table-title').innerHTML = "电离层参数一维图统计数据"
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
                        // yAxisIndex: 'none',
                        title: "数据缩放"
                    },
                    dataView: {
                        title: '数据视图',
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
                boundaryGap: [0, '100%'],
                max: function (value) {
                    return value.max
                },
            },

            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    id: 'xSlider'
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    filterMode: 'none',
                    moveOnMouseMove:false
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    filterMode: 'none',
                    moveOnMouseMove:false
                }
            ],
            series: serData
        };


        chartDom.clear()
        chartDom.setOption(option)
        demonstratePositionedStat({},maxValue)
        chartDom.on('dataZoom', function (params) {
            try {
                demonstratePositionedStat(params,maxValue)
            } catch (e) {
            }
        });
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

function testEchart() {
    try {

    } catch (e) {
        mdui.alert(e)
    }
}

//垂直折线图
function drawLinearVerticalMapData(rawData) {
    let chartDom = echarts.init(document.querySelector("#chart"));
   clearListener()
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
            roam:false,
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

    let maxValue = ecStat.statistics.max(dataX);
    let minValue = ecStat.statistics.min(dataX);
    demonstrateStat(dataX)



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
            },
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
        },
        dataZoom: [
            {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'none',
                id: "ySlider"
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none',
                moveOnMouseMove:false

            },
            {
                type: 'inside',
                yAxisIndex: 0,
                filterMode: 'none',
                moveOnMouseMove:false

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
    chartDom.on('dataZoom', function (params) {
        try {
            funcInjector.log(JSON.stringify(params))
            let rangeX =  chartDom.getModel().getComponent('xAxis').axis.scale._extent // 获取y轴刻度最值
            let min = rangeX[0]
            let max = rangeX[1]
            funcInjector.log(JSON.stringify(min))
            funcInjector.log(JSON.stringify(max))
            if (params.batch && params.batch[1].start != null) {
                let datay = dataX
                starty =Math.round((params.batch[1].start * datay.length)/100);
                endy =Math.round( (params.batch[1].end * datay.length)/100) + 1;
                // funcInjector.log(starty.toString())
                // funcInjector.log(endy.toString())
                datay = dataX.slice(starty, endy)
                // let max = Math.ceil(maxValue - (((maxValue-minValue)*params.batch[0].start) /100))
                // let min =Math.floor(maxValue -(((maxValue-minValue)*params.batch[0].end) /100))
                // funcInjector.log(max.toString())
                // funcInjector.log(min.toString())
                datay = datay.filter(num => num>=min && num <= max)
                demonstrateStat(datay)

            } else if (params.batch && params.batch[0].end != null) {
                let datay = dataX
                // if(params.batch[0].dataZoomId == "xInsider") {
                //     starty = Math.round((params.batch[0].start * datay.length) / 100)
                //     endy = Math.round((params.batch[0].end * datay.length) / 100) + 1
                //     funcInjector.log(starty.toString())
                //     funcInjector.log(endy.toString())
                //     demonstrateStat(datay.slice(starty, endy))
                // }
                // demonstrateStat(datay)
                demonstrateStat(datay)
            } else if (params.batch && params.batch[0].startValue != null) {
                let datay = dataX.slice(params.batch[1].startValue, params.batch[1].endValue+1)
                datay = datay.filter(num => num>=params.batch[0].startValue && num <= params.batch[0].endValue)
                demonstrateStat(datay)
            } else {
                if (params.dataZoomId == "ySlider") {
                    starty =Math.round((params.start * dataX.length )/100)
                    endy =Math.round( (params.end * dataX.length)/100) +1
                    demonstrateStat( dataX.slice(starty, endy))
                }
                // else if(params.dataZoomId == "ySlider") {
                //     let max = (maxValue *params.end) /100
                //     let min = (maxValue *params.start) /100
                //     let datay = rawData["y"]
                //
                //     starty =Math.round((params.start * datay.length )/100);
                //     endy =Math.round( (params.end * datay.length)/100) +1 ;
                //     demonstrateStat(datay.slice(starty, endy))
                // }
            }

        } catch (e) {
            // mdui.alert(e)
        }
    });
    chartDom.clear()
    chartDom.setOption(option)
}

function drawHeatMapData(rawData, min, max, ytype, title, xTitle, yTitle, reverseY, schema) {
    let chartDom = echarts.init(document.querySelector("#chart"));
   clearListener()
    chartDom.on('legendselectchanged', function (params) {
        demonstrateWorldStat(legendData,seriesData,params.name)
    });
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

    demonstrateWorldStat(legendData, seriesData,selectedtime)
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
            selectedMode: 'single',
            top:"5%"
        },
            title: {
                text: title,
                left: "center",

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
//监听地图滚动缩放事件
    chartDom.clear()
    chartDom.setOption(option)
}

function clearListener() {
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.off("datazoom")
    chartDom.off("legendselected")
    chartDom.off("legendselectchanged")
}

//热力图
function drawWorldHeatMapData(rawData, min, max, ytype, title, xTitle, yTitle, reverseY, schema) {
    let chartDom = echarts.init(document.querySelector("#chart"));
    clearListener()
    let temp = rawData["legend"]
    temp.forEach((item) => {
        // 空数组newList2 不包含item为false ,取反为true 执行数组添加操作
        // 如果数组包含了 item为true 取反为false 不执行数组添加操作
        if (!videoData.includes(item)) {
            videoData.push(item)
        }
    })

    funcInjector.log(JSON.stringify(videoData))
    try {
        videoData.sort((a, b) => {

            let date1 = new Date(a);
            let date2 = new Date(b);

            if (date1 > date2) {
                return 1;
            } else  if(date1 == date2) {
                return 0
            } else  {
                return -1
            }
        })
    } catch (e) {
        mdui.alert(e)
    }
    let seriesData = []

    let element = `<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent"
                          onclick="dynamicDisplay()"  style = "margin-left: 1vh"> 动态展示 </button>`
    element += `<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" 
                          onclick="getVideo()"  style = "margin-left: 1vh"> 生成视频 </button>`
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
        animation:false,
        // selectedMode: 'single',
        top: "7%",
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
    demonstrateWorldStat(legendData, seriesData,selectedtime)
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
                type: 'scroll',
                id : 'worldLegend',
                // inactiveColor: "#fff",
                // inactiveBorderColor: "#000",
                // selector: ['all', 'inverse'] ,
                data: videoData,
                selectedMode: 'single',
                top:"3%"
            },
            title: {
                text: title,
                left: "center",

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
                inverse: reverseY,
                nameLocation: "start"

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
        chartDom.clear()
    window.addEventListener("resize",function(){
        chartDom.resize();
    });
        chartDom.setOption(option)
    chartDom.on('legendselectchanged', function (params) {
        // mdui.alert("here")
        demonstrateWorldStat(legendData,seriesData,params.name)
    });
    chartDom.on('legendselected', function (params) {
        // mdui.alert("here")
        demonstrateWorldStat(legendData,seriesData,params.name)
        let chartDom = echarts.init(document.querySelector("#hisCharts"));
        chartDom.dispatchAction({
            type: 'legendInverseSelect',
            // 图例名称
        });
        chartDom.dispatchAction({
            type: 'legendSelect',
            // 图例名称
            name: params.name
        });
        chartDom.dispatchAction({
            type: 'legendScroll',
            // 图例名称
            scrollDataIndex: Number(rawData["legend"].indexOf(params.name)),
        });
    });

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


        const mask = document.createElement('div');
             mask.style.position = 'absolute';
             mask.style.top = '0';
             mask.style.left = '0';
             mask.style.width = '100%';
             mask.style.height = '100%';
             mask.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // 设置遮罩层的颜色和透明度
             element.appendChild(mask);
        var myspin1 = new SpinLoading('chart','正在生成视频中...');
        myspin1.show()
        for (let i in videoData) {
            setTimeout(() => {
                chartDom.dispatchAction({
                    type: 'legendSelect',
                    // 图例名称
                    name: videoData[i]
                });
                chartDom.dispatchAction({
                    type: 'legendScroll',
                    // 图例名称
                    scrollDataIndex: Number(i),
                    legendId: "worldLegend"
                });
                setTimeout(() => {
                    let img = saveAsImage()
                    imageList.push(img)
                    let temp = videoData[i].replace(" ","")
                    temp =temp.replace("-","")
                    temp =temp.replace(":","")
                    temp =temp.replace(":","")
                    timeList.push(temp)
                },500)
            }, 600*i)
        }
        setTimeout(() => {
            mask.remove()
            try {
               let p = new Promise((resolve) => {
                    let path = funcInjector.createVideo(imageList, timeList)
                    resolve(path)
                })
                p.then(path => {
                    myspin1.close()
                    mdui.snackbar({
                        message: '生成视频成功，路径为' + path,
                        position: 'left-top',
                    });
                })
            } catch (e) {
                mdui.alert(e)
            }

        }, 1000*(videoData.length+2))
    } catch (e) {
        mdui.alert(e)
    }
}


function dynamicDisplay() {
    try {
        let chartDom = echarts.init(document.querySelector("#chart"));
        for (let i in videoData) {
            setTimeout(() => {
                chartDom.dispatchAction({
                    type: 'legendSelect',
                    // 图例名称
                    name: videoData[i]
                });
                chartDom.dispatchAction({
                    type: 'legendScroll',
                    // 图例名称
                    scrollDataIndex: Number(i),
                    legendId: "worldLegend"
                });
            }, 1000*i)
        }
    } catch (e) {
        mdui.alert(e)
    }
}
