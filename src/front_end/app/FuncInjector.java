package front_end.app;

import com.teamdev.jxbrowser.chromium.JSValue;

public class FuncInjector {

    public String JTestStr(String str){
        System.out.println(str);
        return "  JS 调用Java成功";
    }

    public void JTestArr(JSValue arr){
        System.out.println(arr.asArray().toString());
    }
}
