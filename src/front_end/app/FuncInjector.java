package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;

public interface FuncInjector {
    public String GetHeatMapData(JSObject params);
    public String GetContourMapData(JSObject params);
    public Object GetFileInfo();
}
