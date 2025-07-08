---
title: Gentry全同态加密方案
date: 2024-10-06 00:34:22
tags: [同态加密,全同态加密方案]
categories: [同态加密,全同态加密方案]
---

# 前言

2009年 **Gentry** 提出了第一个全同态加密方案，其中控制密文运算噪声增长的核心就是本文要介绍的 **Boostrapping** 技术，也即自举。但是原论文比较难啃，为此 **Gentry** 写了一篇介绍性文章**Computing Arbitrary Functions of Encrypted Data** 来理解他提出的全同态加密方案。因此，本问根据该篇论文以及结合知乎上的一些回答来谈一下我对第一代全同态加密方案的理解。

# Alice的珠宝店

论文首先以一个例子来类比全同态加密，因此本文先列举出这个例子再逐渐比较其与全同态加密的相似之处。

Alice是一家珠宝店的老板，现在她要求她的员工Bob将一些原材料加工成珠宝。但是她害怕员工会在加工的时候偷偷地把原材料收入囊中，于是她想了一个计划：她准备了加工箱子，这个箱子有以下特点：

- 箱子是透明的，方便加工
- 箱子带有两双手套，工人可以通过手套进行加工
- 箱子带有挂锁，且只有Alice能打开

类似这样：

![OIP](https://typora-666.oss-cn-shanghai.aliyuncs.com/imaes/202410082245952.jpg)

# 一个简单的同态加密方案

全同态加密包含四个算法：$KeyGen$、$Enc$、$Dec$ 和 $Evaluate$，全同态加密是基于公钥密码体制的，也就是说，$KetGen$ 算法会生成一个 $pk$ 和 $sk$ ， $pk$ 用来加密明文， $sk$ 用来解密密文。$pk$ 类比 Alice 箱子上的挂锁 ，每个人都可以上锁， $sk$ 类比 Alice 手中的钥匙，只有她才能解密。

$Evaluate$ 算法则相当于是密文计算算法，论文中的定义为

**It has a fourth algorithm $Evaluate_{\varepsilon}$，which is associated to a set $\textstyle{\mathcal{F}}_{\varepsilon}$ of permitted functions. For any function $f$ in $\textstyle{\mathcal{F}}_{\varepsilon}$ and any ciphertexts $c_{1},\ \dots,\ c_{t}$ with $c_{i}\leftarrow\mathrm{Encrypt}_{\varepsilon}\left(\mathrm{pk},\,m_{i}\right)$，the algorithm $\mathrm{Encrypt}_{\varepsilon}\left(\mathrm{pk},f,c_{1},\dots,c_t\right)$ outputs a ciphertext $c$ that encrypts $f(m_{1},\ldots,m_{t})$ —— i.e.,such that $Decrypt_{\epsilon}(sk,c)=f(m_{1},\dots,m_{t})$**

该算法的定义即是全同态加密的核心，可以看出$Evaluate$ 算法必须要在 $\textstyle{\mathcal{F}}_{\varepsilon}$ 包含的**所有函数**下成立。根据这个定义，构建一个可以处理所有函数的加密方案很简单。只需定义 $Evaluate_{\varepsilon}$ 如下：**直接输出密文 $c\leftarrow (f,c_1,\dots,c_t)$ 而不对密文做任何操作**，而解密也非常简单，解密函数定义如下：为了解密 $c$，**只需先解密 $c_1,\dots,c_t$ 得到对应的 $m_1,\dots,m_t$ 接着再通过 $f$ 函数对这些明文进行运算**。

该方案简直就是听君一席话胜似一席话。根本没有全同态加密的灵魂——委托数据处理(同时保护隐私)，这种方案就像是Alice的珠宝店里，工人直接把盒子送回给Alice，而不对里面的材料进行任何操作，Alice自己打开盒子，取出材料，自己加工戒指或者项链。

直观的来说，Alice委托工人就是为了减少自己的工作量，上述这个方案相当于什么都没有做，全同态加密也是如此，我们要求解密 $c$ ($Evaluate_{\varepsilon}$ 计算后的密文) 所需的计算量与解密 $c_{i}$ ($Encrypt_{\varepsilon}$ 加密得到的密文)相同，并且要求 $c$ 和 $c_i$ 的大小相同。我们称这为 *compact ciphertexts* requirement. 并且我们要求 $c$ 的大小和运算函数 $f$ 相互独立，即 $c$ 的大小和解密它所需要的时间不会随着 $f$ 的复杂度而增加，这样才能保证对任意函数都能进行全同态加密运算。类比Alice的珠宝店，她的工人可以在箱子组装任意复杂的零件，但组装所需的工作与Alice打开盒子并取出零件的时间无关。有了这个定义，上述的简单方案也不是我们想要的，因为该方案的 $c$ 解密的所需要的时间其实取决于运算函数 $f$ 。

# 一个高效的方案长什么样

上述的方案并不能称为全同态加密方案。因为全同态加密方案还要求是高效的，那什么方案是高效的呢？我们希望 $Evaluate_{\varepsilon}$ 和其他算法一样，只多项式地依赖安全参数。前置知识说到了计算复杂度模型——电路模型。我们用 $S_f$ 来表示布尔电路中函数 $f$ 包含的与门、或门和非门的数量。如果由一个多项式 $g$ ，我们说 $Evaluate_{\varepsilon}$ 是有效的如果 $Evaluate_{\varepsilon}$ 的复杂度至多为 $S_f\ \cdot g(\lambda)$

但是用电路表示函数 $f$ 有两点不妥：

- 使用电路表示来评估函数 $f$ 并不总是有效的，例如在图灵机上对有序数组二分搜索比在随机存取机上的运行速度慢得多。但其实二分搜索函数并不是一个低效的算法。
- 使用固定的电路表示，也代表了输出的大小必须事先固定了。例如，如果我想从云服务上读取1MB的数据量，云服务就会生成对应的函数电路，得到的结果要么刚好(存储的数据刚好1MB)、要么被截断(太多数据响应了请求)、要么被零填充(响应的数据不足1MB)。这是不可避免的，因为除非云服务事先知道生成的电路函数和我们想要查询的数据信息之间的关系

当然用电路表示肯定也有优点：

它将一个函数分解为简单的步骤，例如与门(AND)、或门(OR)、非门(NOT). 为了评估这些门电路，只需要加减乘就行了。事实上，对于 $x,y\in\{0,1\}$，有
$$
\begin{align}
&AND(x,y)=xy\\
&OR(x,y)=x+y\\
&NOT(x)=1-x
\end{align}
$$
