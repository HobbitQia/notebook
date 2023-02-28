---
counter: True  
---

# Digital Hardware Implementation

!!! Abstract  
    1. 可编程技术  
    Programmable TechnologyROM、PAL、PLA，使用ROM、PAL和PLA来实现逻辑电路  
    2. ROMReadOnly Memory  
    结构、编程方法、作为存储器的使用  
    3. PALProgrammable Array Logic  
    结构、编程方法、使用时的主要约束、输出反馈的作用、多函数实现、编程表  
    4. PLAProgrammable Logic Array  
    结构、编程方法、使用时的主要约束、输出反向的作用、多函数实现、编程表

## Why Programmable Logic?

* Facts:
    * It is most economical to produce an IC in large volumes
    * Many designs required only small volumes of ICs
* Need an IC that can be:
    * Produced in large volumes
    * Handle many designs required in small volumes
* A programmable logic part can be:
    * made in large volumes
    * programmed to implement large numbers of different low-volume designs
* Many programmable logic devices are *field-programmable*, i. e., can be programmed outside of the manufacturing environment

* Most programmable logic devices are *erasable and reprogrammable*.
    * Allows “updating” a device or correction of errors
    * Allows reuse the device for a different design - the ultimate in re-usability!
    * Ideal for course laboratories
* Programmable logic devices can be used to prototype design that will be implemented for sale in regular ICs.
    * Complete Intel Pentium designs were actually prototyped with specialized systems based on large numbers of VLSI programmable devices! 

## Programming Technologies

### Classifications

Programming Technologies are used to  

* Control connections   
把两个脚连接起来，常见的连接方法有：
    * Mask programming  
    一次性编程，工厂里芯片制造时使用，厂家在生产时编程到芯片内   
    * Fuse(熔丝)  
    在芯片设计时，在很多芯片引脚连接之间有 fuse, 设计电路时不需要保留连接的用高电压产生高电流，熔断 fuse.  
    * Antifuse   
    最开始断开，击穿后电路连接好  
    * Single-bit storage element   
    存储一个二进制位，这个位的输出控制一个晶体管，进而控制两个引脚连接/断开  
* Build lookup tables(*LUT*)   
如 16 位寄存器（存真值表的值） +16-1 Mux 可构成四输入之内的逻辑模块，只需要将 16位寄存器填上不同的值就可以实现不同的逻辑函数
* Control transistor switching   
用晶体管控制开关，类似连接控制   
浮动栅极  
    * Stored charge on a floating transistor gate
        * Erasable 
        * Electrically erasable
        * Flash (as in Flash Memory)
    * Storage elements  

### Characteristics

* Permanent - Cannot be erased and reprogrammed
    * Mask programming
    * Fuse
    * Antifuse
* Reprogrammable
    * Volatile(易失的) - Programming lost if chip power lost 
        * Single-bit storage element
    * Non-Volatile
        * Erasable 
        * Electrically erasable
        * Flash (as in Flash Memory)

### Configurations

* **Read Only Memory (ROM)** - a fixed array of AND gates and a programmable array of OR gates
* **Programmable Array Logic (PAL)** - a programmable array of AND gates feeding a fixed array of OR gates.
* **Programmable Logic Array (PLA)** - a programmable array of AND gates feeding a programmable array of OR gates.
* **Complex Programmable Logic Device (CPLD) /Field- Programmable Gate Array (FPGA)** - complex enough to be called “architectures” - See VLSI Programmable Logic Devices reading supplement 

![](http://cdn.hobbitqia.cc/202212151657276.png)

基本思想类似：一个 AND 阵列加上一个一个 OR 阵列，区别在于哪个阵列是可编程的。  

* ROM: OR
* PAL: AND
* PLA: OR+AND

#### Read Only Memory

**Read Only Memories (ROM)** or **Programmable Read Only Memories (PROM)** have:
* N input lines, 
* M output lines, and 
* $2^N$ decoded minterms.  

* <u>**Fixed AND array**</u> with $2^N$ outputs implementing all N-literal minterms.  
* <u>**Programmable OR Array**</u> with $M$ outputs lines to form up to M sum of minterm expressions.  
有 M 个或门，因此最多可以实现 M 个逻辑函数（每个函数最多 N 个输入）  

* A program for a ROM or PROM is simply a multiple-output truth table
    * If a 1 entry, a connection is made to the corresponding minterm for the corresponding output
    * If a 0, no connection is made
    
    二维阵列：AND 阵列产生 $2^n$ minterms, OR 阵列有 M 个输出，每个输出对应最多 $2^n$ minterms.   

* Can be viewed as a memory with the inputs as *addresses of data* (output values), hence ROM or PROM names!

!!! Example "A 8 X 4 ROM(N = 3 input lines,  M= 4 output lines)"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202212151723555.png" width = 30%/> </div> 

    一个或门的线表示一根总线，一个 "X" 表示与门阵列和或门阵列连接。  
    实现逻辑函数就是将译码器的最小项与或门连接

    也可以将输入看作 addr, 输出看作 data.  

#### Programmable Array Logic (PAL)

The **PAL** is the opposite of the ROM, having a **programmable** set of ANDs combined with **fixed** ORs.

* Disadvantage   
ROM guaranteed to implement any M functions of N inputs.  PAL may have too few inputs to the OR gates. 
* Advantages  
    * For given internal complexity, a PAL can have larger N and M
    * Some PALs have outputs that can be complemented, adding POS functions
    * No multilevel circuit implementations in ROM (without external connections from output to input).  PAL has outputs from OR terms as internal inputs to all AND terms, making implementation of multi-level circuits easier.

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202212151836078.png" width = 40%/> </div>  

    上方 0~9 每根线，每根分别代表一个输入或者输入的反变量("*")   
    这里 F1 还有连到 8, 9 线，用来实现级联。
    $F1=\overline A\overline B+\overline C$  
    $F2=\overline AB\overline C+AC+A\overline B$  
    $F3=AD+BD+\overline A\overline B+\overline C$  
    $F4=AB+CD+AC+BC(\overline{F1})$

#### Programmable Logic Array (PLA)

Compared to a ROM and a PAL, a PLA is the most flexible having a **programmable** set of ANDs combined with a **programmable** set of  ORs.

* Advantages
    * A PLA can have large N and M permitting implementation of  equations that are impractical for a ROM (because of the number of inputs, N, required)
    * A PLA has all of  its product terms connectable to all outputs, overcoming the problem of  the limited inputs to the PAL Ors
    * Some PLAs have outputs that can be complemented, adding POS functions
* Disadvantages
    * Often, the product term count limits the application of a PLA.
    * Two-level multiple-output optimization is required to reduce  the number of product terms in an implementation, helping to fit it into a PLA.
    * Multi-level circuit capability available in PAL not available in PLA.  PLA requires external connections to do multi-level circuits.

!!! Example 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202212151927298.png" width = 40%/> </div>  

    $F1 = AB +BC + AC$   
    $F2 = (AB + A’B’)’ =  (A’ + B’) (A + B) = A’B + AB’$  
    这里 F2 我们求的是反变量，因此在最后要求反，这样做可以节省重复利用之前的 AND 项。

合理利用 AND 项资源，尽可能复用，可以求反变量。