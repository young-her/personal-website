---
title: Django实践
date: 2024-08-14 23:37:48
tags: [Web框架,Web程序设计]
categories: [Web开发,Web框架]
---

# 前言

由于博主本学期开设了web程序设计这门课，于是为了进行开发，不得不学习python里面的一些web框架。早闻`Django`大名，遂开始学习，谨以此博客记录`Django`学习记录

# 前期准备

## 安装

`Django`作为一款优秀的**python web框架**，安装也是非常简单的。只需在命令行输入

```cmd
pip install django
```

如果安装了`anaconda`也可以先新建一个虚拟环境来进行开发

```cmd
conda create -n django_test python=3.10
conda activate django_test
pip install django
```

安装完之后，`django`会自动添加`django-admin.exe`到环境目录。

![image-20240814235646017](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408142356150.png)

出现以上图片即说明安装成功。

如果要创建一个新的项目，运行

```cmd
django-admin startproject django_test
```

则会出现以下目录

```
D:\DJANGO_TEST
│─ manage.py            管理项目的文件。例如：运行、类自动生成数据表
│
└─django_test           
        asgi.py         异步运行项目，编写socket，处理网络请求
        settings.py     项目的配置文件、例如：连接的数据库的账户密码等等
        urls.py         根路由，URL和函数的对应关系  /login->do_login
        wsgi.py         同步运行项目，编写socket，处理网络请求
        __init__.py
```

# 初识Django

## 快速上手

在项目根目录运行

```cmd
python manage.py runserver
```

django会自动启动一个web服务在`localhost:8000`，用浏览器访问会出现以下界面
![image-20240815001328887](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408150013176.png)

## 自定义路由

刚刚提到django_test/urls.py是管理路由的地方，于是想着能不能自己写一个url访问，编写urls.py如下

```python
from django.contrib import admin
from django.urls import path
from django.shortcuts import HttpResponse

def login(request):
    return HttpResponse("登录页面")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", login),
]
```

同时访问`localhost:8000/login`页面
![image-20240815002545677](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408150025795.png)

这样就自定义了一个页面~~（虽然只有文本，也很丑）~~，这是因为返回的是一个`HttpResponse`类的缘故，关于该类之后再详细介绍。

## 自定义app

前面介绍了`login()`函数，试想一下，如果正在做一个大工程，自定义的页面比较多，那么`urls.py`里面实现的函数就比较多，不利于开发，如果能把函数实现放在另一个文件里面定义，再在`urls.py`里面`import`更利于开发。因此引入`app`

创建一个app，在命令行输入

```cmd
python manage.py startapp web
```

这样就创建了一个叫`web`的app，此时目录结构应该长这样

```
D:\DJANGO_TEST
│  db.sqlite3
│  manage.py
│
├─django_test
│  │  asgi.py
│  │  settings.py
│  │  urls.py
│  │  wsgi.py
│  │  __init__.py
│  │
│  └─__pycache__
│          settings.cpython-39.pyc
│          urls.cpython-39.pyc
│          wsgi.cpython-39.pyc
│          __init__.cpython-39.pyc
│
└─web
    │  admin.py                 内部后台管理配置
    │  apps.py                  App的名字
    │  models.py                数据库操作，类->SQL语句（ORM）
    │  tests.py                 单元测试
    │  views.py                 主要写视图函数，例如上例中的login函数
    │  __init__.py
    │
    └─migrations                迁移记录，自动生成，不要修改
            __init__.py
```

接下来，将login函数放到view.py里面
`web/views.py`

```python
from django.shortcuts import render, HttpResponse

# Create your views here.

def login(request):
    return HttpResponse("登录页面")
```

`django_test/urls.py`

```python
from django.contrib import admin
from django.urls import path
from web.views import login


urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", login),
]
```

## 初识视图函数

- 视图函数中的形参`request`是什么？   用户请求相关的所有内容

  在`request`中获取用户提交的数据等信息

- 视图函数主要是实现业务逻辑操作

- 返回业务逻辑结果，常见的返回有三种

  `return HttpResponse("登陆页面")` 返回的是一个文本，文本内容是传入的内容

  `return  render(request,"login.html")` 返回一个`html`的网页

  `return redirect("https://www.baidu.com")` 重定向到另一个网页

有一个问题，那么上述`login.html`放在哪呢？在`django_test`目录下面有一个`settings.py`文件
![image-20240815104607037](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408151046207.png)

