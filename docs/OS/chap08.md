---
counter: True  
---

# Main Memory

Program must be brought (from disk) into memory and placed within a process for it to be run.

*Main memory* and *registers* are only storage that CPU can access directly.

* Register access is done in one CPU clock (or less)
* Main memory can take many cycles, causing a *stall*

Protection of memory is required to ensure correct operation.

## Partition evolution

最开始我们把一个程序加载到物理内存里，只能执行一个 job（如果 job 比物理内存还大就要分治），后来我们有多个进程要同时进行，就使用 partition 分区的方法，不同的分区执行不同的进程。

Partition requirements

* **Protection** – keep processes from smashing each other
* **Fast execution** – memory accesses can’t be slowed by protection mechanisms
* **Fast context switch** – can’t take forever to setup mapping of addresses

### Simplest Implementation - Partition

Logical address 逻辑地址，由我们自己定义的地址形式。CPU 上使用的地址都是逻辑地址，内存管理看到的是物理地址。CPU 中要将逻辑地址转为物理地址。

Base and Limit registers

* **Base** added to all addresses
* **Limit** checked on all memory references

    每次访问时检查是否超过了 Limit，如果是就说明越界了。

* Loaded by OS at each context switch

    每个进程有自己的 base 和 limit 寄存器，每次进程切换时，OS 都会将 base 和 limit 寄存器的值更新为当前进程的值。（线程不需要，因为线程是共享的地址空间）

??? Example 
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116210139.png" width=60%></div>

Hardware Address Protection
CPU must check every memory access generated in user mode to be sure it is between base and limit for that user.
<div align = center><img src="https://cdn.hobbitqia.cc/20231116210520.png" width=60%></div>

CPU 首先发出逻辑地址（即偏移量）随后判断是否超过 limit 范围，随后再加上重定位寄存器（即 base）就得到了真正的物理地址。

Advantages

* Built-in protection provided by Limit
    * No physical protection per page or block
* Fast execution
    * Addition and limit check at hardware speeds within each instruction
* Fast context switch
    * Need only change base and limit registers
* No relocation of program addresses at load time
    * All addresses relative to zero
* Partition can be suspended and moved at any time
    * Process is unaware of change

        修改 base 即可移动进程，进程是意识不到的。

    * Expensive for large processes

        移动进程需要改 base，还要把旧的内容全部改到新的位置，耗时。

## Memory Allocation Strategies

* Fixed partitions
* Variable partitions

取决于长度是否会变化。

### Fixed partitions

* Fixed Partitions – divide memory into equal sized pieces (except for OS)
    * Degree of multiprogramming = number of partitions
    * Simple policy to implement
        * All processes must fit into partition space.

            每个 piece 都可以放一个进程。

        * Find any free partition and load process.

size 要切多大？如果切的太小，可能有大进程无法加载进来；如果切的太大，会有内部碎片（因为在一个 partition 内部）。

!!! Example "Internal Fragmentation"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116212120.png" width=60%></div>

Memory allocated may be larger than the requested size

* This size difference is memory internal to a partition, but not being used.
* Sophisticated algorithms are designed to avoid fragmentation.

### Variable partitions

长度不一致，按需划分。即要给一个进程分配空间时，我们找到比他大的最小的 partition，然后把他放进去。

* Memory is dynamically divided into partitions based on process needs
    * More complex management problem
        * Need data structures to track free and used memory
        * New process allocated memory from hole large enough to fit it
* Problem – **External Fragmentation**
    * Unused memory between partitions too small to be used by any processes

        在 partition 之外的空闲空间太小，无法被任何进程使用。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116212848.png" width=60%></div>

How to satisfy a request of size n from a list of free memory blocks?

* first-fit: allocate from the first block that is big enough
* best-fit: allocate from the smallest block that is big enough
* worst-fit: allocate from the largest hole

Variable partitions 可以避免内部碎片，但无论如何总是有外部碎片。

#### External fragmentation

* total amount of free memory space is larger than a request.
* the request cannot be fulfilled because the free memory is not contiguous.

External fragmentation can be reduced by **compaction**.

* shuffle memory contents to place all free memory in one large block.
* program needs to be *relocatable* at runtime.
* performance overhead, timing to do this operation.

