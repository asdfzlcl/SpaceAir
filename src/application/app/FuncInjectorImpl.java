package application.app;


import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import javafx.util.Pair;
import org.json.simple.JSONArray;
import setting.Setting;
import util.DialogHelper;
import util.FileType;
import org.json.simple.JSONObject;
import util.fileType.ADFile;
import util.fileType.IPFile;
import util.fileType.SATFile;
import util.fileType.SEFile;

import javax.swing.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
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



    public void test() {
//        FileSystemView fsv = FileSystemView.getFileSystemView();
        final FutureTask popChooseFile = new FutureTask(() -> new JFileChooser().showOpenDialog(null));
        Platform.runLater(popChooseFile);
    }


    /**
     * @return filePath, String 表示文件绝对路径, 直接在js文件中获取, 之后可以调用其他方法获取数据
     * */
    public String chooseFile(JSObject params){
        InputParam inputParam = new InputParam(params);
        String type = inputParam.getType();

        final FutureTask popChooseFile = new FutureTask(() -> new FileChooser().showOpenDialog(new Stage()).getAbsolutePath());
        Platform.runLater(popChooseFile);
        String filePath = "";
        try {
            filePath = (String) popChooseFile.get();
            String dest = new String();
            if(Objects.equals(type, "0")) {
                SATFile sat = (SATFile) readFile(filePath, FileType.SATFile);
               dest = "." + File.separator+ "data" +File.separator + "太阳和地磁指数" +File.separator;
            } else if (Objects.equals(type, "1")) {
                ADFile sat = (ADFile) readFile(filePath, FileType.ADFile);
                dest = "." + File.separator+ "data" +File.separator + "大气密度变化规律" +File.separator;
            } else if (Objects.equals(type, "2")) {
                SEFile sat = (SEFile) readFile(filePath, FileType.SEFile);
                dest = "." + File.separator+ "data" +File.separator + "电离层参数" +File.separator;
            } else if (Objects.equals(type, "3")) {
                IPFile sat = (IPFile) readFile(filePath, FileType.IPFile);
                dest = "." + File.separator+ "data" +File.separator + "临近空间环境" +File.separator;
            }
            SimpleDateFormat sdf= new SimpleDateFormat("yyyy-MM-dd") ;
            dest +=sdf.format(System.currentTimeMillis())+ File.separator;
            File file;
            file = new File(filePath);
            String fileName = file.getName();
            file = new File(dest);

            if (file.exists()) {
                System.out.println("路径已存在");
            } else {
                System.out.println("路径不存在");
                boolean created = file.mkdirs();
                if (created) {
                    System.out.println("路径创建成功");
                } else {
                    System.out.println("路径创建失败");
                }
            }

            dest += fileName;
            FileChannel sourceChannel = new FileInputStream(filePath).getChannel();
            FileChannel destChannel = new FileOutputStream(dest).getChannel();
            destChannel.transferFrom(sourceChannel, 0, sourceChannel.size());

        }catch (Exception e){
            e.printStackTrace();
            if(e.getMessage() == "错误的文件格式！" || e.getMessage() == "0") {
                DialogHelper.popErrorDialog("文件类型错误，请选择正确的文件格式！");
            } else {
                DialogHelper.popErrorDialog("未选择文件！");
            }
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

    public JSONObject getTime_DensityData(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        ArrayList<String> timeSeries = new ArrayList<>();
        ArrayList<Double> data = new ArrayList<>();
        ADFile ad = (ADFile) readFile(inputParam.filepath, FileType.ADFile);
        timeSeries = ad.getTimeSeries();
        data = ad.getDensDataSeries();
        HashMap ret = new HashMap();
        ret.put("x",timeSeries);
        ret.put("y",data);
        JSONObject json =  new JSONObject(ret);
        return json;
    }
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

    public JSONObject getTime_AltitudeData(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);

        ArrayList<ArrayList<ArrayList<Pair<Double, Double>>>> data;
        SEFile se = (SEFile) readFile(inputParam.filepath, FileType.SEFile);
        ArrayList<String> stationSeries = se.getStationSeries();
        ArrayList<ArrayList<String>> timeSeries = se.getTimeSeries();
        data = se.getDataSeries();
        HashMap ret = new HashMap();
        for (int i=0;i<stationSeries.size();i++) {
            ArrayList<ArrayList<String>> oneStationdata = new ArrayList<>();
            for(int j=0;j<timeSeries.get(i).size();j++) {

                for(int k=0 ; k<data.get(i).get(j).size();k++) {
                    ArrayList<String> onePointData = new ArrayList<>();
                    onePointData.add(timeSeries.get(i).get(j));
                    onePointData.add(String.valueOf(data.get(i).get(j).get(k).getKey()));
                    onePointData.add(String.valueOf(data.get(i).get(j).get(k).getValue()));
                    oneStationdata.add(onePointData);
                }

            }
            HashMap temp = new HashMap();
            ret.put(stationSeries.get(i),oneStationdata);
        }
        ret.put("legend",stationSeries);
        System.out.println(ret);
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
        HashMap<String,HashMap> timeRawData = new HashMap();
        for (int i =0; i<timeSeries.size();i++) {
            for (int j =0; j<timeSeries.get(i).size();j++) {
                String time = timeSeries.get(i).get(j);
                if(timeRawData.containsKey(time))  {
                    timeRawData.get(time).put(stationSeries.get(i),true);
                } else {
                    HashMap temp = new HashMap();
                    temp.put(stationSeries.get(i),true);
                    timeRawData.put(time,temp);
                }
            }
        }

        HashMap<Object, Object> dataRaw = new HashMap<>();
            for (int i =0; i<timeSeries.size();i++) {
                for (int j =0; j<timeSeries.get(i).size();j++) {
                    String time = timeSeries.get(i).get(j);
                    if(timeRawData.containsKey(time))  {
                        ArrayList<ArrayList<Double>> onestationData = new ArrayList<ArrayList<Double>>();
                        for (int k =0; k< data.get(i).get(j).size();k++) {
                            ArrayList<Double> onePointData = new ArrayList<Double>();
                            onePointData.add(data.get(i).get(j).get(k).getValue());
                            onePointData.add(data.get(i).get(j).get(k).getKey());
                            onestationData.add(onePointData);
                        }
                        timeRawData.get(time).put(stationSeries.get(i), onestationData);

                    } else {
                        HashMap temp = new HashMap();
                        ArrayList<ArrayList<Double>> onestationData = new ArrayList<ArrayList<Double>>();
                        for (int k =0; k< data.get(i).get(j).size();k++) {
                            ArrayList<Double> onePointData = new ArrayList<Double>();
                            onePointData.add(data.get(i).get(j).get(k).getValue());
                            onePointData.add(data.get(i).get(j).get(k).getKey());
                            onestationData.add(onePointData);
                        }
                        timeRawData.get(time).put(stationSeries.get(i), onestationData);
                        temp.put(stationSeries.get(i),onestationData);
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

    public JSONObject getPositionSelection(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        IPFile ip = (IPFile) readFile(inputParam.filepath, FileType.IPFile);
        ArrayList<Double> longSeries = new ArrayList<Double>();
        for (int i = -180;i <= 180 ;i+=5) {
            longSeries.add((double) i);
        }
        ArrayList<Double> latiSeries = ip.getPositionSeries();
        HashMap ret = new HashMap();
        ret.put("longSeries",longSeries);
        ret.put("latiSeries",latiSeries);
        System.out.println(ret);
        JSONObject json =  new JSONObject(ret);
        return json;
    }

    public static JSONArray hisFile = new JSONArray();


    public static void traverse(File dir) {
        if (dir == null && !dir.exists() || dir.isFile()) {
            return;
        }
        hisFile = new JSONArray();

        // 读取出该目录下的所有文件
        File[] files = dir.listFiles();

        for (File file : files) {
            // 如果是文件，加入到文件集合中否则加入到文件夹集合中
            HashMap temp = new HashMap();
            if (file.isFile()) {
                temp.put("fileName",file.getName());
                int lastIndex = file.getParent().lastIndexOf(File.separator);
                temp.put("fileTime",file.getParent().substring(lastIndex+1));
                System.out.println(temp);
                hisFile.add(temp);
            }

            if (file.isDirectory()) {
//                dirList.add(file.toString());
                traverse(file);
            }
        }
    }




    public ArrayList getHisFile(JSObject params) throws IOException {
        InputParam inputParam = new InputParam(params);
        String type = inputParam.getType();
        String dest = new String();
        if(Objects.equals(type, "0")) {
            dest = "." + File.separator+ "data" +File.separator + "太阳和地磁指数" +File.separator;
        } else if (Objects.equals(type, "1")) {
            dest = "." + File.separator+ "data" +File.separator + "大气密度变化规律" +File.separator;
        } else if (Objects.equals(type, "2")) {
            dest = "." + File.separator+ "data" +File.separator + "电离层参数" +File.separator;
        } else if (Objects.equals(type, "3")) {
            dest = "." + File.separator+ "data" +File.separator + "临近空间环境" +File.separator;
        }
        traverse(new File(dest));

        return hisFile;
    }


    public JSONObject getPositionedData(Double longitude,Double latitude,JSObject params) throws IOException {
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
        ArrayList dataOfEachTime = new ArrayList<>();
        System.out.println(data);
        System.out.println(data.size());
        System.out.println(timeSeries);
        for(int i= 0;i< data.size();i++) {
            for(int j = 0; j< data.get(i).size(); j++) {
                for(int k = 0; k< data.get(i).get(j).size(); k++) {
                    if(Objects.equals(latiSeries.get(j), latitude) && Objects.equals(longSeries.get(k), longitude)) {
                        ArrayList temp = new ArrayList<>();
                        temp.add(timeSeries.get(i));
                        temp.add(data.get(i).get(j).get(k));
                        System.out.println(temp);
                        dataOfEachTime.add(temp);
                    }
                }
            }
        }
        ret.put("data",dataOfEachTime);
        System.out.println(ret);
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
