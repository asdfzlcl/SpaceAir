package application.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;

public class InputParam {


    //文件类型
    public final String type;
    //高度

    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject){
        type = jsObject.getProperty("type").getStringValue();
        //height = (int) jsObject.getProperty("height").getNumberValue();
    }



    @Override
    public String toString() {
        return "{\"InputParam\":{"
                + ",\"type\":\""
                + type
                + "}}";

    }
}
