---
counter: True  
---

# Threads

How can we make a process run faster

* Multiple **execution units** with a process
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031101720.png" width=70%></div>

## Thread Definition

* A **thread** is a basic unit of execution within a process.  
    * Each thread has its own
    * thread ID
    * program counter
    * register set
    * **Stack**
* It shares the following with other threads within the same process 
    * code section
    * data section
    * the heap (dynamically allocated memory)
    * open files and signals
* Concurrency: A multi-threaded process can do multiple things at once

??? Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031101828.png" width=70%></div>

    线程执行的代码很有可能不一样。

* Advantages of Threads
    * Economy  
        * Creating a thread is cheap

            如果已经有了一个线程，那么我们创建新的线程只需要给它分配一个栈。Code，data，heap 都已经在内存里分配好了。
        
        * Context switching between threads is cheap

            Cache is hot, no need to cache flush. 
    * Resource Sharing
        * Threads naturally share memory

            不需要 IPC。
        
        * Having concurrent activities in the same address space is very powerful
    * Responsiveness

        如在 web server 中，一个线程在等待 I/O，当有请求来时就再分配一个线程去处理。（进程也可以，但是代价更大）

    * Scalability
        * multi-core machine
* Drawbacks of Threads
    * Weak isolation between threads

        如果有一个线程出错，那么整个进程都会出错。
* Typical challenges of multi-threaded programming
    * Deal with data dependency and synchronization
    * Dividing activities among threads
    * Balancing load among threads
    * Split data among threads
    * Testing and debugging

## User Threads vs. Kernel Threads

如果内核不知道你这个 user thread，完全在 user space 执行，就是 user space-based thread; 如果内核知道你这个 user thread，就是 kernel-based thread。

* Many-to-One Model

    缺点：内核只有一个线程，无法发挥 multi-core 的优势；一旦一个线程被阻塞，其他线程也会被阻塞。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031103409.png" width=70%></div>

* One-to-One Model

    把线程的管理变得很简单，现在 Linux，Windows 都是这种模型。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031103523.png" width=70%></div>

* Many-to-Many Model

    m to n 线程，折中。缺点是太复杂。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031103647.png" width=70%></div>

* Two-Level Model

    可以选择 many to many 或者 one to one。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031103741.png" width=70%></div>

## Thread Libraries

* In C/C++: pthreads and Win32 threads
* In C/C++: OpenMP
* In Java: Java Threads

### Pthreads

**Specification, not implementation**

只要符合接口的定义，就可以叫 pthreads。

??? Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031104125.png" width=70%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031104137.png" width=70%></div>

### OpenMP

Identifies **parallel regions** – blocks of code that can run in parallel  
``` C++
#pragma omp parallel
```

??? Example
    ``` C++
    #include <omp.h>
    #include <stdio.h>
    int main(int argc, char *argv[])
    {
        /* sequential code */
        #pragma omp parallel
        {
            printf("I am a parallel region.");
        }
        /* sequential code */
        return 0;
    }

    #pragma omp parallel for
    for (i = 0; i < N; i++)
    {
        c[i] = a[i] + b[i];
    }
    ```

使用之后编译器会为我们切分出若干个并行块，创造出对应的线程，最后使用 join 把线程合并。

### Java Threads

* Java threads may be created by:
    * Extending Thread class
    * Implementing the Runnable interface

??? Example
    ``` Java
    class MyThread extends Thread {
        public void run() {
            . . .
        }
    }
        MyThread t = new MyThread();
        public interface Runnable {
        public abstract void run();
    }
    ```

## Threading Issues

线程的加入让进程的操作变得更复杂。

### Semantics of `fork()` and `exec()`

如果一个线程调用了 `fork()`，可能发生两种情况：只复制调用线程，或者复制所有线程。

Some OSes provide both options

* In Linux the first option above is used  

    因为大部分时候 `fork` 之后会接 `exec`，抹掉所有的数据，因此直接复制调用线程就可以了。

### Signals

信号是给一个线程，给所有线程，给一个固定的线程还是用一个特定的线程来处理信号？

Most UNIX versions: a thread can say which signals it accepts and which signals it doesn’t accept.  

On Linux: dealing with threads and signals is tricky but well understood with many tutorials on the matter and man pages

### Safe Thread Cancellation

把一个线程的工作取消掉，如何保证取消后不影响系统的稳定性。

* Asynchronous cancellation
    
    立即终止。

* Deferred cancellation

    线程会自己进行周期性检查，如果取消掉不会影响系统的稳定性，就把自己取消掉。

Invoking thread cancellation requests cancellation, but actual cancellation depends on thread state.
<div align = center><img src="https://cdn.hobbitqia.cc/20231031105736.png" width=70%></div>

带来很多问题：比如一个线程正在写变量，值还没有同步到内存或者 cache，这个 bug 很难被复现。

In Java, the `Thread.stop()` method is deprecated, and so cancellation has to be deferred. 

## Linux Threads

In Linux, a thread is also called a **light-weight process**(**LWP**).

The `**clone()**` syscall is used to create a thread or a process. 

!!! Note
    `clone` 有一个参数 `CLONE_VM`，如果不设置那么类似于 `fork`，每个线程都有自己的内存空间；如果设置了那么线程跑在同一地址空间上。

    注意线程能访问到其他线程的栈，也能读写，只是正常使用情况下是用的自己栈。？？？

TCB 用来存储线程的信息，Linux 并不区分 PCB 和 TCB，都是用 `task_struct` 来表示。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031143655.png" width=70%></div>

    PID 如果和 LWP 相同，说明这个进程只有这一个线程。如果不相同，说明进程有多个线程，此时进程的 PID 是主线程的 LWP。

A process is 

* either a **single** thread + an address space 
    * PID is thread ID
* or **multiple** threads + an address space
    * PID is the leading thread ID

!!! Example "Threads with Process – What is shared"
    <div align = center><img src="https://cdn.hobbitqia.cc/20231031144309.png" width=70%></div>
    
    可以看到 `mm_struct` （与内存管理相关的信息，如页表，`vm_struct`）是共享的，`task_struct, pid, stack, comm` 是不共享的。

* One task in Linux
    * Same task_struct (PCB) means same thread（一个 PCB 指的是一个线程）
        * Also viewed as 1:1 mapping
        * One user thread maps to one kernel thread
        * But actually, they are the same thread
* Can be executed in user space
    * User code, user space stack
* Can be executed in kernel space
    * Kernel code, kernel space stack

例如我们使用了一个系统调用，线程切换到内核模式，相当于是用户线程对应的内核线程在执行，此时就使用内核空间的栈。

## Takeaway

!!! Summary "Takeaway"
    * Thread is the basic execution unit
        * Has its own registers, pc, stack 
    * Thread vs Process
        * What is shared and what is not
    * Pros and cons of thread