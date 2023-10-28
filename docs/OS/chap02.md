---
counter: True  
---

# Processes

??? Abstract
    * Process Concept
    * Process Control Block
    * Process State
        * Process Creation
        * Process Termination
        * Process and Signal
    * Process Scheduling

## Process Concept

**Process**: a unit of resource allocation and protection  

* A process is a program in execution  
一个在执行的程序（ELF 文件），跑起来后要分配资源（CPU，内存，IO），就成为了一个进程。
* Multiple processes can be associated to the same program.  
一个 program 可以运行多次，每次运行都产生一个新的进程。
* A running system consists of multiple processes.  
* “job” and “process” are used interchangeably in OS texts.  

Process includes（其中前四项在 ELF 中，堆和栈是运行时的信息在 ELF 之外）

* code (also called the text)  
initially stored on disk in an executable file
* data section  
global variables (`.bss` and `.data` in x86 assembly)
* program counter  
points to the next instruction to execute (i.e., an address in the code)
* content of the processor’s registers
* a stack
* a heap

!!! Example "Memory Layout of a C Program"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011231535.png" width=60%></div>

    * `int x;` unitialized data, 
    * `int y = 15;` initialized data
    * 临时变量在栈上，malloc 在堆上。

### The Stack

每个函数运行时都会分配栈的一部分，即一个栈帧 stack frame. 

??? Example "Simple Runtime Stack"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231010163732.png" width=30%></div>

引入栈是为了解决函数调用的问题。  

Any function needs to have some “state” so that it can run. 

* Parameters passed to it by whatever function called it
* Local variables
* The address of the instruction that should be executed once the function  
returns: the return address
* The value that it will return

栈从上（高地址）往下（低地址），堆从下往上。如果碰面就发生了溢出。

!!! Note "Runtime Stack Growth"
    如果我们运行一个程序两次，内存布局不一定相同。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011204707.png" width=65%></div>

    stack 和 heap 称为动态内存，相当于是 OS 给进程的两张草稿纸，用多少取决于当前的执行状态。

## Process Control Block (PCB)

Each process has and only has a **PCB**. Information associated with each process.  
控制块，每一个进程有且只有一个 PCB. 整个 PCB 存在内存里。  
<div align = center><img src="https://cdn.hobbitqia.cc/20231010164638.png" width=25%></div>

* Process state
* Program counter
* CPU registers
* CPU-scheduling information
* Memory-management information
* Accounting information
* I/O status information

Represented by the C structure `task_struct`. 
<div align = center><img src="https://cdn.hobbitqia.cc/20231011205333.png" width=65%></div>

所有的 `task_struct` 是通过链表串起来的。

## Process State

As a process executes, it changes state
<div align = center><img src="https://cdn.hobbitqia.cc/20231010164518.png" width=75%></div>

* **New**: The process is being created
* **Running**: Instructions are being executed
* **Waiting**: The process is waiting for some events to occur
* **Ready**: The process is waiting to be assigned to a processor
* **Terminated**: The process has finished execution

<!-- p17 必考 -->

### Process Creation

A process may create new processes, in which case it becomes a parent.

Each process has a **pid** (process ID).  

