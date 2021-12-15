// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    task: 0, type: "", time: "", height: 0, latLb: 0.0, latUb: 0.0, lonLb: 0.0, lonUb: 0.0, filename: ""
}

// 数据限制
limit = {
    height: 0, latLb: 0, latUb: 0, lonLb: 0, lonUb: 120,
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

function checkParam() {
    //alert(limit.latLb)
    return  params.lonLb >= limit.lonLb && params.lonUb  <= limit.lonUb && params.latLb >= limit.latLb && params.latUb  <= limit.latUb && params.lonLb  <= params.lonUb && params.latLb  <= params.latUb
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
    if (!checkParam()) {
        mdui.alert("数据不在范围内，请重新设置")
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

function getHeightSelHtml(value, number) {
    return `<option value="${number}">${value}km</option>`
}

function fetchHeights() {
    document.querySelector("#height-selector").innerHTML = ''
    // let types = funcInjector.GetFileHeight()
    // types = types
    //     .toString()
    //     .slice(1, types.toString().length - 1)
    //     .replace(/\s+/g, '')
    //     .split(',')
    let html = ""
    //html = html + getHeightSelHtml(types[0], 0)
    for (let i = 1; i < 81; i++) html = html + getHeightSelHtml(i, i)
    mdui.$("#height-selector").append(html)
    mdui.$("#height-selector").mutation()
    document.querySelector("#height-selector").value = 1;
}


// 通过value动态生成文杰列表项
function getFileListHtml(value) {
    return `<div><li class="mdui-list-item mdui-ripple file-item" onclick="fileChangeHandler('` + value + `')">${value}</li>
<li class="mdui-divider"></li></div>`
}

function getDatainfo(filename)
{
    params_info=params
    params_info.filename = filename
    //document.querySelector("#show-filename").innerHTML = filename
    limit_file = funcInjector.Getinformation(params_info)
    limit_file = limit_file
        .toString()
        .slice(1, limit_file.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    if (limit_file[0].length === 4)
        return [0,limit_file[0].substr(0, 2), limit_file[0].substr(2, 2)]
    else if (limit_file[0].length === 6)
        return [0,limit_file[0].substr(0, 2) , limit_file[0].substr(2, 2) ]
    else
        return [limit_file[0].substr(0, 4) , limit_file[0].substr(4, 2) , limit_file[0].substr(6, 2)]
}

function fileChangeHandler(filename) {
    params.filename = filename
    document.querySelector("#show-filename").innerHTML = filename
    limit_file = funcInjector.Getinformation(params)
    limit_file = limit_file
        .toString()
        .slice(1, limit_file.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    limit.latLb = Math.min(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    limit.latUb = Math.max(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    limit.lonLb = Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    limit.lonUb = Math.max(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    let yearL=[]
    if (limit_file[0].length === 4)
        params.time = limit_file[0].substr(0, 2) + "月" + limit_file[0].substr(2, 2) + "日"
    else if (limit_file[0].length === 6)
        params.time = limit_file[0].substr(0, 2) + "月" + limit_file[0].substr(2, 2) + "日" + limit_file[0].substr(4, 2) + ":00"
    else
    {
        params.time = limit_file[0].substr(0, 4) + "年" + limit_file[0].substr(4, 2) + "月" + limit_file[0].substr(6, 2) + "日" + limit_file[0].substr(8, 2) + ":00"
    }
    fetchHeights()
    //alert(Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1))
    document.querySelector("#latLb-input").value=Math.min(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#latLb-input").min=Math.min(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#latLb-input").max=Math.max(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#lonLb-input").value=Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    document.querySelector("#lonLb-input").min=Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    document.querySelector("#lonLb-input").max=Math.max(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    //alert(Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1))
    document.querySelector("#latUb-input").value=Math.max(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#lonUb-input").value=Math.max(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
}

function unique(arr){
    var res = [];
    var obj = {};
    for(var i=0; i<arr.length; i++){
        if( !obj[arr[i]] ){
            obj[arr[i]] = 1;
            res.push(arr[i]);
        }
    }
    return res;
}
// 动态添加文件列表组件
function fetchFileList() {
    addM()
    addD()
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
    let yearL=[]
    for (let i = 0; i < files.length; i++) {
        let Dataf=getDatainfo(filelist.get(i))
        if(Dataf[0]!==0)
            yearL.push(Dataf[0])

    }
    addY(unique(yearL))
    params.filename=""
    params.time=""
    document.querySelector("#show-filename").innerHTML=""
}

function drawHeatMap(rawData) {
    let lon=JSON.parse(funcInjector.GetFileLon())
    let lat=JSON.parse(funcInjector.GetFileLat())
    let xData = []
    let yData = []
    let data = []
    let min = rawData[0][0]
    let max = rawData[0][0]
    let sum = 0
    let count = 0
    //采样（为了保证速度）
    for (let x = 0; x  < rawData.length; x ++ ) {
        xData.push((params.latLb+x*(params.latUb-params.latLb)/(rawData.length-1)).toFixed(1));
        for (let y = 0; y  < rawData[0].length; y ++ ) {
            max = Math.max(rawData[x][y], max)
            min = Math.min(rawData[x][y], min)
            sum += rawData[x][y]
            count++
            data.push([y, x, rawData[x][y]])
        }
    }
    statics.min = min
    statics.max = max
    statics.avg = sum / count
    let sum_avg = 0
    for (let x = 0; x < rawData.length;  x ++) {
        for (let y = 0; y  < rawData[0].length;  y ++) {
            sum_avg += (rawData[x][y] - sum / count) * (rawData[x][y] - sum / count)
        }
    }
    statics.sdev = Math.sqrt(sum_avg / count)

    let dataName='温度(K)'
    if(params.type=="U"||params.type=="O")
        dataName='速度(m/s)'
    if(params.type=="R")
        dataName='密度(kg/m³)'

    for (let y = 0; y < rawData[0].length;  y++ ) yData.push((params.lonLb+y*(params.lonUb-params.lonLb)/(rawData[0].length-1)).toFixed(1));
    let option = {
        toolbox: {
            show: true,
            feature: {
                dataZoom: {},
                saveAsImage: {}
            }
        },

        // geo: {
        //     "map": "china",
        //     "roam": true
        // },
        axisPointer:
            {
                show:true,
                type: 'shadow'
            },
        tooltip: {
            formatter:function (p) {
                return p.data[2].toString();
            }
        }, xAxis: {
            type: 'category', data: yData, name: '经度 (°E)'
        }, yAxis: {
            type: 'category', data: xData, name: '纬度 (°N)'
        }, visualMap: {
            min: min, max: max, range: [min, max],calculable: true, realtime: false, inRange: {
                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            },precision:2
        },
        series: [{
            name: dataName,
            type: 'heatmap',
            data: data,
            emphasis: {
                itemStyle: {
                    borderColor: '#333', borderWidth: 1
                }
            },
            progressive: 10000,
            animation: false
        }]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

function drawContourMapData(rawData) {
    let height=JSON.parse(funcInjector.GetFileHeight(params))
    let data = []
    let ydata = []
    let min = rawData[0]
    let max = rawData[0]
    let sum = 0
    let count = 0
    for (let i = rawData.length-1; i >= 0; i--) {
        ydata.push((height[i]/1000).toFixed(3))
        data.push(rawData[i])
        max = Math.max(rawData[i], max)
        min = Math.min(rawData[i], min)
        sum += rawData[i]
        count++
    }
    statics.max = max
    statics.min = min
    statics.avg = sum / count
    let sum_sdev = 0
    for (let i = 0; i < rawData.length; i++) {
        sum_sdev += (rawData[i] - sum / count) * (rawData[i] - sum / count)
    }
    statics.sdev = Math.sqrt(sum_sdev / count)

    let dataName='温度(K)'
    if(params.type=="U"||params.type=="O"||params.type=="V")
        dataName='速度(m/s)'
    if(params.type=="R")
        dataName='密度(kg/m³)'

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
            type: 'category', axisLine: {onZero: false}, name: '高度 (km)', boundaryGap: false, data: ydata
        }, visualMap: {
            min: min, max: max,dimension :0, range: [min, max], calculable: true, realtime: true, inRange: {
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
            data: data
        }]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.clear()
    chartDom.setOption(option)
}

// 输入查询字符串和文件名，返回是否符合查询结果
// TODO 完善该函数
function fileFilter(filename){
    let F_data=getDatainfo(filename)
    //alert(F_data[0])
    if(F_data[0]!=0 && document.querySelector('#fliter-Y').value!==0 && Number(F_data[0])!=document.querySelector('#fliter-Y').value)
        return true
    //alert(document.querySelector('#fliter-M').value!=0)
    if(Number(F_data[1])!=document.querySelector('#fliter-M').value && document.querySelector('#fliter-M').value!=0)
        return true
    //alert(document.querySelector('#fliter-D').value)
    if(Number(F_data[2])!=document.querySelector('#fliter-D').value && document.querySelector('#fliter-D').value!=0)
        return true
    return false
}

// 文件搜索功能
document.querySelector('#file-filter-btn').addEventListener('click',(event)=>{
    //let queryStr = document.querySelector('#file-filter-input').value
        let files = document.querySelectorAll('.file-item')
        for(let file of files){
            // file.hidden = file.innerHTML.indexOf(query)===-1
            file.hidden = fileFilter(file.innerHTML)
        }
})
document.querySelector('#file-filter-reset-btn').addEventListener('click',(event)=>{
    document.querySelector('#fliter-Y').value=0
    document.querySelector('#fliter-M').value=0
    document.querySelector('#fliter-D').value=0
    let files = document.querySelectorAll('.file-item')
    for(let file of files){
        file.hidden=false
    }
})
function addM() {
    document.querySelector("#fliter-M").innerHTML = ''
    let html = `<option value="0">*</option>`
    for (let i = 1; i <= 12; i++)
        html = html + `<option value="${i}">${i}</option>`
    //alert(html)
    mdui.$("#fliter-M").append(html)
    mdui.$("#fliter-M").mutation()
    document.querySelector("#fliter-M").value = 0;
}
function addD() {
    document.querySelector("#fliter-D").innerHTML = ''
    let html = `<option value="0">*</option>`
    for (let i = 1; i <= 31; i++)
        html = html + `<option value="${i}">${i}</option>`
    //alert(html)
    mdui.$("#fliter-D").append(html)
    mdui.$("#fliter-D").mutation()
    document.querySelector("#fliter-D").value = 0;
}
function addY(yearL) {
    //alert(yearL)
    document.querySelector("#fliter-Y").innerHTML = ''
    let html = `<option value="0">*</option>`
    for (let i = 0; i < yearL.length; i++)
        html = html + `<option value="${yearL[i]}">${yearL[i]}</option>`
    //alert(html)
    mdui.$("#fliter-Y").append(html)
    mdui.$("#fliter-Y").mutation()
    document.querySelector("#fliter-Y").value = 0;
}
