package application.app;


import application.app.messages.InputParam;
import com.teamdev.jxbrowser.chromium.JSArray;
import com.teamdev.jxbrowser.chromium.JSObject;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import javafx.util.Pair;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import setting.Setting;
import util.DialogHelper;
import util.FileType;
import util.fileType.ADFile;
import util.fileType.IPFile;
import util.fileType.SATFile;
import util.fileType.SEFile;
import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.*;
import java.util.concurrent.FutureTask;

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



    public void Base64ToImage(String base64String,String timeData) {
        try {
            Date date = new Date(); SimpleDateFormat dateFormat= new
                    SimpleDateFormat("yyyyMMddhhmmss");
            String imagePath = "." + File.separator + "temp" + File.separator + timeData + "-" +dateFormat.format(date)  +  UUID.randomUUID()+ ".png";
            File file = new File(imagePath);
            boolean FileExist = false;
            // 创建文件
            try {
                FileExist = file.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
            if (FileExist){
                // 解密
                Base64.Decoder decoder = Base64.getDecoder();
                // 去掉base64前缀 data:image/jpeg;base64,
                base64String = base64String.substring(base64String.indexOf(",", 1) + 1, base64String.length());
                byte[] b = decoder.decode(base64String);
                // 处理数据
                for (int i = 0; i < b.length; ++i) {
                    if (b[i] < 0) {
                        b[i] += 256;
                    }
                }
                // 保存图片
                try {
                    FileOutputStream out = new FileOutputStream(file);
                    out.write(b);
                    out.flush();
                    out.close();
                    // 写入成功返回文件路径
                } catch (FileNotFoundException e) {

                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }

    }

    public void createVideo(JSArray imgList,JSArray timeData) {

        String directoryPath =  "." + File.separator + "temp" + File.separator;
        String fileSuffix = ".png";

        File directory = new File(directoryPath);
        File[] files = directory.listFiles();
        ArrayList<File> imgFiles = new ArrayList<File>();


        for (File file: Objects.requireNonNull(directory.listFiles())) {
            if (!file.isDirectory()) {
                file.delete();
            }
        }


        for (int i =0;i<imgList.length();i++) {
            Base64ToImage(String.valueOf(imgList.get(i)), String.valueOf(timeData.get(i)));
        }



        for (File file : files) {
            System.out.println(file.getName());
            if (file.getName().endsWith(fileSuffix)) {
                imgFiles.add(file);
            }
        }

        Collections.sort(imgFiles, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                String name1 = o1.getName();
                String name2 = o2.getName();
                System.out.println(name1);
                System.out.println(name2);
                String[] str1 = name1.split("-");
                String[] str2 = name2.split("-");
                Date date1 = new Date(
                        Integer.parseInt(str1[0].substring(0,4)),
                        Integer.parseInt(str1[0].substring(4,6)),
                        Integer.parseInt(str1[1].substring(0,2)),
                        Integer.parseInt(str1[1].substring(2,4)),
                        Integer.parseInt(str1[1].substring(4,6)),
                        Integer.parseInt(str1[1].substring(6,8)));
                Date date2 = new Date(
                        Integer.parseInt(str2[0].substring(0,4)),
                        Integer.parseInt(str2[0].substring(4,6)),
                        Integer.parseInt(str2[1].substring(0,2)),
                        Integer.parseInt(str2[1].substring(2,4)),
                        Integer.parseInt(str2[1].substring(4,6)),
                        Integer.parseInt(str2[1].substring(6,8)));
                return date1.compareTo(date2);
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
                IPFile sat = (IPFile) readFile(filePath, FileType.IPFile);
                dest = "." + File.separator+ "data" +File.separator + "电离层参数" +File.separator;
            } else if (Objects.equals(type, "3")) {
                SEFile sat = (SEFile) readFile(filePath, FileType.SEFile);
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
            sourceChannel.close();
            destChannel.close();
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
        longSeries = ip.getLongitudeSeries();
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
                    dataOfEachTime.add(temp);
                }
            }
            ret.put(timeSeries.get(i),dataOfEachTime);
        }
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
        longSeries = ip.getLongitudeSeries();
        ArrayList<Double> latiSeries = ip.getPositionSeries();
        HashMap ret = new HashMap();
        ret.put("longSeries",longSeries);
        ret.put("latiSeries",latiSeries);
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
        longSeries = ip.getLongitudeSeries();
        ArrayList<Double> latiSeries = ip.getPositionSeries();
        HashMap ret = new HashMap();
        ArrayList dataOfEachTime = new ArrayList<>();

        for(int i= 0;i< data.size();i++) {
            for(int j = 0; j< data.get(i).size(); j++) {
                for(int k = 0; k< data.get(i).get(j).size(); k++) {
                    if(Objects.equals(latiSeries.get(j), latitude) && Objects.equals(longSeries.get(k), longitude)) {
                        ArrayList temp = new ArrayList<>();
                        temp.add(timeSeries.get(i));
                        temp.add(data.get(i).get(j).get(k));
                        dataOfEachTime.add(temp);
                    }
                }
            }
        }
        ret.put("data",dataOfEachTime);
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


    public int deleteHisFile(JSArray fileList){
        try {
            for (int i =0;i<fileList.length();i++) {
                System.out.println(String.valueOf(fileList.get(i)));
                File file = new File(String.valueOf(fileList.get(i)));
                System.out.println(file.delete());

            }
        }  catch (Exception e){
        e.printStackTrace();
       return 1;
    }
        return 0;
    }



}
