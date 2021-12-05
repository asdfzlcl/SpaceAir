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
    T, //temperature
    U, //Zonal Winds
    V,  //V component of wind
    O  //Omega velocity
}
