---
counter: True  
---

# Chapter 2 Bits, Data Types and Operations

!!! Abstract
    Covered in Lecture 1 2022.7.11 and Lecture 2 2022.7.12    
    Topics:    
    1. the bit binary digit codes    
    2. data type(unsigned integer, signed integer, logical variable, float number, ASCII)  

n bits, can represent $2^n$ numbers, ranging from 0 to $2^{n-1}$

## Bits, Bytes

* bit: only 1/0  
* byte: 1 byte = 8 bits

## Data Type

### Integer

#### Unsigned Integer

n bits, can represent $2^n$ numbers. range: $[0,2^{n-1}]$

#### Signed Integer

* signed-magnitude(原码): a leading 0 signifies a positive integer, a
leading 1 signify a negative integer. In a 4-bit example,$0110=6,\ 1110=-6$,can represent $[-7, 7]$.  
It has the problem of "positive zero" and "negative zero".  

* 1's Complement(反码): For a non-negative number, its opposite
number is obtained after bitwise inversion. In a 4-bit example, $0110=6,\ 1001=-6$, can represent [-7, 7], also has the problem of "positive zero" and "negative zero".  
It has also the problem above.

* **2's Complement(补码)**: The highest bit of the 2's complement is the sign bit. The sign bit is 0 for non-negative numbers, and 1 for negative numbers. For an n-bit signed number, the weight of the sign bit is $-2^{n-1}$. range: $[-2^{n-1},2^{n-1}-1]$.  
**Obtain 2's Complement: 按位取反再加一**

* Extension

  * sign extension: Fill sign bit when extending.(不会改变数字大小)  
  * zero extension: Fill 0 when extending.  

    !!! Example
        两个数 0100 1100 和 1011.  
        0100 1100(76) + 1011(-5) = 11111011  
        但 11111011 != 71  
        因为两个数字长度不同，要对1011符号扩充为 1111 1011(-5)，再相加即可。

* Overflow  
The only possible overflow situations:  

  * positive + positive == negative, that is, carry to the sign bit, and the sign bit becomes 1 after adding
  * negative + negative == positive，the sign bit becomes 0
    after adding.

* Conversion between binary and decimal  
用2乘十进制小数，将积的整数部分取出，再用 2 乘余下的小数部分，再将积的整数部分取出，如此直到积中的整数部分为 0/1，此时 0/1 为二进制的最后一位。或者达到所要求的精度为止。  
然后把取出的整数部分按顺序排列起来，先取的整数作为二进制小数的高位有效位，后取的整数作为低位有效位。  

#### Logical Variables

* bit vector: number string of 0 or 1.  
* functions: AND, OR, Exclusive-OR (XOR), Equivalence, NAND, NOR

    !!! Info
        $X\cdot Y\Leftrightarrow X\ AND\ Y$  
        $X+Y\Leftrightarrow X\ OR\ Y$  
        $X\oplus Y\Leftrightarrow X\ XOR\ Y$  
        $\overline X \Leftrightarrow NOT\ X$  
        Be careful of the diffrence of +(AND) and +(plus).

#### Floating Point

|       | S |   exp   |     frac     |
|:------|---|---------|-----------: |
| Float | 1 |    8    |     23      |
| Double | 1 |    11    |     52      |

Normalized form: $N=(-1)^S\times M\times 2^E$  

* S: sign. $S=1$ indicates the number is negative.
* M: 尾数. Normally, $M=1.frac$.
* E: 阶码. Normally, $E=exp-Bias$ where $Bias=127$ for floating point numbers. $Bias = 1023$ for double.  

!!! Note Special cases

    * 当 $exp=0$ 时, 规定 $M=0.frac$.  
    其中 $frac=0$ 时, 表示的数字为 0.(可能有 +0/-0)  
    * 当 $exp=1111\ 1111$时  
        * 若 $frac=0$, 则表示 $+\inf /$ $-\inf$.  
        * 若 $frac\neq 0$, 则表示 NaN(Not a number). ***e.g.*** $1/0, \inf/\inf$.  

How to represent decimal number in the floating point type?  

* Convert decimal to binary.
* Convert binary to floating point.

#### ASCII Code

Ameican Standard Code for Informationo Interchange.

#### Hexadecimal Notation

convert 4(resp. 3) binary bits to 1 hexadecimal(resp. octal) bits.
$A=1010,\ B=1011,\ C=1100,\ D=1101,\ E=1110,\ F=1111$
