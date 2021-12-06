package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import front_end.app.messages.InputParam;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FuncInjectorImpl implements FuncInjector {

    @Override
    public List<List<Double>> GetData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Double>> data = new ArrayList<>(2);
        data.add(Arrays.asList(1.0,2.0));
        data.add(Arrays.asList(3.0,4.0));
        return data;
    }

    @Override
    public List<String> GetTypeList() {
        return Arrays.asList("U","V","T","H");
    }
}
