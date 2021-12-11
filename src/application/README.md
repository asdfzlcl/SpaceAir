## 前后端胶水层涉及类
1. application.app.messages.InputParam
2. application.app.FuncInjector
3. application.app.WebStage

### InputParam
该类的实例化对象用于表示前端向后端传输的参数，解析如下
```java
    //0-统计模型热力图，1-统计模型廓线图，2-标准模型廓线图
    private final int task;
    //U,V,T等类型
    private final String type;
    //时间，取值只可能是0,6,12,18
    private final int time;
    //高度
    private final int height;
    //年份
    private final int year;
    //年积日
    private final int days;
    //经度下限
    private final int latLb;
    //经度上限
    private final int latUb;
    //纬度下限
    private final int lonLb;
    //纬度上限
    private final int lonUb;

    //唯一构造函数，用于将JS传入的参数转化为Java对象
    public InputParam(JSObject jsObject)
```
### WebStage
该类只提供了两个函数，声明如下
```java
public static void showWebStage();
public static void setFuncInjector(FuncInjector funcInjector);
```
其中showWebStage()是必需调用的，用于进行必要的初始化，并显示该窗口。

setFuncInjector()往往是要调用的，后端需要手动创建一个类，实现FuncInjector接口。
将该类的一个实例化对象传入该函数。

但实际上这不是必要的，因为前端也实现了一个FuncInjectorImpl，
内部储存了用于前端测试的固定数据，如果没有调用setFuncInjector()，则默认使用前端实现的测试类。

**注意：setFuncInjector()的调用必需在showWebStage()调用之前**
