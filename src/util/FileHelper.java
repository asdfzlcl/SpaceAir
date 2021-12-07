package util;

import ucar.ma2.Array;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @classname FilePathHelper
 * @author wxy
 * @description Singleton 单例类
 * @date 2021-12-5
 * */
public class FileHelper {

    public static String classBasePath = System.getProperty("user.dir"); //当前工作路径
    public static String configFileName = ".config"; //config文件名称
    public static String configFilePath = classBasePath + File.separator + configFileName;

    private static FileHelper instance; //唯一实例

    public String T_DIR_PATH = null; // T文件路径
    public String U_DIR_PATH = null; // U文件路径
    public String V_DIR_PATH = null; // V文件路径
    public String O_DIR_PATH = null; // O文件路径

    private NetcdfFile currentNetcdfFile;  //当前正在读取的文件，对象会缓存文件信息
    private List<Double> levelList; //缓存当前的层数数组

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
     * construction function: FilePathHelper()
     * parameter: PathOfDirectory[] 存储各个文件类型的文件夹路径
     */
    private FileHelper(PathOfDirectory[] paths){
        currentNetcdfFile = null; //init currentNetcdfFile
        levelList = null;
        for(PathOfDirectory p: paths){
            switch (p.getType()){
                case T:
                    T_DIR_PATH = p.getDirectoryPath();
                    break;
                case O:
                    O_DIR_PATH = p.getDirectoryPath();
                    break;
                case U:
                    U_DIR_PATH = p.getDirectoryPath();
                    break;
                case V:
                    V_DIR_PATH = p.getDirectoryPath();
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * function: getFilePath
     * description: 通过文件类型和日期获取文件路径
     * parameter: FILE_TYPE对象type 描述文件类型（T,U,V,O); Date对象date 描述文件日期
     * return: String对象 文件路径
     * */
    public String getFilePath(FILE_TYPE type, Date date){
        String returnPath = null;
        switch (type){
            case V:
                returnPath = V_DIR_PATH + File.separator + "v";
                break;
            case U:
                returnPath = U_DIR_PATH + File.separator + "U";
                break;
            case T:
                returnPath = T_DIR_PATH + File.separator + "T";
                break;
            case O:
                returnPath = O_DIR_PATH + File.separator + "OMEGA";
                break;
        }
        //增加时间参数
        return returnPath;
    }

    /**
     * function: getFilePath
     * description: 通过一个标准的文件抽象类获取
     * parameter: FILE_TYPE对象type 描述文件类型（T,U,V,O); Date对象date 描述文件日期
     * return: String对象 文件路径
     * */
    public String getFilePath(NetCDFFile file){
        String returnPath = null;
        switch (file.getFileType()){
            case V:
                returnPath = V_DIR_PATH;
                break;
            case U:
                returnPath = U_DIR_PATH;
                break;
            case T:
                returnPath = T_DIR_PATH;
                break;
            case O:
                returnPath = O_DIR_PATH;
                break;
        }
        if(file.getFileName() == null){
            return getFilePath(file.getFileType(), file.getFileDate());
        }else{
            return returnPath + File.separator + file.getFileName();
        }
    }

    /**
     * function: getAllFileOfDirectory
     * description: 输入文件类型 获得对应目录下的所有文件信息 以对象数组形式返回
     * parameter: FILE_TYPE对象filType 描述文件类型 （T,U,V,O)
     * return: List<NetCADFile> 读取到的该目录下的所有NC文件信息
     * throw: IOException 当文件路径无效或内容为空时
     * */
    public List<NetCDFFile> getAllFileOfDirectory(FILE_TYPE fileType) throws IOException {
        String directoryPath = null;
        List<NetCDFFile> returnList = new ArrayList<>();
        switch (fileType){
            case V:
                directoryPath = V_DIR_PATH;
                break;
            case O:
                directoryPath = O_DIR_PATH;
                break;
            case T:
                directoryPath = T_DIR_PATH;
                break;
            case U:
                directoryPath = U_DIR_PATH;
                break;
            default:
                break;
        }
        File currentDirectory = new File(directoryPath);
        File[] currentFiles = currentDirectory.listFiles();
        if(currentFiles == null){
            throw new IOException();
        }
        for(File file:currentFiles){
            if(file.isFile()){
                returnList.add(new NetCDFFile(file.getName(), fileType, convertDate(file.getName())));
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
            levels.add(Double.parseDouble(i));
        }
        levelList = levels;
        return levels;
    }

    /**
     * function: getDataSetFromFile
     * parameter:NetCDFFile 与 level层数
     * description: 输入对应层数与内容 返回所有经纬度对应数值
     * return: 二维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<List<Float>> getDataSetVarLevel(NetCDFFile file, int levelIndex) throws IOException, InvalidRangeException {
        List<List<Float>> dataSet = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }
        int[] shape = variable.getShape();
        int[] origin = new int[]{levelIndex, 0, 0};
        int[] size = new int[]{1, shape[1], shape[2]};
        Array data2D = variable.read(origin, size).reduce(0);
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

    /**
     * function: getDataSetVarCoordinate
     * parameter:NetCDFFile 与 latIndex经度索引 longIndex纬度索引
     * description: 输入对应层数与内容 返回所有经纬度对应数值
     * return: 一维List
     * throw: IOException, InvalidRangeException 均是读文件发生的错误
     * */
    public List<Float> getDataSetVarCoordinate(NetCDFFile file, int latIndex, int longIndex)throws IOException, InvalidRangeException{
        List<Float> dataset = new ArrayList<>();
        currentNetcdfFile = NetcdfFile.open(getFilePath(file));
        Variable variable = currentNetcdfFile.findVariable(file.getFileType().attr);
        if(variable == null){
            throw new IOException();
        }
        int[] shape = variable.getShape();
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
     * return: List<Float> 即经度数组
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
     * return: List<Float> 即纬度数组
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
     * tool function: convertDate
     * parameter: String text of a nc file
     * return: Date object which represent the create date of the nc file
     * */
    private Date convertDate(String fileName){
        // pass
        return new Date();
    }
}
