package setting;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;
import util.*;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


/**
 * @author wxy
 * @description 启动窗口Controller类
 * @date 2021-12-07
 * */
public class SettingController {
    private ConfigFileHelper config;

    @FXML
    private VBox chooserBox;

    private final List<String> pathList = new ArrayList<>();

    public void init(){
        try {
            config = ConfigFileHelper.getInstance();
        } catch (IOException e) {
            DialogHelper.popErrorDialog("配置文件读写出错！\n请检查程序读写权限！");
        }

        for(int i = 0;i < FILE_TYPE.count;i ++){
            HBox currentHBox = new HBox();
            Label currentLabel = new Label(FILE_TYPE.sequence[i].name + "(" + FILE_TYPE.sequence[i] + ")数据文件路径选择：" );
            TextField currentField = new TextField();
            String set = config.getPathFromConfig(FILE_TYPE.sequence[i]);
            if(set == null){
                currentField.setText("首次开启程序，请选择正确的数据文件路径");
                pathList.add("");
            }else {
                currentField.setText(set);
                pathList.add(set);
            }
            Button currentButton = new Button("浏览");
            currentHBox.getChildren().add(currentLabel);
            currentHBox.getChildren().add(currentField);
            currentHBox.getChildren().add(currentButton);

            int finalI = i;
            currentButton.setOnMouseClicked(new EventHandler<MouseEvent>() {
                @Override
                public void handle(MouseEvent event) {
                    DirectoryChooser directoryChooser = new DirectoryChooser();
                    //TODO: change config
                    directoryChooser.setInitialDirectory(new File(config.getPathFromConfig(FILE_TYPE.sequence[finalI])));
                    File temp;
                    try {
                        temp = directoryChooser.showDialog(currentButton.getScene().getWindow());
                    }catch (IllegalArgumentException i){
                        directoryChooser.setInitialDirectory(new File(PathHelper.classBasePath));
                        temp = directoryChooser.showDialog(currentButton.getScene().getWindow());
                    }
                    if(temp != null){
                        currentField.setText(temp.getAbsolutePath());
                        pathList.set(finalI, temp.getAbsolutePath());
                    }
                }
            });
            chooserBox.getChildren().add(currentHBox);
        }
    }

    @FXML
    private void launch() {
        // 存储config信息
        for(int i = 0;i < FILE_TYPE.count; i ++){
            config.setPathToConfig(pathList.get(i), FILE_TYPE.sequence[i]);
        }
        try {
            config.store();
        }catch (IOException e){
            DialogHelper.popErrorDialog("配置文件读写出错！\n请检查程序读写权限！");
        }

        String[] paths = pathList.stream().toArray(String[]::new);
        FileHelper.setInstance(paths);
        try{
            FileHelper.getInstance().checkStatus();
        }catch (Exception e){
            e.printStackTrace();
            DialogHelper.popErrorDialog("路径配置错误，程序无法正常运行!\n请修改配置文件或重新修改路径!");
        }

        final Stage stage = (Stage)chooserBox.getScene().getWindow();
        stage.close();
    }


    @FXML
    private void exit() {
        final Stage stage = (Stage)chooserBox.getScene().getWindow();
        stage.close();
    }


}