!!! Example "External Fragmentation"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116213226.png" width=60%></div>
    
## Segmentation

利用 partition 的概念实现了 Segmentation 的机制。

认为 text、data、stack 是多个区域，每个区域就可以用一个 partition 来代表它。

* **Logical address** consists of a pair:
    * `<segment-number, offset>`

        segment-number 表示属于第几组。

    * Offset is the address offset within the segment.
* Segment table where each entry has:
    * **Base**: starting physical address
    * **Limit**: length of segment

根据 number 在 table 里找到对应的 base 和 limit，然后加上 offset 就得到了真正的物理地址。
<div align = center><img src="https://cdn.hobbitqia.cc/20231116214418.png" width=60%></div>

已经有逻辑地址的概念（即地址如何解释是由我们自己定义的），但是没有解决外部碎片的问题。

## Address Binding

在程序的不同阶段，地址有不同的表现方式：

* **source code** addresses are usually **symbolic**. (***e.g.***, variable name)
* **compiler** binds symbols to **relocatable addresses**. (***e.g.***, “14 bytes from beginning of this module”)
* **linker** (or loader) binds relocatable addresses to **absolute addresses**.

详细可见 CSAPP Chapter 7.

Address binding of instructions and data to memory addresses can happen at three different stages.

* **Compile time**: If memory location known a priori, absolute code can be generated; must recompile code if starting location changes.
* **Load time**: Must generate relocatable code if memory location is not known at compile time.
* **Execution time**: Binding delayed until run time if the process can be moved during its execution from one memory segment to another.

<div align = center><img src="https://cdn.hobbitqia.cc/20231116215124.png" width=60%></div>

### Logical vs. Physical Address

* **Logical address** – generated by the CPU; also referred to as **virtual address**.

    CPU 看不到物理地址，只用逻辑地址，需要经过特定的部件转化为物理地址。

* **Physical address** – address seen by the memory unit.

    内存单元只能理解物理地址，它是无法改变的。

逻辑地址对应逻辑地址空间（Logical Address Space），物理地址对应物理地址空间（Physical Address Space）。

## Memory-Management Unit

Hardware device that at run time maps logical to physical address.

<div align = center><img src="https://cdn.hobbitqia.cc/20231116215910.png" width=60%></div>

相当于在 CPU 和内存之间做了地址的翻译。

!!! Example "MMU" 
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116220019.png" width=60%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116220034.png" width=60%></div>

## Paging

Contiguous -> Noncontiguous

Physical address space of a process can be **noncontiguous**; process is allocated physical memory whenever the latter is available.  
Fixed 和 Variable 划分都是物理连续的分配，Paging 是把所有内存都变成不连续的，这样空闲的内存不管在哪，都可以分配给进程，避免了外部碎片。

Basic methods

* Divide **physical** address into fixed-sized blocks called **frames**（帧）
    * Size is power of 2, usually 4KB.
* Divide **logical** address into blocks of same size called **pages**（页）
* Keep track of all free frames.
* To run a program of size N pages, need to find N free frames and load program.

    把 N 个帧映射到 N 个页。（页和帧是一样大的）

* Set up a mapping to translate logical to physical addresses.
    * This mapping is called **page table**.

        存储帧到页的映射，这个数据结构叫页表。

Paging has no **external** fragmentation, but **internal** fragmentation.  

* worst case internal fragmentation: 1 frame – 1 byte

    前面的页都被填满了，只有最后的页才会有碎片。

* average internal fragmentation: 1 / 2 frame size

页如果小，碎片少，但是映射更多，页表需要更大的空间；反之页如果大，碎片多但映射更少，页表较小。现在页逐渐变大（因为内存变得 cheap）。

### Page Table

* Page table: Stores the logical page to physical frame mapping
* Frame table

    一个 Bitmap，标记哪些 frame 是空闲的。

页表不存页号（页号用作索引），只存物理帧号。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231116215910.png" width=60%></div>
    https://cdn.hobbitqia.cc/20231117152200.png

### Address Translation

A logical address is divided into:

* **page number (p)** 
    * used as an index into a page table
    * page table entry contains the corresponding physical frame number
* **page offset (d)**
    * offset within the page/frame
    * combined with frame number to get the physical address

