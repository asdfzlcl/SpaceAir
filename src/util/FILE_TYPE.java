package util;

/**
 * 枚举类 FILE_TYPE
 * 数据文件类型
 * T文件：即温度数据
 * U文件：即带状风流数据
 * V文件：即V风数据
 * O文件：即垂直风速
 * */
public enum FILE_TYPE {
    T("T", "lev", "lat", "lon"), //temperature
    U("U","lev", "lat", "lon"), //Zonal Winds
    V("v","level", "latitude", "longitude"),  //V component of wind
    O("OMEGA","lev", "lat", "lon");  //Omega velocity

    public final String attr; //attr 表示其在文件内的变量名称
    public final String level;
    public final String latitude;
    public final String longitude;
    FILE_TYPE(String a, String level, String latitude, String longitude){
        this.attr = a;
        this.level = level;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
