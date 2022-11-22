
# Sequential Circuits

!!! Abstract
    * Part 1 - Storage Elements and Analysis  
        * Introduction to sequential circuits  
        * Types of sequential circuits  
        * Storage elements  
        * Latches  
        * Flip-flops  
        * Sequential circuit analysis  
        * State tables  
        * State diagrams  
        * Equivalent states  
        * Moore and Mealy Models  
    * Part 2 - Sequential Circuit Design  
    * Part 3 – State Machine Design  


## Storage Elements and Analysis

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091011289.png" width = 50%/> </div>  

时序电路包括：组合逻辑电路+存储元件

Combinatorial Logic  
* Next state function Next State = f(Inputs, State)  次态方程  
* Output function (Mealy) Outputs = g(Inputs, State)
* Output function (Moore) Outputs = h(State) 输入不会直接改变输出，而是通过状态来间接改变输出  

**Types of Sequential Circuits**    
* Depends on the times at which:
    * storage elements observe their inputs, and 
    * storage elements change their state 
* Synchronous  
状态更新一定发生在时钟周期的整周期上
* Asynchronous  
状态更新可以在任意时间发生    
如果时钟也被看做一个输入，那么所有电路都是 Asynchronous        
Asynchronous 可以让我们在有需要的时候更新电路，降低电路的功耗   

Discrete Event Simulation 离散事件仿真

### Storing State

#### Latch

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202211091038178.png" width = 40%/> </div>  
    <div align=center> <img src="http://cdn.hobbitqia.cc/202211091038137.png" width = 55%/> </div>   

    The simple combinational circuit has now become a sequential circuit because its output is a function of a time sequence of input signals!  
    <div align=center> <img src="http://cdn.hobbitqia.cc/202211091039908.png" width = 60%/> </div>   

##### Basic (NAND)  $\overline S$ –  $\overline R$ Latch

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091041175.png" width = 40%/> </div>  

|$R$|$S$|$Q$|$\overline Q$|Comment|
|:-|-|-|-|-|
|1|1|?|?|Stored state unknown|
|1|0|1|0|*Set* Q to 1|
|1|1|1|0|Now Q *remembers* 1|
|0|1|0|1|*Reset* Q to 0|
|1|1|0|1|Now Q *remembers* 0|
|0|0|1|1|Both go high|
|1|1|?|?|Unstable!|

最后一步，两个引脚同时从 0 -> 1, 那么两个与非门的输出都期望变成 0, 但只要有一个门的输出变为 0 另一个门就被锁住变成 1, 因此两个门不可能同时变化。但我们无法确定是哪个门会变成 1.  
$S=0,R=0$ is <u>**forbidden**</u> as input pattern.   

##### Basic (NOR)  $S$ – $R$ Latch

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091046159.png" width = 40%/> </div>  

|$R$|$S$|$Q$|$\overline Q$|Comment|
|:-|-|-|-|-|
|0|0|?|?|Stored state unknown|
|0|1|1|0|*Set* Q to 1|
|0|0|1|0|Now Q *remembers* 1|
|1|0|0|1|*Reset* Q to 0|
|0|0|0|1|Now Q *remembers* 0|
|1|1|1|1|Both go high|
|0|0|?|?|Unstable!|

##### Clocked $S$ - $R$ Latch

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091058462.png" width = 45%/> </div>  

$C$ 作为一个 ENABLE 的功能。当 $C=0$ 时，$Q$ 不会发生改变。当 $C=1$ 时，上面相当于 $\overline S$, 下面相当于 $\overline R$, 变成一个钟控的 SR 锁存器。  
|$C$|$S$|$R$|$Q(t+1)$|
|:-|-|-|-|
|0|X|X|No change|
|1|0|0|No change|
|1|0|1|0: *Clear* Q|
|1|1|0|1: *Set* Q|
|1|1|1|Indeterminate|

$Q(t+1)$ based on current state $Q(t)$ and current inputs $(S,R,C)$

##### $D$ Latch

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091105090.png" width = 45%/> </div>  

$S\ R$ 不会同时为 0.  
|$C$|$D$|$Q(t+1)$|
|:-|-|-|
|0|X|No change|
|1|0|0: *Clear* Q|
|0|1|1: *Set* Q|
即当 $C=1$ 时 $Q=D$

The graphic symbol for a $D$ latch:  
<div align=center> <img src="http://cdn.hobbitqia.cc/202211091106989.png" width = 30%/> </div>  

!!! Info
    在算门输入成本的时候，我们要分开算 G 和 GN. 因为锁存器同时为我们提供了 $Q$ 和 $\overline Q$, 锁存器可以为后面的组合电路提供原变量和反变量。

#### Flip-flop

锁存器不适合使用在电路中：不能做到一个周期，状态只更新一次。具体原因见 [ICS Notes](http://note.hobbitqia.cc/ICS/ICS-3/#the-synchronous-finite-state-machine)  

##### S-R Master-Slave Flip-Flop

<div align=center> <img src="http://cdn.hobbitqia.cc/202211091128641.png" width = 50%/> </div>  

前面称为 master(主锁存器), 后面称为 slave(从锁存器)    
当 $C=0$ 时，主锁存器不变。    
$C$ 从 0 变为 1 时，主锁存器被使能，Q 改变，但从锁存器不变。

周期变长一倍
问题：当 S R 均为 0 时如果有小扰动，无法复原  
要求主从触发器避免 S R 的扰动

##### Edge-Triggered D Flip-Flop

An **edge-triggered flip-flop** ignores the pulse while it is at a constant level and triggers only during a transition of the clock signal.  
A **master-slave D flip-flop** which also exhibits **edge-triggered** behavior can be used.

<div align=center> <img src="http://cdn.hobbitqia.cc/202211111109804.png" width = 40%/> </div>  

The delay of the S-R master-slave flip-flop can be avoided since the 1s-catching behavior is not present with D replacing S and R inputs. (D 锁存器不会出现 S R 同时为 0 的情况)

Positive-Edge Triggered D Flip-Flop is Formed by adding inverter to clock input. (上升沿触发器)  
Q changes to the value on D applied at the positive clock edge within timing constraints to be specified
<div align=center> <img src="http://cdn.hobbitqia.cc/202211111112460.png" width = 40%/> </div>  

**Actual Circuit of Edge-Triggered D Flip-Flop:**  

<div align=center> <img src="http://cdn.hobbitqia.cc/202211111108389.png" width = 40%/> </div>  

**Standard Symbols for Storage Elements:**  

<div align=center> <img src="http://cdn.hobbitqia.cc/202211111116243.png" width = 50%/> </div>  

* **Direct Inputs**    
Direct $R$ and/or $S$ inputs that control the state of the latches within the flip-flops are used for this *initialization*. 
<div align=center> <img src="http://cdn.hobbitqia.cc/202211111118511.png" width = 20%/> </div>    