默认会从`DIRS`目录里面寻找

```python
import os
"DIRS": [os.path.join(BASE_DIR, "templates")]
```

之后在根目录(manage.py同级目录)创建一个`templates`文件夹，在里面编写`login.html`如下

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <h1>
        登录界面
    </h1>
</body>
</html>
```

然后编写视图函数`web/views.py`

```python
from django.shortcuts import render, HttpResponse, redirect

# Create your views here.

def login(request):
    # return HttpResponse("登录页面")
    # return redirect("https://www.baidu.com")
    return render(request, "login.html")
```

访问l`ocalhost:8000/login`就可以看到一个登录页面了。

还有一个寻找方案为在`settings.py`目录下，在`INSTALLED_APPS`项下面添加一项`”web“`

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "web",
]
```

之后在web目录下面，新建一个templates文件夹，编写`login1.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <h1>
        登录界面111
    </h1>
</body>
</html>
```

访问发现显示**登录界面111**，说明配置成功。但是如果两个地方同时出现了`login.html` 呢，下面来测试一下，将`login1.html`重命名为`login.html`，发现页面显示为**登录页面**

**结论：**同时存在`templates`文件夹的时候，会优先在项目于根目录的`templates`寻找文件，其次在`app`文件夹下的`templates`目录寻找。因此，可以在网站根目录下的`templates`文件夹下面放公共的网页，在`app`文件夹下的`templates`文件夹放这个`app`所需要实现的网页。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

## 初识模板

考虑如下一种情况，现在有一个公司的员工表，我希望在网页里面动态的显示出来，编写如下`user.html`文件

```html
<!DOCTYPE html>
<html>
<head>
    <title>User</title>
</head>
<body>
    <h1>
        1、张三
        2、李四
        3、王五
    </h1>
</html>
```

这样的网站肯定是静态的，如果员工表的内容改变，则必须一个一个修改。要想实现自动读取一个列表里面的名字并显示出来，就要采用模板里面的语法了。重新编写`user.html`如下

```html
<!DOCTYPE html>
<html>
<head>
    <title>User</title>
</head>
<body>
    <h1>
        {%for user in users%}
        <li>
            {{user}}
        </li>
        {%endfor%}
    </h1>
</html>
```

编写`views.py`定义`user`函数如下

```python
def user(request):
    users = ["张三", "李四", "王五"]
    return render(request, "user.html", {"users": users})
```

在模板里面通过`{%for%}`以及`{%endfor%}`实现了for循环，如果要显示函数里面定义的变量则需要用`{{变量}}`，在函数的返回值里面就要用一个字典的形式来返回该变量。最后结果如图

![image-20240815141741971](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408151417046.png)

如果想在模板里面只读取一个列表元素，与python索引不同的地方在于模板的索引是用`.`来进行索引，例如`{{users.0}}`

```html
<!DOCTYPE html>
<html>
<head>
    <title>User</title>
</head>
<body>
    <h1>
        {%for user in users%}
        <li>
            {{user}}
        </li>
        {%endfor%}
    </h1>
    <h2>
        {{users.0}}
        {{users.1}}
        {{users.2}}
    </h2>
</body>
</html>
```

![image-20240815142351089](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408151423140.png)

如果定义的是一个字典呢，方法也差不多，`user.html`如下

```html
<!DOCTYPE html>
<html>

<head>
    <title>User</title>
    <meta charset="UTF-8">
</head>

<body>
    <h1>
        {%for user in users%}
        <li>
            {{user}}
        </li>
        {%endfor%}
    </h1>

    <h2>
        {{users.0}}
        {{users.1}}
        {{users.2}}
    </h2>
    <p>
        {{info}}
    </p>
    <p>
        {{info.name}}
        {{info.age}}
        {{info.sex}}
    </p>
    <p>
        <h3>
            keys:
        </h3>
        {%for key in info.keys%}
        <li>
            {{key}}
        </li>
        {%endfor%}
        <h3>
            values:
        </h3>
        {%for value in info.values%}
        <li>
            {{value}}
        </li>
        {%endfor%}
        <h3>
            items:
        </h3>
        {% for key, value in info.items%}
        <li>
            {{key}}:{{value}}
        </li>
        {%endfor%}
    </p>

</body>

</html>
```

编写`views.py`如下

