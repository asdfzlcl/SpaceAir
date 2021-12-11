package application.app;

import com.teamdev.jxbrowser.chromium.JSObject;
import application.app.messages.InputParam;
import ucar.ma2.InvalidRangeException;
import util.FileHelper;
import util.NetCDFFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FuncInjectorImpl implements FuncInjector {

    private List<NetCDFFile> nowDictionary=null;
    private List<Double> heights =null;
    private List<Double> Latitudes=null;
    private List<Double> Longitudes=null;
    @Override
    public String GetHeatMapData(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<List<Float>> data = new ArrayList<>(200);
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), "");
        try {
            data = FileHelper.getInstance().getDataSetVarLevel(file, inputParam.getHeight());
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
        List<Float> data = new ArrayList<>();
        NetCDFFile file = new NetCDFFile(inputParam.getFilename(), inputParam.getFileType(), "");
        try {
            data = FileHelper.getInstance().getDataSetVarCoordinate(file, inputParam.getLatLb(),inputParam.getLonLb());
        } catch (IOException | InvalidRangeException e) {
            e.printStackTrace();
        }
        return data.toString();
    }

    //获取对应文件属性目录
    public List<String> GetDictiontary(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        try {
            nowDictionary = FileHelper.getInstance().getAllFileOfDirectory(inputParam.getFileType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        List<String> filedictionary=new ArrayList<>();
        for(NetCDFFile f: nowDictionary){
            filedictionary.add(f.getFileName());
        }
        return filedictionary;
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

    public String Getinformation(JSObject params){
        InputParam inputParam = new InputParam(params);
        System.out.println(inputParam);
        List<String> data = new ArrayList<>();

        Latitudes=FileHelper.getInstance().getLatitude();
        Longitudes=FileHelper.getInstance().getLongitude();
        heights =FileHelper.getInstance().getHighList();

        for(NetCDFFile f: nowDictionary){
            if(f.getFileName().equals(inputParam.getFilename())){
                data.add(f.getFileDate());
                break;
            }
        }
        data.add(Latitudes.get(0).toString());
        data.add(Latitudes.get(Latitudes.size()-1).toString());
        data.add(Longitudes.get(0).toString());
        data.add(Longitudes.get(Longitudes.size()-1).toString());
        data.add(heights.get(0).toString());
        data.add(heights.get(heights.size()-1).toString());
        return data.toString();
    }


    public String GetFileHeight()
    {
        return heights.toString();
    }

    @Override
    public Object GetFileInfo() {
        return Arrays.asList("U","R","T","O");
    }
}
