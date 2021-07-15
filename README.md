# SceneSynthesis
A web-driven tool to for scene synthesis with separate sketch objects.
Demo at http://localhost:8080/create/?task=1

## Dependencies
* ThinkPHP 5.0 (PHP web framework)
    * Please clone the framework from Github:
```bash
    git clone https://github.com/top-think/framework thinkphp
```

## Environments
* Apache + PHP + MySQL + Python
* Install the latest [XAMPP](https://www.apachefriends.org/index.html)
* We suggest you git clone this repository as a folder called *create*

## Acknowledgement for ThirdParty libraries
* [jQuery](https://jquery.com/)
* [jQuery UI](https://jqueryui.com/)
* [jquery.ui.rotatable](https://github.com/godswearhats/jquery-ui-rotatable)
* [jQuery Simulate](https://github.com/jquery/jquery-simulate)
* [Mousetrap.js](https://craig.is/killing/mice)
* [HTML2Canvas](https://github.com/niklasvh/html2canvas)
* [Hermite-resize](https://github.com/viliusle/Hermite-resize)
* [SignaturePad](https://github.com/szimek/signature_pad)
* [MersenneTwister](https://github.com/pigulla/mersennetwister)

## 运行说明
1. linux系统安装xampp
2. 将系统目录整个拷贝到/htdocs目录下
3. 配置文件 ./public/images/background.txt (第一行 文件总数，后面每行一个图片名)
   ./public/images/background 所有图片放在该目录下
4. 绘制保存说明 ./results1 绘制保存目录（json文件）（./backup1 绘制备份目录）
   ./results2 审核保存目录（json文件）（./backup2 审核备份目录）

## Bugs

1. 修改页面中的部分内容，再恢复后程序出错，thinkphp显示系统错误。   
解决：查看了runtime/log中的日志，根据提示删除了temp下的所有东西

2. 写了一个show.html页面，结果老是出错
// Apollo.reference	=	"{$reference}";
后来发现尽管注释掉了，结果后面的{$reference}框架还是再起作用，注释掉也没用


# skepad
## 20200513
该程序专门用来绘制草图，功能从简，只保留画板的基本功能。可用来平板等小屏幕设备上显示。

## 20200517
今天添加了check功能，可以查看画完多少张了。上传一次服务器

## 20200521
今天上传服务器一次，添加了在线审核功能，和可装载已绘制的功能

## 20200521 下午
解决了一个画笔在小范围内画，会弹出一个窗口的问题

## 20200522 
添加了橡皮擦功能，并删除了所有没用的代码，只保留有用的代码

## 20200813
修改了橡皮檫功能，解决了有些笔画删除不掉的问题。