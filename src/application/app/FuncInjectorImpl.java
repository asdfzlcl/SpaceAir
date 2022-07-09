package application.app;


import java.io.IOException;
import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.Stage;
import setting.Setting;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.util.IO;
import util.DialogHelper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

    //获取对应文件属性目录
    public List<String> GetDictiontary(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);

        try {
            //FileHelper.getInstance().checkStatus();
        } catch (Exception e) {
            e.printStackTrace();
            DialogHelper.popErrorDialog("大气温度(T)目录与大气密度(R)目录格式错误或目录下必须有对应文件！\n请更改设置路径后重新尝试。");
        }


        try {
            //nowDictionary = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (Exception e) {
            e.printStackTrace();
            DialogHelper.popErrorDialog("当前目录格式有误或目录为空！\n请检查路径设置！");
        }
        List<String> filedictionary=new ArrayList<>();
//        for(NetCDFFile f: nowDictionary){
//            filedictionary.add(f.getFileName());
//        }
        return filedictionary;
    }

    public Object GetFileInfo() {
        return Arrays.asList("T","U","R","O","V","H","rH");
    }
    public Object GetFileInformation() {
        return Arrays.asList("大气温度(T)","纬向风速(U)","大气密度(R)","垂直风速(O)","经向风速(V)","绝对湿度(H)","相对湿度(rH)");
    }
}
