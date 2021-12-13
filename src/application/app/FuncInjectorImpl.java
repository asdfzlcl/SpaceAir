package application.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.Stage;
import setting.Setting;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.util.IO;
import util.DialogHelper;
import util.FileHelper;
import util.NetCDFFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FuncInjectorImpl implements FuncInjector {

    private List<NetCDFFile> nowDictionary=null;
    private List<Double> heights =null;
    private List<Double> Latitudes=null;
    private List<Double> Longitudes=null;
    @Override
    public String GetHeatMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Float>> data = new ArrayList<>(200);
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), "");
        try {
            data = FileHelper.getInstance().getDataSetVarLevel(file, inputParam.getHeight());
        } catch (IOException | InvalidRangeException e) {
            DialogHelper.popErrorDialog("当前文件已不存在！\n请重启软件刷新文件目录重新尝试。");
        }
        // end test

        return data.toString();
    }

    @Override
    public String GetContourMapData(JSObject params) {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<Float> data = new ArrayList<>();
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), "");
        try {
            data = FileHelper.getInstance().getDataSetVarCoordinate(file, inputParam.getLatLb(),inputParam.getLonLb());
        } catch (IOException | InvalidRangeException e) {
            DialogHelper.popErrorDialog("当前文件已不存在！\n请重启软件刷新文件目录重新尝试。");
        }
        return data.toString();
    }

    public void changePath(){
        Platform.runLater(()->{
            Setting setting = new Setting();
            Stage settingStage = new Stage();
            try {
                setting.start(settingStage);
                settingStage.showAndWait();
            }catch (Exception e){
                DialogHelper.popErrorDialog("致命错误！请重启软件。");
            }
        });
    }

    //获取对应文件属性目录
    public List<String> GetDictiontary(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);

        int status = 0;
        try {
            status = FileHelper.getInstance().checkStatus();
        } catch (Exception e) {
            DialogHelper.popErrorDialog("大气温度(T)目录与大气密度(R)目录格式错误或目录下必须有对应文件！\n请更改设置路径后重新尝试。");
        }
        if(status == -1){
            DialogHelper.popErrorDialog("大气温度(T)目录与大气密度(R)目录格式错误或目录下必须有对应文件！\n请更改设置路径后重新尝试。");
        }

        try {
            nowDictionary = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (IOException e) {
            DialogHelper.popErrorDialog("当前目录格式有误或目录为空！\n请检查路径设置！");
        }
        List<String> filedictionary=new ArrayList<>();
        for(NetCDFFile f: nowDictionary){
            filedictionary.add(f.getFileName());
        }
        return filedictionary;
    }

    //获取文件精度、纬度、高度上下限
    public String Getlimit(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<NetCDFFile> data = new ArrayList<>(200);
        try {
            data = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (IOException e) {
            DialogHelper.popErrorDialog("大气温度(T)目录与大气密度(R)目录格式错误或目录下必须有对应文件！\n请更改设置路径后重新尝试。");
        }
        return data.toString();
    }

    public String Getinformation(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<String> data = new ArrayList<>();

        Latitudes=FileHelper.getInstance().getLatitude();
        Longitudes=FileHelper.getInstance().getLongitude();
        heights =FileHelper.getInstance().getHighList();

        for(NetCDFFile f: nowDictionary){
            if(f.getFileName().equals(inputParam.getFilename())){
                data.add(f.getFileDate());
                break;
            }
        }
        data.add(Latitudes.get(0).toString());
        data.add(Latitudes.get(Latitudes.size()-1).toString());
        data.add(Longitudes.get(0).toString());
        data.add(Longitudes.get(Longitudes.size()-1).toString());
        data.add(heights.get(0).toString());
        data.add(heights.get(heights.size()-1).toString());
        return data.toString();
    }


    public String GetFileHeight()
    {
        return heights.toString();
    }

    public String GetFileLat()
    {
        return Latitudes.toString();
    }

    public String GetFileLon()
    {
        return Longitudes.toString();
    }

    @Override
    public Object GetFileInfo() {
        return Arrays.asList("U","R","T","O","V");
    }
}
