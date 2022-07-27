package util.fileType;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class SEFile extends BaseFile{

    public SEFile(String fileURL) throws IOException {
        super(fileURL);
    }

    @Override
    protected void readFile() throws IOException {
        File currentFile = new File(this.fileURL);
        BufferedReader currentBR = new BufferedReader(new FileReader(currentFile));
        String currentLine;
        while((currentLine = currentBR.readLine()) != null){

        }
    }


}
