package application.app;


import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import javafx.util.Pair;
import setting.Setting;
import util.DialogHelper;
import util.FileType;
import org.json.simple.JSONObject;
import util.fileType.IPFile;
import util.fileType.SATFile;
import util.fileType.SEFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.FutureTask;

import static java.lang.Thread.sleep;
import static util.fileType.BaseFile.readFile;

public class FuncInjectorImpl implements FuncInjector {

    private List<Double> heights =null;
    private List<Double> Latitudes=null;
    private List<Double> Longitudes=null;

    public void changePath(){
        Platform.runLater(()->{
            Setting setting = new Setting();
            Stage settingStage = new Stage();
            try {
                setting.start(settingStage);
                settingStage.showAndWait();
            }catch (Exception e){
                e.printStackTrace();
                DialogHelper.popErrorDialog("致命错误！请重启软件。");
            }
        });
    }

    /**
     * @return filePath, String 表示文件绝对路径, 直接在js文件中获取, 之后可以调用其他方法获取数据
     * */
    public String chooseFile(){
        final FutureTask popChooseFile = new FutureTask(() -> new FileChooser().showOpenDialog(new Stage()).getAbsolutePath());
        Platform.runLater(popChooseFile);
        String filePath = "";
        try {
            filePath = (String) popChooseFile.get();
        }catch (Exception e){
            e.printStackTrace();
            DialogHelper.popErrorDialog("未选择文件！");
        }
        System.out.println(filePath);
        return filePath;
    }

/*
太阳和地磁指数
大气密度变化规律
电离层参数
临近空间环境
*/
//获得属性
    @Override
    public Object GetFileInfo() {
        return Arrays.asList("0","1","2","3");
    }
    public Object GetFileInformation(){
        return Arrays.asList("太阳和地磁指数","大气密度变化规律","电离层参数","临近空间环境");
    }
    //获取按键属性
    public Object GetBottonType(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        String type = inputParam.getType();
        if(Objects.equals(type, "0"))
        {
            return Arrays.asList("太阳和地磁指数","太阳指数","0","地磁指数","1");
        }
        if(Objects.equals(type, "1"))
        {
            return Arrays.asList("大气密度","大气密度变化","2");
        }
        if(Objects.equals(type, "2"))
        {//电离层参数
            return Arrays.asList("电离层参数","一维图","3","二维图","4");
        }
        if(Objects.equals(type, "3"))
        {//临近空间环境
            return Arrays.asList("临近空间环境","一维图","5","二维图","6");
        }
        return Arrays.asList("临近空间环境","一维图","2","临近空间环境二维图","3");
    }


    //获取对应文件属性目录
    public List<String> GetDictiontary(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<String> filedictionary=new ArrayList<>();
        for(int i = 0;i<=Integer.parseInt(inputParam.getType());i++){
            filedictionary.add("File"+i);
        }
        //todo: 获取文件目录
//        try {
//            filedictionary = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());获取文件列表，格式为List<String>
//        } catch (Exception e) {
//            e.printStackTrace();
//            DialogHelper.popErrorDialog("当前目录格式有误或目录为空！\n请检查路径设置！");
//        }
        return filedictionary;
    }


    public JSONObject getTime_F10Data(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        List<String> timeSeries = new ArrayList<>();
        ArrayList<Double> data = new ArrayList<>();
        SATFile sat = (SATFile) readFile(inputParam.filepath, FileType.SATFile);
        timeSeries = sat.getTimeSeries();
        data = sat.getF10Series();
        HashMap ret = new HashMap();
        ret.put("x",timeSeries);
        ret.put("y",data);
        JSONObject json =  new JSONObject(ret);
        return json;
    }

    public JSONObject getTime_ApData(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        List<String> timeSeries = new ArrayList<>();
        ArrayList<Double> data = new ArrayList<>();
        SATFile sat = (SATFile) readFile(inputParam.filepath, FileType.SATFile);
        timeSeries = sat.getTimeSeries();
        data = sat.getAPSeries();
        HashMap ret = new HashMap();
        ret.put("x",timeSeries);
        ret.put("y",data);
        JSONObject json =  new JSONObject(ret);
        return json;
    }

//    public String getTime_DensityData(JSObject params) throws IOException {
//        InputParam inputParam = new InputParam(params);
//        System.out.println(inputParam);
//        ArrayList<String> timeSeries = new ArrayList<>();
//        ArrayList<Double> data = new ArrayList<>();
//        ADFile ad = (ADFile) readFile(inputParam.filepath, FileType.ADFile);
//        timeSeries = ad.getTimeSeries();
//        data = ad.getModelDataSeries();
//        System.out.println(timeSeries);
//        System.out.println(data);
//        return data.toString();
//    }
//

