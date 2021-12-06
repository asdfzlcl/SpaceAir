


import java.io.File;


public class Main {
    public static void main(String[] args) {
//        try{
//            int a=1;
//            double b=2.1;
//            File file =new File("input.txt");
//            if(!file.exists()){
//                file.createNewFile();
//            }
//            FileWriter fw=new FileWriter(file.getAbsoluteFile());
//            BufferedWriter bw=new BufferedWriter(fw);
//            bw.write(String.valueOf(a));
//            bw.write(' ');
//            bw.write(String.valueOf(b));
//            bw.close();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        File file=new File("input.txt");
        if(file.exists()){
            file.delete();
        }
        int year=2002;
        int doy=80;
        double uth=12.0;
        double height_start=0.0;
        double height_end=100.0;
        double ratio=2;
        double lat=60;
        double lon=120;
        double f107p=120;
        double f107a=120;
        double apd=10;
        double ap1=10;
        double ap2=0;
        double ap3=0;
        GenerateInputTxt.GenerateInputData(year,doy,uth,height_start,height_end,ratio,lat,lon,f107p,f107a,apd,ap1,ap2,ap3);

    }
}
