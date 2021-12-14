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
 * @date 2021-12-5 remake in 2021-12-14
 * */
public class FileHelper {
    //instance
    private static FileHelper instance; //唯一实例

    //data parameter
    private List<Double> originHeightList = new ArrayList<>();

    //init member
    public int status;
    public List<NetCDFDirectory> netCDFDirectories = new ArrayList<>();
    private NetcdfFile currentNetcdfFile;  //当前正在读取的文件，对象会缓存文件信息

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
    public static void setInstance(String[] paths){
        instance = new FileHelper(paths);
    }


    /**
     * tool function: checkStatus
     * description: 自检路径与文件夹内容 读取所需信息 提前计算high
     * */
    public void checkStatus() throws Exception{
        boolean ifError = false;
        for(NetCDFDirectory n: netCDFDirectories){
            n.init();
            if(n.getType() == FILE_TYPE.T || n.getType() == FILE_TYPE.R){
                ifError = n.status == -1;
            }
        }
        if(ifError){
            throw new IOException();
        }else {
            Height.LevToHeight_70(getLevel(new NetCDFFile("", FILE_TYPE.T, "")),
                    getLevel(new NetCDFFile("", FILE_TYPE.R, "")),
                    getDataSetVarCoordinate(netCDFDirectories.get(FILE_TYPE.T.index).getDirectoryList().get(0),  40, 80));
            Height.LevToHeight_other(getLevel(new NetCDFFile("", FILE_TYPE.O, "")));
            Height.LevToHeight_other(getLevel(new NetCDFFile("", FILE_TYPE.V, "")));
        }
    }

    /**
     * construction function: FilePathHelper()
     * parameter: PathOfDirectory[] 存储各个文件类型的文件夹路径
     */
    private FileHelper(String[] paths){
        for (int i = 0;i < FILE_TYPE.count;i ++){
            netCDFDirectories.add(new NetCDFDirectory(FILE_TYPE.sequence[i], paths[i]));
        }
    }

    /**
     * function: getFilePath
     * description: 通过一个标准的文件抽象类获取
     * parameter: FILE_TYPE对象type 描述文件类型（T,U,V,O); Date对象date 描述文件日期
     * return: String对象 文件路径
     * */
    public String getFilePath(NetCDFFile file){
        String returnPath = netCDFDirectories.get(file.getFileType().index).getDirectoryPath();
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
        if(netCDFDirectories.get(fileType.index).status == -1){
            throw new IOException();
        }
        return netCDFDirectories.get(fileType.index).getDirectoryList();
    }


    /**
     * function: getLevelFromFile
     * @param file 需要获得的文件类型的任意一个文件
     * return: List<Integer> 即层数数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: levels是一个整型数组 且是升序的
     * */
    public List<Double> getLevel(NetCDFFile file) throws IOException{
        if(netCDFDirectories.get(file.getFileType().index).status == -1){
            throw new IOException();
        }
        return netCDFDirectories.get(file.getFileType().index).getLevelList();
    }


