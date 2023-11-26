package application.app;

import com.teamdev.jxbrowser.chromium.Browser;
import com.teamdev.jxbrowser.chromium.BrowserCore;
import com.teamdev.jxbrowser.chromium.BrowserPreferences;
import com.teamdev.jxbrowser.chromium.JSValue;
import com.teamdev.jxbrowser.chromium.events.*;
import com.teamdev.jxbrowser.chromium.internal.Environment;
import com.teamdev.jxbrowser.chromium.javafx.BrowserView;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;
import javafx.scene.text.Font;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import setting.Setting;
import util.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.Objects;

import static java.lang.Thread.sleep;

public class WebStage extends Application {

    private static final Stage webStage = new Stage(StageStyle.DECORATED);
    private FuncInjector funcInjector = new FuncInjectorImpl();
    public static Stage getInstance(){
        return webStage;
    }

    public Browser browser;

    private static void initWebCore() {
        // On Mac OS X Chromium engine must be initialized in non-UI thread.
        if (Environment.isMac()) {
            BrowserCore.initialize();
        }
    }


    public void setFuncInjector(FuncInjector funcInjector){
        funcInjector = funcInjector;
    }

    private void initWebStage(){
        browser = new Browser();
//        webStage.initStyle(StageStyle.UNDECORATED);
//        GridPane gridPane = new GridPane();
//        gridPane.setStyle("-fx-background-color: rgb(78.0,163.0,248.0);");
//        gridPane.setPrefHeight(32);
//        gridPane.setAlignment(Pos.CENTER_LEFT);
//        Label label = new Label("title");
//        label.setFont(Font.font(14));
//        label.setTextFill(Paint.valueOf("white"));
////        ImageView imageView = new ImageView("../logo.png");
////        imageView.setFitHeight(24);
////        imageView.setFitWidth(24);
////        label.setGraphic(imageView);
//        Button minButton = new Button("—");
//        Button amxButton = new Button("口");
//        Button closeButton = new Button("X");
//        minButton.setStyle("-fx-base: rgb(243,243,243); -fx-border-color: rgb(243,243,243); -fx-border-width: 0.1; "
//                + "-fx-max-height: infinity;-fx-text-fill: white ; -fx-border-image-insets: 0;");
//        amxButton.setStyle("-fx-base: rgb(243,243,243); -fx-border-color: rgb(243,243,243); -fx-border-width: 0.1; "
//                + "-fx-max-height: infinity;-fx-text-fill: white ; -fx-border-image-insets: 0;");
//        closeButton.setStyle("-fx-base: rgb(255,128,128); -fx-border-color: rgb(243,243,243); -fx-border-width: 0.1; "
//                + "-fx-max-height: infinity;-fx-text-fill: white ; -fx-border-image-insets: 0;");
//        minButton.setOnAction(new EventHandler<ActionEvent>() {
//
//            @Override
//            public void handle(ActionEvent event) {
//                webStage.setIconified(true);
//            }
//        });
//        amxButton.setOnAction(new EventHandler<ActionEvent>() {
//
//            @Override
//            public void handle(ActionEvent event) {
//                webStage.setMaximized(!webStage.isMaximized());
//            }
//        });
//        closeButton.setOnAction(new EventHandler<ActionEvent>() {
//
//            @Override
//            public void handle(ActionEvent event) {
//                webStage.close();
//            }
//        });
//        gridPane.addColumn(0, label);
//        GridPane.setHgrow(label, Priority.ALWAYS);
//        gridPane.addColumn(1, minButton);
//        gridPane.addColumn(2, amxButton);
//        gridPane.addColumn(3, closeButton);
//        VBox box = new VBox();
//        box.getChildren().add(gridPane);

        BrowserView browserView = new BrowserView(browser);
        StackPane pane = new StackPane();
//        browserView.getChildren().add(gridPane);
        pane.getChildren().add(browserView);


        Scene scene = new Scene(pane, 1900, 1032);
        webStage.setScene(scene);
        webStage.setTitle(NameHelper.softwareName);
        webStage.getIcons().add(new Image("file:" +
                System.getProperty("user.dir") + File.separator + "logo.png"));
        String url = Objects.requireNonNull(WebStage.class.getResource("/application/pages/index.html")).toExternalForm();
        browser.addLoadListener(new LoadAdapter() {
            @Override
            public void onStartLoadingFrame(StartLoadingEvent event) {
                super.onStartLoadingFrame(event);
//                CSS文件可以在document加载之前提前载入
//                browser.setCustomStyleSheet(ResInjector.getCss("mdui.min.css"));
//                browser.setCustomStyleSheet(ResInjector.getCss("global.css"));
//                browser.setCustomStyleSheet(ResInjector.getCss("index.css"));
            }

            @Override
            public void onDocumentLoadedInFrame(FrameLoadEvent event) {
                super.onDocumentLoadedInFrame(event);
//                由于一些JS脚本必须在document加载完成后执行，所以必需在这里注册JS文件
//                browser.executeJavaScript(ResInjector.getJs("mdui.min.js"));
//                browser.executeJavaScript(ResInjector.getJs("index.js"));
//                browser.executeJavaScript(ResInjector.getJs("index.databind.js"));
            }

            @Override
            public void onFinishLoadingFrame(FinishLoadingEvent event) {
                super.onFinishLoadingFrame(event);
                browser.executeJavaScript("fetchTypes()");
                browser.executeJavaScript("fetchFileList()");
                browser.executeJavaScript("echarts.registerMap('china',{geoJSON:chinaJSON})");
            }
        });
        browser.addScriptContextListener(new ScriptContextAdapter() {
            @Override
            public void onScriptContextCreated(ScriptContextEvent event) {
                JSValue window = browser.executeJavaScriptAndReturnValue("window");
                window.asObject().setProperty("funcInjector", funcInjector);
            }
        });
        browser.loadURL(url);



        //给webStage增加退出按钮
        webStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                if(DialogHelper.popConfirmationDialog("退出","是否退出" + NameHelper.softwareName + "?")){
                    Platform.exit();
                }else{
                    event.consume();
                }
            }
        });

    }

    private Stage getLogoStage() throws FileNotFoundException {
        Stage logoStage = new Stage();
        Pane logoPane = new Pane();
        logoPane.getChildren().add(new ImageView(new Image("file:" +
                System.getProperty("user.dir") + File.separator + "op.png")
        ));
        Scene logoScene = new Scene(logoPane, 500, 500);
        logoScene.setFill(Color.TRANSPARENT);
        logoStage.initStyle(StageStyle.UNDECORATED);
        logoStage.setScene(logoScene);
        logoStage.getIcons().add(new Image("file:" +
                System.getProperty("user.dir") + File.separator + "logo.png"));
        return logoStage;
    }


    @Override
    public void start(Stage primaryStage) throws Exception{
        // create new temp stage for logo
        Stage logoStage = getLogoStage();
        logoStage.show();
        initWebStage();
        primaryStage = webStage;
        Stage finalPrimaryStage = primaryStage;
        Platform.runLater(() ->{
            try {
                sleep(3000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            logoStage.close();
            finalPrimaryStage.show();
        });
    }

    @Override
    public void stop() throws Exception {
        this.browser.dispose();
//        webStage.close();

    }

    public static void main(String[] args){
        launch(args);
    }
}
