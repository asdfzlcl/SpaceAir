package util;

import java.io.File;
import java.util.Date;

/**
 * @classname FilePathHelper
 * @author wxy
 * @discription Singleton 单例类
 * @date 2021-12-5
 * */
public class FilePathHelper {

    public static String classBasePath = System.getProperty("user.dir"); //当前工作路径

    private static FilePathHelper instance; //唯一实例

    private static String T_DIR_PATH = null; // T文件路径
    private static String U_DIR_PATH = null; // U文件路径
    private static String V_DIR_PATH = null; // V文件路径
    private static String O_DIR_PATH = null; // O文件路径

    /**
     * function: getInstance()
     * description: 获得唯一FilePathHelper唯一实例
     * throws: NullPointerException 当instance未被创建的时候
     * */
    public static FilePathHelper getInstance() throws NullPointerException{
        if(instance != null){
            return instance;
        }else{
            throw new NullPointerException();
        }
    }

    /**
     * construction function: FilePathHelper()
     * parameter: PathOfDirectory[] 存储各个文件类型的文件夹路径
     */
    public FilePathHelper(PathOfDirectory[] paths){
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



}
