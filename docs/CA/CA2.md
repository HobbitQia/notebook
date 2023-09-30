---
counter: True  
---

# Pipelining

What is pipelining?  
How is the pipelining Implemented?  
What makes pipelining hard to implement?  

## What is pipelining?

从两个角度进行加速：对每一条的指令进行加速；对一段程序的执行进行加速

Pipelining is an implementation technique whereby multiple instructions are overlapped in execution; it takes advantage of parallelism that exists among the actions needed to execute an instruction.

机制上，先进行分段，每一段用不同的部件，就可以并行执行。我们用 Buffer 存放了临时的结果，有人放有人取

假设一条指令的执行分为下面三段：
<div align = center><img src="https://cdn.hobbitqia.cc/20230928230936.png" width=60%></div>

那么我们执行的模式可以有下面三种：

Three modes of execution

* Sequential execution  
* Single overlapping execution
* Twice overlapping execution

### Sequential execution

没有流水线的时候，每一条指令顺序执行，执行时间就是每一条指令的每个阶段时间求和。

<div align = center><img src="https://cdn.hobbitqia.cc/20230928231025.png" width=60%></div>

### Overlapping execution

重叠执行时，如果不同阶段时间不一致，如 ID 阶段时间较长，那么需要等待，浪费资源；如 EX 阶段时间较长，那么产生冲突，执行部件不够。
<div align = center><img src="https://cdn.hobbitqia.cc/20230928231336.png" width=60%></div>
<div align = center><img src="https://cdn.hobbitqia.cc/20230928231419.png" width=60%></div>

因此理想情况是让三个阶段的时间相等。

* Single  
好处：时间缩短 1/3，但提高了硬件开销，而且有冒险。  
    <div align = center><img src="https://cdn.hobbitqia.cc/20230928231731.png" width=60%></div>
 
* Twice    
好处：时间缩短 2/3，但需要更复杂的硬件，而且需要单独的 FETCH DECODE EXE 部件。
    <div align = center><img src="https://cdn.hobbitqia.cc/20230928231838.png" width=60%></div>

如何实现重叠？- buffer  
Adding instruction buffer between memory and instruction decode unit.  
添加 buffer 之后，IF 阶段时间变得很短，此时可以和 ID 阶段合并（把二次重叠变为了一次重叠）。

但如果合并后 IFID 和 EX 阶段时间不一致，也会有执行部件的浪费。  
如何平滑速度的差异？- buffer  

Common features: They work by FIFO, and are composed of a group of several storage units that can be accessed quickly and related control logic. 
<div align = center><img src="https://cdn.hobbitqia.cc/20230928232451.png" width=60%></div>
<div align = center><img src="https://cdn.hobbitqia.cc/20230928232708.png" width=60%></div>

可以看到，添加 buffer 之后，ID 阶段不用等待 EX 阶段技术才能进行下一条的译码，因为 ID 阶段的结果已经存放在 buffer 中了。

## Classes of pipelining

Characteristics of pipelining

* Single function pipelining: only one fixed function pipelining.
* Multi function pipelining: each section of the pipelining can be connected differently for several different functions.  
不同运算，用到流水线中不同的段，这样实现了不同的功能。

    ??? Example
        <div align = center><img src="https://cdn.hobbitqia.cc/20230928233306.png" width=60%></div>

    针对多功能流水线的划分:

    * Static pipelining  
    静态流水线：同一个时刻流水线只能做一个功能。  
    例如在刚刚的例子中，流水线要么做浮点加法，要么做乘法。
    * Dynamic pipelining  
    动态流水线：同一个时刻流水线可以做多个功能。  

        ??? Example
            <div align = center><img src="https://cdn.hobbitqia.cc/20230928233501.png" width=60%></div>

        可以不用等浮点加法第 n 条结束，就可以开始浮点乘法。

还可以从不同粒度分类：

* Component level pipelining (in component - operation pipelining)
* Processor level pipelining (inter component - instruction pipelining)
* Inter processor pipelining (inter processor - macro pipelining)

还可以分为线性/非线性：

* Linear pipelining
* Nonlinear pipelining  
非线性，功能部件可能多次使用，造成回路

    ??? Example
        <div align = center><img src="https://cdn.hobbitqia.cc/20230929093030.png" width=60%></div>

还可以分为顺序/乱序：

* Ordered pipelining
* Disordered pipelining  
进来和流出的顺序不一样。后面的指令与前面的指令无关，则可以先出来，不能则要等待。

还可以分为标量/向量处理器：

* Scalar processor
* Vector pipelining processor: The processor has vector data representation and vector instructions. It is the combination of vector data representation and pipelining technology.  