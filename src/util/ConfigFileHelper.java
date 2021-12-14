package util;

import java.io.*;
import java.util.Properties;

/**
 * @description 单例类 传递launcher所需要的config信息
 * @author wxy
 * @date 2021-12-07
 * */
public class ConfigFileHelper {

    private static ConfigFileHelper instance = null;
    private final Properties properties;

    public static ConfigFileHelper getInstance() throws IOException {
        if(instance == null){
            instance = new ConfigFileHelper();
        }
        return instance;
    }

    public ConfigFileHelper() throws IOException {
        File configFile = new File(PathHelper.configFilePath);
        properties = new Properties();
        if(!configFile.exists()){
            configFile.createNewFile();
        }
        InputStream inputStream = new FileInputStream(configFile);
        properties.load(inputStream);
        inputStream.close();
        System.out.println(properties);
    }

    public String getPathFromConfig(FILE_TYPE type){
        return properties.getProperty(type + "_file_path");
    }

    public void setPathToConfig(String path, FILE_TYPE type){
        properties.setProperty(type + "_file_path", path);
    }


    public void store() throws IOException {
        OutputStream outputStream = new FileOutputStream(new File(PathHelper.configFilePath));
        properties.store(outputStream, null);
        outputStream.close();
    }
}
