package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import com.teamdev.jxbrowser.chromium.JSValue;

import java.util.List;

public interface FuncInjector {
    public String GetHeatMapData(JSObject params);
    public String GetContourMapData(JSObject params);
    public List<String> GetTypeList();
}
