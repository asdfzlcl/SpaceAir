package application.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;

public class InputParam {

    //0-统计模型热力图，1-统计模型廓线图，2-标准模型廓线图
    private final int task;
    //U,V,T等类型
    private final String type;
    //高度
    private final int height;
    //经度下限
    private final double latLb;
    //经度上限
    private final double latUb;
    //纬度下限
    private final double lonLb;
    //纬度上限
    private final double lonUb;
    //文件名
    private final String filename;

    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject){
        task = (int)jsObject.getProperty("task").getNumberValue();
        type = jsObject.getProperty("type").getStringValue();
        height = (int) jsObject.getProperty("height").getNumberValue();
        latLb = (double) jsObject.getProperty("latLb").getNumberValue();
        latUb = (double) jsObject.getProperty("latUb").getNumberValue();
        lonLb = (double) jsObject.getProperty("lonLb").getNumberValue();
        lonUb = (double) jsObject.getProperty("lonUb").getNumberValue();
        filename= jsObject.getProperty("filename").getStringValue();
    }

    @Override
    public String toString() {
        return "{\"InputParam\":{"
                + "\"task\":"
                + task
                + ",\"type\":\""
                + type + '\"'
                + ",\"height\":"
                + height
                + ",\"latLb\":"
                + latLb
                + ",\"latUb\":"
                + latUb
                + ",\"lonLb\":"
                + lonLb
                + ",\"lonUb\":"
                + lonUb
                + ",\"filename\":"
                + filename
                + "}}";

    }
}
