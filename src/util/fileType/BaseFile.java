package util.fileType;
import util.FileType;
import java.util.ArrayList;

/**
 * 此类用作其他文件类型对应类的父类, 涵盖了文件类型类包含的基础信息以及基础构造函数
 * 并且包含一个静态方法
 * 此静态方法
 * @author wxy
 * */
public class BaseFile {

    protected String fileURL;

    /**
     * 基础构造函数, 将文件URL传入, 并使用成员变量保存
     * 一般不会在外部使用次构造函数, 因此为protected前缀
     * @param fileURL 传入的文件路径
     * */
    protected BaseFile(String fileURL){
        this.fileURL = fileURL;
    }

    /**
     * @param fileURL 传入的文件路径, 推荐使用PathHelper内的方法获取前缀
     * @param fileType 获取的文件类型, 使用enum类
     * @return 一个文件类型对应的对象, 注意需要使用强制类型转换将其转换为对应的对象
     * */
    public static BaseFile readFile(String fileURL, FileType fileType) {
        BaseFile currentFile = null;
        switch (fileType){
            case SpaceEnvironmentFIle:
                currentFile = new SEFile(fileURL);
                break;
            case AtmosphereDensityFile:
                currentFile = new ADFile(fileURL);
                break;
            case IonizationParameterFile:
                currentFile = new IPFile(fileURL);
                break;
            case SunAndTerrestrialMagnetismFile:
                currentFile = new SATFile(fileURL);
                break;
        }
        return currentFile;
    }
}
