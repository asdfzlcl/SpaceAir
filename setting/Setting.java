package setting;

import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import util.DialogHelper;
import util.PathHelper;

import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * @description 程序入口所在类
 * @author wxy
 * @date 2021-12-05
 * */
public class Setting extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        URL location = getClass().getResource("setting.fxml");
        FXMLLoader fxmlLoader = new FXMLLoader();
        fxmlLoader.setLocation(location);
        fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
        Parent root = fxmlLoader.load();

        primaryStage.setTitle("标准大气软件路径设置");
        Scene scene = new Scene(root, 900, 450);
        primaryStage.setScene(scene);
        primaryStage.getIcons().add(new Image("file:" +
                PathHelper.classBasePath + File.separator + "logo.png"));

        SettingController controller = fxmlLoader.getController();
        controller.init();

        primaryStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                if(DialogHelper.popConfirmationDialog("配置未保存","配置未保存，确认退出？")){
                    primaryStage.close();
                }else{
                    event.consume();
                }
            }
        });
    }


}
