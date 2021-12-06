package util;

import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import java.io.IOException;
import java.util.List;

public class test {

    /**
     * static function: getNCFileVariable()
     * input: nc文件路径，最好使用FilePathHelper
     * output: 此nc文件内的变量列表List<variable>
     **/
    public static List<Variable> getNCFileVariable(String path) throws IOException {
        NetcdfFile file = NetcdfFile.open(path);
        Variable a= file.findVariable("latitude");
        System.out.println(a);
        float[] b = (float[]) a.read().copyTo1DJavaArray();
        System.out.println(b.length);
        for (float c:b){
            System.out.println(c);
        }
        return file.getVariables();
    }

    public static NetcdfFile getNCFile(String path) throws  IOException{
        return NetcdfFile.open(path);
    }


    public static void main(String[] args){
        String path = "C:\\Users\\seu-wxy\\Desktop\\标准大气\\somedata\\v010100_V数据_气候态.nc";
        try {
            test.getNCFileVariable(path);
        }catch (IOException e){
            e.printStackTrace();
        }


    }
}
