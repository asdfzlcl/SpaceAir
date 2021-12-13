package util;

/**
 * 枚举类 FILE_TYPE
 * 数据文件类型
 * T文件：即温度数据
 * U文件：即带状风流数据
 * V文件：即V风数据
 * O文件：即垂直风速
 * @warnning: 修改此文件来进行读取文件顺序修改
 * */
public enum FILE_TYPE {
    T("T" ,0, "lev", "lat", "lon"), //temperature
    U("U", 1, "lev", "lat", "lon"), //Zonal Winds
    R("RHO_CLUBB", 2, "lev", "lat", "lon"),  //R component of wind
    O("OMEGA", 3, "lev", "lat", "lon"),  //Omega velocity
    V("v", 4, "level", "latitude", "longitude");

    public static final int count = 5;
    public static final FILE_TYPE[] sequence = new FILE_TYPE[]{T, U, R, O, V};

    public final String attr; //attr 表示其在文件内的变量名称
    public final String level;
    public final String iLevel = "ilev";
    public final String latitude;
    public final String longitude;
    public final int index;


    FILE_TYPE(String a, int index, String lev, String lat, String lon){
        this.attr = a;
        this.index = index;
        this.level = lev;
        this.latitude = lat;
        this.longitude = lon;
    }
}
