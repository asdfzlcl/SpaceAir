package front_end.app;

import com.teamdev.jxbrowser.chromium.Browser;
import com.teamdev.jxbrowser.chromium.BrowserCore;
import com.teamdev.jxbrowser.chromium.JSValue;
import com.teamdev.jxbrowser.chromium.events.FinishLoadingEvent;
import com.teamdev.jxbrowser.chromium.events.FrameLoadEvent;
import com.teamdev.jxbrowser.chromium.events.LoadAdapter;
import com.teamdev.jxbrowser.chromium.events.StartLoadingEvent;
import com.teamdev.jxbrowser.chromium.internal.Environment;
import com.teamdev.jxbrowser.chromium.javafx.BrowserView;
import javafx.event.EventHandler;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import javafx.stage.WindowEvent;

public class WebStage {
    static Stage webStage = new Stage(StageStyle.UTILITY);
    static boolean webStageConfigured = false;

    private static void initWebCore()throws Exception {
        // On Mac OS X Chromium engine must be initialized in non-UI thread.
        if (Environment.isMac()) {
            BrowserCore.initialize();
        }
    }

    public static void showWebStage(){
        if(!webStageConfigured)
            initWebStage();
        webStage.show();
    }

    private static void initWebStage(){
        Browser browser = new Browser();
        BrowserView browserView = new BrowserView(browser);
        webStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
            public void handle(WindowEvent we) {
                webStage.close();
            }
        });
        StackPane pane = new StackPane();
        pane.getChildren().add(browserView);
        Scene scene = new Scene(pane, 1400, 900);
        webStage.setTitle("Webview");
        webStage.setScene(scene);

        String url = WebStage.class.getResource("/front_end/pages/index.html").toExternalForm();
        browser.addLoadListener(new LoadAdapter() {
            @Override
            public void onStartLoadingFrame(StartLoadingEvent event) {
                super.onStartLoadingFrame(event);
                //CSS文件可以在document加载之前提前载入
                browser.setCustomStyleSheet(ResInjector.getCss("mdui.min.css"));
                browser.setCustomStyleSheet(ResInjector.getCss("global.css"));
                browser.setCustomStyleSheet(ResInjector.getCss("index.css"));
            }

            @Override
            public void onFinishLoadingFrame(FinishLoadingEvent event) {
                super.onFinishLoadingFrame(event);
                JSValue window = browser.executeJavaScriptAndReturnValue("window");
                FuncInjector funcInjector = new FuncInjector();
                window.asObject().setProperty("funcInjector",funcInjector);
            }

            @Override
            public void onDocumentLoadedInFrame(FrameLoadEvent event) {
                super.onDocumentLoadedInFrame(event);
                //由于一些JS脚本必须在document加载完成后执行，所以必需在这里注册JS文件
                browser.executeJavaScript(ResInjector.getJs("mdui.min.js"));
                browser.executeJavaScript(ResInjector.getJs("index.js"));
                browser.executeJavaScript(ResInjector.getJs("index.databind.js"));
            }

        });
        browser.loadURL(url);
        webStageConfigured = true;
    }
}
