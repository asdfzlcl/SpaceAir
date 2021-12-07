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
        File configFile = new File(FileHelper.configFilePath);
        properties = new Properties();
        if(!configFile.exists()){
            configFile.createNewFile();
        }
        InputStream inputStream = new FileInputStream(configFile);
        properties.load(inputStream);
        inputStream.close();
        System.out.println(properties);
    }

    public String getTPathFromConfig(){
        return properties.getProperty("T_file_path");
    }
    public String getUPathFromConfig(){
        return properties.getProperty("U_file_path");
    }
    public String getOPathFromConfig(){
        return properties.getProperty("O_file_path");
    }
    public String getVPathFromConfig(){
        return properties.getProperty("V_file_path");
    }
    public void setTPathToConfig(String path){
        properties.setProperty("T_file_path", path);
    }
    public void setUPathToConfig(String path){
        properties.setProperty("U_file_path", path);
    }
    public void setVPathToConfig(String path){
        properties.setProperty("V_file_path", path);
    }
    public void setOPathToConfig(String path){
        properties.setProperty("O_file_path", path);
    }
    public void store() throws IOException {
        OutputStream outputStream = new FileOutputStream(new File(FileHelper.configFilePath));
        properties.store(outputStream, null);
        outputStream.close();
    }
}
