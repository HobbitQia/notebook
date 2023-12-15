---
counter: True  
---

# Mass-Storage Structure

## Overview

**Magnetic disks** provide bulk of secondary storage of computer system.   
hard disk is most popular.

## Disk Structure

<div align = center><img src="https://cdn.hobbitqia.cc/20231215125533.png" width=70%></div>

可见 [DB 笔记](https://note.hobbitqia.cc/DB/db8/#magnetic-disks)

<div align = center><img src="https://cdn.hobbitqia.cc/20231215130120.png" width=70%></div>

* **Positioning time(random-access time)** is time to move disk arm to desired sector
    * seek time: move disk to the target cylinder
    * rotational latency: for the target sector to rotate under the disk head

* **Performance**
    * **transfer rate**: theoretical 6 Gb/sec; effective (real) about 1Gb/sec
    * **seek time** from 3ms to 12ms (9ms common for desktop drives)
    * latency based on spindle speed: 1/rpm * 60
        * average latency = 1/2 latency

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231215144350.png" width=70%></div>

    主要慢在 seek 和 rotation 部分。

## Disk Scheduling

磁盘也需要调度，以减少 access time。

以前 OS 会负责调度，现在由 **firmware** 负责（disk controller）。

There are many disk scheduling algorithms

* FCFS
* SSTF
* SCAN, C-SCAN
* LOOK, C-LOOK

We use a request queue of cylinders “98, 183, 37, 122, 14, 124, 65, 67” ([0, 199]), and initial head position 53 as the example.  
注意这里说的是 cyclinder 柱面（包含若干等距离的 track），只有不在同一柱面的才需要 seek，同一柱面不同 track 不需要动磁头，不同 sector 就靠转动。

### FCFS

First-come first-served, simplest scheduling algorithm.

!!! Example
    Total head movements of 640 cylinders
    <div align = center><img src="https://cdn.hobbitqia.cc/20231215145213.png" width=70%></div>

* Advantage:
    * Every request gets a fair chance
    * No indefinite postponement
* Disadvantages:
    * Does not try to optimize seek time
    * May not provide the best possible service


### SSTF

shortest seek time first.

类似 SJF，选择离现在 head position 最近的 request。**但是 SSTF 不一定最好**。可能发生 starvation。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231215145435.png" width=70%></div>

* Advantages:
    * Average Response Time decreases
    * Throughput increases  

* Disadvantages
    * Overhead to calculate seek time in advance
    * Starvation may exist
    * High variance : favors only some requests

### SCAN

也叫 elevator 电梯算法，先扫到一头，再往另一头扫，如果遇到 request 就读取。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231215145805.png" width=70%></div>

* Advantages:
    * Average Response Time
    * High Throughput
    * Low variance of response time
* Disadvantages:
    * Long waiting time for requests for locations just visited by disk arm

        如果刚好错过电梯，就要等电梯触底再上来，等待时间很长。

C-SCAN(Circular-SCAN) is designed to provides a more uniform wait time.
只做单向的扫，到达一端时立刻回到开头，随后从底往上扫，这样最多只用等待一圈。

### LOOK

在 SCAN / C-SCAN 的基础上，只走到一端最后一个任务（look 是否有请求）而不走到 disk 的头。

LOOK is a version of SCAN, C-LOOK is a version of C-SCAN.

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231215150152.png" width=70%></div>

* Advantage:
    * Prevents the extra delay which occurred due to unnecessary traversal to the end of the disk.

!!! Summary "Selecting Disk-Scheduling Algorithm"
    依赖于请求的模式，而请求本身又依赖于文件分配策略。文件系统如果注重空间局部性，能够提供很好的表现提升。

    如果 I/O 比较少，FCFS 和 SSTF 即可。如果是大型的服务器或者数据库，一般使用 C-LOOK。如果是 SSD（不用 seek），一般使用 FCFS。

## Nonvolatile Memory Devices

If disk-drive like, then called **solid-state disks (SSDs)**.  
固态硬盘

Can be more reliable than HDDs，

与磁盘相比，寿命短，容量小，速度快（Bus 慢，需要直接连到 PCIE 上）。没有 arm 也不需要转，因此不存在 seek time 和 rotational latency.

* Read and written in “page” increments (think sector) but can’t overwrite in place.
    * Must first be erased, and erases happen in larger “block”
    * Assume block size: 64k
    * Can only be erased a limited number of times before worn out – ~ 100,000

        寿命短，里面是用门电路实现。充放电（擦写）门会被击穿，就无法区分 0/1 了。

    * Life span measured in *drive writes per day*(DWPD)
        
Each cell has lifespan, so need to write equally to all cells.

## Magnetic Tape

磁带，容量很大，但是很慢。因为需要倒带，一般都做顺序访问而不是随机访问。现在主要用来做备份。

data stored on the tape are relatively permanent.

## Disk Management

使用这些介质（磁盘、固态硬盘、磁带）的时候，需要先格式化。

**Physical formatting**: divide disk into sectors for controller to read/write.  
即把介质上分好不同的部分。

* **partition disk** into groups of cylinders, each treated as a logical disk.
* **logical formatting** partitions to **make a file system** on it.

## Disk Attachment

* host-attached storage
    * hard disk, RAID arrays, CD, DVD, tape...

        可以插到 I/O Bus 上。
        <div align = center><img src="https://cdn.hobbitqia.cc/20231215153649.png" width=70%></div>

* network-attached storage
* storage area network

## RAID

Disks are unreliable, slow, but cheap. Simple idea: let’s use **redundancy** to improve **reliability** and **speed**.

HDDs 越来越小和便宜，因此如果一个系统可以拥有大量磁盘，那么就能改善数据的读写速率（因为可以并行）和可靠性（使用冗余来降低出现错误的期望）。这样的磁盘组织技术称为 **磁盘冗余阵列 (Redundant Arrays of Independent Disk, RAID)** 技术。

* Data Mirroring
    * Keep the same data on multiple disks

* Data Striping
    * Keep data split across multiple disks to allow parallel reads

* Error-Code Correcting (ECC) - Parity Bits
    * Keep information from which to reconstruct lost bits due to a drive failing

这里 RAID 0 的技术主要是 Striping，RAID 1 的技术主要是 Mirroring，因此我们有时会说 5+1，5+0，表示几个技术结合。

### RAID 0

没有 redundancy，什么也不做，把数据分散在不同的磁盘。

Improves **performance**, but not **reliability**.

!!! Example
    * Fixed strip size
    * 5 files of various sizes
    * 4 disks

    <div align = center><img src="https://cdn.hobbitqia.cc/20231215155752.png" width=70%></div>

### RAID 1

也被称为 mirroring，存在两个磁盘，一个是主磁盘，一个是备份磁盘。主磁盘写入数据后，备份磁盘也写入相同的数据。

!!! Example
    * 5 files of various sizes
    * 4 disks

    <div align = center><img src="https://cdn.hobbitqia.cc/20231215155822.png" width=70%></div>

**Reliability** is ensured unless you have (extremely unlikely) simultaneous failures, **performance** can be boosted by reading from the disk with the fastest seek time.

但是浪费了一半的磁盘。

### RAID 2

stripes data at the bit-level; uses Hamming code for error correction (not used).

没有被实际应用，因为粒度太小，现在无法单独读出来一个比特，至少读出一个字节。
<div align = center><img src="https://cdn.hobbitqia.cc/20231215160147.png" width=70%></div>

### RAID 3

Data is striped across multiple disks, with one dedicated parity disk that stores the parity information for all the data disks.

纠错码就在一个磁盘里。

<div align = center><img src="https://cdn.hobbitqia.cc/20231215160539.png" width=70%></div>

### RAID 4，5，6

* RAID 4: Basically like RAID 3, but interleaving it with strips (blocks)

    用块来做 strip，纠错码单独存在一个盘里。这个纠错盘一直会被读写，很有可能先损坏。

* RAID 5: Like RAID 4, but parity is spread all over the disks as opposed to having just one parity disk.

    parity bit 被分散地存到了不同的磁盘里。相比于 RAID 4，每个盘的读写比较均衡。

* RAID 6: extends RAID 5 by adding an additional parity block.

    又加了一个 parity bit，也是分散存储。

<div align = center><img src="https://cdn.hobbitqia.cc/20231215160506.png" width=70%></div>

### RAID and File Systems

RAID 只检测磁盘失效，并不知道对应的是哪个文件失效。

ZFS adds checksums to all FS data and metadata.  
这样可以检验磁盘是否写错。

## Takeaway

!!! Summary "Takeaway"
    * Disk structure
    * Disk scheduling
        * FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK
    * RAID 0-6