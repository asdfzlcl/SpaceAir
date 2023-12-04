package util.fileType;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

/**
 * SAT文件(Sun and terrestrial magnetism file) 太阳与地球电磁指数文件类
 * 需要分别获得太阳与地球的电磁指数
 * x-axis: time (yymmdd)
 * y-axis: AP/F10.7
 * 使用getTimeSeries()获取x-axis对应时间序列
 * 使用getAPFactor()方法获取此文件内AP指数序列
 * 使用getF10Factor()获取此文件内F10.7指数序列
 * @author wxy
 * */
public class SATFile extends BaseFile {

    protected ArrayList<String> timeSeries;
    protected ArrayList<Double> APSeries;
    protected ArrayList<Double> F10Series;

    public SATFile(String fileURL) throws IOException {
        super(fileURL);
        timeSeries = new ArrayList<String>();
        APSeries = new ArrayList<>();
        F10Series = new ArrayList<>();
        readFile();
    }

    /**
     * 读取SAT图对应的数据文件
     * CssiSpaceWeather文件, 仅关心内部的成行数据
     * 无需对注释进行注解
     * 跳过所有带'#'标记的行
     * 每行数据格式:
     *    1 02 03 0004 05 06 07 08 09 10 11 12 13 014 15  16  17  18  19  20  21  21  023 24 25 026 00027 28 0029  0030 00031 00032 00033
     * yyyy mm dd BSRN ND Kp Kp Kp Kp Kp Kp Kp Kp Sum Ap  Ap  Ap  Ap  Ap  Ap  Ap  Ap  Avg Cp C9 ISN F10.7 Q Ctr81 Lst81 F10.7 Ctr81 Lst81
     * 共33个数据位
     * */
    @Override
    protected void readFile() throws IOException{
        File currentFile = new File(this.fileURL);
        BufferedReader currentBR = new BufferedReader(new FileReader(currentFile));
        String currentLine;
        while((currentLine = currentBR.readLine()) != null){
            String[] splitArray = currentLine.split("\\s+");
            if( !splitArray[0].equals("#") && splitArray.length == 33){
                SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd");
                String unFormatDate = splitArray[0] + "-" + splitArray[1] + "-" + splitArray[2];
                String currentDate;
                double currentAP;
                double currentF10;
                //                    currentDate = ft.parse(unFormatDate);
                currentDate = unFormatDate;
                currentAP = Double.parseDouble(splitArray[14]);
                currentF10 = Double.parseDouble(splitArray[26]);
                this.timeSeries.add(currentDate);
                this.APSeries.add(currentAP);
                this.F10Series.add(currentF10);
            }
        }
        currentBR.close();
        if(this.timeSeries.isEmpty() || this.APSeries.isEmpty() || this.F10Series.isEmpty()){
            throw new IOException("错误的文件格式！");
        }
    }

    /**
     * @return return a Array<Date> represent x-axis data: Time series
     * */
    public ArrayList<String> getTimeSeries() {
        return timeSeries;
    }

    /**
     * @return return a Array<Double> represent y-axis data: AP factor
     * */
    public ArrayList<Double> getAPSeries() {
        return APSeries;
    }

    /**
     * @return return a Array<Double> represent y-axis data: F10.7 factor
     * */
    public ArrayList<Double> getF10Series() {
        return F10Series;
    }
}
