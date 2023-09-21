---
counter: True  
---

# Fundamentals of Computer Design

![](https://cdn.hobbitqia.cc/20230921202940.png)

## Introduction

Von Neumann Structure
<div align = center><img src="https://cdn.hobbitqia.cc/20230921203050.png" width=60%></div>

**Classes of Computers**

* Desktop computers  
PC: Personal Computers
* Servers computers  
更强大的处理速度，容量（用于冗余备份）
* Embedded computers   
不能随意安装第三方应用的，与系统一体，称为嵌入式（不太符合国情x
* Personal Mobile Devices  
如手机，iPad
* Supercomputer   

**Classed by Flynn**  
按照指令流和数据流进行分类
<div align = center><img src="https://cdn.hobbitqia.cc/20230921203255.png" width=50%></div>

* SISD  
单指令流单数据流，如早期的单核 PC
* SIMD  
一条指令有多条数据流动（如向量数据），方便做流水线
* MISD  
多指令流单数据流，并不实际存在
* MIMD  
多指令流多数据流

**Performance**

* Alogrithm
* Programming language, compiler, architecture
* Processor and memory system
* I/O system (including OS)

!!! Summary
    According to the process of using data, computers are developing in three fields:

    * speed up processing (parallel)
    * speed up transmission (accuracy)
    * Increase storage capacity and speed up storage (reliability)

## Performance

这里有很多因素会影响性能：体系结构，硬件实现，编译器，OS...

We need to be able to define a measure of performance. 

* Single users on a PC -> a minimization of response time
* Large data -> a maximization of throughput

为了衡量性能，我们有响应时间和吞吐量两个指标：

* Latency (Response time 响应时间)  
一个事件开始到结束的时间  
* Throughput (bandwidth 带宽)  
给定时间范围内完成了多少的工作量

这部分可见[计组笔记](https://note.hobbitqia.cc/CO/co1/#performance)

<u>***The main goal of architecture improvement is to improve the performance of the system.***</u>

## Technology Trend

The improvement of computer architecture

* Improvement of input / output 
* The development of memory organization structure
* Two directions of instruction set development
    * CISC / RISC 
* Parallel processing technology  
不同层次、粒度的并行