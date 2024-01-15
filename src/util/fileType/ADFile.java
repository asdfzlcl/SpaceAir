package util.fileType;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.lang.Math;

/**
 * ADF文件(大气密度 Atmosphere Density File)
 * 有两个有效数据
 * 有一个时间索引
 * getTimeSeries 获取时间序列
 * getModelDataSeries 获取模型预测数据序列
 * getSpecDataSeries 获取实际观测序列
 * 全都与时间序列相对应
 * @author wxy
 * */
public class ADFile extends BaseFile{

    private final ArrayList<String> timeSeries;
    private final ArrayList<Double> modelDataSeries;
    private final ArrayList<Double> specDataSeries;
    private final ArrayList<Double> densDataSeries;

    public ADFile(String fileURL) throws IOException {
        super(fileURL);
        timeSeries = new ArrayList<>();
        modelDataSeries = new ArrayList<>();
        specDataSeries = new ArrayList<>();
        densDataSeries = new ArrayList<>();
        readFile();
    }


    /**
     * 读取ADF File
     * 需要跳过前面的无效注释行
     * 后续数据行格式为:
     * Year   d  ut      ratio       uncert     log10(msis)  log10(darg)   uncert
     * 1967   1  0.0     0.98737     0.02001    -10.20275    -10.20827     0.00889
     * 使用公式计算大气密度
     * 只有时间作为索引, 二维数据
     * */
    @Override
    protected void readFile() throws IOException {
        File currentFile = new File(this.fileURL);
        BufferedReader currentBR = new BufferedReader(new FileReader(currentFile));
        String currentLine;
        currentLine = currentBR.readLine();
        while((currentLine = currentBR.readLine()) != null){
            String[] temp = currentLine.split("\\s+");
            String year;
            String day;
            double ratio;
            double logMsis;
            String logDrag;
            try{
                int index = 0;
                while (temp[index].isEmpty())
                    index ++;
                year = temp[index];
                day = temp[index + 1];
                ratio = Double.parseDouble(temp[index + 3]);
                if (ratio == -9.999) {
                    ratio = 0;
                }
                logMsis = Double.parseDouble(temp[index + 5]);

            }catch (Exception e){
                continue;
            }
            System.out.println(year + '-' + day);
//            System.out.println(Math.pow(10, logDrag));
            System.out.println(Math.pow(10, logMsis));
            System.out.println(ratio * Math.pow(10, logMsis));

            timeSeries.add(year + '-' + day);
//            modelDataSeries.add(Math.pow(10, logDrag));
            specDataSeries.add(Math.pow(10, logMsis));
            densDataSeries.add(ratio * Math.pow(10, logMsis));
        }
        currentBR.close();
        System.out.println(this.densDataSeries);
        System.out.println(this.specDataSeries);
        System.out.println(this.modelDataSeries);
        System.out.println(this.timeSeries);
        if(this.densDataSeries.isEmpty() || this.specDataSeries.isEmpty()  || this.timeSeries.isEmpty()){
            throw new IOException("错误的文件格式！");
        }
    }


    /**
     * 获得当前文件的时间序列
     * 目前使用String代替日期
     * @return timeSeries: ArrayList<String>
     * */
    public ArrayList<String> getTimeSeries() {
        return timeSeries;
    }

    /**
     * 获得当前文件的模型数据序列
     * 数据是个Double
     * @return modelDataSeries: ArrayList<Double>
     * */
    public ArrayList<Double> getModelDataSeries() {
        return modelDataSeries;
    }

    /**
     * 获得当前文件的观测数据序列
     * 数据是个Double
     * @return specDataSeries: ArrayList<Double>
     * */
    public ArrayList<Double> getSpecDataSeries() {
        return specDataSeries;
    }

    /**
     * 获得当前文件的密度数据序列
     * 数据是个Double
     * @return densDataSeries: ArrayList<Double>
     * */
    public ArrayList<Double> getDensDataSeries() {
        return densDataSeries;
    }
}