* **ppid** refers to the parent’s pid

    ??? Example "Process Tree"
        ![](https://cdn.hobbitqia.cc/20231010165405.png)

* The child may inherit/share some of the resources of its parent, or may have entirely new ones.  
子进程继承父进程的资源（如打开的文件）
* A parent can also pass input to a child.  
* Upon creation of a child, the parent can either
    * continue execution, or
    * wait for the child’s completion
* The child could be either
    * a clone of the parent (**i.e.**, have a copy of the address space), or 
    * be an entirely new program

#### The `fork()` System Call

`fork()` creates a new process.    
The child is is a copy of the parent, but

* It has a different pid (and thus ppid)
* Its resource utilization (so far) is set to 0
* `fork()` returns the child’s pid to the parent, and 0 to the child.  
`fork` 会把 child 的 pid 返回给 parent，给 child 返回 0. (how to implement?)  
* Both processes continue execution after the call to `fork()`

??? Example
    What does the following code print?
    ``` C
    int a = 12;
    if (pid = fork()) { // PARENT
        // ask the OS to put me in waiting
        sleep(10);
        fprintf(stdout,”a = %d\n”,a);
        while (1);
    } else { // CHILD
        a += 3;
        while (1);
    }
    ```
    The answer should be 12.  
    `fork` 之后变量的值相同，但并不是同一个变量。（相当于一份拷贝）
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011211326.png" width=55%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011211428.png" width=55%></div>

??? Example
    How many processes does this C program create?
    ``` C
    int main (int argc, char *arg[])
    {
        fork ();
        if (fork ()) {
            fork ();
        }
        fork (); 
    }
    ```
    The answer should be 12.

#### The `execve()` System Call

`execve()` system call used after a `fork()` to replace the process’ memory space with a new program.  
`execve()` 会把之前的进程资源全部丢掉，再 load 新的 binary，映射新的内存，分的新的堆和栈，常接在 `fork()` 后面使用。

!!! Note "the pros and cons of `fork()`"  
    * Pros
        * 简洁：不需要参数
        * 分工：`fork` 搭起骨架，`exec` 赋予灵魂
        * 联系：保持进程与进程之间的关系
    * Cons
        * 复杂：两个系统调用
        * 性能差
        * 安全问题
    * Clone syscal: fork + exec

### Process Terminations

A process terminates itself with the `exit()` system call.  
调用 exit 后终止进程，释放资源。
  
* This call takes as argument an integer that is called the process’s exit/return/error code.  
* All resources of a process are deallocated by the OS.  
`exit` 终止之后会把资源都释放。
* A process can cause the termination of another process.  
    * Using something called “signals” and the `kill()` system call
* A parent can wait for a child to complete.  
`wait()` and `waitpid()`

#### Processes and Signals

A process can receive signals. And each signal causes a default behavior in the process.  
***e.g.*** 当我们想要终止一个程序时，我们可以敲入 `Ctrl+C`，这相当于对当前进程发送了 `SIGINT` 信号，就会终止当前进程。

Manipulating Signals

* The `signal()` system call allows a process to specify what action to do on a signal  
我们可以修改有些信号的处理程序。
* Signals like `SIGKILL` and `SIGSTOP` cannot be ignored or handled by the user, for security reasons

#### Zombie

When a child process terminates

* Remains as a **zombie** in an “undead” state.  
* Until it is “reaped” (garbage collected) by the OS.  
一个进程结束了，但依然还在占用资源。（他可以释放自己的资源，除了 PCB 是不能由自己释放的）

Get rid of zombies: When a child exits, a `SIGCHLD` signal is sent to the parent.  
我们可以通过给 `SIGCHILD` 信号加一个 handler，里面调用 `wait` 来回收进程。

#### Orphans

An **orphan** process is one whose parent has died.  
子进程还在运行时，它的父进程终止了，那么它就成为了一个孤儿进程。

pid 1 会收养 orphan，因此孤儿进程不会成为 zombie。（pid 1 进程一定会回收子进程）

这里存在一个 trick，可以创建一个与当前进程的父进程完全无关的进程：先 `fork()` 一个进程，随后杀死自己，那么当前进程的子进程就会被 pid 1 收养，就脱离了原来的父进程。

### Process Scheduling

一个 CPU 只能运行一个进程，我们希望提高使用效率。进程处于 Waiting 状态的时候 CPU 如果跟着等待是对资源的浪费。

**Process scheduler** selects among ready processes for next execution on CPU core.  

Maintains scheduling queues of processes: 

* Ready queue - set of all processes residing in main memory, ready and waiting to execute.  
只有一个 ready queue, ready queue 不会空，因为 IDLE 进程一直在里面。
* Wait queue - set of processes waiting for an event.  
很多个等待队列，一个被等待的事件对应一个等待队列。当我们这个事件到来之时，我们从事件对应的队列选择一个进程。
* Processes migrate among the various queues.  

!!! Info "Ready and Wait Queue"
    当我们想要插入一个新的进程时，直接通过双向链表接上即可。通过偏移量找到对应地址，并通过强制类型转换得到 `task_struct`。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011215154.png" width=65%></div>
    
<div align = center><img src="https://cdn.hobbitqia.cc/20231010190355.png" width=65%></div>

首先从 ready queue 中拿一个进程去 CPU，

* 如果到时间了（过了一个时间片），就直接把自己放到 ready queue; 
* 如果要等待 I/O 事件，就把自己放进 wait queue，等待 I/O 事件发生后再把自己唤醒，放回 ready queue.
* 创建子进程之后子进程放到 ready queue 中，如果调用了 `wait`，那么父进程等待子进程终止后，进入 ready queue.

#### Context Switch

A **context switch** occurs when the CPU switches from one process to another.
<div align = center><img src="https://cdn.hobbitqia.cc/20231010190452.png" width=60%></div>

* When CPU switches to another process, the system must save the state of the old process and load the saved state for the new process via a context switch.  
上下文切换时，存储当前进程的状态，并加载目标进程的状态。
* Context of a process represented in the PCB  
state 主要指寄存器的值，页表...
* Context-switch time is overhead; the system does no useful work while switching. 
上下文切换不做有意义的事情，是 pure overhead. 

<div align = center><img src="https://cdn.hobbitqia.cc/20231011215736.png" width=70%></div>

* `cpu_context` 在 `task_struct` 中，且有一个偏移量。因此这里我们先 load 这个偏移量到寄存器 `x10`。
* `x8` 指向要被换出去的进程的 `task_struct`, 随后我们将要存的寄存器存入 `task_struct` 中。
* 随后 `x8` 指向要被换进来的进程的 `task_struct`, 随后我们将要取的寄存器从 `task_struct` 中取出。

!!! Question "为什么 switch 中只保存部分寄存器？"
    我们上下文切换时会调用 `cpu_switch_to` 函数。其他寄存器在 arm 架构中属于 caller-saved registers，因此不用在 `cpu_switch_to` 中保存，`cpu_switch_to` 中存的是 callee-saved registers. 

一个进程在内核中运行时重要的 data structures: 
<div align = center><img src="https://cdn.hobbitqia.cc/20231011221353.png" width=70%></div>

* 内核栈低地址处有 `thread_info`, 指向 `task_struct`, 内有 `cpu_context`.

    注意到 `task_struct` 并不在栈上，只是有指针指向他。（因为 `task_struct` 太大了，因此放了个指针。后来大家认为栈位置暴露后就能找到 `task_struct` 的地址，因此后来指针也没了）

* 内核栈高地址处有 `pt_regs`, 保存了寄存器的值。（不是 `cpu_context` 中的寄存器）  
从用户空间到内核空间时，也会有一次上下文切换，这时候会保存用户空间的所有寄存器，然后加载内核空间的寄存器。
* stack frame

    执行函数调用的时候，会有一个栈帧，先存储返回地址。所以栈一旦切换，程序对应的返回地址也被切换了。

**Context switching between two kernel threads.**  
context 一定在 kernel mode 执行。为了安全，上下文切换涉及到寄存器的修改。

!!! Note "Context Switch Scenarios - kernel"
    When and where are the context (regs) been saved?  

    * When: In `context_switch`, more specifically, in cpu_switch_to
    * Where: In PCB, more specifically, in cpu_context
    * All regs are running kernel code, termed kernel context
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011222054.png" width=70%></div>

!!! Note "Context Switch Scenarios - user"
    * When and where are the user context (regs) been saved?
        * When: `kernel_entry`（进入内核时存寄存器），`kernel_exit`（离开内核时取出寄存器）; Where: per-thread kernel stack, more specifically `pt_regs`
    * When and where are the kernel context (regs) saved saved?
        * When: `cpu_switch_to`; Where: `cpu_context`
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011222153.png" width=70%></div>

!!! Info "`fork()` return values"  
    How does `fork()` return two values?
    
    * 调用 `fork` 后会调用 `do_fork` 函数，随后调用 `copy_process` 最后进入 `copy_thread` 函数。它会把 `task_struct` 里的 `thread` 进行拷贝。
    * 对于父进程，`fork` 相当于是一个系统调用。通过 `kernel_entry` 进入内核态，将用户态上下文存在 `pt_regs` 中。返回值（pid）通过 `pt_regs` 的寄存器值返回。  
    （系统调用的返回值在 `x0` 中，我们把这个值存到 `pt_regs` 中，这样后面从内核切换到用户态时就可以加载返回值到 `x0`）
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011224012.png" width=70%></div>

    * 对于子进程，会调用 `copy_thread` 函数。他会拷贝寄存器，并把 `regs[0]=0`。这样在后续 `kernel_exit` 后就可以把值返回到子进程。  
    注意到此时子进程的 `pc`（ARM 里的 `pc` 类似于 RISC-V 里的 `ra`，存储返回地址）被设置为了 `ret_from_fork`（调用 `ret_to_user`，再调用 `kernel_exit`），`sp` 被设置为了 `pt_regs`.  
    <div align = center><img src="https://cdn.hobbitqia.cc/20231011224646.png" width=70%></div>
    
    * 注意到当 `fork` 之后，我们从父进程返回，此时子进程处于 READY 状态，等待 CPU 的调度。第一次调度时子进程在切换上下文之后会从 `ret_from_fork` 开始执行，随后调用 `ret_to_user`，再调用 `kernel_exit`（把存在 `pt_regs` 里的寄存器全部恢复），从而返回 0。

!!! Question "调用 `write` 的系统调用会不会有上下文切换"
    不会，只是从 user space 通过 `kernel_entry` 进入 kernel space，执行对应的 handler，执行完后通过 `kernel_exit` 返回 user space。

## Takeaway

!!! Summary "Takeaway"
    * Process Concept
        * Process vs Program
    * Process Control Block
        * `task_struct`
    * Process State
        * Five states, who has a queue
        * How to create and terminate a process 
    * Process Scheduling
        * `cpu_switch_to`
            * Where are registers saved?
        * `fork`
            * Why returns two values?