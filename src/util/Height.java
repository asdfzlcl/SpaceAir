package util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 气体常数R=8.314472J/K/mol
 * g=908.665
 *
 * 输入：level：T010100_大气密度(T)气候态.nc文件中的lev变量
 * ilevel：RHO_CLUBB010100_大气密度气候态.nc中的ilev变量
 * Tem:T010100_大气密度(T)气候态.nc文件中的T变量（任意一个经纬度）
 * 输出：lev对应的高度值，单位为米
 */
public class Height {
    public static double R=8.314472;
    public static double g=9.80665;
    public static List<Double> LevToHeight(List<Double> level,List<Double> ilevel,List<Float> Tem){
        List<Double> height=new ArrayList<>();
        List<Double> result=new ArrayList<>();
        for(int i=0;i<= level.size()-1;i++)
            height.add(ilevel.get(i + 1) -ilevel.get(i));
        for(int i=0;i<= height.size()-1;i++)
            height.set(i, height.get(i) / level.get(i) * R *Tem.get(i) / (g * 28.966 / 1000));
        Collections.reverse(height);
        for(int i=0;i<= height.size()-1;i++) {
            double sum=0;
            for(int j=0;j<= i;j++) {
                sum+=height.get(j);
            }
            result.add(sum);
        }
        Collections.reverse(result);
        return result;
    }


//    public static void main(String[] args) throws IOException, InvalidRangeException {
//        NetcdfFile openNC = NetcdfFile.open("D:\\IntelProject\\height\\src\\RHO_CLUBB010100_大气密度气候态.nc");
//        Variable n = openNC.findVariable("ilev");
//        double[] ilev = (double[]) n.read().copyTo1DJavaArray();
//        NetcdfFile openNC_1 = NetcdfFile.open("D:\\IntelProject\\height\\src\\T010100_大气密度(T)气候态.nc");
//
//        Variable n_1 = openNC_1.findVariable("lev");
//        double[] lev = (double[]) n_1.read().copyTo1DJavaArray();
//        Variable n_2 = openNC_1.findVariable("T");
//        int[] org = {0,1,1};
//        int[] sha = {70,1,1};
//        float[] T = (float[]) n_2.read(org,sha).copyTo1DJavaArray();
//        for(double j:ilev)
//            System.out.println(j);
//        List<Double> ilevel=new ArrayList<>();
//        List<Double> level=new ArrayList<>();
//        List<Float> Tem=new ArrayList<>();
//        for(double j:ilev)
//            ilevel.add(j);
//        for(double j:lev)
//            level.add(j);
//        for(float j:T)
//            Tem.add(j);
//        List<Double> heights = LevToHeight(level, ilevel, Tem);
//        for(double i:heights)
//            System.out.println(i);
//    }
}
