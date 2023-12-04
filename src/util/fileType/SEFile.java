package util.fileType;

import javafx.util.Pair;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;


/**
 * SEF文件(Space Environment File) 空间环境文件类
 * 包含两张图
 * 第一张图以高度作为主索引, 给出在所有站点 在高度索引下的温度情况
 * 第二张图以站点作为索引, 给出某一个特定站点 温度随高度与时间的变化情况
 * 数据为四维
 * 包含三个数组
 * stationSeries: ArrayList<String>站点列表
 * dateSeries: ArrayList<ArrayList<Date>> 每个站点对应的时间序列
 * dataSeries: ArrayList<ArrayList<ArrayList<Pair<Double, Double>>>> 每个站点每个时间序列对应的高度温度点对
 * @author wxy
 * */
public class SEFile extends BaseFile{

    private final ArrayList<String> stationSeries;
    private final ArrayList<ArrayList<String>> timeSeries;
    private final ArrayList<ArrayList<ArrayList<Pair<Double, Double>>>> dataSeries;


    public SEFile(String fileURL) throws IOException {
        super(fileURL);
        stationSeries = new ArrayList<>();
        timeSeries = new ArrayList<>();
        dataSeries = new ArrayList<>();
        readFile();
    }

    /**
     * 跳过所有 '#' 开头的行
     * SEF File每行数据
     * day:YYYYMMDDhhmm     attitude           station              temperature
     * 196308040600        44.0                sjd                 -999
     * */
    @Override
    protected void readFile() throws IOException {
        File currentFile = new File(this.fileURL);
        BufferedReader currentBR = new BufferedReader(new FileReader(currentFile));
        String currentLine;
        String currentStation = "";
        String currentDate = "";
        int currentStationIndex = -1;
        int currentDateIndex = -1;
        while((currentLine = currentBR.readLine()) != null){
            if (currentLine.isEmpty())
                continue;
            if (currentLine.charAt(0) == '#' || currentLine.charAt(0) == '-')
                continue;
            String[] temp = currentLine.split("\\s+");
            String dateString = "";
            double attitude = 0;
            String stationString = "";
            double temperature = 0;
            try{
                dateString = temp[0].substring(0,4)+ "-" + temp[0].substring(4,6) + "-" +temp[0].substring(6,8) + " " + temp[0].substring(8,10) + ":" + temp[0].substring(10,12);
                attitude = Double.parseDouble(temp[1]);
                stationString = temp[2];
                temperature = Double.parseDouble(temp[3]);
            }catch (Exception e){
                continue;
            }
            // 无效数据
            if(temperature == -999)
                continue;
            if(!currentStation.equals(stationString)){
                if(stationSeries.contains(stationString))
                    currentStationIndex = stationSeries.indexOf(stationString);
                else{
                    stationSeries.add(stationString);
                    currentStationIndex = stationSeries.size() - 1;
                    timeSeries.add(new ArrayList<>());
                    dataSeries.add(new ArrayList<>());
                }
                currentStation = stationString;
            }
            if(!currentDate.equals(dateString)){
                if(timeSeries.get(currentStationIndex).contains(dateString))
                    currentDateIndex = timeSeries.get(currentStationIndex).indexOf(dateString);
                else{
                    timeSeries.get(currentStationIndex).add(dateString);
                    currentDateIndex = timeSeries.get(currentStationIndex).size() - 1;
                    dataSeries.get(currentStationIndex).add(new ArrayList<>());
                }
                currentDate = dateString;
            }
            dataSeries.get(currentStationIndex).get(currentDateIndex).add(new Pair<>(attitude, temperature));
        }

        currentBR.close();
        if(this.timeSeries.isEmpty() || this.stationSeries.isEmpty() || this.dataSeries.isEmpty()){
            throw new IOException("错误的文件格式！");
        }
    }

    /**
     * @return stationSeries 包含所有的站点(String)
     * */
    public ArrayList<String> getStationSeries() {
        return stationSeries;
    }

    /**
     * @return dateSeries 二维数组 包含每个站点的时间序列 与stationSeries对应
     * */
    public ArrayList<ArrayList<String>> getTimeSeries() {
        return timeSeries;
    }

    /**
     * @return dataSeries 三维数组 包含每个站点每个时间的高度温度点对, 与dateSeries对应
     * */
    public ArrayList<ArrayList<ArrayList<Pair<Double, Double>>>> getDataSeries() {
        return dataSeries;
    }
}
