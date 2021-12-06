package front_end.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;

public class InputParam {

    //0-统计模型热力图，1-统计模型廓线图，2-标准模型廓线图
    private final int task;
    //U,V,T等类型
    private final String type;
    //时间，取值只可能是0,6,12,18
    private final int time;
    //高度
    private final int height;
    //年份
    private final int year;
    //年积日
    private final int days;
    //经度下限
    private final int latLb;
    //经度上限
    private final int latUb;
    //纬度下限
    private final int lonLb;
    //纬度上限
    private final int lonUb;

    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject){
        task = (int)jsObject.getProperty("task").getNumberValue();
        type = jsObject.getProperty("type").getStringValue();
        time = (int) jsObject.getProperty("time").getNumberValue();
        height = (int) jsObject.getProperty("height").getNumberValue();
        year = (int)jsObject.getProperty("year").getNumberValue();
        days = (int) jsObject.getProperty("days").getNumberValue();
        latLb = (int) jsObject.getProperty("latLb").getNumberValue();
        latUb = (int) jsObject.getProperty("latUb").getNumberValue();
        lonLb = (int) jsObject.getProperty("lonLb").getNumberValue();
        lonUb = (int) jsObject.getProperty("lonUb").getNumberValue();
    }

    @Override
    public String toString() {
        return "{\"InputParam\":{"
                + "\"task\":"
                + task
                + ",\"type\":\""
                + type + '\"'
                + ",\"time\":"
                + time
                + ",\"height\":"
                + height
                + ",\"year\":"
                + year
                + ",\"days\":"
                + days
                + ",\"latLb\":"
                + latLb
                + ",\"latUb\":"
                + latUb
                + ",\"lonLb\":"
                + lonLb
                + ",\"lonUb\":"
                + lonUb
                + "}}";

    }

    public int getTask() {
        return task;
    }

    public String getType() {
        return type;
    }

    public int getTime() {
        return time;
    }

    public int getHeight() {
        return height;
    }

    public int getDays() {
        return days;
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

    public int getYear() {
        return year;
    }
}
