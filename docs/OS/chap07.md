---
counter: True  
---

# Deadlock

* Deadlock problem
* System model
* Handling deadlocks
    * deadlock prevention
    * deadlock avoidance
    * deadlock detection 
    * deadlock recovery

## The Deadlock Problem

**Deadlock**: a set of blocked processes each holding a resource and waiting to acquire a resource held by another process in the set. 

??? Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109220525.png" width=50%></div>
    
Note: most OSes do not prevent or deal with deadlocks. 

!!! Example "Deadlock in program"
    resource allocation graph 中出现了环，说明有死锁。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109220940.png" width=50%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109220950.png" width=50%></div>

## System Model of deadlock

* Resources: $R_1, R_2, \ldots, R_m$
    * each represents a different resource type ***e.g.*** CPU cycles, memory space, I/O devices
    * each resource type $R_i$ has Wi instances
* Each process utilizes a resource in the following pattern
    * request 
    * use 
    * release

### Four Conditions of Deadlock

* Mutual exclusion: a resource can only be used by one process at a time.

    互斥，资源在一个时间只能被一个进程使用。

* Hold and wait: a process holding at least one resource is waiting to acquire additional resources held by other processes.

    已经有了一些资源，同时想要更多资源。

* No preemption: a resource can be released only voluntarily by the process holding it, after it has completed its task.

    已经获得的资源不能被抢占，只能由自己释放。

* Circular wait: there exists a set of waiting processes $\{P_1, P_2, \ldots, P_m\}$
    * $P_0$ is waiting for a resource that is held by $P_1$
    * $P_1$ is waiting for a resource that is held by $P_2$ ...
    * $P_{n–1}$ is waiting for a resource that is held by $P_n$
    * $P_n$ is waiting for a resource that is held by $P_0$

### Resource-Allocation Graph

* Two types of nodes:
    * $P = \{P_1, P_2, \ldots, P_n\}$, the set of all the processes in the system
    * $R = \{R_1, R_2, \ldots,R_m\}$, the set of all resource types in the system
* Two types of edges:
    * **request edge**: directed edge $P_i \rightarrow R_j$

        进程需要这个资源。

    * **assignment edge**: directed edge $R_j \rightarrow P_i$

        资源已经分配给这个进程。

<div align = center><img src="https://cdn.hobbitqia.cc/20231109221808.png" width=60%></div>

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109221833.png" width=50%></div>

    这里没有死锁，P3 先执行，随后释放 R3，再执行 P2，最后 P1。  
    下面的例子就有死锁：（有环）
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109221957.png" width=50%></div>
    
    这里如果把 R2->P1 抹掉，就没有死锁了（因为 R2 另一个资源可以给 P3）；如果把 P1->R1 抹掉，也没有死锁。如果把 R2->P1 以及 R2 的另一个资源抹掉，仍然有死锁。

<u>**Circular wait does not necessarily lead to deadlock.**</u>  
有环不一定有死锁，但有死锁一定有环。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109222302.png" width=50%></div>

!!! Note
    * If graph contains no cycles $\rightarrow$ no deadlock
    * If graph contains a cycle 
        * if only one instance per resource type, $\rightarrow$ deadlock
        * if several instances per resource type $\rightarrow$ possibility of deadlock

## How to Handle Deadlocks

* Ensure that the system will never enter a deadlock state
    * **Prevention**
    * **Avoidance**
* Allow the system to enter a deadlock state and then recover - database
    * **Deadlock detection and recovery**
* **Ignore the problem** and pretend deadlocks never occur in the system

    现在操作系统都是这样做，假装无事发生，因为无法提前预测死锁的发生。

### Deadlock Prevention

打破死锁的任一一个条件。

* How to prevent **mutual exclusion**

    sharable 的可以，non-sharable 的没办法。

* How to prevent **hold and wait**
    * whenever a process requests a resource, it doesn’t hold any other resources
        * require process to request all its resources before it begins execution
        * allow process to request resources only when the process has none

            申请资源时不能有其他资源，要一次性申请所有需要的资源。

    * low resource utilization; starvation possible

        利用率低，而且可能有进程永远拿不到所有需要的资源，因此无法执行。

* How to prevent **no preemption**

    可以抢，但不实用。

* How to handle circular wait
    * impose a total ordering of all resource types

        给锁一个优先级排序，取锁的时候要求从高往低取锁。

    * require that each process requests resources in an increasing order
    * Many operating systems adopt this strategy for some locks.

!!! Warning "For dynamic acquired lock"
    有的时候，给锁排序的方法不适用：在银行转账的时候，如果都先锁 from 再锁 to，就会死锁。
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109223214.png" width=50%></div>

### Deadlock Avoidance

