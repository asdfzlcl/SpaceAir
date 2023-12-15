package util.fileType;
import util.FileType;

import java.io.IOException;

/**
 * 此类用作其他文件类型对应类的父类, 涵盖了文件类型类包含的基础信息以及基础构造函数
 * 并且包含一个静态方法
 * 此静态方法
 * @author wxy
 * */
public abstract class BaseFile {

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
     * 抽象方法, 作为工具函数, 每个子类需要实现
     * 用来读取文件内部信息的真正函数
     * */
    protected abstract void readFile() throws IOException;


    /**
     * 抽象类唯一外部静态函数接口, 获取对应文件类型的文件对象
     * @param fileURL 传入的文件路径, 推荐使用PathHelper内的方法获取前缀
     * @param fileType 获取的文件类型, 使用enum类
     * @return 一个文件类型对应的对象, 注意需要使用强制类型转换将其转换为对应的对象
     * */
    public static BaseFile readFile(String fileURL, FileType fileType) throws IOException{
        BaseFile currentFile = null;
        switch (fileType){
            case SEFile:
                currentFile = new SEFile(fileURL);
                break;
            case ADFile:
                currentFile = new ADFile(fileURL);
                break;
            case IPFile:
                currentFile = new IPFile(fileURL);
                break;
            case SATFile:
                currentFile = new SATFile(fileURL);
                break;
        }
        return currentFile;
    }

    /**
     * 测试主类
     * */
    public static void main(String[] args) {
        try {
            ADFile temp = (ADFile) readFile("D:\\GraduateProject\\Project\\空间天气平台\\空间天气\\图2对应的数据--热层大气密度\\cedar_file_access-250km.txt", FileType.ADFile);
            System.out.println("Done!");
        }catch (IOException e){
            e.printStackTrace();
        }
    }
}
