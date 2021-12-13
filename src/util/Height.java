import ucar.ma2.InvalidRangeException;
import ucar.nc2.Dimension;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
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
    public static List<Double> level_70;
    public static List<Double> h;

    public static List<Double> linearFit(double[] low,double[] high) {
        List<Double> result=new ArrayList<>();
        double k =(high[1]-low[1])/(high[0]-low[0]);
        double b=low[1]-k*low[0];
        result.add(k);
        result.add(b);
        return result;
    }

    /**
     *
     * @param level 70个level的值
     * @param ilevel 密度文件中的ilevel
     * @param Tem 大气温度
     * @return 70个level对应的高度
     */
    public static List<Double> LevToHeight_70(List<Double> level,List<Double> ilevel,List<Float> Tem){
        List<Double> height=new ArrayList<>();
        List<Double> result=new ArrayList<>();
        level_70=new ArrayList<>(level);
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
        h=new ArrayList<>(result);
        return result;
    }

    /**
     *
     * @param level_30 30个level的值(80个值的也可以)
     * @return result 通过线性插值得到的高度
     */
    public static List<Double> LevToHeight_other(List<Double> level_30){
        List<Double> result=new ArrayList<>();
        for(int i=0;i<level_30.size();i++){
            for(int j=0;j<level_70.size();j++) {
                if(level_30.get(i)<=level_70.get(j)) {
                    //如果30层的最小值小于70层的最小值
                    if(j==0){
                        double[] low = new double[]{level_70.get(j ), h.get(j )};
                        double[] high = new double[]{level_70.get(j+1), h.get(j+1)};
                        List<Double> fit = linearFit(low, high);
                        result.add(fit.get(0) * level_30.get(i) + fit.get(1));
                    }
                    else {
//                    System.out.println("当前高度层"+i+'\n');
                        double[] low = new double[]{level_70.get(j - 1), h.get(j - 1)};
                        double[] high = new double[]{level_70.get(j), h.get(j)};
                        List<Double> fit = linearFit(low, high);
                        result.add(fit.get(0) * level_30.get(i) + fit.get(1));

                    }
                    break;
                }
            }
        }
        //如果70层的高度值最大值不能包含30层的
        if(result.size()<level_30.size()){
            for(int i=result.size();i<level_30.size();i++){
                double[] low = new double[]{level_70.get(level_70.size()-2), h.get(level_70.size()-2)};
                double[] high = new double[]{level_70.get(level_70.size()-1), h.get(level_70.size()-1)};
                List<Double> fit = linearFit(low, high);
                result.add(fit.get(0) * level_30.get(i) + fit.get(1));
            }
        }
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
////        for(double j:ilev)
////            System.out.println(j);
//        List<Double> ilevel=new ArrayList<>();
//        List<Double> level=new ArrayList<>();
//        List<Float> Tem=new ArrayList<>();
//        for(double j:ilev)
//            ilevel.add(j);
//        for(double j:lev)
//            level.add(j);
//        for(float j:T)
//            Tem.add(j);
//        List<Double> heights = LevToHeight_70(level, ilevel, Tem);
//        for(double i:h)
//            System.out.println(i);
//        System.out.println("高度个数"+h.size());
//        System.out.println("----------------");
//        double[] level_30=new double[]{1,2,3,5,7,10,20,30,50,70,100,125,150,175,200,225,250,300,350,400,450,500,550,600,650,700,750,775,800,825,850,875,900,925,950,975,1000};
//        List<Double> l_30=new ArrayList<>();
//        for(double i:level_30)
//            l_30.add(i);
//        List<Double> height_30=LevToHeight_other(l_30);
//        for(double i:height_30)
//            System.out.println(i);
//        System.out.println("----------------");
//        System.out.println("高度个数"+height_30.size());
//    }
}
