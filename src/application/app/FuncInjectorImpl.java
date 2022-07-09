package application.app;


import java.io.IOException;
import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.Stage;
import setting.Setting;
import util.DialogHelper;
import java.util.ArrayList;
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
        List<String> filedictionary=new ArrayList<>();
        return filedictionary;
    }

    //获取文件精度、纬度、高度上下限
    public String Getlimit(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<String> data = new ArrayList<>(200);
        return data.toString();
    }

    public String Getinformation(JSObject params){
        InputParam inputParam = new InputParam(params);
        //System.out.println(inputParam);
        List<String> data = new ArrayList<>();
        data.add("-90");
        data.add("90");
        data.add("-180");
        data.add("180");
//        data.add(Latitudes.get(0).toString());
//        data.add(Latitudes.get(Latitudes.size()-1).toString());
//        data.add(Longitudes.get(0).toString());
//        data.add(Longitudes.get(Longitudes.size()-1).toString());
        data.add(heights.get(0).toString());
        data.add(heights.get(heights.size()-1).toString());
        return data.toString();
    }


    public String GetFileHeight(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<String> data = new ArrayList<>();
        return data.toString();
    }

    public void StartExe(String adress)
    {
        Runtime rt = Runtime.getRuntime();
        try {
            rt.exec(adress);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public String GetFileLat()
    {
        return Latitudes.toString();
    }

    public String GetFileLon()
    {
        return Longitudes.toString();
    }
}
