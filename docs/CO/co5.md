---
counter: True  
---

# Large and Fast: Exploiting Memory Hierarchy

??? Abstract
    * Memory Technologies
    * Memory Hierarchy Introduction
    * The basics of Cache
    * Measuring and improving cache performance
    * Dependable Memory Hierarchy
    * Virtual Machines
    * Virtual Memory
    * A common Framework for Memory Hierarchy
    * Using FSM to Control a simple Cache

## Memory Technologies

* SRAM
    * value is stored on a pair of inverting gates
    * very fast but takes up more space than DRAM 
* DRAM
    * value is stored as a charge on capacitor (must be refreshed)
    * very small but slower than SRAM (factor of 5 to 10

见[计逻部分](https://note.hobbitqia.cc/Logic/logic07/)

## Memory Hierarchy Introduction

Programs access a small proportion of their address space at any time  

* Temporal locality  
Items accessed recently are likely to be accessed again soon  
如 for 循环，跑过一次后我们大概率还要执行循环体里的代码
* Spatial locality  
Items near those accessed recently are likely to be accessed soon  
如数组，我们访问了这个元素后大概率还要访问后面的元素

利用局部性：

* Memory hierarchy
* Store everything on disk
* Copy recently accessed (and nearby) items from disk to smaller DRAM memory
    * Main memory
* Copy more recently accessed (and nearby) items from DRAM to smaller SRAM 
memory
    * Cache memory attached to CPU
    
<div align=center> <img src="http://cdn.hobbitqia.cc/202305252023530.png" width = 45%/> </div>

* **Block** (aka **line**): unit of copying  
向上级存储器搬数据的最小单位（可能有很多个字）
* **Hit**: If accessed data is present in upper level  
命中 - 上层的存储器有我们要的数据，不需要去下层存储器寻找
    * hit ratio: hits/accesses
    * hit time: 访问上层存储的时间以及决定是否命中的时间
* **Miss**: If accessed data is absent  
需要从下层存储器中把对应数据的块搬到上层，接着从上层把数据读走
    * miss penalty 
    * miss rate: 1 - hit ratio
    * miss time: 替代上层存储器的块的时间和把这个块给处理器的时间

Exploiting Memory Hierarchy
<div align=center> <img src="http://cdn.hobbitqia.cc/202305252033223.png" width = 45%/> </div>

接下来我们关注两部分：

* The basics of Cache: SRAM and DRAM(main memory)  
解决速度问题
* Virtual Memory: DRAM and DISK  
解决容量问题  

## The basics of Cache

For each item of data at the lower level, there is exactly one location in the cache where it might be.  
So, lots of items at the lower level share locations in the upper level.  
多个块会映射到同一个位置。

* How do we know if a data item is in the cache?  
如何知道数据是否在 cache 中？
* If it is, how do we find it?  
如果有，如何找到数据？

### Direct Mapped Cache

<div align=center> <img src="http://cdn.hobbitqia.cc/202305301541770.png" width = 55%/> </div>

memory address is modulo the number of blocks in the cache  
取模。

* Store block address as well as the data
我们需要知道 cache 放的是哪个块。
    * Actually, only need the high-order bits
    * Called the **tag**  
* Valid bit: 1 = present, 0 = not present  
我们需要知道 cache 里是否有放有效的块。

<div align=center> <img src="http://cdn.hobbitqia.cc/202305301546465.png" width = 55%/> </div>

* byte offset 地址
如果一个 block 是一个字，那么 byte offset 应该有 2 位。  
注意 CPU 给出的地址都是以 byte 为最小寻址单元的。

??? Example
    这里省略了后面的 byte offset.
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301553756.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301555320.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301556643.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301558565.png" width = 40%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301558669.png" width = 40%/> </div>

* byte offset 位宽由 block size 决定。
* index 位宽由 cache size 决定
* tag 位宽由总的地址位宽减掉其他位决定

<div align=center> <img src="http://cdn.hobbitqia.cc/202305301600840.png" width = 50%/> </div>

!!! Example "Bits in Cache"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301601001.png" width = 50%/> </div>

??? Example "Mapping an Address to Multiword Cache Block"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202305301613776.png" width = 50%/> </div>

### Handling Cache hit and Misses

* Read hits
* Read misses—two kinds of misses
    * data cache miss
    * instruction cache miss  
    Stall the CPU, fetch block from memory, deliver to cache, restart CPU read  
    1. Send the original PC value (current PC-4) to the memory.   
    因为 PC 取值完就变成 +4 了，所以当前执行的其实是 PC-4
    2. Instruct main memory to perform a read and wait for the memory to complete its 
    access.  
    3. Write the cache entry, putting the data from memory in the data portion of the 
    entry, writing the upper bits of the address (from the ALU) into the tag field, and 
    turning the valid bit on.  
    4. Restart the instruction execution at the first step, which will refetch the instruction 
    again, this time finding it in the cache.  
* Write hits
    * **write-back**: Cause Inconsistent  
    只把数据写到 cache 中。以后再把 block 搬回到内存。
    * **write-through**: Ensuring Consistent  
    既把数据写到 cache 中又写到内存中。  
    Slower! -- write buffer
* Write misses  
read the entire block into the cache, then write the word

### Deep concept in Cache

* Q1: Where can a block be placed in the upper level? (Block placement)
* Q2: How is a block found if it is in the upper level? (Block identification)
* Q3: Which block should be replaced on a miss? (Block replacement)
* Q4: What happens on a write? (Write strategy)

#### Block Placement

* Direct mapped  
Block can only go in one place in the cache  
块只能去一个地方，通常取模
* Fully associative 全相联  
Block can go anywhere in cache.  
哪里空了去哪里
* Set associative 级相联  
Block can go in one of a set of places in the cache.   
A set is a group of blocks in the cache.  
上两种方法的结合。把一组块组合成 set, 一个块取模找到这个组号，可以去组里的任意一个块。  
Direct mapped 相当于 1-way set associative, Fully associative 相当于 m-way set-associative(m blocks)

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011101837.png" width = 55%/> </div>

#### Block Identification

* Tag  
直接映射只需要比较一个块的 tag, 级相联需要比较 set 里所有块的 tag.  
* Valid bit

The Format of the Physical Address

* The Index field selects  
全相联没有 index. 
    * The set, in case of a set-associative cache 级相联 $\log_2(sets)$
    * The block, in case of a direct-mapped cache 直接映射 $\log_2(blocks)$
* The Byte Offset field selects  
由一个块内 byte 的数目决定. $\log_2(size of block)$
* The Tag is used to find the matching block within a set or in the cache

<div align=center> <img src="http://cdn.hobbitqia.cc/202306011111285.png" width = 60%/> </div>

??? Example "Direct-mapped Cache Example (1-word Blocks)"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011112917.png" width = 50%/> </div>

??? Example "Fully-Associative Cache example (1-word Blocks)"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011113653.png" width = 50%/> </div>

??? Example "2-Way Set-Associative Cache"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011115647.png" width = 50%/> </div>

    注意这里应该是对 Set0 里面的 tag 比较。

#### Block Replacement

In a direct-mapped cache, there is only one block that can be replaced.  
In set-associative and fully-associative caches, there are N blocks (where N is the degree of associativity).

* **Random replacement** - randomly pick any block
    * Easy to implement in hardware, just requires a random number generator  
    * Spreads allocation uniformly across cache
    * May evict a block that is about to be accessed
* **Least-recently used (LRU)** - pick the block in the set which was least recently accessed
    * Assumed more recently accessed blocks more likely to be referenced again
    * This requires extra bits in the cache to keep track of accesses.   
    需要额外的位数！
* **First in,first out(FIFO)** - Choose a block from the set which was first came into the cache

#### Write Strategy

* If the data is written to memory, the cache is called a **write through** cache
    * Can always discard cached data - most up-to-date data is in memory  
    好处是可以随时把 cache 的内容丢掉。
    * Cache control bit: only a *valid* bit
    * memory (or other processors) always have latest data
* If the data is NOT written to memory, the cache is called a **write-back** cache
    * Can’t just discard cached data - may have to write it back to memory
    * Cache control bits: both *valid* and *dirty* bits
    * much lower bandwidth, since data often overwritten multiple times

写回需要时间，我们需要 write stall.  
**Write stall** -- When the CPU must wait for writes to complete during write through.  
我们往往使用 write buffer.  

* A small cache that can hold a few values waiting to go to main memory.
* It does not entirely eliminate stalls since it is possible for the buffer to fill if the burst is larger than the buffer.  
buffer 可能被填满，不能完全避免 write stall. 

<div align=center> <img src="http://cdn.hobbitqia.cc/202306011133671.png" width = 50%/> </div>

存在问题：当我如果要读的时候，数据还在 buffer 里没有被写入内存。因此我们需要先在 buffer 里面比较，如果没有再在内存里找。

Write misses

* Write allocate  
The block is loaded into the cache on a miss before anything else occurs.  
常与 write back 搭配
* Write around (no write allocate)  
常与 write through 搭配
    * The block is only written to main memory
    * It is not stored in the cache.

Larger blocks exploit spatial locality
<div align=center> <img src="http://cdn.hobbitqia.cc/202306011146485.png" width = 50%/> </div>

#### Designing the Memory system to Support Cache 

为了提高 cache 的性能，我们有不同的 memory 组织架构

* Performance basic memory organization
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011148690.png" width = 60%/> </div>

* Performance in Wider Main Memory  
    一次可以读出两个 word. 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011150779.png" width = 60%/> </div>

    但这时内存太大了，开销大。
* Performance in Four-way interleaved memory
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306011154501.png" width = 60%/> </div>

    内存分为多个 banks, 并行访问。

## Measuring and improving cache performance

* How to measure cache performance?
* How to improve performance?
    * Reducing cache misses by more flexible placement of blocks
    * Reducing the miss penalty using multilevel caches

Average Memory Assess time = hit time + miss time =  hit rate $\times$ Cache time + miss rate $\times$ memory time

### Measuring cache performance

We use CPU time to measure cache performance.  
$
CPU\  Time = CPU\  execution\  clock\  cycles + 
Memory-stall\  clock\  cycles \times Clock\  cycle\  time
$  
这里 CPU 的执行时间在设计流水线的时候已经确定了，我们无需考虑。

$$
\begin{align*}
Memory-stall\  clock\ cycles & =  instructions \times miss\  ratio \times miss \  penalty \\ & = Read-stall\  cycles + Write-stall\  cycles
\end{align*}
$$

* For Read-stall  
$Read-stall\ cycles = \dfrac{Read}{Program}\times Read\ miss\ rate \times Read\ miss\ penalty$  
包括取指和数据加载。
* For a write-through plus write buffer scheme  
$Write-stall\ cycles = \left(\dfrac{Write}{Program} \times Write\ miss\ rate \times Write\ miss\ penalty\right)+Write\ buffer\ stalls$
    * If the write buffer stalls are small, we can safely ignore them.  
    一般来说 buffer 不会溢出。
    * If the cache block size is one word, the write miss penalty is 0.  
    大小是一个 word, 替换出去就直接写了。

In most write-through cache organizations, the read and write miss penalties are the same.(为了简便，我们这里这么假设)    
If we neglect the write buffer stalls, we get the following equation: 

$$
\begin{align*}
Memory-stall\ clock\ cycles
& =\dfrac{Memory\ accesses}{Program}\times Miss\ rate\times Miss\ penalty\\
& =\dfrac{Instructions}{Program}\times \dfrac{Misses}{Instructions}\times Miss\ penalty
\end{align*}
$$

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021835934.png" width = 50%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021842560.png" width = 50%/> </div>

    内存占了性能瓶颈。  
    假设我们把时钟频率提高两倍。这样 penalty 需要的时钟周期翻倍。  
    此时 CPU 性能实际只提升 1.23 倍。
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021924424.png" width = 50%/> </div>

### Improving

提高 cache 命中率；减小 penalty.  

#### Reducing cache misses by more flexible placement of blocks  

如果我们正好以模长为步距访问，就会一直 miss. 但其实此时 cache 中还有很多空位。

??? Example "The disadvantage of a direct-mapped cache"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021932583.png" width = 50%/> </div>

??? Example "Miss rate versus set-associative"
    注意 block addr 是忽略了地位的 byte offset 的。
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021934540.png" width = 50%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021935378.png" width = 50%/> </div>

??? Example "Size of tags versus set associativity"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021943052.png" width = 50%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306021945118.png" width = 50%/> </div>

#### Decreasing miss penalty with multilevel caches

Add a second level cache:

* often primary cache is on the same chip as the processor
* use SRAMs to add another cache above primary memory (DRAM)
* miss penalty goes down if data is in 2nd level cache

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306022009397.png" width = 50%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306022012192.png" width = 50%/> </div>

Using multilevel caches:

* try and optimize the hit time on the 1st level cache
* try and optimize the miss rate on the 2nd level cache

## Virtual Memory

Main Memory act as a “Cache” for the secondary storage.

* Efficient and safe sharing of memory among multiple programs.  
不同程序有自己的内存空间，我们希望只考虑自己的空间，不在乎其他程序放在哪里。让进程认为是自己独有这块地址空间。
* Remove the programming burdens of a small, limited amount of main memory.  

Translation of a program’s address space to physical address.  
虚拟内存的作用就是翻译。（内存是碎片化的，我们需要让程序认为地址是连续的）

Advantages:

* illusion of having more physical memory
* program relocation 
* protection

<div align=center> <img src="http://cdn.hobbitqia.cc/202306022027075.png" width = 50%/> </div>

### Pages: virtual memory blocks

page 是映射的最小单位。  

虚拟页的数量比物理页多（现在不一定）。

**Page faults**: the data is not in memory, retrieve it from disk

* huge miss penalty, thus pages should be fairly large ***e.g.*** 4KB
* reducing page faults is important  
要减少 miss
* can handle the faults in software instead of hardware  
缺页是由操作系统处理的，而不是硬件(cache 是硬件做的)
* using *write-through* is too expensive so we use ****write back****

<div align=center> <img src="http://cdn.hobbitqia.cc/202306022106720.png" width = 50%/> </div>

### Page Tables

pgtbl 本身存在 memory 里。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306022107379.png" width = 60%/> </div>

每个进程都有自己的 **Page table**, **Program counter** and the **page table register**.  
进程之间切换，切换页表就可以了。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306022119500.png" width = 50%/> </div>

??? Example "How larger page table?"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202306022121353.png" width = 50%/> </div>

    页表要能把所有的页都能放下。  
    我们需要减小页表的大小。

disk write 很慢，因此我们用 write-back 的策略，需要有一个 dirty bit.  
The dirty bit is set when a page is first written. If the dirty bit of a page is set, the page must be written back to disk before being replaced.

### Making Address Translation Fast--TLB

在 pgtbl 上找是很慢的，因此我们引入了 TLB.  
The **TLB (Translation-lookaside Buffer)** acts as Cache on the page table
<div align=center> <img src="http://cdn.hobbitqia.cc/202306022128528.png" width = 60%/> </div>

### Page faults

When the OS creates a process, it usually creates the space on disk for all the pages of a process.  

* When a page fault occurs, the OS will be given control through exception mechanism.
* The OS will find the page in the disk by the page table.
* Next, the OS will bring the requested page into main memory. If all the pages in main memory are in use, the OS will use LRU strategy to choose a page to replace

