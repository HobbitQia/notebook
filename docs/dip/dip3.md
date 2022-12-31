---
counter: True  
---

# Image grayscale transform

## Grayscale perception

<div align=center> <img src="https://s2.loli.net/2022/10/18/hD8bpv9WXM6U4er.png" width = 50%/> </div> 


灰度级感知：32灰度级、64灰度级、128灰度级、256灰度级

可视的阈值 
Weber’s Law 能被我们看到的阈值(delta I) 与 I 成正比
$\dfrac{\Delta I}{I}\approx K_{weber}\approx 1...2\%$   P

假设连续两个灰度级之间的亮度差异就是Weber’s Law中的可视临界值，
$\dfrac{I_{max}}{I_{min}}=(1+K_{weber})^{255}$  
考虑到 $K_{weber}=0.01...0.02,\dfrac{I_{max}}{I_{min}}=13...156$ 

## Visibility enhancement: a logarithmic operation

可视化增强：以对数操作为例

为了增强图像的可视信息，对图像中的像素进行基于对数的操作
$L_d=\dfrac{\log(L_w+1)}{\log(L_{max}+1)}$
$L_d$ 是显示亮度，$L_w$ 是真实世界亮度，$L_{max}$ 是场景中的最亮值。
这个映射能够确保不管场景的动态范围是怎么样的，其最大值都能映射到1（白），其他的值能够比较平滑地变化。 

平滑曲线，不会出现梯度逆转（原来比较暗，现在还是比较暗） global method. 

对数的问题： 
<div align=center> <img src="http://cdn.hobbitqia.cc/202210302325021.png" width = 50%/> </div> 

虽然细节更多，但是对比度没那么 sharp 了，美感

## Grayscale image and histogram

### Grayscale image

* 二维数组，每个像素 8 位（通常写作 0..255）
* 灰度级的值越小，这个图像看上去越暗；反之越亮  

### Histogram

灰度直方图是一类统计图形，它表示一幅图像中各个灰度等级的像素个数在像素总数中所占的比重。 
***e.g.***  
<div align=center> <img src="http://cdn.hobbitqia.cc/202210302336500.png" width = 50%/> </div>   

量化：如 256 分为 8 个灰度级， 0-32 为一个灰度级，以此类推... 每个柱子就反映了像素数目占的比例。

设灰度等级范围为[0,L-1] ，灰度直方图用下列离散函数来表示：
$h(r_k)=n_k$
其中，$r_k$ 为第k级灰度，$n_k$ 是图像中具有灰度级 $r_k$ 的像素数目，$0 \leq k \leq L-1，0 \leq n_k \leq n-1$, $n$ 为图像总的像素数目。  
通常用概率密度函数来归一化直方图：
$P(r_k)$为灰度级$r_k$所发生的概率（概率密度函数）。此时，满足下列条件：  $\sum\limits_{k=0}^{L-1}P(r_k)=1$

