---
counter: True  
---

# Storage, Networks and Other Peripherals

??? Abstract
    * Introduction
    * Disk Storage and Dependability
    * Networks (Skim)
    * Buses and Other Connections between Processors Memory, and I/O Devices
    * Interfacing I/O Devices to the Memory, Processor, and Operating System
    * I/O Performance Measures:   
    Examples from Disk and File Systems
    * Designing an I/O system
    * Real Stuff: A Typical Desktop I/O System

## Introduction

除了 CPU 的设备我们都认为是 I/O.  

Assessing I/O system performance is very difficult.  
不同的场景有不同的评估。

Performance of I/O system depends on:

* connection between devices and the system
* the memory hierarchy
* the operating system

<div align=center> <img src="http://cdn.hobbitqia.cc/202306072304626.png" width = 60%/> </div>

CPU 和 I/O 由总线连接. I/O 往往通过中断的方式通知 CPU 有事件处理。  
不同的设备有不同的驱动(I/O controller)

Three characters of IO

* Behavior  
Input (read once), output (write only, cannot read) ,or storage (can be reread and usually rewritten)  
输入/输出/存储
* Partner  
Either a human or a machine is at the other end of the I/O device, either feeding data on input or reading data on output.  
和谁对接？人/机器
* Data rate  
The peak rate at which data can be transferred between the I/O device and the main memory or processor.  
数据传输速率

I/O performance depends on the application.  

* Throughput
单位时间传输的数据量；单位时间 I/O 的操作数。
* Response time ***e.g.***, workstation and PC
* both throughput and response time ***e.g.***, ATM
不同的应用场景关心不同的方面。

### Amdahl’s law

Sequential part can limit speedup  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306072325911.png" width = 50%/> </div>

    想用 100 个 CPU 完成 90 倍的加速。这要求不能被并行执行的部分最多占 0.1%. 

Remind us that ignoring I/O is dangerous. 

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306072328275.png" width = 50%/> </div>

## Disk Storage and Dependability

Two major types of magnetic disks

* floppy disks  
软盘（内存）
* hard disks
    * larger
    * higher density
    * higher data rate
    * more than one platter

### The organization of hard disk

* platters: disk consists of a collection of platters, each of which has two recordable disk surfaces
盘
* tracks: each disk surface is divided into concentric circles  
盘上有很多个轨道
* sectors: each track is in turn divided into sectors, which is the smallest unit that can be read or written  
每条轨道被分为若干个扇区
<div align=center> <img src="http://cdn.hobbitqia.cc/202306072332199.png" width = 50%/> </div>

### To access data of disk

* **Seek**: position read/write head over the proper track  
数据不一定刚好在圈上，需要找到数据对应的圈。
* **Rotational latency**: wait for desired sector  
找到圈后，等待旋转到数据起点。

    ??? Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202306072336724.png" width = 50%/> </div>

* **Transfer**: time to transfer a sector (1 KB/sector) function of rotation speed  
把硬盘数据搬到内存。

!!! Example "Disk Read Time"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306072338521.png" width = 50%/> </div>

### Flash Storage

Nonvolatile semiconductor storage

* 100× – 1000× faster than disk
* Smaller, lower power, more robust
* But more $/GB (between disk and DRAM)

Flash Types

* **NOR flash**: bit cell like a NOR gate
    * Random read/write access  
    可以随意读写
    * Used for instruction memory in embedded systems  
    因此在嵌入式中作为指令存储
* **NAND flash**: bit cell like a NAND gate
    * Denser (bits/area), but block-at-a-time access  
    密度可以更高，但是读写要以 block 为单位。
    * Cheaper per GB  
    * Used for USB keys, media storage  

Flash bits wears out after 100000’s of accesses.  
因此不适合做 RAM/硬盘的替代。  
当已经被磨损时，就把本来的数据映射到其他内存。

### Disk Performance Issues

一般得到的是 average seek time. 
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081622578.png" width = 60%/> </div>

### Dependability

衡量硬盘的指标就是可靠性 Dependability(Reliability).  

Computer system dependability is the quality of delivered service such that reliance can justifiably be placed on this  service.  
连续提供服务的时间。

* MTTF mean time to failure  平均无故障时间
* MTTR mean time to repair 平均修复时间
* MTBF (Mean Time Between Failures) 平均故障间隔时间  
= MTTF+ MTTR

因此可用的时间就是 $\dfrac{MTTF}{MTTF+MTTR}$

