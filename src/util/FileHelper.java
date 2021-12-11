package util;

import ucar.ma2.Array;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * @classname FilePathHelper
 * @author wxy
 * @description Singleton 单例类
 * @date 2021-12-5
 * */
public class FileHelper {

    //static final member (class const)
    public static final String classBasePath = System.getProperty("user.dir"); //当前工作路径
    public static final String outputDicPath = classBasePath + File.separator + "output"; //算法模块输出路径
    public static final String configFileName = ".config"; //config文件名称
    public static final String configFilePath = classBasePath + File.separator + configFileName; //config文件完整路径

    public static final double latUpper = 53.5;  //（N）纬度上限
    public static final double latLower = 4.0;  //（N）纬度下限
    public static final double lonUpper = 135.0;  //（E）经度上限
    public static final double lonLower = 73.5; //（E）经度下限

    //instance
    private static FileHelper instance; //唯一实例

    //init member
    public int status;
    public List<String> dirPath = new ArrayList<>();  //路径信息
    private List<Double> levelList = new ArrayList<>();  //层数数组
    private List<Double> iLevelList = new ArrayList<>(); //i层数数组 仅大气密度文件拥有
    private List<Float> atomTemperatureList = new ArrayList<>();
    private List<Double> highList = new ArrayList<>();  //高度数组 由层数数组计算得到
    private List<Double> longitude = new ArrayList<>();  //经度数组
    private List<Double> latitude = new ArrayList<>();  //纬度数组
    private NetcdfFile currentNetcdfFile;  //当前正在读取的文件，对象会缓存文件信息

    private int latStartIndex = 99999;
    private int lonStartIndex = 99999;
    private int latLength = 0;
    private int lonLength = 0;

    /**
     * function: getInstance()
     * description: 获得唯一FilePathHelper唯一实例
     * throws: NullPointerException 当instance未被创建的时候
     * */
    public static FileHelper getInstance() throws NullPointerException{
        if(instance != null){
            return instance;
        }else{
            throw new NullPointerException();
        }
    }


    /**
     * init function: setInstance()
     * parameter: PathOfDirectory[] 存储各个文件类型的文件夹路径
     */
    public static void setInstance(PathOfDirectory[] paths){
        instance = new FileHelper(paths);
    }


    /**
     * tool function: checkStatus
     * description: 自检路径与文件夹内容 读取所需信息 提前计算high
     * return: status: -1?说明程序无法正常启动
     * */
    public int checkStatus() throws Exception{
        this.status = 0;
        File currentDirectory = new File(dirPath.get(FILE_TYPE.T.index));
        File[] TFiles = currentDirectory.listFiles();
        currentDirectory = new File(dirPath.get(FILE_TYPE.R.index));
        File[] RFiles = currentDirectory.listFiles();
        if(TFiles == null || RFiles == null){
            this.status = -1;
        }else{
            for(File t:TFiles){
                if(t.isFile() && isNCFile(t.getName())){
                    NetCDFFile tFile = new NetCDFFile(t.getName(), FILE_TYPE.T, "");
                    try {
                        levelList = getLevelFromFile(tFile);
                        longitude = getLongitudeFromFile(tFile);
                        latitude = getLatitudeFromFile(tFile);
                        atomTemperatureList = getDataSetVarCoordinate(tFile, 0, 0);
                        break;
                    } catch (IOException | InvalidRangeException ignored) {
                    }
                }
            }
            for(File r:RFiles){
                if(r.isFile() && isNCFile(r.getName())){
                    NetCDFFile rFile = new NetCDFFile(r.getName(), FILE_TYPE.R, "");
                    try {
                        iLevelList = getILevelFromRFile(rFile);
                        break;
                    } catch (IOException ignored) {
                    }
                }
            }
            if(levelList == null || longitude == null || latitude == null
                    || atomTemperatureList == null || iLevelList == null
                    || levelList.size() == 0 || longitude.size() == 0
                    || latitude.size() == 0 ||atomTemperatureList.size() == 0
                    || iLevelList.size() == 0){
                this.status = -1;
            }else {
                highList = Height.LevToHeight(levelList, iLevelList, atomTemperatureList);
                int count = 0;
                for(double d: latitude){
                    if(d > latLower && d <= latUpper){
                        count ++;
                        latStartIndex = Math.min(latStartIndex, latitude.indexOf(d));
                    }
                }
                latLength = count;
                count = 0;
                for(double d: longitude){
                    if(d > lonLower && d <= lonUpper){
                        count++;
                        lonStartIndex = Math.min(lonStartIndex, longitude.indexOf(d));
                    }
                }
                lonLength = count;
            }
        }
        return status;
    }

    /**
     * construction function: FilePathHelper()
     * parameter: PathOfDirectory[] 存储各个文件类型的文件夹路径
     */
    private FileHelper(PathOfDirectory[] paths){
        currentNetcdfFile = null; //init currentNetcdfFile
        for(int i = 0;i<FILE_TYPE.count;i++){
            dirPath.add(""); //init dirPath
        }
        for(PathOfDirectory p: paths){
            dirPath.set(p.getType().index, p.getDirectoryPath());
        }
    }

