
# SEER: Super-Optimization Explorer for High-Level  Synthesis using E-graph Rewriting

!!! Abstract
    ![Abstract](https://github.com/HobbitQia/notebook/docs/assets/images/seer9.png)

    * Paper: [SEER: Super-Optimization Explorer for High-Level Synthesis using E-graph Rewriting](https://dl.acm.org/doi/10.1145/3620665.3640392)
    * Architectural Support for Programming Languages and Operating Systems (**ASPLOS 2024**)

## 背景和动机

* HLS 能够自动将 C/C++ 等高级语言转换为硬件描述语言（如 Verilog）。
* 一个重要的问题：Phase-Ordering，与传统编译器中的问题类似。
    * HLS 包括不同粒度的优化，例如高阶段的 control path 优化和低阶段的 data path 优化。这些优化可能会相互干扰，导致优化排序的空间比软件编译器中的更大更复杂。=> 挑战 1: Efficiency，如何高效探索庞大的优化空间？
    * 从输入的软件程序中评估硬件指标是很有挑战的，往往需要调用下游的综合工具。=> 挑战 2: Hardware awareness，如何选取可映射为高效硬件的优化序列？
* 现有关于HLS源码重写的研究基于**启发式方法**构建优化序列。这种做法错失了 program-specific 优化的机会，可能导致无法获得最优硬件设计。
* 本篇工作提出了 SEER (Super-optimization Explorer using E-graph Rewriting)，使用 E-graph 并行地探索多种优化顺序，保留所有可能的程序版本，最后通过硬件成本模型提取最优解。

## 方法

<div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer1.png" width =90%></div>

* 1: C/C++ 程序经过 Polygiest 转换为 MLIR，随后 2: 转为 SEER dialect（SeerLang）的 IR。
* 3: SeerLang 会调用 egg 构建 e-graph，同时 4: 根据提供好的 rewrite rule 在 egg 内进行模式匹配，匹配到之后会进行 5: 改写（这里的可以在 e-graph 内，也可以在 SeerLang IR 内）。如果改写成功（改写后会进行等价性检查），6: 将改写后的结果作为表达式添加到 e-graph 中，直到达到最大迭代次数或者饱和。
* 7: 基于硬件 cost 调用 e-graph extraction 提取最优解，8: 将提取出的 SeerLang 表达式转换回 MLIR affine/scf 方言，9: 再转换回 C/C++ 程序。10: 最后进行和原始程序的等价性检查。

### SeerLang IR

* 如何协调 MLIR 和 egg
    * 保留每次转化后的 MLIR 表达，完整存储 => 内存开销大，与 egg 的结构共享理念矛盾
    * 只保留基准 MLIR，同时记录改写过程，需要特定版本时进行重算 => 编译时间长
    * 因此本文选择设计一个新的领域特定语言 SeerLang，作为 MLIR 和 egg 之间的一个轻量级接口。
* 使用类似 LISP 的 S-expression 来表示表达式 `term ::= (operator [term] [term]. . . [term])`
* 支持的操作符主要来自 affine/scf/arith/memref，还有一个特殊的操作符 `seq` 用来规定 block 内内存读写操作之间的顺序。

!!! Example
    <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer2.png" width =40%></div>

    * 为了简化，假设一个 block 内的内存操作都有依赖关系，因此需要用 `seq` 来规定顺序。
    * 从 MLIR 翻译到 SeerLang 几乎是无损的，因为 SeerLang 中的每个操作都保留了类型和操作数信息。

### 改写规则

* 包括内部改写和外部改写
    * 包括 control path, data path, gate level 的改写。
* internal rewrite: 可以直接在 e-graph 内应用改写（data/gate level）。
    * 大部分改写自基于 e-graph 的 ROVER工具。这些重写包括表达式平衡、常量折叠与操作以及强度折减。
    * 门级重写同样在运算符层面修改程序，但主要针对比特级硬件定制。

    ??? Example "Example SEER rewriting rules implemented directly in egg."
        <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer3.png" width =50%></div>

        * SEER 包含了 106 条内部改写规则，所有数据路径的重写都依赖于符号和位宽。

* external rewrite: 通过 egg 中的动态改写实现，在匹配到模式后，SEER 会调用 MLIR 的 passes 进行改写（control path level）。
    * loop: unroll, fusion, interchange, flatten, perfection（将包含外层循环体内代码且内层循环体外代码的循环嵌套转换为完美循环嵌套）
    * if: conversion（将条件语句转换为选择操作）, correlation（合并条件相同的 if 语句）
    * memory: forward（消除代码中的冗余加载与存储操作）, reuse（只读内存访问移出循环体外）
    * 可以定制 MLIR Pass 来实现更复杂的改写。

!!! Example "E-graph Rewriting for Super-optimization"
    <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer4.png" width =90%></div>

    * 绿色节点代表了程序的初始状态，红色节点代表第一次改写，蓝色节点代表第二次改写。
    * 第一次是内部改写，使用 seq 结合律，匹配红色阴影覆盖的子表达式，返回等价的 SeerLang 表达式，新表达式被合并到匹配的 e-class 中。
    * 第二次是外部改写，SEER 的模式匹配器在图中发现了 `(seq loop_2 loop_3)` 可以进行循环融合。
        * 将匹配的 SeerLang 转换为等效 MLIR，然后 SEER 调用 MLIR 现有循环融合 pass（`mlir-opt --affine-loop-fusion`）生成新 MLIR 实现。
        * 若依赖约束不满足或转换失败，程序将返回原始 MLIR。egg 中的循环融合规则会验证程序未报错且返回的 MLIR 与输入不同，最后将其转换回 SeerLang 执行合并操作。

!!! Info "Deeper Optimization Opportunities"
    * E-graph 允许我们在不同的时间点使用程序的不同版本，同时保持程序不变量，这是传统静态分析的编译器做不到的。
    * 循环依赖分析
        * 问题：硬件效率与代码可分析性之间存在冲突。例如计算 `3*i`，为了避免使用昂贵的乘法器，会写成 `(i<<1)+i`。在 ASIC 设计中，移位操作几乎是零成本的。 然而，现有的循环优化依赖于多面体分析来检查数据依赖。多面体分析非常擅长处理仿射表达式，如 `3*i`。但面对 `(i<<1)+i` 这种包含位运算的非仿射模式，分析器往往无法确定内存访问的规律。为了安全起见，编译器会保守地认为存在依赖冲突，从而禁止循环融合。
        * 通过 data path 改写，SEER 可以把 `(i<<1)+i` 转换为 `3*i`，从而可以进行循环融合。同时 E-graph 保留了原始的 `(i<<1)+i` 表达式，在后续提取时 SEER 会选择这个硬件更友好的表达。

        <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer5.png" width =70%></div>
    
    * `if` 语句转换
        * 问题：代码变换有时会破坏静态分析所需的结构信息。例如图中我们做了循环完全展开后，这里有若干 `if` 语句，但是编译器很难发现这些 `if` 语句之间的关系（例如，这些条件互斥/覆盖所有情况）。
        * SEER 保留了变换之前的信息作为额外的上下文，有这些信息 SEER 可以成功执行 If Correlation，将展开后的一堆 if 合并为更紧凑的逻辑。

        <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer6.png" width =60%></div>

    * 这里使用的是 E-graph 里的 greedy 提取方法，即从 e-class 里只选择最优的 e-node 而不考虑公共子表达式。这里的成本函数是 analysis-friendly 的，给乘法加法更低的成本，使得仿射表达式比替代的逻辑表达式具有更低的代价。

### 成本函数

* 将提取过程分为两个阶段：首先提取能最大化性能的控制流节点，然后在固定控制流基础上最小化 data path电路面积。
* 控制流节点是 SeerLang 操作子集（如 `for` 和 `if` 语句），用于描述程序控制流。SEER 假设所有的循环默认都是 pipelined 的。
    * 一个流水线循环具有三个调度约束：启动间隔 P、迭代延迟 l 和循环次数 N，总延迟 $L = P + (N-1)\times l$。
    * 对于最初的表达式（没有进行改写的），SEER 直接运行 HLS 来获得所有循环的 $(P,l,N,A)$ 值（这里 $A% 是内存访问的集合）。对于后续生成的循环，采用估计的方式。
        * 对于循环融合，$l'=\max\{l_1,l_2\}$，$P'=\min\{P_1,P_2\}$，$N'=N_1+N_2, A'=A_1\cup A_2$。
        * 对于循环完全展开，如果展开循环，迭代次数 N 变为 1，延迟变为 $N\times l$。
    * 提取时的成本函数定义为所有控制流 e-class 的延迟之和，此时 data path 的成本认为是 0（这时因为只考虑控制流等价类，extraction 阶段返回的是一个 e-graph 的子集，我们需要进一步考虑剩下的数据流部分的 e-node 选择）。
* 对于数据路径，SEER 以最小化面积而非延迟为目标（因为操作延迟通常可被循环流水线掩盖）。SEER 利用 ROVER 现有成本函数提取每个模块中的最小电路面积表达式，基于位宽相关门数为每个节点 n 分配面积成本 $A(n)$。

### 验证

* 转换过程可能未经验证，导致非等价表示。
* SEER 从提取的表示形式回溯中间形态至原始程序，为每个通过单次重写与前序步骤产生差异的环节生成 SystemC 代码；随后 SEER 生成一系列 equivalence checks，构建原始程序与生成程序功能等效的完备推理链条。每个中间检查均通过商用等价性验证器完成证明。
* 通过将验证问题分解为更简单的子问题序列，SEER 提供了稳健的验证流程。

## 实验

* baselines: 未经修改的商业化 HLS 工具，ROVER（基于 E-graph 做数据通路的优化），Manual（手动插入 pragma）。
* benchmarks: 
    * MachSuite (8/19)：选取了 HLS 工具通常无法生成最优解的子集，包括矩阵乘法 (GEMM)、分子动力学 (MD)、排序算法 (Sort) 等 。
    * Intel 生产级代码：`byte_enable_calc`，一段真实的资源管理逻辑代码。
    * 人工构造代码：`seq_loops`，专门用于测试循环融合能力的案例。
* Case Study on Intel Production Code。
    * 这段代码包含不必要的控制流和内存依赖，导致 HLS 工具无法进行流水线优化，延迟很高。
    * SEER 自动发现了循环展开、内存转发和 If Correlation 等机会，在性能和综合指标上击败了人类专家。
* 总体结果

    <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer7.png" width =90%></div>

    * 大多数基准测试的 PPA 指标均得到改善。
    * 成本函数未考虑功耗因素，仅聚焦于性能和面积优化，这可能导致最终硬件设计存在能效不足的问题。
    * 在 md (grid) 案例中，SEER 输给了 Pragma。HLS 工具提供的编译指示涵盖了 SEER 当前尚未支持的某些转换，例如 loop coalesce。我们期待当SEER具备与HLS工具相同的转换能力后，其表现将达到甚至超越手动插入编译指示的水平。

* 运行时间
    
    <div align=center><img src = "https://github.com/HobbitQia/notebook/docs/assets/images/seer8.png" width =50%></div>

    * MLIR 的转换时间很短，主要时间消耗在 egg 的探索和提取上。对于硬件编译来说，这个时间成本是完全可以接受的 。