package front_end.app;

import java.io.IOException;
import java.io.InputStream;

public class ResInjector {
    public static String getCss(String filename) {
        InputStream contentStream = ResInjector.class.getResourceAsStream("/front_end/pages/css/" + filename);
        assert contentStream != null;
        return getFileContent(contentStream);
    }
    public static String getJs(String filename) {
        InputStream contentStream = ResInjector.class.getResourceAsStream("/front_end/pages/js/" + filename);
        assert contentStream != null;
        return getFileContent(contentStream);
    }

    private static String getFileContent(InputStream contentStream) {
        assert contentStream != null;
        int count;
        byte[] buf = new byte[0];
        try {
            count = contentStream.available();
            buf = new byte[count];
            contentStream.read(buf);
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        return new String(buf);
    }
}
