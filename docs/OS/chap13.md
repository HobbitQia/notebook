---
counter: True  
---

# File System Implementation

## Layered File System

<div align = center><img src="https://cdn.hobbitqia.cc/20231219154218.png" width=45%></div>

* Logical file system
    * Keep all the **meta-data** necessary for the file system
    * It stores the **directory** structure
    * It stores a data structure that stores the file description (**File Control Block - FCB**)
    * Input from above:
        * Open/Read/Write filepath
    * Output to below:
        * Read/Write logical blocks

* File-organization module
    * Knows about logical file blocks (from 0 to N) and corresponding physical file blocks: it performs translation

        把逻辑块映射到物理块。输入是逻辑块号，输出是物理块号。

    * It also manages free space

* Basic file system
    * Allocates/maintains various buffers that contain file-system, directory, and data blocks.

        提供 buffer，用于缓存文件系统、目录和数据块。在 Linux 中称为 IO buffer。

* I/O Control

    Device drivers and interrupt handlers.

    I/O control 将上层的指令转换为 low-level, hardware-specific 的指令来实现相关操作。同时也可以发中断。

分层是为了降低复杂度，通过接口来隔离不同层。但也降低了性能。

## File System Data Structures

on-disk 的是可持久化的（persisitant），in-memory 的是易失的（volatile）。

* **On-disk** structures
    * An optional **boot control block**
    * A **volume control block**
    * A **directory**
    * A **per-file File Control Block (FCB)**    

* **In-memory** structures
    * A **mount table** with one entry per mounted volume
    * A **directory cache** for fast path translation (performance)
    * A **global open-file table**
    * A **per-process open-file table**
    * Various **buffers** holding disk blocks “in transit” (performance)

### File Control Block

在 UNIX 中，FCB 被称为 inode；在 NTFS 中，每个 FCB 是一个叫 master file table 的结构的一行。

<div align = center><img src="https://cdn.hobbitqia.cc/20231224101734.png" width=70%></div>

!!! Example
    这里前面的是 metadata，后面存有数据块的指针。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224103250.png" width=70%></div>

### File Creation

逻辑文件系统为这个新的文件分配一个新的 FCB（与文件一对一映射），随后把它放到一个目录里，将对应的 directory 读到内存，并用 filename 和 FCB 更新 directory。

### File Open & Close

系统调用 `open()` 将文件名传给 logical file system，后者搜索 system-wide open-file table 以确定该文件是否正在被其他进程使用。

* 如果有，则直接在当前进程的 per-process open-file table 中新建一个 entry，指向 system-wide open-file table 中的对应项即可。
* 否则，需要在 directory 中找到这个 file name，并将其 FCB 从磁盘加载到内存中，并将其放在 system-wide open-file table 中。然后，在当前进程的 per-process open-file table 中新建一个 entry，指向 system-wide open-file table 中的对应项。

<div align = center><img src="https://cdn.hobbitqia.cc/20231224103820.png" width=70%></div>

（这里的 index 就是 file descriptor）

打开文件之后就拿到了一个 pointer，指向这个文件。

如果要关闭文件，per-process open-file table 中对应 entry 将被删除，system-wide open-file table 中的 counter 将被 -1；如果该 counter 清零，则更新的 metadata 将被写会磁盘上的 directory structure 中，system-wide open-file table 的对应 entry 将被删除。

在 Unix 里面（UFS）System-Wide Open-File Table 会放设备、网络，所以我们的设备也是用文件来表示的，读写文件相当于读写设备。 

## Virtual File Systems

操作系统可以同时支持多种类型的文件系统。

<div align = center><img src="https://cdn.hobbitqia.cc/20231224105213.png" width=70%></div>

VFS provides an **object-oriented way** of implementing file systems.

* OS defines a common interface for FS, all fses implement them.
* System call is implemented based on this common interface.

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224155238.png" width=70%></div>

VFS Implementation  
Write syscall -> `vfs_write` -> indirect call -> `ext4_file_write_iter`
<div align = center><img src="https://cdn.hobbitqia.cc/20231224155318.png" width=70%></div>

在需要调用某个函数时，去对应 FS 的函数表的约定位置找到函数指针就可以访问了。这和 C++ 中多态的虚函数表是类似的。

