---
counter: True  
---

# The Processor 

<div align=center> <img src="http://cdn.hobbitqia.cc/202303311644374.png" width = 65%/> </div>

## Introduction

### Instruction Execution Overview

CPU performance factors

* Instruction count  
Determined by ISA and compiler  
如同样的功能用 Intel 和 RISC-V 的处理器实现，英特尔的指令用的更少（因为更复杂）
* CPI and Cycle time  
Determined by CPU *hardware*

For every instruction, the first two steps are identical

* Fetch the instruction from the memory
* Decode and read the registers

Next steps depend on the instruction class  

* Memory-reference  
`load, store`
* Arithmetic-logical  
* branches  

### CPU Overview

<div align=center> <img src="http://cdn.hobbitqia.cc/202303311659539.png" width = 60%/> </div>

* Use ALU to calculate
    * Arithmetic result
    * Memory address for load/store
    * Branch comparison  
    因为我们是单周期，因此 ALU 只能做比较，具体跳转的地址由单独的 Adder 计算。
* Access data memory for load/store
* PC $\leftarrow$ target address or PC + 4  

??? Question
    为什么指令要和内存分开？  
    因为我们是单周期，我们无法在同一个周期内既读指令又读数据。

Can’t just join wires together -- *Use multiplexers*.  

### Control

<div align=center> <img src="http://cdn.hobbitqia.cc/202303311701629.png" width = 60%/> </div>

* different sources for unit
* read/write memory

## Logical Design Convention

* Information encoded in binary
    * Low voltage = 0, High voltage = 1
    * One wire per bit
    * Multi-bit data encoded on multi-wire *buses*  
* Combinational element
    * Operate on data
    * Output is a function of input
* State (sequential) elements  
Store information

??? Note "逻辑电路内容简要复习"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303311709405.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303311710984.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303311711616.png" width = 40%/> </div>

## Building a datapath

Elements that process data and addresses in the CPU.  

同类指令的 opcode 是一样的（I 型指令的里逻辑运算、load 指令、jal 不同），具体功能由 Func 决定。（因此不把所有操作编到 opcode 内）

### Instruction execution in RISC-V

* **Fetch**:
    * Take instructions from the instruction memory 
    * Modify PC to point the next instruction
* **Instruction decoding & Read Operand**: 
    * Will be translated into machine control command 
    * Reading Register Operands, whether or not to use 
* **Executive Control**:
    * Control the implementation of the corresponding ALU operation 
* **Memory access**:
    * Write or Read data from memory 
    * Only ld/sd
* **Write results to register**:
    * If it is R-type instructions, ALU results are written to rd
    * If it is I-type instructions, memory data are written to rd
* **Modify PC for branch instructions**

### Instruction fetching

<div align=center> <img src="http://cdn.hobbitqia.cc/202303311728883.png" width = 50%/> </div>

* R-format Instructions  
    * Read 2 register operands
    * Perform arithmetic/logical operation
    * Write register result
* Load/Store Instructions
    * Read register operands
    * Calculate address using 12-bit offset  
    Use ALU, but sign-extend offset
    * Load: Read memory and update register
    * Store: Write register value to memory
* Branch Instructions
    * Read 2 register operands
    * Compare operands  
    use ALU, substract and check Zero output
    * Calculate target address 
        * Sign-extend displacement
        * Shift left 1 place (halfword displacement)
        * Add to PC value
    
First-cut data path does an instruction in one clock cycle

* Each datapath element can only do one function at a time
* Hence, we need separate instruction and data memories

### Path Built using Multiplexer

* R-type instruction Datapath 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303312308474.png" width = 50%/> </div>
    
* I-type instruction Datapath
    * For ALU
    * For load  
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303312310587.png" width = 50%/> </div>
    
* S-type (store) instruction Datapath
<div align=center> <img src="http://cdn.hobbitqia.cc/202303312327879.png" width = 50%/> </div>

* SB-type (branch) instruction Datapath
<div align=center> <img src="http://cdn.hobbitqia.cc/202303312328985.png" width = 50%/> </div>

* UJ-type instruction Datapath
<div align=center> <img src="http://cdn.hobbitqia.cc/202303312329165.png" width = 50%/> </div>

**Full datapath**
<div align=center> <img src="http://cdn.hobbitqia.cc/202303312331894.png" width = 50%/> </div>

## A simple Implementation Scheme

Analyse for cause and effect

* *Information* comes from the 32 bits of the instruction
* Selecting the *operations* to perform (ALU, read/write, etc.)
* Controlling the *flow of data* (multiplexor inputs)
* ALU's operation based on *instruction type* and *function* code

<div align=center> <img src="http://cdn.hobbitqia.cc/202303312348754.png" width = 50%/> </div>

* 7 个控制信号和一个 4 位的 `ALU_operation`.  
* MemToReg 有三个源，分别是 `load` 指令，PC 来的(`jal, jalr` 存 PC+4), ALU 出来的（R 型，I 型）

<div align=center> <img src="http://cdn.hobbitqia.cc/202303312353531.png" width = 50%/> </div>

### ALU symbol & Control

ALU used for

* Load/Store: F = add
* Branch: F = subtract
* R-type: F depends on opcode

因此我们进行两级解码 2-level decode. 
<div align=center> <img src="http://cdn.hobbitqia.cc/202303312358260.png" width = 60%/> </div> 

#### First level

* 一级解码后，可以决定除了 `ALU_opration` 以外的控制信号
* 同时我们会解码出 2 位的 `ALU_op`. 

<div align=center> <img src="http://cdn.hobbitqia.cc/202304010000818.png" width = 60%/> </div>

<div align=center> <img src="http://cdn.hobbitqia.cc/202304010002960.png" width = 60%/> </div>