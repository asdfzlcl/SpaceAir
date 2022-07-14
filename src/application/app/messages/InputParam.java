package application.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;

public class InputParam {


    //文件类型
    private final String type;
    private final int pictype;
    private final String filename;
    //高度


    public String getType(){
        return type;
    }
    public int getPicType(){
        return pictype;
    }
    public String getFileName(){
        return filename;
    }
    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject){
        type = jsObject.getProperty("type").getStringValue();
        pictype = (int)jsObject.getProperty("pictype").getNumberValue();
        filename = jsObject.getProperty("filename").getStringValue();
        //height = (int) jsObject.getProperty("height").getNumberValue();
    }



    @Override
    public String toString() {
        return "{\"InputParam\":{"
                + ",\"type\":\""
                + type
                + ",\"pictype\":\""
                + pictype
                + ",\"filename\":\""
                + filename
                + "}}";

    }
}