improve MTTF

* Fault avoidance   
preventing fault occurrence by construction  
在硬盘寿命到达前替换硬盘
* Fault tolerance  
using redundancy to allow the service to comply with the service specification despite faults occurring, which applies primarily to hardware faults  
多个地方备份
* Fault forecasting  
predicting the presence and creation of faults, which applies to hardware and software faults  
预见故障，采取措施

### Redundant Arrays of (Inexpensive) Disks

不同设备对硬盘的需求量不同。  
能不能用小硬盘组合成大硬盘？  
好处是可以有多个读写口，同时访问。坏处是坏掉的概率更大了。


Hot spares support reconstruction in parallel with access: very high media availability can be achieved.  
热备份可以支持数据重建。

* Files are "striped" across multiple disks  
* Redundancy yields high data availability  
* Disks will still fail
* Contents reconstructed from data redundantly stored in the array  
数据可以从冗余的用于备份的硬盘里恢复，代价是容量会有损失。

RAID
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081635472.png" width = 60%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081637953.png" width = 60%/> </div>

#### RAID 0: No Redundancy

Data is striped across a disk array but there is no redundancy to tolerate disk failure.  
数据被放在多个盘里提高并行，速度可以提高（因为能同时访问）

RAID 0 something of a misnomer as there is no Redundancy

#### RAID 1: Disk Mirroring/Shadowing

<div align=center> <img src="http://cdn.hobbitqia.cc/202306081638944.png" width = 50%/> </div>

* Each disk is fully duplicated onto its “mirror”  
每一个盘的内容都被复制放到另一个盘里。
* Bandwidth sacrifice on write  
写的时候需要同时写两个盘，读可能被优化。
* Most expensive solution: 100% capacity overhead

#### RAID 3: Bit-Interleaved Parity Disk

P contains sum of other disks per stripe mod 2 (“parity”)  
如第 1、2、3 个盘的第一个 bit 做奇偶校验放在第 4 个盘。

当其中一个盘挂掉的时候，读出其他盘的数据我们可以推出原来盘的数据。  
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081641490.png" width = 60%/> </div>

哪个盘坏了？（不知道x

#### RAID 4: Block-Interleaved Parity

RAID 3 relies on parity disk to discover errors on Read. 

我们希望自己的盘有自己的 error detection, 不需要校验盘来检验自己对不对，盘与盘之间没有依赖关系。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081646245.png" width = 60%/> </div>

把自己每个 block 做了校验位，放到备份盘中。

当我们同时读 D0, D5 时 Paritybit 会被读两次。  
Small Write 增加开销。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081649639.png" width = 60%/> </div>

#### RAID 5: High I/O Rate Interleaved Parity

P 盘是不定的。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306081651961.png" width = 60%/> </div>

#### RAID 6: P+Q Redundancy

有 P, Q 两位，可以恢复出两个盘的内容。

!!! Summary "RAID Techniques"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306081652365.png" width = 60%/> </div>

## Buses and Other Connections between Processors Memory, and I/O Devices

<div align=center> <img src="http://cdn.hobbitqia.cc/202306231639947.png" width = 60%/> </div>

**Bus**: Shared communication link (one or more wires)  
一条高速公路和各条小道，给不同车辆共享通行。

Difficult Design:

* may be bottleneck  
很容易成为性能的 bottleneck(瓶颈).
* length of the bus
* number of devices
* tradeoffs (fast bus accesses and high bandwidth)
* support for many different devices
* cost

### Bus Basics

总线不是一条线，而是多条线组合在一起。把各种路、设备连接起来。

A bus contains two types of lines

* Control lines: signal requests and acknowledgments, and to indicate what types of information is on the data lines.  
比如给外设发送读取命令，外设发送可以读的信号。
* Data lines: carry information (***e.g.***, data, addresses, and complex commands) between the source and the destination.

**Bus transaction**  
sending the address and receiving or sending the data   
总线传输的两部分，送地址，送数据。

* Types of buses
    * processor-memory : short high speed, custom design)  
    * backplane : high speed, often standardized, ***e.g.***, PCI)
    * I/O : lengthy, different devices, standardized, ***e.g.***, SCSI)

<div align=center> <img src="http://cdn.hobbitqia.cc/202306231648577.png" width = 60%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202306231647551.png" width = 60%/> </div>