    /**
     * function: getDataSetFromFile
     * @param file 代表传入的文件信息
     * @param high 传入的高度数值(1<high<80)
     * description: 输入对应层数与内容 返回默认中国范围内的所有经纬度对应数值
     * return: 二维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<List<Float>> getDataSetVarLevel(NetCDFFile file, int high) throws IOException, InvalidRangeException {
        if(high > 80 || high < 1){
            throw new InvalidRangeException();
        }
        double height = high * 1000; // convert km to m
        int[] scope = Height.Position((int)height, file.getFileType());
        List<List<Float>> dataSet = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }
        int[] origin = new int[]{scope[0], netCDFDirectories.get(file.getFileType().index).getLatStartIndex(), netCDFDirectories.get(file.getFileType().index).getLonStartIndex()};;
        int[] size = new int[]{1, netCDFDirectories.get(file.getFileType().index).getLatLength(), netCDFDirectories.get(file.getFileType().index).getLonLength()};
        Array dataUpper;
        dataUpper = variable.read(origin, size).reduce(0);
        origin[0] = scope[1];
        Array dataLower;
        dataLower = variable.read(origin, size).reduce(0);

        List<Double> tempHeightList = Height.getHeightList(file.getFileType());


        float[][] upper = (float[][]) dataUpper.copyToNDJavaArray();
        float[][] lower = (float[][]) dataLower.copyToNDJavaArray();
        float[][] temp = new float[upper.length][upper[0].length];
        for(int i = 0;i<temp.length;i++){
            for(int j = 0;j<temp[0].length;j++){
                double de_x = tempHeightList.get(scope[0]) - tempHeightList.get(scope[1]);
                temp[i][j] = (float) (lower[i][j] + (upper[i][j] - lower[i][j])/de_x * (height - tempHeightList.get(scope[1])));
            }
        }
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
     * function: getDataSetFromFile
     * parameter:(default) NetCDFFile 与 high（高度 km) 以及 经纬度范围
     * description: 输入对应层数与内容 返回默认中国范围内的所有经纬度对应数值
     * return: 二维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<List<Float>> getDataSetVarLevel(NetCDFFile file, int high, double lat_sml, double lat_big,
                                                double lon_sml, double lon_big) throws IOException, InvalidRangeException {
        if(high > 80 || high < 1){
            throw new InvalidRangeException();
        }
        double height = high * 1000; // convert km to m
        int[] scope = Height.Position((int)height, file.getFileType());
        List<List<Float>> dataSet = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }

        List<Double> tempLatList = netCDFDirectories.get(file.getFileType().index).getLatitudeList();
        List<Double> tempLonList = netCDFDirectories.get(file.getFileType().index).getLongitudeList();
        int latOrigin = netCDFDirectories.get(file.getFileType().index).getLatStartIndex();
        int lonOrigin = netCDFDirectories.get(file.getFileType().index).getLonStartIndex();
        int latSize = 0;
        int lonSize = 0;
        boolean first = true;
        for(double d:tempLatList){
            if(d>lat_sml && d<=lat_big){
                latOrigin = first ? tempLatList.indexOf(d) : latOrigin;
                latSize++;
                first = false;
            }
        }
        first = true;
        for(double d:tempLonList){
            if(d>lon_sml && d<=lon_big){
                lonOrigin = first ? tempLonList.indexOf(d) : lonOrigin;
                lonSize++;
                first = false;
            }
        }
        int[] origin = new int[]{scope[0], latOrigin, lonOrigin};;
        int[] size = new int[]{1, latSize, lonSize};
        Array dataUpper;
        dataUpper = variable.read(origin, size).reduce(0);
        origin[0] = scope[1];
        Array dataLower;
        dataLower = variable.read(origin, size).reduce(0);

        List<Double> tempHeightList = Height.getHeightList(file.getFileType());


        float[][] upper = (float[][]) dataUpper.copyToNDJavaArray();
        float[][] lower = (float[][]) dataLower.copyToNDJavaArray();
        float[][] temp = new float[upper.length][upper[0].length];
        for(int i = 0;i<temp.length;i++){
            for(int j = 0;j<temp[0].length;j++){
                double de_x = tempHeightList.get(scope[0]) - tempHeightList.get(scope[1]);
                temp[i][j] = (float) (lower[i][j] + (upper[i][j] - lower[i][j])/de_x * (height - tempHeightList.get(scope[1])));
            }
        }
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
        int latIndex =  fuzzySearch(getLatitude(file), latValue);
        int longIndex = fuzzySearch(getLongitude(file), lonValue);
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
    public List<Double> getLongitude(NetCDFFile file) throws IOException{
        if(netCDFDirectories.get(file.getFileType().index).status == -1){
            throw new IOException();
        }
        return netCDFDirectories.get(file.getFileType().index).getLongitudeList();
    }

    /**
     * function: getLatitudeFromFile
     * parameter: 需要获得纬度的文件类型的任意一个文件
     * return: List<Double> 即纬度数组
     * throws: IOException 当文件不存在或文件格式有误时
     * @warnning: 纬度也是float 数组升序 有正负
     * */
    public List<Double> getLatitude(NetCDFFile file) throws IOException{
        if(netCDFDirectories.get(file.getFileType().index).status == -1){
            throw new IOException();
        }
        return netCDFDirectories.get(file.getFileType().index).getLatitudeList();
    }


    public List<Double> getHeightList(NetCDFFile file){
        return Height.getHeightList(file.getFileType());
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
