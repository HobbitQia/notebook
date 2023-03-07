---
counter: True  
---

# Arithmetic for Computer

## Introduction

Instructions can be divided into 3 categories

* memory-reference instructions  
***e.g.*** `lw, sw`
需要 ALU 计算内存地址
* arithmetic-logical instructions  
***e.g.*** `add, sub, and, or, xor, slt`
需要 ALU 进行计算
* control flow instructions  
***e.g.*** `beq, bne, jal`
需要 ALU 进行条件判断

### Signed Number Formats

* Sign and magnitude
* 2's Complement
* 1's Complement
* Biased notation  

    !!! Example "Why we need biased notation"
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303061541842.png" width = 65%/> </div>  
        
        上图是 32 位的二进制补码表示，我们可以看到左侧二进制表示，如果看作无符号数，那他们是从小到大排列的；但右侧对应的十进制整数确实分段单增的。  
        我们希望有一种这样的表示，能够让右侧的对应的值也单调递增。  
        一个想法是对右侧数加上 $2^31$, 相当于其二进制表示下最高位翻转。  

    $[X]_b = 2^n + X$  从二进制补码到移码，只需要翻转符号位即可。  

## Arithmetic 

* Addition
* Substraction  
* Overflow detection: $C_n \oplus C_{n-1}$

Constructing an ALU 

