package util;

import java.io.File;

public class PathHelper {
    //static final member (class const)
    public static final String classBasePath = System.getProperty("user.dir"); //当前工作路径
    public static final String outputDicPath = classBasePath + File.separator + "output"; //算法模块输出路径
    public static final String configFileName = ".config"; //config文件名称
    public static final String configFilePath = classBasePath + File.separator + configFileName; //config文件完整路径
}
