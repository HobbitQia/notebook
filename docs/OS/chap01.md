---
counter: True  
---

# OS Structures

??? Abstract
    * Operating System Services
    * User and Operating System-Interface
    * System Calls
    * System Services
    * Linkers and Loaders
    * Why Applications are Operating System Specific
    * Operating-System Design and Implementation
    * Operating System Structure
    * Building and Booting an Operating System
    * Operating System Debugging

## Operating System Services

A View of Operating System Services
<div align = center><img src="https://cdn.hobbitqia.cc/20231010102048.png" width=70%></div>

红色部分是 helpful to user, 蓝色部分是 better efficiency/operation. 

User Operating System Interface

* CLI  
Comand Line Interface
    * shells
* GUI  
User-friendly desktop metaphor interface

## System Calls

Programming interface to the services provided by the OS
用户空间进入内核的接口 interface.  

一般用高级语言编写，称为 API(Application Programming Interface) ***e.g.*** Win32 API, POSIX API(for Unix, Linux, Mac OSX), Java API(for JVM)

### Example of System Call - `write` 

<div align = center><img src="https://cdn.hobbitqia.cc/20231010102617.png" width=70%></div>

`unist`: Unix Standard
`printf` 是 `write` (system call) 的一个 wrapper。这里我们可以通过 `man 2 write` 查看系统调用的用法（2 表示查询系统调用）
``` C
ssize_t write(int fd, const void *buf, size_t count);
```

* `fd=1` 表示标准输出。
* `buf` 是要输出的内容，指向 `hello world\n` 这个字符串首地址。
* `count=13` 是要输出的字节数（包含了 `\n`）

可以看到，`write` 的系统调用号为 1。  
<div align = center><img src="https://cdn.hobbitqia.cc/20231010103120.png" width=45%></div>

`objdump -d` 翻译成汇编可以看到，`main` 里会调用 `__libc_write`。
<div align = center><img src="https://cdn.hobbitqia.cc/20231010103209.png" width=45%></div>

在 `__libc_write` 里会将 1（系统调用号）挪到寄存器 `%eax` 里随后调用了 `syscall` 指令，跳到 kernel space，并且切换 mode。  
<div align = center><img src="https://cdn.hobbitqia.cc/20231010103308.png" width=45%></div>

在 kernel 空间，

* 调用 `kernel_entry` 来保护寄存器。
* 从 syscall_table 里拿到函数指针，跳到 `write` 的处理程序。
    * syscall_table 是一个 array，系统调用号作为 index，通过 index 取对应系统调用的函数指针。
* 写完后调用 `ret_to_user`。
    * 恢复寄存器
    * 返回到 user。

The caller need know nothing about how the system call is implemented.  
用户不需要知道系统调用具体实现，OS 已经实现好了。

!!! Info "The Hidden Syscall Table"
    ARM64 架构的 `sys.c`: 
    <div align = center><img src="https://cdn.hobbitqia.cc/20231010104350.png" width=65%></div>

    这里我们需要通过 C 预处理得到宏展开的文件：
    <div align = center><img src="https://cdn.hobbitqia.cc/20231010104526.png" width=65%></div>

    `make` `.i` 文件可以得到预处理后的文件。

??? Info "`write`"
    其实 `write` 也是一个 wrapper，背后故事可见：

    * http://osteras.info/personal/2013/10/11/hello-world-analysis.html
    * https://code.woboq.org/userspace/glibc/sysdeps/unix/sysv/linux/notcancel.h.html#__write_nocancel
    * https://code.woboq.org/userspace/glibc/sysdeps/unix/sysv/linux/write_nocancel.c.html#__write_nocancel

### System Calls 

!!! Info "`strace`"
    On Linux there is a “command” called **`strace`** that gives details about which system calls were placed by a program during execution.  
    `strace`: system call trace. ***e.g.*** `strace cp main.c main` 可以看到我们调用 `cp main.c main` 时，调用了哪些系统调用。  
    可以用 `strace` 知道我们的程序调用了什么系统调用之后出问题。

!!! Info "`time`"
    `time` 可以输出 real, user, sys 的时间。（real 表示时钟的时间）  
    有时 user 和 sys 是多进程同时进行，所以加起来的时间比时钟的时间长。

#### System Call Parameter Passing

传参，如果参数小，直接放在寄存器里；否则可以把地址放在寄存器里，通过地址访问。
<div align = center><img src="https://cdn.hobbitqia.cc/20231010105527.png" width=60%></div>

#### Types of System Calls

* Process control  
create process, terminate process; end, abort; 
* File management
* Device management
* Information maintenance
* Communications
* Protection

## Linkers and Loaders

<div align = center><img src="https://cdn.hobbitqia.cc/20231010110107.png" width=60%></div>

从 `.c` 文件到 `.o` 文件经过了下面的流程：

* 预处理 `cpp main.c -o main.i`
* 编译 `gcc -S main.i -o main.s`
* 汇编 `as main.s -i main.o` 

怎么生成 main？如何把 main 加载到内存里执行？

**Linker** combines these into single binary *executable file*.  
**Loader** loads *executable file* into memory and starts execution.

### ELF binary basics

<div align = center><img src="https://cdn.hobbitqia.cc/20231010110406.png" width=50%></div>

* Executable and Linkable Format - **ELF**
* Section header & Program header  
一个给 Linker 用，一个给 Loader 用。
* `.text`: code
* `.rodata`: initialized read-only data
* `.data`: initialized data
* `.bss`: uninitialized data

!!! Example "`readelf`"
    static variables 在 `.data` 段，static const 在 `.rodata` 段，const 在 `.data` 段。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231010122606.png" width=48%></div>

    存有每个段的起始地址，大小，权限等信息。

