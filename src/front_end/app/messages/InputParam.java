package front_end.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;
import util.FILE_TYPE;

public class InputParam {

    //0-统计模型热力图，1-统计模型廓线图，2-标准模型廓线图
    private final int task;
    //U,V,T等类型
    private final String type;
    //高度
    private final int height;
    //经度下限
    private final int latLb;
    //经度上限
    private final int latUb;
    //纬度下限
    private final int lonLb;
    //纬度上限
    private final int lonUb;
    //文件名
    private final String filename;

    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject){
        task = (int)jsObject.getProperty("task").getNumberValue();
        type = jsObject.getProperty("type").getStringValue();
        height = (int) jsObject.getProperty("height").getNumberValue();
        latLb = (int) jsObject.getProperty("latLb").getNumberValue();
        latUb = (int) jsObject.getProperty("latUb").getNumberValue();
        lonLb = (int) jsObject.getProperty("lonLb").getNumberValue();
        lonUb = (int) jsObject.getProperty("lonUb").getNumberValue();
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

    public int getTask() {
        return task;
    }

    public String getType() {
        return type;
    }

    public int getHeight() {
        return height;
    }

    public int getLatLb() {
        return latLb;
    }

    public int getLatUb() {
        return latUb;
    }

    public int getLonLb() {
        return lonLb;
    }

    public int getLonUb() {
        return lonUb;
    }

    public String getFilename() {
        return filename;
    }

    //获取FILE_TYPE格式的输出
    public FILE_TYPE getFileType(){
        if(type.equals("U"))
            return FILE_TYPE.U;
        if(type.equals("T"))
            return FILE_TYPE.T;
        if(type.equals("V"))
            return FILE_TYPE.R;
        return FILE_TYPE.O;
    }
}
