// 参数数据
// 该对象的所有属性getter均被绑定到页面
params = {
    type: 0, pictype: 0, filename: "",filepath:""
}

// 统计数据
// 该对象的所有属性setter均被绑定到页面
statics = {
    min: 0, max: 0, avg: 0, sdev: 0
}

const PicType ={
    Time_F10:0, Time_Ap:1,Time_Density:2,TIME_TECU:3,Location_TECU:4,Temp_Height:5,Time_Altitude:6
}

// window.addEventListener("error",(e) => {
//     alert(e.error)
//     funcInjector.log('errorMessage: ' + e); // 异常信息
// },true)
//
window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
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
             rawData = funcInjector.getTIME_TECUData(params)
            break
        case PicType.Temp_Height:
            rawData = funcInjector.getTemp_HeightData(params)
            break
        case PicType.Time_Altitude:
            rawData = funcInjector.getTime_AltitudeMapData(params)
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

function fileChangeHandler(filename, path) {
    mdui.alert(getObjectURL(filename))
    params.filename = filename.name
    params.filepath = getObjectURL(filename)
    document.querySelector(".file-name").innerHTML = filename.name
    document.querySelector(".file-path").innerHTML = path
}

function browserRedirect(){
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
    if (isWin) return  "Win"
    return "other";
}

function GetFile() {
    fileURL = funcInjector.chooseFile()
    document.querySelector(".file-detail").style.display = 'inline'
    document.querySelector(".file-path").innerHTML = fileURL
    var Splitter = browserRedirect() =="Win"? '\\':'/'
    last = fileURL.lastIndexOf(Splitter)
// 截取文件名称和后缀
    fileName = fileURL.substring(last+1)
    params.filename = fileName
    params.filepath = fileURL
    document.querySelector(".file-name").innerHTML = fileName
}
function renewEcharts() {

}
function getSelectorHTML(data)  {
    let html = ' <select class="mdui-select" mdui-select id="selector" onchange="renewEcharts()">'
    for (let i = 0; i < data.length; i += 1) {
        let temp = data[i]
        funcInjector.log(temp)
        html = html + `<option value=` + data[i] + `> ${temp} </option>`
    }
    html += "</select>"
    return html
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
            switch (params.pictype) {
                case 0:
                    drawLinearMapData(rawData,"太阳地磁指数一维图","Time(Year)","F10.7(sfu)")
                    break
                case 1:
                    drawLinearMapData(rawData,"电离层参数一维图","Time(Year)","Ap")
                    break
                case 2:
                    drawLinearVerticalMapData(rawData)
                    break
                case 3:
                    drawHeatMapData(rawData)
                    break
                case 4:
                    drawHeatMapData(rawData)
                case 5:
                    let timeSeries = rawData["timeSeries"]
                    let legends = []
                    for(i in timeSeries) {
                        let temp = i + "("
                        for(j in timeSeries[i]) {
                            temp += timeSeries[i][j] == true?j:""
                        }
                        temp += ")"
                        legends.push(temp)
                    }

                    // document.querySelector("#botton-type").innerHTML = bottontype[0]
                    //mdui.$("#botton-list").mutation()
                   let html =   getSelectorHTML(legends)

                    mdui.$(".charts-selector").append(html)
                    mdui.$(".charts-selector").mutation()
                    // drawLinearVerticalMapData(rawData)
                case 6:
                    drawHeatMapData(rawData)
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
function drawLinearMapData(rawData,title,xname,yname) {
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
                    title:""
                },
                restore: {
                    title: '还原配置项'
                },
                dataView: {
                    title: '数据视图工具',
                    lang : ['数据视图', '关闭', '刷新'],
                    backgroundColor  : "f2eef9",

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
    funcInjector.getLocation_TECUData(params)
   //  var html = `<label class="mdui-radio">
    drawHeatMapData()
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

function getNoiseHelper() {
    class Grad {
      constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
      dot2(x, y) {
        return this.x * x + this.y * y;
      }
      dot3(x, y, z) {
        return this.x * x + this.y * y + this.z * z;
      }
    }
    const grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1)
    ];
    const p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
      36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
      234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
      88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
      134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
      230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
      1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
      116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
      124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
      47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
      154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
      108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
      242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
      239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
      50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
      141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    // To remove the need for index wrapping, double the permutation table length
    let perm = new Array(512);
    let gradP = new Array(512);
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    function seed(seed) {
      if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }
      seed = Math.floor(seed);
      if (seed < 256) {
        seed |= seed << 8;
      }
      for (let i = 0; i < 256; i++) {
        let v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed >> 8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
      }
    }
    seed(0);
    // ##### Perlin noise stuff
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(a, b, t) {
      return (1 - t) * a + t * b;
    }
    // 2D Perlin Noise
    function perlin2(x, y) {
      // Find unit grid cell containing point
      let X = Math.floor(x),
        Y = Math.floor(y);
      // Get relative xy coordinates of point within that cell
      x = x - X;
      y = y - Y;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255;
      Y = Y & 255;
      // Calculate noise contributions from each of the four corners
      let n00 = gradP[X + perm[Y]].dot2(x, y);
      let n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
      let n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
      let n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
      // Compute the fade curve value for x
      let u = fade(x);
      // Interpolate the four results
      return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
    }
    return {
      seed,
      perlin2
    };
  }

//垂直折线图
function drawLinearVerticalMapData(rawData) {
    let option = {
        legend: {
            data: ['临近空间环境一维图', 'x']
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

let noise = getNoiseHelper();
let xData = [];
let yData = [];
noise.seed(Math.random());
function generateData(theta, min, max) {
  let data = [];
  for (let i = 0; i <= 200; i++) {
    for (let j = 0; j <= 100; j++) {
      // let x = (max - min) * i / 200 + min;
      // let y = (max - min) * j / 100 + min;
      data.push([i, j, noise.perlin2(i / 40, j / 20) + 0.5]);
      // data.push([i, j, normalDist(theta, x) * normalDist(theta, y)]);
    }
    xData.push(i);
  }
  for (let j = 0; j < 100; j++) {
    yData.push(j);
  }
  return data;
}

//热力图
function drawHeatMapData(rawData) {
    let seriesData = []


    for(let i in rawData) {
        funcInjector.log(i.toString())
        if(i != "legend") {
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

    funcInjector.log(rawData["legend"].toString())
    let data = generateData(2, -5, 5);
    let option = {
        tooltip: {},
        legend: {
            type: 'scroll',
            // selector: ['all', 'inverse'] ,
            data: rawData["legend"],
            selectedMode : 'single'
        },
        toolbox: {
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none',
                    title:""
                },
                restore: {
                    title: '还原配置项'
                },
                dataView: {
                    title: '数据视图工具',
                    lang : ['数据视图', '关闭', '刷新'],
                    backgroundColor  : "f2eef9",

                },
                saveAsImage: {
                    title: '另存为图像'
                }
            }
        },
        xAxis: {

          type: 'category',
            show:true
        },
        yAxis: {
          type: 'category',
            show:true,
            inverse: true
        },
        visualMap: {
          min: 0,
          max: 800,
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