avoidance 用了一些算法，在分配资源之前，先判断是否会死锁，如果会死锁就不分配。

**Safe State**

* there exists a sequence $<P_1, P_2, \ldots, P_m>$ of all processes in the system
* for each $P_i$, resources that $P_i$ can still request can be satisfied by currently available resources + resources held by all the $P_j$.

    序列里的每一个进程都可以被满足。（空闲的资源和之前的进程释放的资源）

Safe state can guarantee no deadlock. 

* if $P_i$’s resource needs are not immediately available: 
    * wait until all $P_j$ have finished
    * when $P_j$ has finished, $P_i$ can obtain needed resources, 
* when $P_i$ terminates, $P_{i+1}$ can obtain its needed resources, and so on.

!!! Note
    * If a system is in **safe state** $\rightarrow$ no deadlocks
    * If a system is in **unsafe state** $\rightarrow$ possibility of deadlock
    * **Deadlock avoidance** $\rightarrow$ ensure a system never enters an unsafe state

    <div align = center><img src="https://cdn.hobbitqia.cc/20231109224430.png" width=50%></div>
    
!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109224548.png" width=50%></div>
    
    What if we allocate 1 more for P2?  
    不是一个 safe state，因为做完 P1 后，我们只有 4 个可用，P0 和 P2 都无法满足。

* Single instance of each resource type $\rightarrow$ use **resource-allocation graph**
* Multiple instances of a resource type $\rightarrow$ use **the banker’s algorithm**

#### Single-instance Deadlock Avoidance

Resource-allocation graph can be used for single instance resourcedeadlock avoidance

* one new type of edge: **claim edge**
    * claim edge $P_i\rightarrow R_j$ indicates that process $P_i$ may request resource $R_j$

        想要，但还没有 request。

    * claim edge is represented by a dashed line
* resources must be claimed a priori in the system.

    要事先声明。

Transitions in between edges

* *claim edge* converts to *request edge* when a process requests a resource.
* *request edge* converts to an *assignment edge* when the resource is allocated to the process.
* *assignment edge* reconverts to a *claim edge* when a resource is released by a process.

Algorithm

* Suppose that process $P_i$ requests a resource $R_j$
* The request can be granted only if:
    * converting the request edge to an assignment edge does not result in the formation of a cycle. 
    * no cycle $\rightarrow$ safe state

比如这里分配之后就有一个环，no safe state. 
<div align = center><img src="https://cdn.hobbitqia.cc/20231109225531.png" width=50%></div>

#### Banker’s Algorithm

我们通过 available（当前还没有被分配的空闲资源）, max（进程所需要的资源）, allocation（已经分配的资源）, need（还需要分配多少资源） 这四个矩阵刻画一个时间内各个进程对各种资源的持有和需求情况。

选取一个 need（的每一项都对应地）小于 available（的对应项）的进程，其运行完后会将 allocation 释放回 work（前面的进程执行完毕后，空闲的资源），以此类推。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109233853.png" width=50%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109233936.png" width=50%></div>

### Deadlock Detection

Allow system to enter deadlock state, but detect and recover from it.

#### Single Instance Resources

使用 wait-for graph. 

$P_i \rightarrow P_j$ if $P_i$ is waiting for $P_j$ 

<div align = center><img src="https://cdn.hobbitqia.cc/20231109231453.png" width=50%></div>

Periodically invoke an algorithm that searches for a cycle in the graph

* if there is a cycle, there exists a deadlock

    有环就有 deadlock。

* an algorithm to detect a cycle in a graph requires an order of $n^2$ operations,
    * where $n$ is the number of vertices in the graph.

#### Multi-Instance Resources

类似银行家算法。如果找不到任何安全序列，则说明系统处于死锁状态。

!!! Example
    <div align = center><img src="https://cdn.hobbitqia.cc/20231109231807.png" width=50%></div>

### Deadlock Recovery

#### Terminate deadlocked processes.

options:

* abort all deadlocked processes.
* abort one process at a time until the deadlock cycle is eliminated.

In which order should we choose to abort?

* priority of the process
* how long process has computed, and how much longer to completion
* resources the process has used
* resources process needs to complete
* how many processes will need to be terminated
* is process interactive or batch?

#### Resource preemption

* Select a victim
* Rollback
* Starvation
    * How could you ensure that the resources do not preempt from the same process?

## Takeaway

!!! Summary "Takeaway"
    * Deadlock occurs in which condition?
    * Four conditions for deadlock
    * Deadlock can be modeled via resource-allocation graph
    * Deadlock can be prevented by breaking one of the four conditions
    * Deadlock can be avoided by using the banker’s algorithm
    * A deadlock detection algorithm
    * Deadlock recover