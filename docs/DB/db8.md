
# Physical Storage Systems

??? Abstract
    * Classification of Physical Storage Media
    * Storage Hierarchy 
    * Magnetic Disks
    * Disk Interface Standards
    * Performance Measures of Disks
    * Optimization of Disk-Block Access
    * Flash Storage & SSD
    * Storage Class Memory(NVM)

## Storage Hierarchy

* volatile storage(易失存储)  
loses contents when power is switched off.  
* non-volatile storage（非易失存储）  
Contents persist even when power is switched off.  

主要从 speed, cost, reliability 衡量

<div align=center> <img src="http://cdn.hobbitqia.cc/202304241004959.png" width = 70%/> </div>

从高层往低层走，存储设备变得更慢，更便宜和更大。

* **primary storage**: Fastest media but volatile (cache, main memory).
* **secondary storage**: next level in hierarchy, non-volatile, moderately fast access time  
also called *on-line storage* 
* **tertiary storage**: lowest level in hierarchy, non-volatile, slow access time  
also called *off-line storage*   
常用来备份

**NVM** (non-volatile memory) 访问和内存一样，以字节寻址，而且掉电能保持数据。 

## Magnetic Disks

<div align=center> <img src="http://cdn.hobbitqia.cc/202304241012893.png" width = 55%/> </div>

一个磁盘有上十万个 track(磁道), 一个磁道又有上千个 sector(扇区，是计算机和磁盘交换数据的最小单位).  
arm assemly 用来寻道，读写头共进退，寻找数据在哪个磁道上。  
等对应扇区旋转到读写头，才开始传输数据。  
同样磁道组成的柱面。对于大文件，最好存在同一个柱面上，这样可以并行读写。

* **Read-write head**
* Surface of platter divided into circular **tracks（磁道）**
* Each track is divided into **sectors（扇区）**
* To read/write a sector
    * disk arm swings to position head on right track
    * platter spins continually; data is read/written as sector passes under head
* **Cylinder（柱面）** i consists of ith track of all the platters 
* **Disk controller(磁盘控制器)**– interfaces between the computer system and the disk drive hardware.

### Performance Measures of Disks

* **Access time(访问时间)** – the time it takes from when a read or write request is issued to when data transfer begins.    Consists of: 
    * **Seek time（寻道时间**）– time it takes to reposition the arm over the correct track. 
        * Average seek time is 1/2 the worst case seek time.  
        * 4 to 10 milliseconds on typical disks
    * **Rotational latency（旋转延迟）** – time it takes for the sector to be accessed to appear under the head. 
        * Average latency is 1/2 of the worst case latency.  
        * 4 to 11 milliseconds on typical disks (5400 to 15000 r.p.m.)
* **Data-transfer rate（数据传输率）** – the rate at which data can be retrieved from or stored to the disk.

内存传输是以块为单位的。即使是想要访问一个 byte, 也需要把这个 byte 所在的 4k 内存读进来。

* **Disk block** is a logical unit for storage allocation and retrieval  
    * Smaller blocks: more transfers from disk
    * Larger blocks:  more space wasted due to partially filled blocks

* **Sequential access pattern(顺序访问模式)**  
连续的读写请求只需要第一次访问磁盘  
* **Random access pattern（随机访问模式）**  
慢，希望尽量多一些顺序访问。  
可以用一个日志把要修改的数据记录下来，后面再进行修改，尽量用顺序访问替换随机访问。  

* **I/O operations per second (IOPS ，每秒I/O操作数)**  
Number of random block reads that a disk can support per second.  
每秒可以支持随机读的次数。  
* **Mean time to failure (MTTF，平均故障时间)**   
the average time the disk is expected to run continuously without any failure.

### Optimization of Disk-Block Access

* **Buffering**: in-memory buffer to cache disk blocks  
数据读进来就丢，比较可惜，所以我们把它放在一个地方，万一后面需要使用可以不用再读。
* **Read-ahead(Prefetch)**: Read extra blocks from a track in anticipation that they will be requested soon   
预取，读某块时预测邻近几块也会被访问，于是就一起取到内存中。要有依据地预取，不然无用的数据会占用缓存。  
* **Disk-arm-scheduling** algorithms re-order block requests so that disk arm movement is minimized   
**elevator algorithm**  
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304241037347.png" width = 50%/> </div>

* **File organization**
    * Allocate blocks of a file in as contiguous a manner as possible  
    预先分配得到的内存是连续的  
    * Files may get *fragmented*  
        * Sequential access to a fragmented file results in increased disk arm movement  
        * Some systems have utilities to defragment the file system, in order to speed up file access
* **Nonvolatile write buffers（非易失性写缓存）**  
speed up disk writes by writing blocks to a non-volatile RAM buffer immediately  
把要写的数据先写到一个快速的非易失的缓存里，如 NVM. 这时上面的程序可以继续执行了, NVM 再择机将数据写回到磁盘。
* **Log disk（日志磁盘）**  
a disk devoted to writing a sequential log of block updates  

## Flash Storage

* NAND flas
    * requires page-at-a-time read (page: 512 bytes to 4 KB)  
    顺序读写和随机读写差不多  
    * Page can only be written once  
    像黑板，写了数据如果要再写需要把之前的擦掉。  
* **SSD(Solid State Disks)**  
Use standard block-oriented disk interfaces, but store data on multiple flash storage devices internally

<div align=center> <img src="http://cdn.hobbitqia.cc/202304241050864.png" width = 60%/> </div>

可能有这样的情况：我们反复读写、擦去某几个块，这会导致它们坏的很快。

* **Remapping** of logical page addresses to physical page addresses avoids waiting for erase
* **Flash translation table** tracks mapping
    * also stored in a label field of flash page
    * remapping carried out by flash translation layer  
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304241057122.png" width = 60%/> </div>

* **wear leveling(磨损均衡)**  
evenly distributed erase operators across physical blocks

<div align=center> <img src="http://cdn.hobbitqia.cc/202304241059015.png" width = 60%/> </div>

Persistence 即掉电是否能保持原数据。