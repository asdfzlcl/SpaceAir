package algorithm;

import java.util.Date;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import com.sun.jna.Library;
import com.sun.jna.Native;
import util.FileHelper;


/**
 * GenerateInputTxt类中GenerateInputData方法为算法实现方法
 * 由用户输入时间、经纬度、起止高度和高度分辨率等信息会生成input.txt文件
 * 经过fortran算法计算会生成output.txt文件
 * output.txt中每一行代表一个高度的数据，数据分别为 Temperature(K)    Density(kg/m3)   Mer and Zon Wind(m/s)   Pressure(Pa)
 */
public class GenerateInputTxt {


    //算法文件夹
    public static String algorithmDicPath=FileHelper.algorithmDicPath;

    //输出output.txt文件夹
    public static String outputDicPath=FileHelper.outputDicPath;


    public interface LgetLib extends Library {

        LgetLib INSTANCE = (LgetLib) Native.loadLibrary("./model.so",LgetLib.class);
        void model_();
    }


    public static void model_(){
        LgetLib.INSTANCE.model_();
    }

    public static void WriteTxt(int year,int doy,double uth,double height,double lat,double lon,double f107p,double f107a,double apd,double ap1, double ap2,double ap3){
        try{

            File file =new File(algorithmDicPath+"/input.txt");
            if(!file.exists()){
                file.createNewFile();
            }
            FileWriter fw=new FileWriter(file.getAbsoluteFile(),true);
            BufferedWriter bw=new BufferedWriter(fw);
            bw.write(String.valueOf(year)+' ');
            bw.write(String.valueOf(doy)+' ');
            bw.write(String.valueOf(uth)+' ');
            bw.write(String.valueOf(height)+' ');
            bw.write(String.valueOf(lat)+' ');
            bw.write(String.valueOf(lon)+' ');
            bw.write(String.valueOf(f107p)+' ');
            bw.write(String.valueOf(f107a)+' ');
            bw.write(String.valueOf(apd)+' ');
            bw.write(String.valueOf(ap1)+' ');
            bw.write(String.valueOf(ap2)+' ');
            bw.write(String.valueOf(ap3)+'\n');
            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /*
    用户输入
    year:年
    doy：积日
    uth：时间
    height_start:用户指定的起始高度
    height_end:用户指定的结束高度
    ratio：用户指定的高度分辨率
    lat：纬度
    lon：经度
    f107p：
    f107a:
    apd：
    ap1:
    ap2:
    ap3:
     */
    public static String  GenerateInputData(int year,int doy,double uth,double height_start,double height_end,double ratio,double lat,double lon,double f107p,double f107a,double apd,double ap1, double ap2,double ap3 ) {
        double curr_height=height_start;
        while(curr_height<=height_end){
            WriteTxt(year,doy,uth,curr_height,lat,lon,f107p,f107a,apd,ap1,ap2,ap3);
            curr_height+=ratio;
        }
        GenerateInputTxt.model_();

        //将本地生成的output.txt移动到output目录下
        File output_file=new File(algorithmDicPath+"/output.txt");
        Date date = new Date();
        String output_name=outputDicPath+'/'+date.toString( )+"_output.txt";
        File to_file=new File(output_name);
        output_file.renameTo(to_file);

        //返回文件名称为时间_output.txt 例如Wed Dec 08 16:56:21 CST 2021_output.txt
        return output_name
    }

    public static void main(String[] args){
        int year=2002;
        int doy=80;
        double uth=12.0;
        double height_start=0.0;
        double height_end=5.0;
        double ratio=5;
        double lat=60;
        double lon=120;
        double f107p=120;
        double f107a=120;
        double apd=10;
        double ap1=10;
        double ap2=0;
        double ap3=0;
        GenerateInputTxt.GenerateInputData(year,doy,uth,height_start,height_end,ratio,lat,lon,f107p,f107a,apd,ap1,ap2,ap3);
    }

}
