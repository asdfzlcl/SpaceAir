package setting;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;
import util.*;
import java.io.File;
import java.io.IOException;


/**
 * @author wxy
 * @description 启动窗口Controller类
 * @date 2021-12-07
 * */
public class SettingController {

    private ConfigFileHelper config;

    @FXML
    private TextField T_file_path;
    @FXML
    private Button T_file_choose;
    @FXML
    private TextField U_file_path;
    @FXML
    private Button U_file_choose;
    @FXML
    private TextField R_file_path;
    @FXML
    private Button R_file_choose;
    @FXML
    private TextField O_file_path;
    @FXML
    private Button O_file_choose;
    @FXML
    private Button launchButton;
    @FXML
    private Button exitButton;

    public void init(){
        try {
            config = ConfigFileHelper.getInstance();
            if(config.getTPathFromConfig() == null){
                T_file_path.setText(FileHelper.classBasePath);
            }else{
                T_file_path.setText(config.getTPathFromConfig());
            }
            if(config.getUPathFromConfig() == null){
                U_file_path.setText(FileHelper.classBasePath);
            }else{
                U_file_path.setText(config.getUPathFromConfig());
            }
            if(config.getRPathFromConfig() == null){
                R_file_path.setText(FileHelper.classBasePath);
            }else{
                R_file_path.setText(config.getRPathFromConfig());
            }
            if(config.getOPathFromConfig() == null){
                O_file_path.setText(FileHelper.classBasePath);
            }else{
                O_file_path.setText(config.getOPathFromConfig());
            }

        }catch (IOException e){
            e.printStackTrace(); //
        }
    }

    @FXML
    private void chooseT() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setInitialDirectory(new File(T_file_path.getText()));
        File temp;
        try {
            temp = directoryChooser.showDialog(T_file_choose.getScene().getWindow());
        }catch (IllegalArgumentException i){
            directoryChooser.setInitialDirectory(new File(FileHelper.classBasePath));
            temp = directoryChooser.showDialog(T_file_choose.getScene().getWindow());
        }
        if(temp != null) {
            T_file_path.setText(temp.getAbsolutePath());
        }
    }

    @FXML
    private void chooseU() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setInitialDirectory(new File(U_file_path.getText()));
        File temp;
        try {
            temp = directoryChooser.showDialog(U_file_choose.getScene().getWindow());
        }catch (IllegalArgumentException i){
            directoryChooser.setInitialDirectory(new File(FileHelper.classBasePath));
            temp = directoryChooser.showDialog(U_file_choose.getScene().getWindow());
        }
        if(temp != null) {
            U_file_path.setText(temp.getAbsolutePath());
        }
    }

    @FXML
    private void chooseV() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setInitialDirectory(new File(R_file_path.getText()));
        File temp;
        try {
            temp = directoryChooser.showDialog(R_file_choose.getScene().getWindow());
        }catch (IllegalArgumentException i){
            directoryChooser.setInitialDirectory(new File(FileHelper.classBasePath));
            temp = directoryChooser.showDialog(R_file_choose.getScene().getWindow());
        }
        if(temp != null) {
            R_file_path.setText(temp.getAbsolutePath());
        }
    }

    @FXML
    private void chooseO() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setInitialDirectory(new File(O_file_path.getText()));
        File temp;
        try {
            temp = directoryChooser.showDialog(O_file_choose.getScene().getWindow());
        }catch (IllegalArgumentException i){
            directoryChooser.setInitialDirectory(new File(FileHelper.classBasePath));
            temp = directoryChooser.showDialog(O_file_choose.getScene().getWindow());
        }
        if(temp != null) {
            O_file_path.setText(temp.getAbsolutePath());
        }
    }

    @FXML
    private void launch() {
        // 存储config信息
        try {
            config.setTPathToConfig(T_file_path.getText());
            config.setUPathToConfig(U_file_path.getText());
            config.setRPathToConfig(R_file_path.getText());
            config.setOPathToConfig(O_file_path.getText());
            config.store();
        }catch (IOException e){
            e.printStackTrace(); //
        }

        //预读目录
        PathOfDirectory[] pathInput = new PathOfDirectory[]{
                new PathOfDirectory(FILE_TYPE.T, T_file_path.getText()),
                new PathOfDirectory(FILE_TYPE.U, U_file_path.getText()),
                new PathOfDirectory(FILE_TYPE.R, R_file_path.getText()),
                new PathOfDirectory(FILE_TYPE.O, O_file_path.getText())
        };
        FileHelper.setInstance(pathInput);
        FileHelper.getInstance().checkStatus();

        final Stage stage = (Stage)T_file_path.getScene().getWindow();
        stage.close();
    }

    @FXML
    private void exit() {
        final Stage stage = (Stage)T_file_path.getScene().getWindow();
        stage.close();
    }
}
