---
counter: True  
---

# Inter-Process Communication

Processes within a host may be independent or cooperating.  
Reasons for cooperating processes:

* Information sharing
* Computation speedup
* Modularity
* Convenience

进程保护的太好了，需要有互相通信的手段。

Models of IPC

* Shared memory
* Message passing
* Signal
* Pipe
* Socket

## IPC Communication Models

<div align = center><img src="https://cdn.hobbitqia.cc/20231011225958.png" width=70%></div>

* Message-passing  
需要内核空间支持
    * useful for exchanging small amounts of data
    * simple to implement in the OS
    * sometimes cumbersome for the user as code is sprinkled with send/recv operations
    * high-overhead: one syscall per communication operation
* Shared memory  
非内核空间 
    * low-overhead: a few syscalls initially, and then none   
    * more convenient for the user since we’re used to simply reading/writing from/to RAM
    * more difficult to implement in the OS

### Shared Memory

Processes need to establish a shared memory region.  

<div align = center><img src="https://cdn.hobbitqia.cc/20231011230419.png" width=70%></div>