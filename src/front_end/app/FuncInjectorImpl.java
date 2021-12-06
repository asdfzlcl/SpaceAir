package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import front_end.app.messages.InputParam;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FuncInjectorImpl implements FuncInjector {

    @Override
    public String GetHeatMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Float>> data = new ArrayList<>(2);
        data.add(Arrays.asList(1.0f,2.0f));
        data.add(Arrays.asList(3.0f,4.0f));
        return data.toString();
    }

    @Override
    public String GetContourMapData(JSObject params) {
        InputParam inputParam = new InputParam(params);
        List<Double> data = Arrays.asList(1.0,2.0);
        return data.toString();
    }

    @Override
    public List<String> GetTypeList() {
        return Arrays.asList("U","V","T","O");
    }
}