!!! Example
    ![](http://cdn.hobbitqia.cc/202210302345223.png)

## Color image and histogram

### Color histogram

彩色直方图是一类统计图形，它表示一幅图像中 r,g,b 通道上各个灰度等级的像素个数在像素总数中所占的比重。 

![](http://cdn.hobbitqia.cc/202210302348534.png)

### Characteristics of histogram

直方图  

* 是空间域处理技术的基础。
* 反映图像灰度的分布规律，但不能体现图像中的细节变化情况。
* 对于一幅给定的图像，其直方图是唯一的。
* 不同的图像可以对应相同的直方图。

对直方图进行操作能有效地用于图像增强、压缩和分割, 他们是图像处理的一个实用手段。

缺点：带来噪声

!!! Question
    <div align=center> <img src="http://cdn.hobbitqia.cc/202210302353767.png" width = 50%/> </div>   

    但是直方图把结构信息丢失，只知道颜色分布，不知道结构。  

## Histogram equalization and fitting

### Histogram equalization

直方图均衡化：将原图像的非均匀分布的直方图通过变换函数T修正为均分布的直方图，然后按均衡直方图修正原图像。

找到变换函数T，确定如下对应关系：
$s=T(r)$
从而确保输入图像中的每一个灰度r都能转换为新图像中的一个对应的灰度s。

直方图均衡化——寻找T（连续灰度变化）  
假设：  

* 令 r和 s 分别代表变化前后图像的灰度级，并且 $0\leq r,s \leq 1$ 。
* P(r) 和 P(s) 分别为变化前后各级灰度的概率密度函数（r和s值已归一化，最大灰度值为1）

规定：  

* 在$0\leq r \leq$中，T(r)是单调递增函数，并且$0\leq T(r)\leq 1$。
* 反变换$r = T-1(s)$也为单调递增函数。

考虑到灰度变换不影响像素的位置分布，也不会增减像素数目。所以有：$\int_{0}^rP(r)dr =\int_{0}^sP(s)ds=\int_{0}^s1ds=s=T(r)$ (为什么 Ps = 1, 因为是概率密度)  
因此 $s=T(r)=\int_{0}^rP(r)dr$  
即转换函数 T 在变量 r 处的函数值 s，是原直方图中灰度等级为 [0,r] 以内的直方图曲线所覆盖的面积。 

**Discrete:**  
设一幅图像的像素总数为 n，分 L 个灰度级，$n_k$为第 k 个灰度级出现的像素数，则第 k 个灰度级出现的概率为：$P(r_k)=\dfrac{n_k}{n}\quad (0\leq r_k\leq 1,k=0,1,2,...L-1)$  
**离散**灰度直方图均衡化的转换公式为：  
$s_k=T(r_k)=\sum\limits_{i=0}^kP(r_i)=\sum\limits_{i=0}^k\dfrac{n_i}{n}=\dfrac{1}{n}\sum\limits_{i=0}^k n_i$  
对于原直方图中的任意一个灰度级 $r_k$，只需将灰度级为 $[0,r_k]$ 以内的所有像素个数的和除以图像的像素总数，就可以得到转换之后的对应灰度级 $s_k$

!!! Example
    设图像有64*64=4096个像素，有8个灰度级，灰度分布:
    ![](http://cdn.hobbitqia.cc/202210311842933.png)
    1. 计算 $s_k$(利用前缀和)
    2. 把计算的 $s_k$ 就近安排到8个灰度级中（得到 $s_k$ 舍入）
    ![](http://cdn.hobbitqia.cc/202210311849380.png)
    注意这里 34 灰度级被合并，灰度级总数减少，意味着灰度级之间的差异增大，对比度增强。
    ![](http://cdn.hobbitqia.cc/202210311852689.png)

!!! Question
    * 按照均衡化的要求，在均衡化后的结果直方图中，各灰度级发生的概率应该是相同的，如右上图所示连续灰度级均衡化结果那样。但是，如刚刚中离散灰度级均衡化后，各灰度级出现的概率并不完全一样。为什么？
    * 步骤2中，所得的 $s_k$ 不可能正好等于8级灰度值中的某一级，因此需要就近归入某一个灰度级中。这样，相邻的多个 $s_k$ 就可能落入同一个灰度级，需要在步骤3时将处于同一个灰度级的像素个数累加。因此，离散灰度直方图均衡化操作以后，每个灰度级处的概率密度（或像素个数）并不完全一样。 

 直方图均衡化实质上是减少图像的灰度级以换取对比度的加大。在均衡过程中，原来的直方图上出现概率较小的灰度级被归入很少几个甚至一个灰度级中，故得不到增强。若这些灰度级所构成的图象细节比较重要，则需采用局部区域直方图均衡化处理。 

### Histogram fitting

* 所谓直方图匹配，就是修改一幅图像的直方图，使得它与另一幅图像的直方图匹配或具有一种预先规定的函数形状。  
* 直方图匹配的目标，是突出我们感兴趣的灰度范围，使图像质量改善。  
* 利用直方图均衡化操作，可以实现直方图匹配过程。

![](http://cdn.hobbitqia.cc/202210311901959.png)

具体过程：  

* Base on the equation $s=T(r)=\int_0^rP(r)dr$ map the gray level r in the resulted histogram to be s.  
* Base on the equation $v=T(z)=\int_0^zP(z)dz$ map the gray level z in the resulted histogram to be v.  
* 由$v = G(z)$得到 $z =G^{-1}(v)$。由于s和v有相同的分布，逐一取$v = s$，求出与r对应的$z =G^{-1}(s)$。

方法简述：    
在步骤1和2中，分别计算获得两张表（参见直方图均衡化中的算例），从中选取一对vk、sj，使vk = sj，并从两张表中查出对应的zk、rj。这样，原始图像中灰度级为rj的所有像素都映射成灰度级zk，最终得到所期望的图像。

直方图（灰度）变换用以确定变换前后两个直方图灰度级之间对应关系的变换函数。经过直方图变换以后，原图像中的任何一个灰度值都唯一对应一个新的灰度值，从而构成一幅新图像。  
直方图均衡化、直方图匹配都属于直方图变换操作。

### Histogram transform—image enhancement

**图像增强**
* 采用一系列技术去改善图像的视觉效果，或将图像转换成一种更适合于人或机器进行分析处理的形式。 
* 图像增强并不以图像保真为准则，而是有选择地突出某些对人或机器分析有意义的信息，抑制无用信息，提高图像的使用价值。 
* 根据任务目标突出图像中感兴趣的信息，消除干扰，改善图像的视觉效果或增强便于机器识别的信息。 

* Luminance adjustment

    ??? Example
        ![](http://cdn.hobbitqia.cc/202210311920581.png)

* Contrast adjustment

    ??? Example
        ![](http://cdn.hobbitqia.cc/202210311920136.png)

* Color quantization

    ??? Example
        ![](http://cdn.hobbitqia.cc/202211011330860.png)


根据变换函数类型的不同，直方图灰度变换可以分为线性变换和非线性变换两大类。 

### Linear grayscale transform

![](http://cdn.hobbitqia.cc/202211011337017.png)

!!! Example
    ![](http://cdn.hobbitqia.cc/202211011338501.png)

Contrast stretching 拉伸
输入图像f(x,y)灰度范围为[a,b]
输出图像g(x,y)灰度范围为[c,d] 


有的时候 分段拉伸
利用分段直方图变换，可以将感兴趣的灰度范围线性扩展，同时相对抑制不感兴趣的灰度区域。 

###　Nonlinear histogram transform

