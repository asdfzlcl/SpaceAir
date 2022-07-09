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


}