```python
def user(request):
    users = ["张三", "李四", "王五"]
    info={"name":"张三","age":18,"sex":"男"}
    return render(request, "user.html", {"users": users,"info": info})
```

结果如图：

![image-20240815143903444](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202408151439540.png)

## 操作数据库

### 连接数据库

首先需要连接数据库，在`setting.py`中(以MySQL为例)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'django', #数据库的名字
        'USER': 'root', #数据库账号
        'PASSWORD': '123456', #数据库密码
        'HOST': '127.0.0.1', #数据库ip
        'PORT': '3306', #数据库端口
    }
}
```

### 定义数据表

定义数据库的实现主要在`model.py`页面

```python
from django.db import models

class UserInfo(models.Model):
    #用户名是唯一的
    username = models.CharField(max_length=32, unique=True)
    password = models.CharField(max_length=64)

```

上述定义了一个`UserInfo`类的表，有两列分别为：

- username：CharField=varchar
- password：CharField=varchar

### 创建数据表

但此时只是定义了一个类，并没有对数据库进行迁移，运行

```cmd
python manage.py makemigrations

python manage.py migrate
```

两条命令都需要执行，且顺序不能调换

此时会在定义的app目录下生成一个`migrations`文件夹

### 添加数据项

在`views.py`文件中

```python
from .models import *

def register(request):
    if request.method == 'GET':
        return render(request, 'register.html')
    elif request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        if UserInfo.objects.filter(username=username).first():
            return render(request, 'register.html', {'error': '用户名已存在'})
        UserInfo.objects.create(username=username, password=password)
        
        return  render(request, 'register.html', {'success': '注册成功'})
```

上述定义了注册用户的逻辑，编写`register.html`如下

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Register</title>
    </head>
    <body>
        <h1>Register</h1>
        <form action="/register/" method="post" >
            {% csrf_token %}
            <div>
                <span>
                    Username:
                    <input type="text" name="username" />
                </span>
            </div>
    
            <div>
                <span>
                    Password:
                    <input type="password" name="password" />
                </span>
            </div>
            <div>
                <input type="submit" value="Register" />
            </div>
            <div>
                {{error}}
                {{success}}
            </div>
        </form>
</html>
```

同时在`urls.py`中定义路由

```python
path("register/",register,name="register"),
```

这样就可以完成一个简单的注册逻辑

### 查找数据项

在`views.py`文件中

```python
from .models import *

def login(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    elif request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = UserInfo.objects.filter(username=username, password=password).first()
        if user:
            return render(request, 'login.html', {'success': '登录成功'})
        else:
            return render(request, 'login.html', {'error': '用户名或密码错误'})
```

上述定义了登录的逻辑

```python
user = UserInfo.objects.filter(username=username, password=password).first()
```

`filter`意为**过滤**，所以该语句从`UserInfo`表里面查找是否有该用户名和密码，有多个则返回第一个。若`username`是`unique`则可以不用`first`方法。

编写`login.html`如下

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Login</title>
    </head>
    <body>
        <h1>Register</h1>
        <form action="/login/" method="post" >
            {% csrf_token %}
            <div>
                <span>
                    Username:
                    <input type="text" name="username" />
                </span>
            </div>
    
            <div>
                <span>
                    Password:
                    <input type="password" name="password" />
                </span>
            </div>
            <div>
                <input type="submit" value="Register" />
            </div>
            <div>
                {{error}}
                {{success}}
            </div>
        </form>
</html>
```

同时在`urls.py`中定义路由

```python
path("login/",login,name="login")
```

### 更新数据项

在`view.py`文件中

```python
from .models import *

def update_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        new_password = request.POST.get('new_password')
        user = UserInfo.objects.filter(username=username).first()
        if user:
            user.password = new_password
            user.save()
            return render(request, 'update_user.html', {'success': '用户信息更新成功'})
        else:
            return render(request, 'update_user.html', {'error': '用户不存在'})
    return render(request, 'update_user.html')
```

直接获取新的密码，用`save`方法即可保存

### 删除数据项

在`view.py`文件中

```python
from .models import *

def delete_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        user = UserInfo.objects.filter(username=username).first()
        if user:
            user.delete()
            return render(request, 'delete_user.html', {'success': '用户删除成功'})
        else:
            return render(request, 'delete_user.html', {'error': '用户不存在'})
    return render(request, 'delete_user.html')
```

用`delete`方法即可删除数据项
