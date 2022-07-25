package application.app;

import com.teamdev.jxbrowser.chromium.Browser;
import com.teamdev.jxbrowser.chromium.BrowserCore;
import com.teamdev.jxbrowser.chromium.JSValue;
import com.teamdev.jxbrowser.chromium.events.*;
import com.teamdev.jxbrowser.chromium.internal.Environment;
import com.teamdev.jxbrowser.chromium.javafx.BrowserView;
import javafx.application.Application;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import setting.Setting;
import util.*;

import java.io.File;
import java.util.Objects;

public class WebStage extends Application {
    private static final Stage webStage = new Stage(StageStyle.DECORATED);
    private FuncInjector funcInjector = new FuncInjectorImpl();
    public static Stage getInstance(){
        return webStage;
    }

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
        Browser browser = new Browser();
        BrowserView browserView = new BrowserView(browser);
        StackPane pane = new StackPane();
        pane.getChildren().add(browserView);
        Scene scene = new Scene(pane, 1850, 1000);
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
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            browser.dispose();
                        }
                    }).start();
                    webStage.close();
                    System.exit(0);
                }else{
                    event.consume();
                }
            }
        });

    }

    @Override
    public void start(Stage primaryStage) throws Exception{
        initWebStage();
        webStage.show();
    }

    public static void main(String[] args){
        launch(args);
    }
}
