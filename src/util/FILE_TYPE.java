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
    T("T" ,0, "lev", "lat", "lon", "大气温度", false), //temperature
    U("U", 1, "lev", "lat", "lon", "纬向风速", false), //Zonal Winds
    R("RHO_CLUBB", 2, "ilev", "lat", "lon", "大气密度", false),  //
    O("OMEGA", 3, "lev", "lat", "lon", "垂直风速",false),  //Omega velocity
    V("v", 4, "level", "latitude", "longitude", "经向风速", true), //V component of wind
    H("H2O", 5, "lev", "lat", "lon", "绝对湿度", false),// H absolute humidity
    rH("r", 6, "level", "latitude", "longitude", "相对湿度", true); //rH relative humidity


    public static final int count = 7;
    public static final FILE_TYPE[] sequence = new FILE_TYPE[]{T, U, R, O, V, H, rH};

    public final String attr; //attr 表示其在文件内的变量名称
    public final String level;
    public final String latitude;
    public final String longitude;
    public final String name;
    public final int index;
    public final boolean ifScaled;


    FILE_TYPE(String a, int index, String lev, String lat, String lon, String n, boolean ifScaled){
        this.attr = a;
        this.index = index;
        this.level = lev;
        this.latitude = lat;
        this.longitude = lon;
        this.name = n;
        this.ifScaled = ifScaled;
    }
}
