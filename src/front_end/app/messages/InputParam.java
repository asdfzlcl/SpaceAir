package front_end.app.messages;

import com.teamdev.jxbrowser.chromium.JSObject;

public class InputParam {

    private final String task;
    private final String type;
    private final int time;
    private final int height;
    private final int year;

    private final int days;//年积日

    //lower bound and upper bound of 经度
    private final int latLb;
    private final int latUb;

    //lower bound and upper bound of 纬度
    private final int lonLb;
    private final int lonUb;

    public InputParam(JSObject jsObject){
        task = jsObject.getProperty("task").getStringValue();
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
                + "\"task\":\""
                + task + '\"'
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

    public String getTask() {
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