    public JSONObject getLocation_TECUData(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        ArrayList<String> timeSeries;
        ArrayList<ArrayList<ArrayList<Double>>> data;
        IPFile ip = (IPFile) readFile(inputParam.filepath, FileType.IPFile);
        timeSeries = ip.getTimeSeries();
        data = ip.getDataSeries();
        ArrayList<Double> longSeries = new ArrayList<Double>();
        for (int i = -180;i <= 180 ;i+=5) {
            longSeries.add((double) i);
        }
        ArrayList<Double> latiSeries = ip.getPositionSeries();
        HashMap ret = new HashMap();
        for(int i= 0;i< data.size();i++) {
            ArrayList dataOfEachTime = new ArrayList<>();
            for(int j = 0; j< data.get(0).size(); j++) {
                for(int k = 0; k< data.get(0).get(0).size(); k++) {
                    ArrayList temp = new ArrayList<>();
                    temp.add(longSeries.get(k));
                    temp.add(latiSeries.get(j));
                    temp.add(data.get(i).get(j).get(k));
                    System.out.println(temp);
                    dataOfEachTime.add(temp);
                }
            }
            ret.put(timeSeries.get(i),dataOfEachTime);
        }
        System.out.println(timeSeries);
        ret.put("legend",timeSeries);
        JSONObject json =  new JSONObject(ret);
        return json;
    }

//    public String getTIME_TECUData(JSObject params) throws IOException {
//        InputParam inputParam = new InputParam(params);
//        System.out.println(inputParam);
//        ArrayList<String> timeSeries = new ArrayList<>();
//        ArrayList<Double> data = new ArrayList<>();
//        ADFile ad = (ADFile) readFile(inputParam.filepath, FileType.ADFile);
//        timeSeries = ad.getTimeSeries();
//        data = ad.getModelDataSeries();
//        System.out.println(timeSeries);
//        System.out.println(data);
//        return data.toString();
//    }
//
    public JSONObject getTemp_HeightData(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        ArrayList<ArrayList<String>> timeSeries;
        ArrayList<ArrayList<ArrayList<Pair<Double, Double>>>> data;
        SEFile se = (SEFile) readFile(inputParam.filepath, FileType.SEFile);
        ArrayList<String> stationSeries = se.getStationSeries();
        timeSeries = se.getTimeSeries();
        data = se.getDataSeries();
        ArrayList<Double> longSeries = new ArrayList<Double>();
        System.out.println(stationSeries);
        System.out.println(timeSeries);
        System.out.println(data);

        HashMap<String,HashMap> timeRawData = new HashMap();
        for (int i =0; i<timeSeries.size();i++) {
            for (String time:timeSeries.get(i)) {
                if(timeRawData.containsKey(time))  {
                    timeRawData.get(time).put(stationSeries.get(i),true);
                    continue;
                } else {
                    HashMap temp = new HashMap();
                    temp.put(stationSeries.get(i),true);
                    timeRawData.put(time,temp);
                }
            }
        }
        System.out.println(timeRawData);
        HashMap ret = new HashMap();
        ret.put("timeSeries",timeRawData);
        JSONObject json =  new JSONObject(ret);
        return json;
    }
//
//    public String getTime_AltitudeMapData(JSObject params) throws IOException {
//        InputParam inputParam = new InputParam(params);
//        System.out.println(inputParam);
//        ArrayList<String> timeSeries = new ArrayList<>();
//        ArrayList<Double> data = new ArrayList<>();
//        ADFile ad = (ADFile) readFile(inputParam.filepath, FileType.ADFile);
//        timeSeries = ad.getTimeSeries();
//        data = ad.getModelDataSeries();
//        System.out.println(timeSeries);
//        System.out.println(data);
//        return data.toString();
//    }

    public void log(String info){

        System.out.println(info);
    }



}
