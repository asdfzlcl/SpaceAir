package util;

import javafx.application.Platform;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.layout.Region;
import java.util.Optional;

/**
 * 使用此类来包装所有与弹出窗口相关的操作
 * @author wxy
 */
public class DialogHelper {

    /**
     * 使用底层JavaFX window弹出一个错误窗口
     * 注意并不是在webview上弹出
     * @param content 错误警示内容
     */
    public static void popErrorDialog(String content){
        Platform.runLater(new Runnable() {
            @Override
            public void run() {
                DialogHelper.popWarningDialog("错误！",content);
            }
        });
    }

    /**
     * 使用底层JavaFX window弹出一个警告窗口
     * 注意并不是在webview上弹出
     * @param header 警告标题
     * @param context 警告详细内容
     */
    public static void popWarningDialog(String header, String context) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle("警告");
        alert.setHeaderText(header);
        alert.setContentText(context);

        alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);
        alert.showAndWait();
    }

    /**
     * 使用底层JavaFX window弹出一个信息窗口
     * 注意并不是在webview上弹出
     * @param header 信息标题
     * @param context 警信息细内容
     */
    public static void popInformationDialog(String header, String context) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("提示");
        alert.setHeaderText(header);
        alert.setContentText(context);

        alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);

        alert.showAndWait();
    }

    /**
     * 使用底层JavaFX window弹出一个阻塞式确认窗口
     * 注意并不是在webview上弹出
     * 必须在得到用户点击确认或取消之后释放阻塞
     * @param header 确认内容标题
     * @param context 确认内容详细
     * @return 是否确认 如果没有确认 布尔值为false
     */
    public static boolean popConfirmationDialog(String header,String context){
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("请确认");
        alert.setHeaderText(header);
        alert.setContentText(context);

        alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);

        Optional<ButtonType> result = alert.showAndWait();
        return result.get() == ButtonType.OK;
    }
}