<div align = center><img src="https://cdn.hobbitqia.cc/20231117152534.png" width=50%></div>

首先把 p 拿出来，到页表里读出读出物理帧号，随后和 d 拼接起来就得到了物理地址。
<div align = center><img src="https://cdn.hobbitqia.cc/20231117152643.png" width=60%></div>

### Paging Hardware

早期想法：每个页用一组寄存器实现，优势是非常快，但是缺点是寄存器数量有限，无法存储多的页表。（如 32 bit 地址，20 位作为物理页号，会有 $2^{20}$ 个页）

One big page table maps logical address to physical address

* the page table should be *kept in main memory*
* **page-table base register (PTBR)** points to the page table
    
    PTBR 指向页表的起始地址。（RISC-V 上叫 SATP，ARM 上叫 TTBR，x86 上叫 CR3）

* **page-table length register (PTLR)** indicates the size of the page table

这样每次数据/指令访问需要两次内存访问，第一次把页表读出来，第二次再根据页表去读数据。

#### TLB

How to reduce memory accesses caused by page table?

* CPU can cache the translation to avoid one memory access (**TLB**)

**TLB (translation look-aside buffer)** caches the address translation.

* TLB hit: if page number is in the TLB, no need to access the page table.
* TLB miss: if page number is not in the TLB, need to replace one TLB entry.
* TLB usually use a fast-lookup hardware cache called *associative memory*.

    Associative memory: memory that supports parallel search. If page# is in associative memory’s key, return frame# (value) directly.

    与页表不同的是，TLB 里存储的既有 page number 又有 frame number，通过比较 page number 来找到对应的 frame number（相当于全相联的 cache）。

* TLB is usually small, 64 to 1024 entries.

    TLB 数量有限，为了覆盖更大的区域，我们也想要把页变得更大。

每个进程有自己的页表，所以我们 context switch 时也要切换页表，要把 TLB 清空。

TLB must be consistent with page table

* Option I: Flush TLB at every context switch, or, 
* Option II: Tag TLB entries with address-space identifier (ASID) that uniquely identifies a process.

    通用的全局 entries 不刷掉，把进程独有的 entries 刷掉。

在 MIPS 上 TLB miss 是由 OS 处理的，但是在 RISC-V 上是由硬件处理的。
<div align = center><img src="https://cdn.hobbitqia.cc/20231117161511.png" width=60%></div>

!!! Info "EAT (Effective Access Time)"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231117161750.png" width=80%></div>
    
### Memory Protection

到目前为止，页表里放了物理帧号。我们可以以页为粒度放上保护的一些权限（如可读、写、执行），这样就可以实现内存保护。

* Each page table entry has a present (aka. valid) bit 
    * present: the page has a valid physical frame, thus can be accessed.
* Each page table entry contains some protection bits.
    * Any violations of memory protection result in a trap to the kernel.
* XN: protecting code
    * Segregate areas of memory for use by either storage of processor instructions (code) or for storage of data.
    
        代码无论在 user 还是 kernel 状态下都不能执行。

        ***e.g.*** Intel: XD(execute disable), AMD: EVP (enhanced virus protection), ARM: XN (execute never)

* PXN: Privileged Execute Never
    * A Permission fault is generated if the processor is executing at EL1(kernel) and attempts to execute an instruction fetched from the corresponding memory region when this PXN bit is 1 (usually user space memory)

        在特权模式下不能执行。

<div align = center><img src="https://cdn.hobbitqia.cc/20231117162507.png" width=60%></div>

### Page Sharing

Paging allows to share memory between processes

* shared memory can be used for *inter-process communication*
* shared libraries

把 ELF 里不变的部分通过页表映射到不同的进程里。  
分页可以允许进程间共享代码，例如同一程序的多个进程可以使用同一份代码，只要这份代码是 **reentrant code**（or non-self-modifying code:never changes between execution）。

!!! Example
    图中所述的是多个进程共享一份库代码（ed）的情况。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231117162641.png" width=60%></div>
    
## Structure of Page Table

Page table must be **physically contiguous**.

