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
        List<List<Float>> data = new ArrayList<>(200);
        for (int j = 0; j < 200; j++)
        {
            List<Float> row = new ArrayList<>(200);
            for (int i = 0; i < 200; i++) {
                row.add((float) (Math.random() * 10.0));
            }
            data.add(row);
        }
        return data.toString();
    }

    @Override
    public String GetContourMapData(JSObject params) {
        InputParam inputParam = new InputParam(params);
        List<Float> data = Arrays.asList(1.0f,2.0f);
        return data.toString();
    }

    @Override
    public List<String> GetTypeList() {
        return Arrays.asList("U","V","T","O");
    }
}
