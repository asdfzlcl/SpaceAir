// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    task: 0, type: "", time: "", height: 0, latLb: 0, latUb: 0, lonLb: 0, lonUb: 0, filename: 'U010100_大气密度(U)气候态.nc'//TODO 数据绑定, 改时间, 改limit
}

// 数据限制
limit = {
    heightLb: 0, heightUb: 90, latLb: 0, latUb: 60, lonLb: 60, lonUb: 120,
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
    return params.height >= limit.heightLb && params.height <= limit.heightUb && params.lonLb >= limit.lonLb && params.lonLb < params.lonUb && params.lonUb <= limit.lonUb && params.latLb >= limit.latLb && params.latLb < params.latUb && params.latUb <= limit.latUb
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


// 通过value动态生成文杰列表项
function getFileListHtml(value) {
    return `<li class="mdui-list-item mdui-ripple" onclick="fileChangeHandler('` + value + `')">${value}</li>
<li class="mdui-divider"></li>`
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
    limit.latLb = Math.min(parseFloat(limit_file[1]),parseFloat(limit_file[2]))
    limit.latUb = Math.max(parseFloat(limit_file[1]),parseFloat(limit_file[2]))
    limit.lonLb = Math.min(parseFloat(limit_file[3]),parseFloat(limit_file[4]))
    limit.lonUb = Math.max(parseFloat(limit_file[3]),parseFloat(limit_file[4]))
    limit.heightLb = Math.min(parseFloat(limit_file[5]),parseFloat(limit_file[6])).toFixed(2)
    limit.heightUb = Math.max(parseFloat(limit_file[5]),parseFloat(limit_file[6])).toFixed(2)
    if(limit_file[0].length==4)
        params.time = limit_file[0].substr(0,2)+"月"+limit_file[0].substr(2,2)+"日"
    else if(limit_file[0].length==6)
        params.time = limit_file[0].substr(0,2)+"月"+limit_file[0].substr(2,2)+"日"+limit_file[0].substr(4,2)+":00"
    else
        params.time = limit_file[0].substr(0,4)+"年"+limit_file[0].substr(4,2)+"月"+limit_file[0].substr(6,2)+"日"+limit_file[0].substr(8,2)+":00"
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
    for (let i = 0; i < files.length; i++) html = html + getFileListHtml(files[i])
    mdui.$("#file-list").append(html)
    mdui.$("#file-list").mutation()
}

// TODO 动态横纵轴、经纬度
function drawHeatMap(rawData) {
    //TODO 横纵坐标应按照经纬度重新生成
    let xData = []
    let yData = []
    let data = []
    let min = rawData[0][0]
    let max = rawData[0][0]
    let sum = 0
    let count = 0
    //采样（为了保证速度）
    let cx = 2, cy = 2;
    if (rawData[0].length > 1400) {
        cx = 3;
        cy = 3;
    }
    for (let x = 0; x + cx < rawData.length; x = x + cx) {
        xData.push(x);
        for (let y = 0; y + cy < rawData[0].length; y = y + cy) {
            let now = 0;
            for (let i = 0; i < cx; i++) for (let j = 0; j < cy; j++) now = now + rawData[x + i][y + j]
            rawData[x][y] = now / (cx * cy);
            max = Math.max(rawData[x][y], max)
            min = Math.min(rawData[x][y], min)
            sum += rawData[x][y]
            count++
            data.push([x / cx, y / cy, rawData[x][y]])
        }
    }
    statics.min = min
    statics.max = max
    statics.avg = sum / count
    let sum_avg = 0
    for (let x = 0; x + cx < rawData.length; x = x + cx) {
        for (let y = 0; y + cy < rawData[0].length; y = y + cy) {
            sum_avg += (rawData[x][y] - sum / count) * (rawData[x][y] - sum / count)
        }
    }
    statics.sdev = Math.sqrt(sum_avg / count)

    for (let y = 0; y + cy < rawData[0].length; y = y + cy) yData.push(y);
    let option = {
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                saveAsImage: {}
            }
        },
        tooltip: {}, xAxis: {
            type: 'category', data: xData, name: '经度 (°E)'
        }, yAxis: {
            type: 'category', data: yData, name: '纬度 (°N)'
        }, visualMap: {
            min: min, max: max, calculable: true, realtime: false, inRange: {
                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
        }, series: [{
            name: '值', type: 'heatmap', data: data, emphasis: {
                itemStyle: {
                    borderColor: '#333', borderWidth: 1
                }
            }, progressive: 10000, animation: false
        }]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.setOption({})
    chartDom.setOption(option)
}

function drawContourMapData(rawData) {
    let data = []
    let ydata = []
    let min = rawData[0]
    let max = rawData[0]
    let sum = 0
    let count = 0
    for (let i = 0; i < rawData.length; i++) {
        ydata.push(i)
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
    let option = {
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                saveAsImage: {}
            }
        },
        legend: {
            data: ['高度 (km) vs. 温度 (K)']
        }, tooltip: {
            trigger: 'axis', formatter: '温度 : <br/>{b}km : {c}K'
        }, xAxis: {
            type: 'value',name:'温度 (K)'
        }, yAxis: {
            type: 'category', axisLine: {onZero: false}, name:'高度 (km)', boundaryGap: false, data: ydata
        }, visualMap: {
            min: min, max: max, calculable: true, realtime: true, inRange: {
                color: ['#313695', '#4575b4', '#74add1',]
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
    chartDom.setOption({})
    chartDom.setOption(option)
}
