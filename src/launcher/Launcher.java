package launcher;


import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.image.Image;
import javafx.scene.layout.Region;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.File;
import java.net.URL;
import java.util.Optional;

/**
 *
 *
 * */
public class Launcher extends Application {

    private LauncherController controller;

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
                System.getProperty("user.dir") + File.separator + "icon.png"));

        controller = fxmlLoader.getController();
        controller.init();

        primaryStage.show();


        primaryStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
                alert.setTitle("确认?");
                alert.setHeaderText("确定");
                alert.setContentText("是否退出？");
                alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);

                Optional<ButtonType> result = alert.showAndWait();
                if(result.get() == ButtonType.OK){
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
