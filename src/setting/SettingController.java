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


    @FXML
    private VBox chooserBox;

    private final List<String> pathList = new ArrayList<>();

    public void init(){

    }

    @FXML
    private void launch() {
    }


    @FXML
    private void exit() {
        final Stage stage = (Stage)chooserBox.getScene().getWindow();
        stage.close();
    }


}
