package front_end.app;

import com.teamdev.jxbrowser.chromium.Browser;
import com.teamdev.jxbrowser.chromium.BrowserCore;
import com.teamdev.jxbrowser.chromium.DialogHandler;
import com.teamdev.jxbrowser.chromium.JSValue;
import com.teamdev.jxbrowser.chromium.events.*;
import com.teamdev.jxbrowser.chromium.internal.Environment;
import com.teamdev.jxbrowser.chromium.javafx.BrowserView;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;
import launcher.Launcher;
import util.DialogHelper;

import java.io.File;
import java.util.Objects;

public class WebStage {
    static private final Stage webStage = new Stage(StageStyle.DECORATED);
    static private boolean webStageConfigured = false;
    static private FuncInjector funcInjector = new FuncInjectorImpl();

    private static void initWebCore() {
        // On Mac OS X Chromium engine must be initialized in non-UI thread.
        if (Environment.isMac()) {
            BrowserCore.initialize();
        }
    }

    public static void showWebStage(){
        if(!webStageConfigured)
            initWebStage();
        webStage.showAndWait();
    }

    public static void setFuncInjector(FuncInjector funcInjector){
        WebStage.funcInjector = funcInjector;
    }

    private static void initWebStage(){
        Browser browser = new Browser();
        BrowserView browserView = new BrowserView(browser);
        StackPane pane = new StackPane();
        pane.getChildren().add(browserView);
        Scene scene = new Scene(pane, 1850, 1000);
        webStage.setTitle("Webview");
        webStage.setScene(scene);

        String url = Objects.requireNonNull(WebStage.class.getResource("/front_end/pages/index.html")).toExternalForm();
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
            }
        });
        browser.addScriptContextListener(new ScriptContextAdapter() {
            @Override
            public void onScriptContextCreated(ScriptContextEvent event) {
                JSValue window = browser.executeJavaScriptAndReturnValue("window");
                window.asObject().setProperty("funcInjector", WebStage.funcInjector);
            }
        });
        browser.loadURL(url);
        webStageConfigured = true;

        webStage.setTitle("标准大气软件");
        webStage.getIcons().add(new Image("file:" +
                System.getProperty("user.dir") + File.separator + "logo.png"));

        //给webStage增加退出按钮
        webStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            @Override
            public void handle(WindowEvent event) {
                if(DialogHelper.popConfirmationDialog("确认？","是否退出标准大气软件")){
                    webStage.close();
                }else{
                    event.consume();
                }
            }
        });

    }

}
