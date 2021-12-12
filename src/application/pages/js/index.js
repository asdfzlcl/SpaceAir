// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    task: 0, type: "", time: "", height: 0, latLb: 0.0, latUb: 0.0, lonLb: 0.0, lonUb: 0.0, filename: 'U010100_大气密度(U)气候态.nc'
}

// 数据限制
limit = {
    height: 0, latLb: 0, latUb: 0, lonLb: 0, lonUb: 120,
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
    return  params.lonLb >= limit.lonLb && params.lonLb  <= limit.lonUb && params.latLb >= limit.latLb && params.latLb  <= limit.latUb
}

function changePath() {
    funcInjector.changePath()
}


// 绑定提交参数事件
document.querySelector("#submit-param").onclick = () => {
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
function getTypeSelHtml(value, isChecked) {
    return `<label class="mdui-radio">
            <input type="radio" name="type-selector" value="${value}" onclick="fetchFileList()"
            ${isChecked ? "checked" : ""} />
            <i class="mdui-radio-icon"></i>
            ${value}
            </label>`
}

// 动态添加type组件
function fetchTypes() {
    let types = funcInjector.GetFileInfo()
    types = types
        .toString()
        .slice(1, types.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    let html = ""
    html = html + getTypeSelHtml(types[0], true)
    for (let i = 1; i < types.length; i++) html = html + getTypeSelHtml(types[i], false)
    mdui.$("#type-selector").append(html)
    mdui.$("#type-selector").mutation()
}

function getHeightSelHtml(value, number) {
    return `<option value="${number}">${value}km</option>`
}

function fetchHeights() {
    document.querySelector("#height-selector").innerHTML = ''
    let types = funcInjector.GetFileHeight()
    types = types
        .toString()
        .slice(1, types.toString().length - 1)
        .replace(/\s+/g, '')
        .split(',')
    let html = ""
    //html = html + getHeightSelHtml(types[0], 0)
    for (let i = 0; i < types.length; i++) html = html + getHeightSelHtml((types[i]/1000).toFixed(3), i)
    mdui.$("#height-selector").append(html)
    mdui.$("#height-selector").mutation()
    document.querySelector("#height-selector").value = types.length-1;
}


// 通过value动态生成文杰列表项
function getFileListHtml(value) {
    return `<div><li class="mdui-list-item mdui-ripple file-item" onclick="fileChangeHandler('` + value + `')">${value}</li>
<li class="mdui-divider"></li></div>`
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

    if (limit_file[0].length === 4)
        params.time = limit_file[0].substr(0, 2) + "月" + limit_file[0].substr(2, 2) + "日"
    else if (limit_file[0].length === 6)
        params.time = limit_file[0].substr(0, 2) + "月" + limit_file[0].substr(2, 2) + "日" + limit_file[0].substr(4, 2) + ":00"
    else
        params.time = limit_file[0].substr(0, 4) + "年" + limit_file[0].substr(4, 2) + "月" + limit_file[0].substr(6, 2) + "日" + limit_file[0].substr(8, 2) + ":00"
    fetchHeights()
    document.querySelector("#latLb-input").value=Math.min(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#latLb-input").min=Math.min(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#latLb-input").max=Math.max(parseFloat(limit_file[1]), parseFloat(limit_file[2])).toFixed(1)
    document.querySelector("#lonLb-input").value=Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    document.querySelector("#lonLb-input").min=Math.min(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
    document.querySelector("#lonLb-input").max=Math.max(parseFloat(limit_file[3]), parseFloat(limit_file[4])).toFixed(1)
}

// 动态添加文件列表组件
function fetchFileList() {
    document.querySelector("#file-list").innerHTML = ''
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
        xData.push(lat[x].toFixed(1));
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

    for (let y = 0; y < rawData[0].length;  y++ ) yData.push(lon[y].toFixed(1));
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
    let height=JSON.parse(funcInjector.GetFileHeight())
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
    if(params.type=="U"||params.type=="O")
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
function fileFilter(queryString,filename){

}

// 文件搜索功能
document.querySelector('#file-filter-btn').addEventListener('click',(event)=>{
    let queryStr = document.querySelector('#file-filter-input').value
    if(queryStr===''){
        let files = document.querySelectorAll('.file-item')
        for(let file of files){
            file.hidden=false
        }
    }else{
        let files = document.querySelectorAll('.file-item')
        for(let file of files){
            // file.hidden = file.innerHTML.indexOf(query)===-1
            file.hidden = fileFilter(queryStr,file.innerHTML)
        }
    }

})
document.querySelector('#file-filter-reset-btn').addEventListener('click',(event)=>{
    let files = document.querySelectorAll('.file-item')
    for(let file of files){
        file.hidden=false
    }
})