### Linking

Linking 分为 static 和 dynamic 

* **Static linking**: All needed code is packed in single binary, leading to large binary  
    * 把所有的代码都放到一个二进制文件，大。  
    * 没有 `.interp` 段
* **Dynamic linking**: Reuse libraries to reduce ELF file size  
    * 代码分散在多个文件，运行时再加载，小。  
    * 有 `.interp` 段，存的是 loader。

### Running a binary  

运行时的内存布局：
<div align = center><img src="https://cdn.hobbitqia.cc/20231011192630.png" width=70%></div>

ELF section 被映射到内存里面的不同 segment。
注意区分堆和栈，分配数据时 stack 快，heap 慢。

* who setup ELF files mapping?
    * Kernel
    * exec syscall
* who setup stack and heap?
    * Kernel
    * exec syscall
* who setups libraries?
    * Loader
    * ld-xxx

<div align = center><img src="https://cdn.hobbitqia.cc/20231011193053.png" width=70%></div>

* text: r-xp 
* r--p: rodatas
* rw-p: data
* .bss: uninitialized variables. 给一个全局变量不给值，早期编译器记录它在 `.bss` 段里，但没有实际空间，映射到内存时就初始化为 0。
* heap/stack 匿名映射，没有一个文件支持。映射为可读可写。

#### Running a binary (Statically-linked)

首先我们通过 `strace` 查看运行静态链接文件过程中发生的系统调用。
<div align = center><img src="https://cdn.hobbitqia.cc/20231011193535.png" width=65%></div>

* `execve` 执行对应路径的文件
* `brk` 扩充栈
* `write` 执行程序里的 `printf` 功能

系统如何知道我们要执行的程序从哪一行开始执行？
<div align = center><img src="https://cdn.hobbitqia.cc/20231011193809.png" width=65%></div>

通过 entry point address!  
`sys_execve()` 里有 `load_elf_binary` 函数，从 ELF 头读地址到 `elf_entry`，把地址当作 `regs->pc`。然后调用 `start_thread` 函数。

ELF 里有 entry point address（通过 `readelf -h`）
<div align = center><img src="https://cdn.hobbitqia.cc/20231011194022.png" width=65%></div>

entry point address 不是 `main()` 的地址，而是 `_start` 的地址，里面会调用 `__libc_start_main` 函数，里面才调用 `main()` 函数。  
`_start` 是在读取命令行参数并且传给 `main`。
<div align = center><img src="https://cdn.hobbitqia.cc/20231011194100.png" width=65%></div>

`cat /proc/pid/maps` 里可以看到进程的内存映射。static 的条目更少，因为需要的东西已经打包到 `a.static` 内了，不需要外部的库。而 dynamic 需要外部的库。

!!! Summary
    ![](https://cdn.hobbitqia.cc/20231011194702.png)

#### Running a binary (Dynamically-linked)

相比于静态链接，动态链接：

* 需要一个 loader。
* 动态链接的内存布局中条目更多。
* 动态链接的系统调用比静态的多。
* 动态链接的 entry point 的地址很小，也是对应 `_start` 的地址，里面有些 symbol 还没有被解析。

类似地，我们先通过 `strace` 查看运行动态链接文件中使用了哪些系统调用。  
可以看到相比于静态链接，多出来的系统都用都和 ld 有关，即 dynamic loader。  
<div align = center><img src="https://cdn.hobbitqia.cc/20231011200524.png" width=60%></div>

动态链接有 `.interp` 段，在 `load_elf_binary` 函数中会走另一个分支：entry point 会指向 loader 的地址。
<div align = center><img src="https://cdn.hobbitqia.cc/20231011200358.png" width=60%></div>

!!! Summary
    ![](https://cdn.hobbitqia.cc/20231010145430.png)

    多出来的系统调用是为了先把 loader 加载进来，loader 再把 libc 加载。  
    内存布局里多映射的条目也是为了给 loader 使用。


## Why Applications are Operating System Specific  

* 开发的软件不能直接跨平台调用，因为操作系统不同导致系统调用不同，下面的硬件也不同。  
    * 像 Java 开发的软件可以，因为有 JVM 提供了跨系统的平台。
* **Application Binary Interface** (ABI) is architecture equivalent of API, defines how different components of binary code can interface for a given operating system on a given architecture, CPU, etc...
Application Binary Interface (ABI) 更贴近硬件架构

## Operating-System Design and Implementation

策略 VS 机制：

* **Policy**: What will be done?  
* **Mechanism**: How to do it?

<u>The separation of policy from mechanism.</u>  
把策略和机制分开。

??? Example "The Door Example"
    我们的一个策略：只允许上 OS 的同学进入曹西-201。对应的实现（机制）可以是：我们做一把锁，给 88 个同学都配一把。但这样的策略存在很多被 break 的可能。另一个机制：每个人凭学生卡/人脸识别进入。

### Implementation

宏内核里放有很多 driver，而 driver 出问题，直接影响到 CPU 的 scheduler.    

**microkernel**: Moves as much from the kernel into user space.   
把 driver, file system... 都放到 user space，只留下最核心的东西在 kernel space.  

* benefits: 
    * Easier to extend a microkernel
    * Easier to port the operating system to new architectures
    * More reliable (less code is running in kernel mode)
    * More secure
* detriments: 
    * Performance overhead of user space to kernel space communication  
    
<div align = center><img src="https://cdn.hobbitqia.cc/20231010153159.png" width=60%></div>

Many modern operating systems implement **loadable kernel modules** (LKMs).  

!!! Note "Operating-System Debugging" 
    Kernighan’s Law: “Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.”