在我们创建这个文件的时候，`file->f_op` 就被设为了对应的函数表的地址（`f_op` 是指针）。

`struct file` 里存了文件的 `file_operations`，但没有存文件的 type，因为我们有知道操作对应 fs 的文件，就不需要知道文件的类型了。

## Directory Implementation

Directory is a special file, storing the mapping from file name to inode.

他的数据块有自己的名字（目录项 `dir_entry`），每一个目录项有一个 inode、目录项长度、名字长度。
<div align = center><img src="https://cdn.hobbitqia.cc/20231224161523.png" width=70%></div>

最简单的实现方式是 linear list，即维护 `dir_entry[]`。这种方案的缺点是查找文件很费时。

使用有序数据结构（有序表、平衡树、B+ 树等）能够优化这一问题。

使用 hash table 也可以解决这一问题。

创建一个文件：首先找到当前目录的 inode，在其指向的数据块里加上一个目录项。（在之前要先分配一个 inode 随后才能放入目录项）

## Disk Block Allocation

Files need to be allocated with disk blocks to store data.

这里介绍 3 种不同的 policy。

### Contiguous Allocation

Each file is in a set of contiguous blocks.

优点是顺序访问很快，同时目录也只需要维护文件的起始 block 及其长度；缺点是会带来碎片（磁盘通常够大，我们可能不在意这个问题），文件可能会增大，需要重新分配空间。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224163321.png" width=70%></div>

### Linked Allocation

Linked allocation: each file is a linked list of disk blocks.

允许块分布在磁盘上的任何地方，只需要维护每个块的下一个块的地址即可。这样就没有外部碎片了。缺点是定位某个块需要遍历链表，需要很多 IO。而且 reliablity 也不好，如果某个块的指针坏掉，后面的块就都访问不到了。而且这种实现方式不支持 random access。

解决方案之一是，将多个块组成 cluster。这种方案会增加内部碎片。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224163816.png" width=70%></div>

!!! Example "FAT"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224164120.png" width=70%></div>

### Indexed Allocation

Indexed allocation: each file has its own index blocks of pointers to its data blocks.

用一个块只做 index，里面存放指向数据块的指针。这样可以支持 random access。缺点是 reliability 不好，如果 index 块坏了，文件就访问不到了；浪费空间（需要一个块做 index）。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224164215.png" width=70%></div>

需要一个方法分配 index block 的大小（太大会浪费，太小那么指向的空间小）。我们可以把 index block 链接起来，或者用多级索引。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231224164718.png" width=70%></div>

    如果 block size 为 4KB，那么 Linux 中能创建的最大文件大小为 4TB+4GB+4MB+48KB。如果我们有一个 10KB 的文件，那么只需要前 3 个 direct pointer 就可以，后面的指针都是 NULL，不需要展开。

## Free-Space Management

* Bitmap

    每一个 block 都用一个比特记录分配状态。容易找到连续的空闲空间，但是占用额外空间。

    !!! Example
        <div align = center><img src="https://cdn.hobbitqia.cc/20231225162832.png" width=70%></div>

* Linked Free Space

    Keep free blocks in linked list.  

    好处是不会浪费空间，但是不能快速找到连续的空闲空间，效率低。

    !!! Example
        <div align = center><img src="https://cdn.hobbitqia.cc/20231225162908.png" width=70%></div>

* Grouping

    Use indexes to group free blocks. Store address of n-1 free blocks in the first free block, plus a pointer to the next index block.

    维护若干个 block 形成的链表，每个 block 保存若干空闲块的地址。

* Counting

    a link of clusters (starting block + # of contiguous blocks).

    维护的是连续的空闲块的链表，即链表的每个结点是连续的空闲块的首块指针和连续空虚块的数量。

## File System Performance

To improve file system performance

* Keeping data and metadata close together
* Use cache: separate section of main memory for frequently used blocks
* Use asynchronous writes, it can be buffered/cached, thus faster
* Free-behind and read-ahead

## Takeaway

!!! Summary "Takeaway"
    * File system layers
    * File system implementation
        * On-disk structure, in-memory structure
        * inode
    * File creation(), open()
    * VFS
    * Directory Implementation
    * Allocation Methods
        * Contiguous, linked, indexed
    * Free-Space Management