    /**
     * function: getFilePath
     * description: 通过一个标准的文件抽象类获取
     * parameter: FILE_TYPE对象type 描述文件类型（T,U,V,O); Date对象date 描述文件日期
     * return: String对象 文件路径
     * */
    public String getFilePath(NetCDFFile file){
        String returnPath = dirPath.get(file.getFileType().index);
        return returnPath + File.separator + file.getFileName();
    }

    /**
     * function: getAllFileOfDirectory
     * description: 输入文件类型 获得对应目录下的所有文件信息 以对象数组形式返回
     * parameter: FILE_TYPE对象filType 描述文件类型 （T,U,V,O)
     * return: List<NetCADFile> 读取到的该目录下的所有NC文件信息
     * throw: IOException 当文件路径无效或内容为空时
     * */
    public List<NetCDFFile> getAllFileOfDirectory(FILE_TYPE fileType) throws IOException {
        String directoryPath = dirPath.get(fileType.index);
        List<NetCDFFile> returnList = new ArrayList<>();
        File currentDirectory = new File(directoryPath);
        File[] currentFiles = currentDirectory.listFiles();
        if(currentFiles == null){
            throw new IOException();
        }
        for(File file:currentFiles){
            if(file.isFile()){
                // 判断格式是否为nc
                String lowNCFile = "nc";
                String upperNCFile = "NC";
                String extension = file.getName().substring(file.getName().lastIndexOf(".") + 1,
                        file.getName().length());
                if(extension.equals(lowNCFile) | extension.equals(upperNCFile)){
                    //抽取里面的数字（即时间信息）
                    String timeNumberString = file.getName().replaceAll("[^0-9]", "");
                    returnList.add(new NetCDFFile(file.getName(), fileType, timeNumberString));
                }
            }
        }
        return returnList;
    }


    /**
     * function: getLevelFromFile
     * parameter: 需要获得的文件类型的任意一个文件
     * return: List<Integer> 即层数数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: levels是一个整型数组 且是升序的
     * */
    public List<Double> getLevelFromFile(NetCDFFile file) throws IOException{
        List<Double> levels = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable level = currentNetcdfFile.findVariable(file.getFileType().level);
        if(level == null){
            throw new IOException();
        }
        String[] temp = level.read().toString().split("\\s+");
        for(String i:temp){
            double current = Double.parseDouble(i);

            levels.add(Double.parseDouble(i));
        }
        return levels;
    }


    /**
     * function: getDataSetFromFile
     * parameter:(default) NetCDFFile 与 level层数
     * description: 输入对应层数与内容 返回默认中国范围内的所有经纬度对应数值
     * return: 二维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<List<Float>> getDataSetVarLevel(NetCDFFile file, int highIndex) throws IOException, InvalidRangeException {
        List<List<Float>> dataSet = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }
        int[] origin = new int[]{highIndex, latStartIndex, lonStartIndex};;
        int[] size = new int[]{1, latLength, lonLength};
        Array data2D;
        data2D = variable.read(origin, size).reduce(0);

        float[][] temp = (float[][]) data2D.copyToNDJavaArray();
        for(float[] list :temp){
            List<Float> inner = new ArrayList<>();
            for(float i :list){
                inner.add(i);
            }
            dataSet.add(inner);
        }
        return dataSet;
    }

    public List<List<Float>> getDataSetVarLevel(NetCDFFile file, int highIndex, double lat_sml, double lat_big,
                                                double lon_sml, double lon_big) throws IOException, InvalidRangeException {
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        List<List<Float>> dataSet = new ArrayList<>();
        if(variable == null){
            throw new IOException();
        }
        int latOrigin = 0;
        int lonOrigin = 0;
        int latSize = 0;
        int lonSize = 0;
        boolean first = true;
        for(double d:latitude){
            if(d>lat_sml && d<=lat_big){
                latOrigin = first ? latitude.indexOf(d) : latOrigin;
                latSize++;
                first = false;
            }
        }
        first = true;
        for(double d:longitude){
            if(d>lon_sml && d<=lon_big){
                lonOrigin = first ? longitude.indexOf(d) : lonOrigin;
                lonSize++;
                first = false;
            }
        }
        int[] origin = new int[]{highIndex, latOrigin, lonOrigin};;
        int[] size = new int[]{1, latSize, lonSize};
        Array data = variable.read(origin, size).reduce(0);
        float[][] temp = (float[][]) data.copyToNDJavaArray();
        for(float[] list :temp){
            List<Float> inner = new ArrayList<>();
            for(float i :list){
                inner.add(i);
            }
            dataSet.add(inner);
        }
        return dataSet;
    }

    /**
     * function: getDataSetVarCoordinate
     * parameter:NetCDFFile 与 latIndex经度索引 longIndex纬度索引
     * description: 输入对应层数与内容 返回所有经纬度对应数值
     * return: 一维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<Float> getDataSetVarCoordinate(NetCDFFile file, double latValue, double lonValue)throws IOException, InvalidRangeException{
        List<Float> dataset = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }
        int[] shape = variable.getShape();
        int latIndex =  fuzzySearch(latitude, latValue);
        int longIndex = fuzzySearch(longitude, lonValue);
        int[] origin = new int[]{0, latIndex, longIndex};
        int[] size = new int[]{shape[0], 1, 1};
        Array data = variable.read(origin, size).reduce().reduce();
        float[] temp = (float[]) data.copyTo1DJavaArray();
        for(float f : temp){
            dataset.add(f);
        }
        return dataset;
    }

    /**
     * function: getLongitudeFromFile
     * parameter: 需要获得经度的文件类型的任意一个文件
     * return: List<Double> 即经度数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: 经度是float 数组升序
     * */
    public List<Double> getLongitudeFromFile(NetCDFFile file) throws IOException{
        List<Double> longitudes = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable longitude = currentNetcdfFile.findVariable(file.getFileType().longitude);
        if(longitude == null){
            throw new IOException();
        }
        String[] temp = longitude.read().toString().split("\\s+");
        for(String s:temp){
            longitudes.add(Double.parseDouble(s));
        }
        return longitudes;
    }

