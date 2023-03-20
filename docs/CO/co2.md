---
counter: True  
---

# Instructions: Language of the Computer

## Introduction

* Language of the machine
    * Instructions (Statement)
    * Instruction Set (Syntax)
* Design goal
    * Maximize performance  
    同样资源的情况下性能大
    * Minimize cost  
    同样性能的情况下成本低
    * Reduce design time  
    指令集简单，易于理解
* 我们使用的是 RISC-V 架构


Instruction Characteristics
<div align=center> <img src="http://cdn.hobbitqia.cc/202303151112148.png" width = 50%/> </div>

指令集基本的结构：Operation 操作; Operand 操作数

* 不同指令集，指令的编码可以不同。如 000 表示加法，这也叫指令的 Encoding.  
* 操作数位宽可以不同，可以是立即数/寄存器/内存。 

冯诺依曼架构：
指令由数字方式被存储，可以进行读写。？？

## Operation

* Every computer must be able to perform *arithmetic*.    
    * Only one operation per instruction  
    * Exactly ***3*** variables ***e.g.*** `add a, b, c` 即 $a\leftarrow b+c$  
    注意结果放在第一个位置，这样易于解码  

* **Design Principle 1 - Simplicity favors regularity.**  

!!! Example
    * C code
    ``` C
    f = (g + h) - (i + j);
    ```
    * RISC-V code
    ``` C
    add t0, g, h
    add t1, i, j
    sub f, t0, t1
    ```
## Operands of the Computer Hardware 

### Register Operands

* Arithmetic instructions use register operands.
* RISC-V has a $32\times 64$-bit register file
    * Use for frequently accessed data
    * 32-bit data is called a **word**. 64-bit is called a **doubleword**.  
    * we call them `x0` to `x31`

* **Design Principle 2 - Smaller is faster.**   
寄存器不是越多越好，多了之后访问慢。  

    <div align=center> <img src="http://cdn.hobbitqia.cc/202303172234060.png" width = 55%/> </div>  

    !!! Info "为什么寄存器 `x0` 一直为 0"
        Make the common fast. 因为经常有 0 参与计算，将其存在一个寄存器中，便于计算。

??? Example
    ``` C
    add x5, x20, x21
    add x6, x22, x23
    sub x19, x5, x6
    ```

### Memory Operands

* Data transfer instructions
    * Load: Load values from memory to register
    * Store: Store result from register to memory; store doubleword
* Memory is *byte addressed*.   
* RISC-V is **Little Endian**  

    ??? Example "Little vs Big Endian"
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303180940405.png" width = 60%/> </div>
 
    小端：低位放在地址较小处；大端相反   
* RISC-V dose not require words to be aligned in memory   
    * words align: 一个字是 4 字节，我们要求字的起始地址一定要是 4 的倍数。

    !!! Example "Memory Alignment"
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303180929272.png" width = 60%/> </div>
        第一个是对齐的，第二个是不对齐的。

    * 不对齐的好处是省空间

!!! Example "Memory Operand Example"
    ``` C
    A[12] = h + A[8];
    ```
    (默认数组是双字的, h in `x21`, base address of A in `x22`)  
    翻译为 RISC-V 代码得到
    ``` C
    ld x9, 64(x22)
    add x9, x21, x9
    sd x9, 96(x22)
    ```
    地址是以 byte 为单位，所以要偏移 $8\times 8=64$ bytes.  
    <u>`load` 和 `store` 是唯二可以访问存储器的指令。</u>  

### Registers vs. Memory

* Registers are faster to access than memory  
* Operating on memory data requires loads and stores  
* Compiler must use registers for variables as much as 
possible  
编译器尽量使用寄存器存变量。只有在寄存器不够用时，才会把不太用的值放回内存。  

### Constant or Immediate Operands

**Immediate**: Other method for adding constant  

* Avoids the load instruction  
* Offer versions of the instruction   
***e.g.*** `addi x22, x22, 4`    
* **Design Principle 3 - Make the common case fast.**     

!!! Summary
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303180953593.png" width = 75%/> </div>  

    * 为什么内存是 $2^{61}$ 个 doublewords?  
    可以表示的地址有这么多，因为我们以 64 位寄存器为基址，可以表示的双字就是 $2^{64}/2^3=2^{61}$ (这里 $2^3$ 表示 8 个字节，即双字). 即我们的 `load` 指令可以访问的范围有这么大。   

## Signed and Unsigned Number

## Representing Instructions in the Computer

* All information in computer consists of binary bits.
* Instructions are encoded in binary  
called **machine code (机器码)**  
* Mapping registers into numbers  
0 for register `x0`, 31 for register `x31`. **e.t.c.**  
* RISC-V instructions   
32 位指令编码。所有指令都是规则化的，即一部分是 opcode, 一部分是 operands 等等。  

### R-format

<div align=center> <img src="http://cdn.hobbitqia.cc/202303181012740.png" width = 75%/> </div>  

* *opcode*: operaion code
* *rd*: destination register number
* *funct3*: 3-bit function code(additional opcode)   
例如，我们加法减法可以做成一个 opcode, 然后利用 funct 进行选择。
* *rs1/rs2*: the first/second source register number
* *funct7*: 7-bit function code(additional opcode)  

All instructions in RISC-V have the same length  

<u>**Design Principle 4 - Good design demands good compromises**</u>

### I-format  

<div align=center> <img src="http://cdn.hobbitqia.cc/202303181023683.png" width = 75%/> </div> 

* Immediate arithmetic and load instructions  
***e.g.*** `addi`, `ld`  
* *rs1*: source or base address register number
* *immediate*: constant operand, or offset added to base 
address  
将 rs2, funct7 合并了，得到 12 位立即数

### S-format

<div align=center> <img src="http://cdn.hobbitqia.cc/202303181028726.png" width = 75%/> </div> 

* *rs1*: base address register number
* *rs2*: source opearand register number
* immediate:  
Split so that *rs1* and *rs2* fields always in the same place.  

