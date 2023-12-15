package util.fileType;

import org.joda.time.DateTime;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;


/**
 * IPFile(Ionization Parameter File, 电离层参数文件)
 * 数据包含多个维度, 维度如下:
 * 1. 时间维度(单位 day-hour), 提供一个timeSeries(ArrayList) 代表此文件包含的所有时间序列
 * 2. 经纬维度(单位 度), 提供一个positionSeries(ArrayList<ArrayList<double>) 内部List包含两个List, 代表所有的经纬度开头
 * 3. IPF(电离层闪烁指数)维度(单位 TECU),
 * 包含三个数组
 * timeSeries: ArrayList<DateTime> 包含所有的时间序列
 * positionSeries: ArrayList<Double> 每个时间序列内的纬度序列(默认每个时间序列都包含所有纬度序列)(经度序列固定为-180~180, 分辨率:5度)
 * dataSeries: ArrayList<ArrayList<ArrayList<Double>>> 每个时间序列的每个纬度序列包含的IPF值
 * @author wxy
 * */
public class IPFile extends BaseFile{

    private final ArrayList<String> timeSeries;

    private final ArrayList<Double> LongitudeSeries;

    private final ArrayList<Double> positionSeries;

    private final ArrayList<ArrayList<ArrayList<Double>>> dataSeries;

    public IPFile(String fileURL) throws IOException {
        super(fileURL);
        LongitudeSeries  = new ArrayList<>();
        timeSeries = new ArrayList<>();
        positionSeries = new ArrayList<>();
        dataSeries = new ArrayList<>();
        readFile();
    }

    /**
     * IPF File 比较复杂
     * 大部分都直接剥离行内的空格与制表符随后使用regex判断当前行为什么数据
     * */
    @Override
    protected void readFile() throws IOException {
        File currentFile = new File(this.fileURL);
        BufferedReader currentBR = new BufferedReader(new FileReader(currentFile));
        String currentLine;
        boolean startValidation = false;
        boolean isFirstSeries = true;
        boolean isInDataSeries = false;
        boolean hasCalculatedLongitude = false;
        int countInPositionSeries = -1;
        int countInDateSeries = -1;
        boolean isRSM = false;
        int count = 0;
        while((currentLine = currentBR.readLine()) != null){
            if(!startValidation){
                // 去除多余的空格与tab
                String temp = currentLine.replace("\t", "");
                temp = temp.replace(" ", "");
                if(temp.equals("ENDOFHEADER"))
                    startValidation = true;
                count++;
            }else{
                count++;
                // 首先将这行按照空格分离
                String match = currentLine.replace("\t", "");
                match = match.replace(" ", "");
                String[] temp = currentLine.split("\\s+");
                if(isRSM == true && ! match.matches("[0-9]*ENDOFRMSMAP")  ) {
                    continue;
                } else  {
                    isRSM = false;
                }
                if(match.matches("[0-9]*STARTOFTECMAP")) {
                    continue;
                }
                if(match.matches("[0-9]*STARTOFRMSMAP")) {
                    isRSM = true;
                    continue;
                }
                if(match.matches("[0-9]*EPOCHOFCURRENTMAP")){
                    System.out.println(count);
                    timeSeries.add(new DateTime(Integer.parseInt(temp[1]), Integer.parseInt(temp[2]),
                            Integer.parseInt(temp[3]), Integer.parseInt(temp[4]), Integer.parseInt(temp[5]), Integer.parseInt(temp[6])).toString("yyyy-MM-dd HH:mm:ss"));
                    dataSeries.add(new ArrayList<>());
                    countInPositionSeries = -1;
                    countInDateSeries ++;
                    continue;
                }
                // 说明是经纬度行
                if(match.matches("[0-9.\\-]*LAT/LON1/LON2/DLON/H")){
                    isInDataSeries = true;
                    countInPositionSeries ++;
                    if(!hasCalculatedLongitude) {
                        String[] splitFromNeg = temp[1].split("-");
                        Double Dlon = Double.valueOf(temp[3]);
                        Double Lon1;
                        if(splitFromNeg.length > 2)
                            Lon1 = -Double.parseDouble(splitFromNeg[2]);
                        else
                             Lon1 = -Double.parseDouble(splitFromNeg[1]);
                        Double Lon2 = Double.valueOf(temp[2]);
                        System.out.println(Dlon);
                        System.out.println(Lon1);
                        System.out.println(Lon2);
                        for (Double i = Lon1;i <= Lon2 ;i+=Dlon) {
                            LongitudeSeries.add((double) i);
                        }
                        hasCalculatedLongitude = true;
                    }
                    if(isFirstSeries){
                        // 此处有负数
                        String[] splitFromNeg = temp[1].split("-");
                        if(splitFromNeg.length > 2)
                            positionSeries.add(-Double.parseDouble(splitFromNeg[1]));
                        else
                            positionSeries.add(Double.parseDouble(splitFromNeg[0]));
                    }
                    dataSeries.get(countInDateSeries).add(new ArrayList<>());
                    continue;
                }
                if(isInDataSeries && temp[temp.length - 1].matches("[0-9]*")){
                    for(String i: temp){
                        if(i.isEmpty())
                            continue;
                        double tempData = Double.parseDouble(i);
                        dataSeries.get(countInDateSeries).get(countInPositionSeries).add(tempData);
                    }
                    continue;
                }
                if(match.matches("[0-9]*ENDOFTECMAP")){
                    isFirstSeries = false;
                }
            }
        }
        currentBR.close();
        if(this.timeSeries.isEmpty() || this.positionSeries.isEmpty() || this.dataSeries.isEmpty()){
            throw new IOException("错误的文件格式！");
        }
    }

    /**
     * 获得当前文件的时间序列
     * 内部元素是个DataTime对象
     *
     * @return timeSeries: ArrayList<DateTime>
     */
    public ArrayList<String> getTimeSeries() {
        return timeSeries;
    }


    /**
     * 获得当前文件的经度序列
     * 经度序列默认为-180~180 分辨率为5度
     * @return positionSeries: ArrayList<Double>
     * */
    public ArrayList<Double> getLongitudeSeries() {
        return LongitudeSeries;
    }



    /**
     * 获得当前文件的纬度序列
     * 经度序列默认为-180~180 分辨率为5度
     * @return positionSeries: ArrayList<Double>
     * */
    public ArrayList<Double> getPositionSeries() {
        return positionSeries;
    }



    /**
     * 获得数据序列
     * 维度:[时间, 纬度, 每5度经度的数据]
     * shape: [countOfTime, countOfLatitude, 71]
     * @return dataSeries: ArrayList<ArrayList<ArrayList<Double>>>
     * */
    public ArrayList<ArrayList<ArrayList<Double>>> getDataSeries() {
        return dataSeries;
    }
}
