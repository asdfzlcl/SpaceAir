package front_end.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import front_end.app.messages.InputParam;
import ucar.ma2.InvalidRangeException;
import util.FILE_TYPE;
import util.FileHelper;
import util.NetCDFFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

public class FuncInjectorImpl implements FuncInjector {

    @Override
    public String GetHeatMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Float>> data = new ArrayList<>(200);
//        for (int j = 0; j < 200; j++)
//        {
//            List<Float> row = new ArrayList<>(200);
//            for (int i = 0; i < 200; i++) {
//                row.add((float) (Math.random() * 10.0));
//            }
//            data.add(row);
//        }
        // test
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), new Date());
        try {
            data = FileHelper.getInstance().getDataSetVarLevel(file, 0);
        } catch (IOException | InvalidRangeException e) {
            e.printStackTrace();
        }
        // end test

        return data.toString();
    }

    @Override
    public String GetContourMapData(JSObject params) {
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<Float> data = new ArrayList<>(91);
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), new Date());
        try {
            data = FileHelper.getInstance().getDataSetVarCoordinate(file, inputParam.getLatLb(),inputParam.getLonLb());
        } catch (IOException | InvalidRangeException e) {
            e.printStackTrace();
        }
//        for(int i=0;i<91;i++)
//            data.add((float) (Math.random() * 10.0));
        return data.toString();
    }

    //获取对应文件属性目录
    public String Getinformation(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<NetCDFFile> data = new ArrayList<>(200);
        try {
            data = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return data.toString();
    }

    //获取文件精度、纬度、高度上下限
    public String Getlimit(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<NetCDFFile> data = new ArrayList<>(200);
        try {
            data = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return data.toString();
    }

    @Override
    public Object GetFileInfo() {
        return Arrays.asList("U","V","T","O");
    }
}
