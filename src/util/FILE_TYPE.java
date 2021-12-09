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
    T("T" ,0), //temperature
    U("U", 1), //Zonal Winds
    R("RHO_CLUBB", 2),  //R component of wind
    O("OMEGA", 3);  //Omega velocity

    public static final int count = 4;


    public final String attr; //attr 表示其在文件内的变量名称
    public final String level = "lev";
    public final String latitude = "lat";
    public final String longitude = "lon";
    public final int index;


    FILE_TYPE(String a, int index){
        this.attr = a;
        this.index = index;
    }
}