如果只有一级的页表，那么页表所占用的内存很大。***e.g.*** 32-bit logical address space and 4KB page size. page table would have 1 million entries ($2^{32}$ / $2^{12}$). If each entry is 4 bytes -> 4 MB of memory for page table alone.

我们需要有方法压缩页表。

* Break up the logical address space into multiple-level of page tables. ***e.g.*** two-level page table  
* First-level page table contains the frame# for second-level page tables.

### Two-Level Paging

<div align = center><img src="https://cdn.hobbitqia.cc/20231117164128.png" width=60%></div>

最坏情况下，如果只访问第一个页和最后一页，那么只用一级页表需要 1K 个页用来放页表（这个页表有 $2^{20}$ 个条目），但是对于二级页表就只需要 3 个页表（1 个一级和 2 个二级页表），即 3 个页来放页表。

A logical address is divided into:

* a **page directory number** (first level page table)
* a **page table number** (2nd level page table)
* a **page offset**

<div align = center><img src="https://cdn.hobbitqia.cc/20231117165006.png" width=60%></div>

!!! Example "Page Table in Linux"  
    <div align = center><img src="https://cdn.hobbitqia.cc/20231117165032.png" width=70%></div>
    
#### 64-bit Logical Address Space

64 bit 下，每个页表 entry 变为 8B，因此一个页可以放 $2^9=512$ entries。

* 64-bit logical address space requires more levels of paging
* usually not support full 64-bit virtual address space.
    * AMD-64 supports 48-bit
    * ARM64 supports 39-bit, 48-bit
    
!!! Example "ARM64"
    ARM64: 39 bits = 9+9+9+12
    <div align = center><img src="https://cdn.hobbitqia.cc/20231117165703.png" width=60%></div>
    
页表里存的都是物理地址（物理页号）

页表为什么可以省内存，如果次级页表对应的页都没有被使用，就不需要分配这个页表。

??? Example "Page Table Quiz"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231117171922.png" width=60%></div>

如果页面大小变大（如 64KB），页面 offset 位数变多，前面可用来索引页表的位数就变少了，页表的层级就可能变少。

### Hashed Page Tables

In hashed page table, virtual page# is hashed into a frame#.

* Each element contains: **page#**, **frame#**, and **a pointer to the next element** (resolving conflict)

    哈希页表的每一个条目除了 page number 和 frame number 以外，还有一个指向有同一哈希值的下一个页表项的指针。这个结构与一般的哈希表是一致的。

<div align = center><img src="https://cdn.hobbitqia.cc/20231117184605.png" width=60%></div>

### Inverted Page Tables

Inverted page tables 索引 physical address 而不是 logical address，也就是说，整个系统只有一个页表，并且每个物理内存的 frame 只有一条相应的条目。寻址时，CPU 遍历页表，找到对应的 pid 和 page number，其在页表中所处的位置即为 frame number。

<div align = center><img src="https://cdn.hobbitqia.cc/20231117171922.png" width=60%></div>

每次要遍历整个页表，效率低下。而且这样不能共享内存（因为一个物理帧只能映射到一个页）。

## Swapping

* **Swapping** extends physical memory with backing disks.
    * A process can be swapped temporarily out of memory to a backing store.
    * The process will be brought back into memory for continued execution.
* Swapping is usually only initiated under memory pressure.
* Context switch time can become very high due to swapping.

用 disk 备份内存（因为内存可能不够用），就把 frame 的值交换到 disk 上，然后把 frame 释放出来。当进程要执行的时候，再把 frame 从 disk 读回来。换回来时不需要相同的物理地址，但是逻辑地址要是一样的。

<div align = center><img src="https://cdn.hobbitqia.cc/20231117185731.png" width=60%></div>

Swapping with Paging
<div align = center><img src="https://cdn.hobbitqia.cc/20231117185816.png" width=60%></div>

## Takeaway

!!! Summary "Takeaway"
    * * Partition evolution
    * Contiguous allocation
        * Fixed, variable
            * first, best, worst fit
            * fragmentation: internal/ external
        * Segmentation
            * Logical address vs physical address
    * Fragmentation
        * Internal， external
    * MMU: address translation + protection
    * Paging
        * Page table
            * Hierarchical, hashed page table, inverted
            * Two-level, three-level, four-level
            * For 32 bits and 64 bits architectures