    /**
     * function: getLatitudeFromFile
     * parameter: 需要获得纬度的文件类型的任意一个文件
     * return: List<Double> 即纬度数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: 纬度也是float 数组升序 有正负
     * */
    public List<Double> getLatitudeFromFile(NetCDFFile file) throws IOException{
        List<Double> latitudes = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable latitude = currentNetcdfFile.findVariable(file.getFileType().latitude);
        if(latitude == null){
            throw new IOException();
        }
        String[] temp = latitude.read().toString().split("\\s+");
        for(String s:temp){
            latitudes.add(Double.parseDouble(s));
        }
        return latitudes;
    }

    /**
     * function: createAlgorithmOutPut
     * parameter: 算法的输入
     * description: 从前端获得的信息来生成算法模块（标准大气模型）的输出
     * throw: IOException 当无法读取文件或文件为空时 这时候应提出用户检查参数
     * */
    public List<List<Double>> getAlgOut(int year,int doy,double uth,double height,double lat,double lon,double f107p,
                                        double f107a,double apd,double ap1, double ap2,double ap3) throws IOException{
        List<List<Double>> dataset = new ArrayList<>();
        String outputName = "";
        File algTXT = new File(outputDicPath + File.separator + outputName);
        BufferedReader br = null;
        br = new BufferedReader(new FileReader(algTXT));
        String current;
        String[] count;
        if((current = br.readLine()) != null){
            count = current.split("\\s+");
            for(int i = 0;i<count.length;i++){
                dataset.add(new ArrayList<>());
            }
            do{
                for(int i = 0;i<count.length;i++){
                    dataset.get(i).add(Double.parseDouble(count[i]));
                }
            }while ((current = br.readLine()) != null);
        }
        if (dataset.size() != 0){
            throw new IOException();
        }
        return dataset;
    }

    /**
     * function: getILevelFromRFile
     * parameter: 需要获得ilevel的R类型的一个文件
     * return: List<Double> 即纬度数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: ilevel double 数组升序 正数
     * */
    private List<Double> getILevelFromRFile(NetCDFFile file) throws IOException{
        List<Double> iLevelList = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable iLevel = currentNetcdfFile.findVariable(FILE_TYPE.R.iLevel);
        if(iLevel == null){
            throw new IOException();
        }
        String[] temp = iLevel.read().toString().split("\\s+");
        for(String s:temp){
            iLevelList.add(Double.parseDouble(s));
        }
        return iLevelList;
    }

    private boolean isNCFile(String filename){
        String lowNCFile = "nc";
        String upperNCFile = "NC";
        String extension = filename.substring(filename.lastIndexOf(".") + 1, filename.length());
        return (extension.equals(lowNCFile) | extension.equals(upperNCFile));
    }

    public List<Double> getHighList() {
        return highList;
    }

    public List<Double> getLongitude(){
        List<Double> returnList = new ArrayList<>();
        for(int i = lonStartIndex; i < lonStartIndex + lonLength;i++){
            returnList.add(longitude.get(i));
        }
        return returnList;
    }

    public List<Double> getLatitude() {
        List<Double> returnList = new ArrayList<>();
        for(int i = latStartIndex;i < latLength + latStartIndex;i++){
            returnList.add(latitude.get(i));
        }
        return returnList;
    }

    private int fuzzySearch(List<Double> list, double value){
        int l=0,r=list.size();
        while(l+1<r)
        {
            int m=(l+r)>>1;
            if(list.get(m)<=value)
                l=m;
            else
                r=m;
        }
        return l;
    }

}
