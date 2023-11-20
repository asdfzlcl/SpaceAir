
const rootAPI = "http://localhost:8000/"


function pred(data,datatime) {
    try {
        axios.post(rootAPI + 'pred', {
            "model": "FEDformer",// str, enum of ["FEDformer","Informer","Autoformer"]
            "data": data, //float, length = 30
            "date": datatime  //str of datetime, length = 30
        })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (e) {
        mdui.alert(e)
    }

}