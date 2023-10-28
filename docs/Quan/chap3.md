---
counter: True  
---

# 量子算法

## 量子傅里叶变换

一个周期函数可分解为一系列不同频率正弦波的叠加，**傅里叶变换**将这个函数从时域转为频域。

DFT: $y_k \leftarrow \dfrac{1}{\sqrt N}\sum\limits_{j=0}^{N-1}x_j e^{\frac{2\pi i j k}{N}}$.  
频域中的一点通过时域中的所有离散点计算得到。

在 QFT 中，我们变为 $y_k|k\rangle \leftarrow x_j|j\rangle$.  
QFT 的形式就是把 DFT 的结果作为基态的振幅。

!()[https://cdn.hobbitqia.cc/20231028182736.png]

以 j 为基的态变换为以 k 为基的态，系数满足经典傅里叶变换。

需要怎样的电路才能实现这样的 QFT?  

### QFT 的张量积形式

!()[https://cdn.hobbitqia.cc/20231028183039.png]

To be continued...

p13 的分母上的 k 是十进制。
 
??? Example "QFT例子-单比特系统"
    !()[https://cdn.hobbitqia.cc/20231028184831.png]

??? Example "QFT例子-双比特系统"
    !()[https://cdn.hobbitqia.cc/20231028185455.png]

### QFT 的量子电路

!()[https://cdn.hobbitqia.cc/20231028185521.png]

To be continued...