---
counter: True  
---

# Digital Systems and Information

## Digital Systems

### Types of Digital Systems   

<div align=center> <img src="https://s2.loli.net/2022/09/14/UV18FgmT9fyNPYH.png" width = 60%/> </div>  

* no state presen: Combinational Logic System(output = Function(Input)).  
* state present: Sequential System  

    * state updated at discrete time(系统里有统一的时钟, 每一秒钟决定要不要更新, 这个更新只会在每秒钟的边界产生)/any time -> Synchronous /asynchronous Sequential System  
    * State = Function(State, Input)  
    * Output = Function(State) or Function(State, Input)  

    !!! Question "state 不能只和 input 有关吗?"
        -- 不能, 这样 state 的存在就没有必要了(每次的 state 只是作为了 input 到 output 的中间量.) 

!!! Example
    汽车上的里程表, 输入 count up 和 reset 信号. 如果 count up 就把里程加一. 输出就是可视化的显式里程. 状态就是里程表的值.  
    这是非同步的, 因为更新信号的时间不依赖统一时钟, 在任意时刻都可以发生.  

### Embedded Systems

<div align=center> <img src="https://s2.loli.net/2022/09/14/ti71l4ZYsbP2CEp.png" width = 70%/> </div>  

**analog input(模拟输入)**:  

* **A-to-D**: 把模拟信号转化为数字信号(处理器不能处理模拟信号)  
* **D-to-A**: 处理后把数字信号转化为膜你信号
* 也有其他的数字输入输出(如按键)

**核心**: AD & DA, 嵌入式系统区别于日常计算机

!!! Example
    对空调, input 是温度传感器(电阻). 输入是一个电压值, 空调如何理解电压变化?  
    <div align=center> <img src="https://s2.loli.net/2022/09/14/egbnk4uMYWAiRrV.png" width = 70%/> </div>  

    * 周期性采样: 采样的周期是由输入信号的信号频率决定.(香农定理)  
    * 量化: (带误差) 离散化数据  


**信号的分类:**  
<div align=center> <img src="https://s2.loli.net/2022/09/14/xgXCaJe28Gj1ouI.png" width = 60%/> </div>  

!!! Question "为什么最后一个时间也是离散的"


为什么选择二进制数值表示? ---更好**对抗数据传输中的干扰**  

<div align=center> <img src="https://s2.loli.net/2022/09/14/kyOa5pP7oFs24ic.png" width = 50%/> </div>  
噪声容限 0.3V(0.6-0.9 0.1-0.4之间可以继续保留信息的正确性)  

## Number Systems - Representation

A number with radix(基数) r is represented by a string of digits:  
$A_{n-1}A_{n-2}\cdots A_1A_0.A_{-1}A_{-2}\dots A_{-m}$.  
$Number_r = (\sum\limits_{i=0}^{i=n-1}A_i\times r^i)+(\sum\limits_{j=-m}^{j=-1}A_j\times r^j)$

* $2^10 = 1024$ is Kilo, denoted "K".  
* $2^20$ is Mega, denoted "M".  
* $2^30$ is Giga, denoted "G".  
* $2^40$ is Tera, denoted "T".  

### Binary Arithmetic 

**二进制乘法:** 根据乘数对应位是 1 还是 0, 如果是 1 就移位并加起来.  

**Convert between Bases**  

* **Integral Part**
Repeatedly *divide* the number by the new radix and save the remainders. The digits for the new radix are the remainders in reverse order of their computation. If the new radix is > 10, then convert all remainders > 10 to digits A, B, ...  
* **Fractional Part**  
Repeatedly *multiply* the fraction by the new radix and save the integer digits that result.  The digits for the new radix are the integer digits in order of their computation.If the new radix is > 10, then convert all integers > 10 to digits A, B, ... 

!!! Warning
    注意小数部分补 0 是在右侧(最后)   
    (11 111 101. 010 011 11**0**)~2~ != (375.233)~8~  最后要补 0, 应为 (375.236)~8~  

### Binary Coding

二进制编码

Given M elements to be reprented by a binary code, the minimum number of bits, n satisfies $2^n>=M>2^{n-1}$ so $n=\lfloor{log_2{M}}\rfloor$.  
 
可以 r = 2 表示 4 个元素(00, 01, 10, 11), 也可以 r = 4(0001, 0010, 0100, 1000).   
The second code is called **"one hot" code(独热编码)**.  

常见对十进制的十个数字进行编码:  

<div align=center> <img src="https://s2.loli.net/2022/09/14/35Q9GRC128INglp.png" width = 60%/> </div>  

* **8421**: Binary Code Decimal(BCD 码)  
有权编码, 每个码都有位权
* **Excess3(余3码)**: 8421 + 3 得到 Excess3 的值.  
编码成对出现, i 和 9 - i 互反. 在通信时很有用处.  
* **84-2-1**: 类似 8421 码, 也是成对出现.   
* **Gray 格雷码**:  相邻两个码之间只有一位不同.  

**注:**  
13 = D = 1101(进制转化), 但在以上方式中会被表示成 0001 0011(BCD码), 我们应该分别编码每个数字.   

#### BCD Codes

可以计算, 但要修正.  +

!!! Example
    <div align=center> <img src="https://s2.loli.net/2022/09/16/9tD37pBY5k68PEu.png" width = 60%/> </div>  

!!! Info "为什么需要 BCD 编码"
    电子表中有时针秒, 我们如果用二进制保存时针秒, 那么 加到9以上得到 ABCD..., 当我们想要显示这些值时, 我们要先做进制转换, 再显示(如 A 转为 10) 这其中要做除法, 成本高.  
    但我们用两位 BCD 码表示, 就可以直接显示结果了.  

#### ASCII Codes

常用的 ASCII Code:  

* **`0`** <-> 30~16~  
* **`A`** <-> 41~16~  
* **`a`** <-> 61~16~
* Delete (DEL) is all bits set.  

#### Parity Bit Error-Detection Codes

用来检测数据传输中是否发生错误

A code word has **even parity** if the number of 1’s in the code word is even.  
A code word has **odd parity** if the number of 1’s in the code word is odd.
