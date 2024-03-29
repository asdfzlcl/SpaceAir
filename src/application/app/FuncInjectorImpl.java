package application.app;


import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import javafx.application.Platform;
import javafx.stage.FileChooser;
import javafx.stage.Stage;
import setting.Setting;
import util.DialogHelper;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.atomic.AtomicReference;

import static java.lang.Thread.sleep;

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
            return Arrays.asList("太阳和地磁指数","太阳指数","0","地磁指数","0");
        }
        if(Objects.equals(type, "1"))
        {
            return Arrays.asList("大气密度","大气密度变化","0");
        }
        if(Objects.equals(type, "2"))
        {//电离层参数
            return Arrays.asList("电离层参数","一维图","1","二维图","4");
        }
        if(Objects.equals(type, "3"))
        {//临近空间环境
            return Arrays.asList("临近空间环境","一维图","2","二维图","3");
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

    //获取折线图数据
    public String GetLinearMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<Float> data = new ArrayList<Float>();
        //todo:获取数据
        for(int i=0; i<200; i++)
        {
            data.add((float)3*i*i-9*i+10);
        }

        return data.toString();
    }


    //获取热力图
    public String GetHeatMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Float>> data = new ArrayList<List<Float>>(200);

        for(int i=0; i<200; i++)
        {
            for(int j=0; j<20; j++)
                ((ArrayList)data.get(i)).add(j);
        }

        return data.toString();
    }
}
