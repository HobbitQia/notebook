---
counter: True   
---

# E-Graph 应用

- Automatic Datapath Optimization using E-Graphs **ARITH**
    - RTL 自动优化。已经有很多 manually RTL optimizations（类似于很多 pass）
    - 贡献：a defined set of rewrites。

        <div align=center><img src = "https://github.com/HobbitQia/notebook/raw/note1/docs/assets/images/egg/2.png" width =60%></div>
        

    - 把 RTL 转为 S-expr，人为定义了一些rewrite rule（有些需要满足条件才能rewrite）
    - extraction：建模为 ILP，最小化面积，
        - 引入拓扑顺序，保证不出环。

            $$
            \forall (n,k)\in E, t_{C(n)} - Nx_n -t_k \geq 1-N
            $$

        - 这里 $N$ 是所有 enode, $E$ 是 egg 的所有边。$n, c$ 意味着一个 enode 指向一个 ecass。
        - 因此第二点意思是，如果一个 enode 被选择了，那么 $N_c$（eclass $c$ 里的 enodes）至少也要被选择， 也就是子节点。
        - 第三点意思是，$S$ 是我们需要实现的目标输出 e-class 集合。因此我们最后要保证这些 eclass 都要有 enode 被实现。

        <div align=center><img src = "https://github.com/HobbitQia/notebook/raw/note1/docs/assets/images/egg/1.png" width =40%></div>

- Rewriting History: Repurposing Domain-Specific CGRAs **arxiv**
    - 现有的 CGRA 编译器如果发现代码中存在一个硬件不支持的算子，就会直接导致编译失败 。随着软件的演进，原本为特定领域设计的硬件可能无法运行新的算法，导致昂贵的芯片过时 。domain-restriction。
    - 贡献：使用 egg，同时提出了一个未开源的 benchmark。
    - 方法：
        - 基于 DFG 改写，改写的规则和表达式类似，本质也是 pattern 匹配。最小化成本函数，如果有不支持的算子则 cost 1e6。
        - 混合改写，greedy rewrite（对给定匹配项应用重写能降低开销，则继续处理重写后的程序并丢弃先前版本，直到无法进一步改写）+ saturation rewrite 最后线性规划 LP。先 greedy，如果能成功就结束，如果依然有 op 无法支持就饱和。
        - 改写规则：浮点（$-1 * x = -x; x * y = x / (1 / y)$、布尔逻辑（可以用乘法，$+表示$，这样不用支持逻辑运算了）、随机计算（用 AND 替代 $*$，用 MUX 代替 $+?$）。
        - 核心是把复杂运算，转为简单运算。

- E-morphic: Scalable Equality Saturation for  Structural Exploration in Logic Synthesis **DAC 2025**
    - logic synthesis，在 technology mapping 阶段。
    - 之前方法的问题：ABC 容易陷在局部最优。
    - 实现上：
        - 用了一种 json 格式存储 DAG；

            ``` json
            egraph" : { 
            "3": {"id": 3, "nodes": [{"Symbol": "a" }],"parents": [7,8]}, ... // node id:(b, id:4), (c, id: 5)  
            "7": {"id": 7, "nodes": [{"AND": [3,4]}], "parents": [6,9]}, 
            "8": {"id": 8, "nodes": [{"AND": [3,5]}], "parents": [9]}, ... 
            } // other nodes
            ```

        - 解空间剪枝（在提取过程中，只保留每个等价类中成本最低或接近最低的节点，过滤掉由交换律和结合律产生的海量冗余节点）；
        - 模拟退火算法来寻找全局最优解；
        - 结合了基于 ABC 和 GNN 的 cost 预测。

        ![image](https://github.com/HobbitQia/notebook/raw/note1/docs/assets/images/egg/3.png)