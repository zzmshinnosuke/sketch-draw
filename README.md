# SketchImg
Scene sketch drawing tool, draw sketches with pictures, save the sketches in vector format

## Environments
* ThinkPhp 5.0
* PHP + Js
* [XAMPP](https://www.apachefriends.org/index.html)

## Acknowledgement for ThirdParty libraries
* [jQuery](https://jquery.com/)
* [jQuery UI](https://jqueryui.com/)
* [jquery.ui.rotatable](https://github.com/godswearhats/jquery-ui-rotatable)
* [jQuery Simulate](https://github.com/jquery/jquery-simulate)
* [p5.js](https://p5js.org/)
* [md5](https://github.com/blueimp/JavaScript-MD5)
* [sketch_rnn](https://magenta.tensorflow.org/sketch-rnn-demo)

## Run
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


# Log
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

## 20201124
添加了md5字符串验证，保证传输过程的正确性。

## 20201227
将php中md5值接收方式改成字符串