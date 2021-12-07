package util;

public class PathOfDirectory {
    private FILE_TYPE type;
    private String directoryPath;

    public PathOfDirectory(FILE_TYPE file_type, String path){
        this.type = file_type;
        this.directoryPath = path;
    }

    public FILE_TYPE getType() {
        return type;
    }

    public void setType(FILE_TYPE type) {
        this.type = type;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }
}
