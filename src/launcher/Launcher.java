package launcher;

import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import util.DialogHelper;
import java.io.File;
import java.net.URL;

/**
 * @description 程序入口所在类
 * @author wxy
 * @date 2021-12-05
 * */
public class Launcher extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception{
        URL location = getClass().getResource("launcher.fxml");
        FXMLLoader fxmlLoader = new FXMLLoader();
        fxmlLoader.setLocation(location);
        fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
        Parent root = fxmlLoader.load();

        primaryStage.setTitle("标准大气软件启动器");
        Scene scene = new Scene(root, 800, 310);
        primaryStage.setScene(scene);
        primaryStage.getIcons().add(new Image("file:" +
                System.getProperty("user.dir") + File.separator + "logo.png"));

        LauncherController controller = fxmlLoader.getController();
        controller.init();

        primaryStage.show();

        primaryStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                if(DialogHelper.popConfirmationDialog("确认？","是否退出标准大气软件启动器")){
                    System.exit(0);
                }else{
                    event.consume();
                }
            }
        });
    }

    public static void main(String[] args){
        launch(args);
    }
}