以前的 CPU 只有一条总线，如果 IO 设备和 Memory 接在一起，他们的速度需要遵守一样的协议。  
IO 设备是很慢的，会占用 Bus, 现在我们把任务丢过去后可以等处理好了再来拿。  
不同 IO 设备之间数据传输不需要占用总线。

### Synchronous vs. Asynchronous

同步总线或者异步总线

* **Synchronous bus**: use a clock and a fixed *protocol*, fast and small but every device must operate at same rate and clock skew requires the bus to be short  
所有设备需要以同样的频率。  
clock skew, 即上升沿无法对齐
* **Asynchronous bus**: don’t use a clock and instead use *handshaking*  
A serial of steps used to coordinate asynchronous bus transfers.  

    !!! Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202306231653192.png" width = 50%/> </div>

        1. When memory sees the ReadReq line, it reads the address from the data bus, begin the memory read operation，then raises Ack to tell the device that the ReadReq signal has been seen.  
        2. I/O device sees the Ack line high and releases the ReadReq data lines.  
        3. Memory sees that ReadReq is low and drops the Ack line.  
        4. When the memory has the data ready, it places the data on the data lines and raises DataRdy.  
        5. The I/O device sees DataRdy, reads the data from the bus , and signals that it has the data by raising ACK.   
        6. The memory sees Ack signals, drops DataRdy, and releases the data lines.  
        7. Finally, the I/O device, seeing DataRdy go low, drops the ACK line, which indicates that the transmission is completed.  

        读数据时, CPU 把 read request 拉起来。内存看到后，会把 Data 总线上的读走（即地址），随后进行内存读取，同时把 Ack 信号拉起来，告诉 IO 设备我们已经接收到 read request 了. IO 设备看到 Ack 后把自己的 read request 放下，内存看到 read request 放下后，把 Ack 也放下。  
        内存读出数据后，会把 data ready 拉起来，把数据放在 data line 上. IO 设备看到 data ready 后会把数据取走，并把 Ack 信号拉起。内存看到 Ack 信号后会放下 data ready 信号，随后 IO 设备放下 ack 信号。

### Bus Arbitration

总线上有很多设备，多个设备要访问同一个内存时，需要总线仲裁，获得总线的所有权。  

multiple device desiring to communicate could each try to assert the control and data lines for different transfers.  
a bus master is needed. Bus masters initiate and control all bus requests.  
实际上现在 master 的设备也有多个，不同 master 之间也有竞争（CPU, 显存等都是一个 master）。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306231659748.png" width = 60%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202306231700134.png" width = 60%/> </div>

上面的例子中只有一个 CPU 是 master, 可以占领总线，并让 IO 设备执行操作。

能主动发起操作（操作 Bus）的设备叫做 Bus Master, 一般是 CPU.  
决定哪个 master 能够操作总线的设备叫做总线仲裁。  

Two factors in choosing which device to grant the bus:

* bus priority
* fairness  
公平性，不让某个设备一直占用总线。

### Performance analysis of Synchronous versus Asynchronous buses

评价总线的性能 - 带宽  bandwidth

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306231706454.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306231706872.png" width = 60%/> </div>

    异步时钟 step1 结束时内存已经拿到地址了，这个过程中 step234 可以同时做。

* Increasing data bus width
* Use separate address and data lines
* transfer multiple words  
一次传输多个数据

!!! Example "Increasing the Bus Bandwidth"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306231712313.png" width = 60%/> </div>

    burst 传输，地址发一次，读多个数据。如读地址 4, 我们可以返回 4 5 6 7 的数据。  

    * the 4-word block transfers
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306231715050.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232217459.png" width = 60%/> </div>

    * the 16-word block transfers
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232219660.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232220418.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232222353.png" width = 60%/> </div>

## Interfacing I/O Devices to the Memory, Processor, and Operating System

IO 设备（需要驱动）怎么和 OS 通信  

* The OS must be able to give commands to the I/O devices.  
OS 要能给 IO 设备发出命令，比如启动、关机。
* The device must be able to notify the OS, when I/O device completed an operation or has encountered an error.  
IO 有方式，在设备完成操作或者遇到错误时，要能通知 OS. 比如打印结束，可以继续传输数据了。
* Data must be transferred between memory and an I/O device.  
数据要能在内存和 IO 设备之间传输。

CPU 要能访问到 IO 设备，需要有一个地址。（注意这个地址不能进入 cache, 否则我们就无法获得 IO 设备的最新状态了）

