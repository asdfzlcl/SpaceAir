package util;

import org.omg.PortableInterceptor.SYSTEM_EXCEPTION;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class NetCADFileHelper {

    /**
     * 静态方法 getNCFileVariable
     * 输入：nc文件路径，最好使用pathHelper
     * 输出：此nc文件内的变量列表List<variable>
     **/
    public static List<Variable> getNCFileVariable(String path) throws IOException {
        NetcdfFile file = NetcdfFile.open(path);
        return file.getVariables();
    }

    public static NetcdfFile getNCFile(String path) throws  IOException{
        return NetcdfFile.open(path);
    }


    public static void main(String[] args){
        String path = "C:\\Users\\seu-wxy\\Desktop\\标准大气\\somedata\\v010100_V数据_气候态.nc";
        try {
            NetcdfFile a = NetCADFileHelper.getNCFile(path);
            Variable v = a.findVariable("v");
        }catch (IOException e){
            e.printStackTrace();
        }


    }
}
