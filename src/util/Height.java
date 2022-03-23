package util;

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
 * 该类实现了高度与level之间的计算与转换
 * init和HeightToLev两个方法是主要方法
 * init方法会生成三种不同level各自对应的高度存储在静态成员变量中
 * HeightToLev方法会根据自定义的文件类型，返回一个二维数组，表示每个高度在level中所处的位置
 */
public class Height {
    public static double R=8.314472;
    public static double g=9.80665;

    //70、30、80层文件的level值
    public static List<Double> level_70;
    public static List<Double> level_30;
    public static List<Double> level_80;

    //70、30、80层level分别对应的高度
    public static List<Double> h_70;
    public static List<Double> h_30;
    public static List<Double> h_80;


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
    public static void LevToHeight_70(List<Double> level,List<Double> ilevel,List<Float> Tem){
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
        h_70=new ArrayList<>(result);

    }

    /**
     *
     * @param level_other V文件或者O文件的level
     */
    public static void LevToHeight_other(List<Double> level_other){
        if(level_other.size()==37)
            Height.level_30=level_other;
        if(level_other.size()==88)
            Height.level_80=level_other;
        List<Double> result=new ArrayList<>();
        for(int i=0;i<level_other.size();i++){
            for(int j=0;j<level_70.size();j++) {
                if(level_other.get(i)<=level_70.get(j)) {
                    //如果30层的最小值小于70层的最小值
                    if(j==0){
                        double[] low = new double[]{level_70.get(j ), h_70.get(j )};
                        double[] high = new double[]{level_70.get(j+1), h_70.get(j+1)};
                        List<Double> fit = linearFit(low, high);
                        result.add(fit.get(0) * level_other.get(i) + fit.get(1));
                    }
                    else {
//                    System.out.println("当前高度层"+i+'\n');
                        double[] low = new double[]{level_70.get(j - 1), h_70.get(j - 1)};
                        double[] high = new double[]{level_70.get(j), h_70.get(j)};
                        List<Double> fit = linearFit(low, high);
                        result.add(fit.get(0) * level_other.get(i) + fit.get(1));

                    }
                    break;
                }
            }
        }
        //如果70层的高度值最大值不能包含30层的
        if(result.size()<level_other.size()){
            for(int i=result.size();i<level_other.size();i++){
                double[] low = new double[]{level_70.get(level_70.size()-2), h_70.get(level_70.size()-2)};
                double[] high = new double[]{level_70.get(level_70.size()-1), h_70.get(level_70.size()-1)};
                List<Double> fit = linearFit(low, high);
                result.add(fit.get(0) * level_other.get(i) + fit.get(1));
            }
        }
        if(level_other.size()==37)
            Height.h_30=result;
        if(level_other.size()==88)
            Height.h_80=result;
    }

    /**
     *
     * @param level 70层level的值
     * @param ilevel 密度文件中的ilevel
     * @param Tem 温度
     * @param level_30 V文件中的level值
     * @param level_80 O文件中的level值
     *
     *
     */
    public static void init(List<Double> level,List<Double> ilevel,List<Float> Tem,List<Double> level_30,List<Double> level_80){
        LevToHeight_70(level,ilevel,Tem);
        LevToHeight_other(level_30);
        LevToHeight_other(level_80);
    }


    /**
     *
     * @param height 某一个高度0至80
     * @param type 气象文件标志 ，0-30层 1-70层 2-80层
     * @return 一对序号，height就在他们之中
     */
    public static int[] Position(int height, FILE_TYPE type){
        int i=0;
        if(type == FILE_TYPE.V || type == FILE_TYPE.rH){
            while(height<h_30.get(i))
                i++;
            int[] result=new int[]{i-1,i};
            return result;
        }
        if(type == FILE_TYPE.R || type == FILE_TYPE.T || type == FILE_TYPE.U || type == FILE_TYPE.H){
            while(height<h_70.get(i))
                i++;
            int[] result=new int[]{i-1,i};
            return result;
        }
        else{
            while(height<h_80.get(i))
                i++;
            int[] result=new int[]{i-1,i};
            return result;
        }
    }

    public static List<Double> getHeightList(FILE_TYPE type){
        if(type == FILE_TYPE.O || type == FILE_TYPE.H){
            return h_80;
        }
        else if(type == FILE_TYPE.V || type == FILE_TYPE.rH){
            return h_30;
        }
        else {
            return h_70;
        }
    }


//    /**
//     *
//     * @param flag 气象文件标志 ，0--37层 1--70层 2--88层
//     * @return 一个int型二维数组，一维大小为81，代表着0——80km每个高度在某种文件中所处的位置
//     */
//    public static int[][] HeightToLev(int flag){
//        int[][] result=new int[81][];
//        for(int height=0;height<=80;height++)
//            result[height]=Position(height,flag);
//        return result;
//    }


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