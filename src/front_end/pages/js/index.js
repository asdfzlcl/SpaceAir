//console.log(document.querySelector("input[name=group1]:checked").value)
document.querySelector("input[type=date]").value = '2021-12-05'
let params = {
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

let activePage = 1;

function getData(){
    alert("Hello world!")
    let data = funcInjector.GetData(params)
    alert(data.toString())
}

document.querySelector("#submit-param").onclick=getData
