package util;

import ucar.ma2.Array;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.nc2.write.Ncdump;

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
        Variable a= file.findVariable("v");
//        try {
//            int[] varShape = a.getShape();
//            int[] origin = new int[3];
//            int[] size = new int[] {1, varShape[1], varShape[2]};
//            for (int i = 0; i < varShape[0]; i++) {
//                origin[0] = i;
//                Array data2D = a.read(origin, size).reduce(0);
//                Float[][] temp = (Float[][]) data2D.copyToNDJavaArray();
//                System.out.println(Ncdump.printArray(data2D, "T", null));
//            }
//        }catch (InvalidRangeException e){
//            e.printStackTrace();
//        }


        System.out.println(a);
        float[] b = (float[]) a.read().copyTo1DJavaArray();
        System.out.println(b.length);
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
