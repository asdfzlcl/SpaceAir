package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;

import java.util.List;

public interface FuncInjector {
    public List<List<Double>> GetData(JSObject params);
    public List<String> GetTypeList();
}
