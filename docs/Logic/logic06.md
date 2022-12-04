---
counter: True  
---

# Register and Register Transfers

## Registers, Microoperations and Implementations

### Registers

**Register** – a collection of binary storage elements 

In theory, a register is a sequential logic which can be defined by a state table. More often, think of a register as storing a vector of binary values.  
  
!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202211301052753.png" width = 50%/> </div>  

    如果有 $n$ 位寄存器，需要 $2^n$ 状态. $n$ 可能会很大，导致需要的状态，可能的输入组合、输出函数会很大。

Due to the large numbers of states and input combinations as n becomes large, the state diagram/state table model is not feasible!

* Add predefined combinational circuits to registers(***e.g.*** To count up, connect the register flip-flops to an incrementer)
* Design individual cells using the state diagram/state table model and combine them into a register   
把寄存器拆成单位的来设计，再考虑多位的拼接，最后组成多位寄存器。


#### Register Storage and Load Enable

**Expectations**:  
 
* A register can store information for *multiple clock cycles*
* To “store” or “load” information should be controlled by a signal

但在刚刚的例子中，每个周期都会保存新的数据，不能做到在多个周期保留数据，因此是不行的。

**Realizing expectations**:

* Use a signal to block the clock to the register
* Use a signal to control feedback of the output of the register back to its inputs
* Use other SR or JK flip-flops, that for (0,0) applied, store their state

<u>**Load**</u> is a frequent name for  the signal that controls   register storage and loading

* `Load = 1`: Load the values on the data inputs(加载外部新数据) 
* `Load = 0`: Store the values in the register(保持原有的数据)

**Solution**  

* **Registers with Clock Gating**  
    The $\overline{Load} $(bar 表示低电平有效) signal enables the clock signal to pass through if 0 and prevents the clock signal from passing through if 1. (与 $Load$ 相反)
    
    !!! Example 
        For Positive Edge-Triggered  or Negative Pulse Master-Slave Flip-flop:  
        <div align=center> <img src="http://cdn.hobbitqia.cc/202211301504389.png" width = 40%/> </div>   

        $Gated\ Clock = Clock + \overline{Load}$
        当 $\overline{Load}$ 信号为 1 时，时钟信号不再随着外部时钟改变，这时就是保持原有的数据。
    **Clock Skew**   
    问题在于我们是同步时序电路实现，要求时钟统一提供，这样所有的触发器会在同一时间完成操作。使用门控时钟的方式会带来更多的触发时间，时序电路从同步变为了异步的时序电路（触发有前有后）  
* **Registers with Load-Controlled Feedback**  
     Run the clock continuously, and  Selectively use a load control to change the register contents. 

    !!! Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202211301524511.png" width = 60%/> </div>   

#### Register Transfer Operations

* **Register Transfer Operations** – The movement and processing of data stored in registers

* Three basic components:
    * set of registers(源寄存器，目标寄存器)
    * operations
    * control of operations
* Elementary Operations -- load, count, shift, add, bitwise "OR", etc.  
Elementary operations called **microoperations**  

**Register Notation**  

* Letters and numbers  – denotes a register (***e.g.***  $R2, PC, IR$)
* Parentheses $(\ )$ – denotes a range of register bits (***e.g.*** $R1(1), PC(7:0), PC(L)$)
* **Arrow** $(\leftarrow)$ – denotes data transfer (***e.g.*** $R1 \leftarrow R2, PC(L) \leftarrow R0$) H 代表高位, L 代表低位(如 $PC(L),PC(H)$ 分别代表 $PC$ 的高八位和低八位)
* **Comma** – separates parallel operations
* **Brackets** $[\ ]$ – Specifies a memory address (***e.g.*** $R0 \leftarrow  M[AR],   R3 \leftarrow M[PC]$) 寻址

???  Example "Conditional Transfer"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202211301556875.png" width = 50%/> </div>   

    如果 $K1=1$ 那么将 $R1$ 的信号传给 $R2$, 我们可以写为 $K1:(R2\leftarrow R1)$, 其中 $R1$ 是一个控制变量，表明条件执行的发生是否发生。

### Microoperations

Logical Groupings:  

* **Transfer** - move data from one register to another
* **Arithmetic** - perform arithmetic on data in registers $+-\times /$
* **Logic** - manipulate data or use bitwise logical operations $\wedge \vee \oplus \ \overline{x}$
* **Shift** - shift data in registers

??? "+"
    "+" 在逻辑表达式中表示或，在算术表达式中表示加法。  
    如 $(K1 + K2):  R1 \leftarrow R1 +R3$, 左边为或，右边为加。

<details>
<summary> <b>RTL, VHDL, Verilog Symbols for Register Transfers</b></summary>
<div align=center> <img src="http://cdn.hobbitqia.cc/202211301618933.png" width = 70%/> </div>   
</details>

#### Arithmetic Microoperations

<div align=center> <img src="http://cdn.hobbitqia.cc/202211301623755.png" width = 60%/> </div>   

* Note that any register may be specified for source 1, source 2, or destination.
* These simple microoperations operate on the whole word

#### Logical Microoperations

<div align=center> <img src="http://cdn.hobbitqia.cc/202211301624281.png" width = 60%/> </div>   

#### Shift Microoperations

<div align=center> <img src="http://cdn.hobbitqia.cc/202211301624735.png" width = 40%/> </div>

These shifts *"zero fill"*. Sometimes a separate flip-flop is used to provide the data shifted in, or to “catch” the data shifted out.

Other shifts are possible (rotates, arithmetic).

??? Example
    假设 $R2=1100\ 1001$  

    * $R1 \leftarrow sl\ R2$ 之后 $R2=1001\ 0010$
    * $R1 \leftarrow sr\ R2$ 之后 $R2=0110\ 0100$ 

#### Register Transfer Structures

* <u>**Multiplexer-Based Transfers**</u> - Multiple inputs are selected by a multiplexer dedicated to the register
* <u>**Bus-Based Transfers**</u> - Multiple inputs are selected by a shared multiplexer driving a bus that feeds inputs to multiple registers
* <u>**Three-State Bus**</u>  - Multiple inputs are selected by 3-state drivers with outputs connected to a bus that feeds multiple registers
* <u>**Other Transfer Structures**</u> -  Use multiple multiplexers, multiple buses, and combinations of all the above

Implementation:  

* **Multiplexer-Based Transfers**  
Multiplexers connected to register inputs produce flexible transfer structures (Note: Clocks are omitted for clarity)
    
    !!! Example
        $K1:R0\leftarrow R1\quad K2\overline{K1}:R0\leftarrow R2$   
        我们可以将其化简: $K1+K2\overline{K1}=K1+K2$ 就是 $R0$ 寄存器会被更新时的控制逻辑. 并用 $K1$ 作为 Mux 的选择信号。  
        <div align=center> <img src="http://cdn.hobbitqia.cc/202211301635371.png" width = 35%/> </div>   

        完整电路（假设寄存器均为 4 位）
        <div align=center> <img src="http://cdn.hobbitqia.cc/202211301637817.png" width = 55%/> </div>