* memory-mapped I/O  
把内存地址中的一部分分出来给 IO 设备用，这样就可以用 ld sd 来访问。
* special I/O instructions  
***e.g.*** x86 中 in al,port out port,al. RISC-V 中没有

IO 设备需要有对应的寄存器存储状态  

* The Status register (a done bit, an error bit...)
* The Data register, The command register

### Communication with the Processor

* Polling: The processor periodically checks status bit to see if it is time for the next I/O operation.  
定期检查设备，但是会占用 CPU. 
* Interrupt: When an I/O device wants to notify processor that it has completed some operation or needs attentions, it causes processor to be interrupted.  
当 IO 设备完成操作给 CPU 一个中断，等待其响应。好处是 CPU 可以一直做自己的事情。
* DMA (direct memory access): the device controller transfer data directly to or from memory without involving processor.  
IO 设备直接和内存交互，不需要 CPU 参与。

#### Interrupt-Driven I/O mode

<div align=center> <img src="http://cdn.hobbitqia.cc/202306232242586.png" width = 60%/> </div>

假设 IO 是个打印机。每次打印一个字符，就会给 CPU 发一个中断。CPU 会去读取打印机的状态，看是否完成。完成后 CPU 继续做自己的事情。

#### DMA transfer mode

<div align=center> <img src="http://cdn.hobbitqia.cc/202306232243449.png" width = 60%/> </div>

CPU 需要配置 DMA. DMA 会和 IO 设备交互，把数据搬到内存，不需要 CPU 参与。

A DMA transfer need three steps:

* The processor sets up the DMA by supplying some information, including the identity of the device, the operation, the memory address that is the source or destination of the data to be transferred, and the number of bytes to transfer.   
CPU 配置 DMA，包括哪个设备、做什么操作、内存地址、数据大小等。
* The DMA starts the operation on the device and arbitrates for the bus. If the request requires more than one transfer on the bus, the DMA unit generates the next memory address and initiates the next transfer.  
DMA 开始操作设备，占用总线。如果需要多次传输，DMA 会生成下一个内存地址，开始下一次传输。  
DMA 也是挂在总线上的 master, 优先级没有 CPU 高。因此他会趁 CPU 空闲的时候搬运数据，可以充分利用总线。
* Once the DMA transfer is complete, the controller interrupts the processor, which then examines whether errors occur.   
DMA 完成后，给 CPU 发中断，CPU 检查是否有错误。

!!! Note "Compare polling, interrupts, DMA"
    * The disadvantage of polling is that it wastes a lot of processor time. When the CPU polls the I/O device periodically, the I/O devices maybe have no request or have not get ready.  
    polling 的坏处是浪费了大量的 CPU 的时间。CPU 定期轮询 IO 设备可能没有请求或者没有准备好。  
    * If the I/O operations is interrupt driven, the OS can work on other tasks while data is being read from or written to the device.  
    如果 IO 操作是中断驱动的，OS 可以在数据从设备读取或写入时处理其他任务。
    * Because DMA doesn’t need the control of processor, it will not consume much of processor time.  
    DMA 不需要 CPU 控制，不会消耗 CPU 时间。  
    但 DMA 其实只是搬运数据时有用，其实和 polling interrupt 不对立。

??? Example "Overhead of Polling in an I/O System"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232249676.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232250773.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232250498.png" width = 60%/> </div>
    
??? Example "Overhead of Interrupt-Driven I/O"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232253481.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232255768.png" width = 60%/> </div>

    polling 必须时时刻刻查询，中断只需要在真正有数据传输（比如 5% 的时间）时再去处理。

??? Example "Overhead of I/O Using DMA"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232305327.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232305655.png" width = 60%/> </div>

## I/O Performance Measures: Examples from Disk and File Systems

CPU 有 benchmark, IO 也有 benchmark 来衡量性能。

**I/O rate**: the number of disk access per second, as opposed to data rate  

### Designing an I/O system

整个计算机系统 CPU+bus+I/O  

* Find the weakest link in the I/O system, which is the component in the I/O path that will constrain the design. Both the workload and configuration limits may dictate where the weakest link is located.  
速度由最慢的决定。  
看哪个部分最弱，其他部分保证可以满足最弱的条件即可。
* Configure this component to sustain the required bandwidth.  
* Determine the requirements for the rest of the system and configure them to support this bandwidth.  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232313649.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232313215.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232319472.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306232320523.png" width = 60%/> </div>