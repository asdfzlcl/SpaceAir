params = {
    task:0,
    type:"",
    time:0,
    height:0,
    days:0,
    year:0,
    latLb:0,
    latUb:0,
    lonLb:0,
    lonUb:0
}
// 异步获取数据，避免UI阻塞
async function getData(){
    let rawData = {}
    //TODO 这里之后用switch
    if(params.task===0)
        rawData = funcInjector.GetHeatMapData(params)
    else if(params.task===1)
        rawData = funcInjector.GetContourMapData(params)
    else
        rawData = funcInjector.GetContourMapData(params)
    return JSON.parse(rawData)
}

// 绑定提交参数事件
document.querySelector("#submit-param").onclick=()=>{
    getData()
        .then(rawData => {
            //TODO 这里之后用switch
            if(params.task===0)
                drawHeatMap(rawData)
            else if(params.task===1)
                drawContourMapData(rawData)
            else
                drawContourMapData(rawData)
        })
        .catch(e=> {
            mdui.alert(e.toString())
        })
}

// 通过value动态生成组件
function getTypeSelHtml(value,isChecked){
    return `<label class="mdui-radio">
<input type="radio" name="type-selector" value="${value}"
${isChecked?"checked":""} />
<i class="mdui-radio-icon"></i>
${value}
</label>`
}

// 动态添加type组件
function fetchTypes(){
    let types = funcInjector.GetFileInfo()
    types = types
        .toString()
        .slice(1,types.toString().length-1)
        .replace(/\s+/g,'')
        .split(',')
    let html = ""
    html = html + getTypeSelHtml(types[0], true)
    for (let i = 1; i < types.length; i++)
        html = html + getTypeSelHtml(types[i], false)
    mdui.$("#type-selector").append(html)
    mdui.$("#type-selector").mutation()
}

function drawHeatMap(rawData){
    //TODO 横纵坐标应按照经纬度重新生成
    let xData=[]
    let yData=[]
    let data = []
    let min = rawData[0][0]
    let max = rawData[0][0]
    for(let x=0;x<rawData.length;x++){
        xData.push(x);
        for(let y=0;y<rawData[0].length;y++)
        {
            if(min>rawData[x][y])
                min=rawData[x][y]
            if(max<rawData[x][y])
                max=rawData[x][y]
            data.push([x,y,rawData[x][y]])
        }
    }
    for(let y=0;y<rawData[0].length;y++)
        yData.push(y);
    let option = {
        tooltip: {},
        xAxis: {
            type: 'category',
            data: xData
        },
        yAxis: {
            type: 'category',
            data: yData
        },
        visualMap: {
            min: min,
            max: max,
            // type: 'piecewise',
            // splitNumber: 11,
            calculable: true,
            realtime: false,
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
        series: [
            {
                name: 'Gaussian',
                type: 'heatmap',
                data: data,
                emphasis: {
                    itemStyle: {
                        borderColor: '#333',
                        borderWidth: 1
                    }
                },
                progressive: 10000,
                animation: false
            }
        ]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.setOption(option)
}

function drawContourMapData(rawData){
    let data = []
    let ydata = []
    let min = rawData[0]
    let max = rawData[0]
    for(let i=0;i<rawData.length;i++) {
        ydata.push(i)
        data.push(rawData[i])
        if(rawData[i]>max)
            max=rawData[i]
        if(rawData[i]<min)
            min=rawData[i]
    }
    let option = {
        //TODO 修改坐标轴文字标题等
        legend: {
            data: ['Altitude (km) vs. temperature (°C)']
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
            data: ydata
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
                ]
            }
        },
        series: [
            {
                name: 'Altitude (km) vs. temperature (°C)',
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
                data: data
            }
        ]
    };
    let chartDom = echarts.init(document.querySelector("#chart"));
    chartDom.setOption(option)
}
