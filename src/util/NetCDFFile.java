package util;

/**
 * @classname NetCADFile
 * @author wxy
 * @description 文件信息对象 每一个对象内存储了此文件的名称 类型 与日期
 * @date 2021-12-06
 * */
public class NetCDFFile {
    private String fileName;
    private FILE_TYPE fileType;
    private String fileDate;

    /**
     * main constructor
     * */
    public NetCDFFile(String fileName, FILE_TYPE fileType, String date) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileDate = date;
    }

    /**
     * default getter and setter
     * */
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public FILE_TYPE getFileType() {
        return fileType;
    }

    public void setFileType(FILE_TYPE fileType) {
        this.fileType = fileType;
    }

    public String getFileDate() {
        return fileDate;
    }

    public void setFileDate(String fileDate) {
        this.fileDate = fileDate;
    }
}
