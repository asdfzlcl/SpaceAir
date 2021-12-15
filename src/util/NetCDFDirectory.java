package util;

import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class NetCDFDirectory {

    private FILE_TYPE type;

    //中国区域经纬度上下限
    public static final double latUpper = 53.5;  //（N）纬度上限
    public static final double latLower = 4.0;  //（N）纬度下限
    public static final double lonUpper = 135.0;  //（E）经度上限
    public static final double lonLower = 73.5; //（E）经度下限

    public int status = 0;
    private String directoryPath;
    private final List<NetCDFFile> directoryList;
    private final List<Double> latitudeList;   // complete latitude array
    private int latStartIndex = 99999;    // the start index of latitude(of china schema)
    private int latLength = 0; // the length of the schema of china
    private final List<Double> longitudeList;  // same as latitude
    private int lonStartIndex = 99999;
    private int lonLength = 0;
    private final List<Double> levelList;  // the origin level list of this file type


    NetCDFDirectory(FILE_TYPE file_type, String path){
        this.type = file_type;
        this.directoryPath = path;
        directoryList = new ArrayList<>();
        latitudeList = new ArrayList<>();
        longitudeList = new ArrayList<>();
        levelList = new ArrayList<>();
    }


    public void init(){
        File currentDirectory = new File(directoryPath);
        File[] currentFiles = currentDirectory.listFiles();

        directoryList.clear();
        levelList.clear();
        latitudeList.clear();
        longitudeList.clear();

        if(currentFiles == null){
            status = -1;
            return;
        }
        for(File file:currentFiles){
            if(file.isFile()){
                // 判断格式是否为nc
                String extension = file.getName().substring(file.getName().lastIndexOf(".") + 1,
                        file.getName().length());
                if(isNCFile(file.getName())){
                    //抽取里面的数字（即时间信息）
                    String timeNumberString = file.getName().replaceAll("[^0-9]", "");
                    directoryList.add(new NetCDFFile(file.getName(), type, timeNumberString));
                }
            }
        }

        System.out.println("**************************************");
        for(NetCDFFile c: directoryList){
            System.out.println(c.getFileName());
        }
        System.out.println("**************************************");

        try {
            NetcdfFile current = NetcdfFile.open(directoryPath + File.separator + directoryList.get(0).getFileName());
            Variable level = current.findVariable(this.type.level);
            Variable lat = current.findVariable(this.type.latitude);
            Variable lon = current.findVariable(this.type.longitude);
            if(level == null || lat == null || lon == null){
                status = -1;
            }else {
                String[] levelString = level.read().toString().split("\\s+");
                String[] latString = lat.read().toString().split("\\s+");
                String[] lonString = lon.read().toString().split("\\s+");
                for(String i:levelString){
                    levelList.add(Double.parseDouble(i));
                }
                int count = 0;
                for(int i = 0; i < latString.length; i++){
                    double temp = Double.parseDouble(latString[i]);
                    if(temp > latLower && temp<= latUpper){
                        count ++;
                        latStartIndex = Math.min(latStartIndex, i);
                        latitudeList.add(temp);
                    }
                }
                latLength = count;
                count = 0;
                for(int j = 0; j < lonString.length; j++){
                    double temp = Double.parseDouble(lonString[j]);
                    if(temp > lonLower && temp<= lonUpper){
                        count ++;
                        lonStartIndex = Math.min(lonStartIndex, j);
                        longitudeList.add(temp);
                    }
                }
                lonLength = count;
            }
        } catch (Exception e) {
            e.printStackTrace();
            status = -1;
        }
    }


    public FILE_TYPE getType() {
        return type;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public List<NetCDFFile> getDirectoryList() {
        return directoryList;
    }

    public List<Double> getLatitudeList() {
        return latitudeList;
    }

    public int getLatStartIndex() {
        return latStartIndex;
    }

    public int getLatLength() {
        return latLength;
    }

    public List<Double> getLongitudeList() {
        return longitudeList;
    }

    public int getLonStartIndex() {
        return lonStartIndex;
    }

    public int getLonLength() {
        return lonLength;
    }

    public List<Double> getLevelList() {
        return levelList;
    }

    public void setType(FILE_TYPE type) {
        this.type = type;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }

    private boolean isNCFile(String filename){
        String lowNCFile = "nc";
        String upperNCFile = "NC";
        String extension = filename.substring(filename.lastIndexOf(".") + 1, filename.length());
        return (extension.equals(lowNCFile) | extension.equals(upperNCFile));
    }
}
