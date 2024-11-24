---
counter: True  
---

# QServe

!!! Abstract
    ![](https://cdn.hobbitqia.cc/20241124163751.png)

    * Paper: [QServe: W4A8KV4 Quantization and System Co-design for Efficient LLM Serving](https://arxiv.org/abs/2405.04532)
    * 参考资料：
        * [知乎文章"[LLM量化系列]QServe全面解析"](https://zhuanlan.zhihu.com/p/700538726)
        * [知乎文章"[LLM推理优化]🔥WINT8/4-(00): 通俗易懂讲解-快速反量化算法"](https://zhuanlan.zhihu.com/p/657072856)
        * [知乎文章"量化那些事之 QServe"](https://zhuanlan.zhihu.com/p/697465029)

## 摘要与介绍

* SOTA 的量化算法：
    * INT8（权重和激活值均为 8 位），无损
    * W4A16，无损
    * W4A4 会带来显著的精度下降。虽然他被认为可以带来更高的吞吐，但是 SOTA W4A4 服务系统如 Atom，性能比 W4A16/W8A8 慢 20-25%。
* SOTA INT4 量化只能加速 low-batch，edge LLM 推理，不能在 large-batch，cloud-based LLM 服务中发挥作用。
    * 本文发现，现有 INT4 量化的方法在 dequantize 权重或者部分和的时候运行时间开销显著（20-90%）。
* 本文贡献：
    * QoQ，W4A8KV4 量化算法，4b weight、8b activation，4b KV cache。本文介绍了 progressive quantization（W4A8 GEMM 低反量化开销）、smoothAttention（减少 KV4 带来的精度降低）。
    * QServe 系统，支持 compute-aware weight reordering，同时利用寄存器级并行来降低反量化延时。还让 fused attention 变成 memory-bound。

## 动机

* 权重和 KV cache 量化可以降低内存开销
* 权重和激活值量化可以改善 peak computation throughput

现有的量化方法：W4A16（per-group），W8A8（per-channel + per-token activation），W4A4（per-group），本节会介绍为什么 W4A8KV4 是更好的选择。

* Roofline 模型下 W4A8KV4 优于 W8A8、W4A16
    * 部署 LLMs 时发现，attention 和 GEMM 占了大部分运行时间，而且 decoding 阶段的运行时间约是 prefilling 的 6x，因此本文仅关注 decoding 阶段的 attention 和 GEMM。
    * 对于 $m\times n\times k$ GEMM，计算强度（MACs/element）约为 $m$（当 $n,k$ 远大于 $m$ 时），这适用于 decoding 阶段。因为此时 $m$ 是序列的数量（batch size），$n,k$ 是通道大小。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241124103431.png" width=80%></div>

        <!-- TODO: Roofline analysis -->

        * batch size 小时，memory-bound，W4A16 的内存占用少，因此性能更好。
        * batch size 大时，compute-bound，W8A8 有更高的吞吐（因为有 INT8 tensor cores）。
        * 因此这里采用了 W4A8，结合上面两种方法的优势。
    * Why KV4: attention 可以被认为是一个批量的 GEMV 操作，其计算强度为 1 MAC/element，与 batch size 无关。而内存流量是由 KV cache 访问主导的，因为 $S >> N=1$（$S$ 之前的 token），因此相比于 KV8，KV4 理论上会带来 2x 的峰值吞吐。
* 为什么不使用 W4A4: GEMM 里的 main loop 开销
    * W4A4 虽然可以带来理论上更好的 GEMM 性能（Roofline 模型），但是会带来精度下降，而且无法在现有的 GPU 架构（Ampere & Hopper）上实现。
    * 对于 $m\times n\times k$ GEMM，每个线程块会计算大小为 $t_m\times t_n$ 的输出 tile，通过顺序迭代规约维度 $k$，这个循环成为 main loop，它主导了 GEMM 的性能。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241124105407.png" width=90%></div>

        * FP16 W8A8 GEMM，main loop 完全在 tensor core 上执行。
        * W4A16、A4A4，需要在 CUDA core 上进行反量化（INT4->FP16, INT32->FP32），而且 Atom（W4A4）创建了两套寄存器来存储部分和，可能受到寄存器数量的限制。

            !!! Info "CUDA core v.s. Tensor core"
                在 A100 和 H100 等现代数据中心 GPU 上，FP32 CUDA 内核的峰值性能仅为 INT4 张量内核的 2%。也就是说，在 Atom 中去量化单个部分和相当于 50 个张量核 MAC。

    <div align = center><img src="https://cdn.hobbitqia.cc/20241124110503.png" width=100%></div>

## 方法

### QoQ 量化算法

#### Progressive Group Quantization

给定权重张量 $W\in \mathbb{R}^{k\times n}$，

* 首先采用 per-channel symmetric INT8 量化: $\hat{W}=Q_{W_{s8}}^{(0)}\cdot s_{fp16}^{(0)}$
    * 这里 $Q_{W_{s8}}^{(0)}\in \mathbb{N}^{n\times k}$ 是 8b 中间量化值，$s_{fp16}^{(0)}\in \mathbb{R}^{n\times 1}$ 是 channel-wise 的量化 scale。
* 随后进行 per-group asymmetric INT4 量化: $Q_{W_{s8}}^{(0)}=(Q_{w_{u4}}-z_{u4})\cdot s_{u8}^{(1)}$
    * 这里 $Q_{w_{u4}}\in \mathbb{N}^{n\times k}$ 是无符号 4b 量化值，$z_{u4}\in \mathbb{N}^{n\times k/g}$ 是无符号 4b group-wise 量化零点，$s_{u8}^{(1)}\in \mathbb{N}^{n\times k/g}$ 是 group-wise 量化 scale。
* 在进行 W4A8 GEMM 时，4b 量化值会先进行反量化得到中间值 $Q_{W_{s8}}^{(0)}$，随后进行 INT8 GEMM。

本文在 INT4 量化中，采取了 Protective Quantization Range 的策略：

* 直接应用上面的式子不能保证中间值完全位于 8 位整数表示范围内。一个做法是在反量化中打开 saturation 饱和选项。然而这样会严重损害计算吞吐量，速度会降低多达 67%。

    !!! Example
        假设 INT8 量化后，weight 落在 $[-113, 120]$ 中，4b 非对称量化会得到 scale factor $\lceil (120 - -113)/(15 - 0)\rceil=16$ 以及零点 $\lceil 0--113/16\rceil = 7$，那么 120 会被映射到 $\lceil 120/16+7\rceil=15$，这个值反量化为 $(15-7)*16=128$，超出了 INT8 的表示范围。

* 经过下面的推导，本文将 INT8 量化的范围缩小到 $[-119, 119]$，这样来避免反量化的溢出。

    $$
    \begin{aligned}
    \hat{q_{s8}} =\lfloor \frac{q_{s8}}{s_{u8}} \cdot s_{u8} & \leq q_{s8} + \frac{1}{2} s_{u8} \\
    s_{u8} = \frac{q_{s8max}-q_{s8min}}{q_{u4max}-q_{u4min}} & \leq \frac{127-(-128)}{15-0} = 17 \\
    \hat{q_s8} \leq 127 \rightarrow q_{s8} & \leq 127-\frac{1}{2}s_{u8} \rightarrow q_{s8} \leq 119.5
    \end{aligned}
    $$

    !!! Example "保护性量化范围"
        <div align = center><img src="https://cdn.hobbitqia.cc/20241124111716.png" width=100%></div>

!!! Note "与之前 two-level 的量化方法比较"
    * 以前的研究，如 QLoRA 中的 VSQuant 和 DoubleQuant，也引入了两级缩放因子来减少组内缩放因子的内存占用。但他们直接使用目标精度进行 group quantization，然后使用组内浮点缩放因子执行 per-channel 量化。在计算 GEMM 时需要先反量化出 scale，再反量化出浮点值，不能先产生 8b weight tensor。
    * DGQ 也遵循 VSQuant、DoubleQuant 的量化方案，但对缩放因子施加限制，以确保所有计算都可以映射到 INT8 Tensor Core 上，但它将反量化 kernel 与 GEMM kernel 分开，没有发挥出 int4 的内存带宽优势。

#### SmoothAttention

直接将 KV cache 压缩到 4 位会显著降低 LLM 的精度，因此本文将 Key Value 的激活值可视化地展现出来：
<div align = center><img src="https://cdn.hobbitqia.cc/20241124120132.png" width=70%></div>

* 本文发现，Value 矩阵没有显著的 outlier，但是 Key 矩阵在每个头的固定通道上有 outlier。
* 借助于 SmoothQuant 的思想，这里通过 per-channel facotr $\lambda$ 将 K scale down，$Z=((Q\Lambda)\cdot(K\Lambda^{-1})^\top), \Lambda=\text{diag}(\lambda)$。SmoothQuant 需要通过搜索迁移强度来专门平衡激活和权重量化。这里不对 Queries 进行量化，因此只需将注意力集中在 Keys 上并简单地选择 SmoothAttention 的比例因子即可 $\lambda_i=\max(|K_i|)^\alpha$（实践中 $alpha=0.5$）
* 我们希望将 scale 矩阵 fuse 进之前的线性层，这样可以提高性能。但是现在的 LLMs 普遍对 key & query 使用 RoPE。为了让 SmoothAttention scaling 可交换，我们人为添加了一个要求：$\lambda_i=\lambda_{i+D/2}=\max\left(\max(|K_i|), \max(|K_{i+D/2}|)\right)^\alpha$。这样就可以通过 $W_Q=\Lambda W_Q, W_K=\Lambda^{-1}W_K$ 进行融合。

#### 通用的 LLM 量化优化

这里的技巧主要来自之前的工作，如 QuaRot, Quip, AWQ, Atom。

* Block Input Module Rotation
    * 我们将接收块输入的组件定义为输入模块，如 QKV 投影层和 FFN 第一层。
    * 对激活值输入，乘以旋转矩阵。为了保持线性层的数学等价性，我们将相应的权重反向旋转。旋转后，每个通道的激活都是所有其他通道的线性组合，因此 outlier channel 会被有效抑制。此外，由于旋转是一种单元变换，我们可以将旋转矩阵与之前线性层的权重融合在一起。这里选择 Hadamard 矩阵作为旋转矩阵。

    <div align = center><img src="https://cdn.hobbitqia.cc/20241124151155.png" width=75%></div>

* Block Output Module Smoothing
    * 输出模块指的是生成块输出的层，如输出投影层和 FFN 第二层。
    * 我们通过 per-channel 平滑因子来平滑区块中间的激活值。
    
    <div align = center><img src="https://cdn.hobbitqia.cc/20241124151353.png" width=75%></div>

* Activation-Aware Channel Reordering
    * 之前的工作发现，将部分显著的权重用高精度保存可以改善模型精度。
    * 本文使用 $\max (|X|)$ 来确定 channel salience，然后对通道重新排序，使具有相似显著性的通道处于同一量化组中。
* Weight Clipping
    * 在 QServe 中，我们会使所有线性层的层输出误差最小化，但 q_proj 和 k_proj 除外，我们会优化块输出均方误差。

### QServe 服务系统

#### QServe 系统运行时

QServe 中的所有 GEMM 层都在 W4A8 输入上运行，在 INT8 Tensor Core 上执行计算，并生成 FP16 输出。所有 Attention 层都在 CUDA 内核上以 FP16 格式执行计算。因此，QServe 中的每个 LLM 块都有 FP16 输入和 FP16 输出（下图为一个 LLM 块）。

<div align = center><img src="https://cdn.hobbitqia.cc/20241124152552.png" width=55%></div>

* Activation Quantization
    * 要保证每个 GEMM 块接收 INT8 的激活值作为输入，我们将激活值量化 fuse 到之前的 layernorm（这样 QKV proj 和第一个 FFN 就可以保证 INT8 输入）和激活函数层（第二个 FFN 可以保证 INT8）。
* KV Cache Management
    * 同 vLLM, TensorRT-LLM，采用分页 KV 缓存。与这两个在 KV 缓存上执行 per-tensor，static 量化（即离线计算缩放因子）的框架不同，QServe 由于位精度较低（4 位对 8 位），因此需要 per-head，dynamic KV 量化，以保持有竞争力的精度。

#### W4A8 GEMM

* Compute-Aware Weight Reordering
    * 在每个 main loop 迭代期间将操作数从全局内存加载到 L1 共享内存中。例如，线程 0 不是连续加载 8 个 INT8 权重，而是先加载输入通道 0-3，然后跳到输入通道 16-19。一个简单的权重加载实现需要对每四个通道进行一次地址计算，这会导致两个效率问题：
        * 指针算术运算是在 CUDA 内核上进行的，而 CUDA 内核的吞吐量比 A1 上的 INT8 张量内核低 32 倍。
        * stried 跨步内存访问无法通过打包的 128 位加载实现最高的 HBM 带宽，从而进一步降低了内存流水线的速度。
        * 当存储和计算类型匹配时，我们可以使用 `ldmatrix` 指令，但这里 W4A8 无法使用这个指令。
    * 本文按照计算过程中 TensorCore 需要使用的顺序来存储权重。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241124155144.png" width=65%></div>

* Fast Dequantization in Per-Channel W4A8 GEMM
    * 在每通道 W4A8 量化的情况下，二级 scale factor 被省略，一级 FP16 scale 融合到 GEMM epilogue，问题在于如何实现 UINT4 到 SINT8。
    * UINT4 到 UINT8，这里可以通过将 32 个 UINT4 权重重排，并使用逻辑运算快速解压，实现 register-level parallism。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241124160357.png" width=75%></div>

    * UINT8 到 SINT8，通过数学变换，将反量化计算中的减法移出 main loop 来减少计算开销。这里的 $1_k$ 表示把每个 token 的所有输入通道相加。

        $$
        \begin{aligned}
        O & = (Q_X\odot S_X)((Q_W-Z_W)\odot S_W) \\
        & = (Q_XQ_W)\odot(s_W\times s_X) - (Q_X\odot S_X)ZS_W \\
        & = (Q_XQ_W)\odot(s_W\times s_X) - (X 1_k)\times (z_W\odot s_W) \\
        \end{aligned}
        $$

        最后的减法可以移到 epilogue 计算。但是这里需要提前计算 $(X 1_k)$，好在 W4A8 kernel 前通常为 memory-bound kernel，因此我们可以将预计算内核融合到该内核中，延迟开销可以忽略不计。

* Fast Dequantization in Per-Group W4A8 GEMM
    * 本文认为在乘法后应用减法仍然是有利的方法，因为它启用了寄存器级并行（RLP）。有了乘法后的减法计算顺序，渐进式分组量化算法确保了初始乘法步骤的结果永远不会超出 INT8 范围。这允许在乘法和减法中充分利用 RLP 的性能优势。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241124162324.png" width=75%></div>

* 通用优化
    * 内存方面，我们采用了多级软件流水线和异步内存复制以更好地实现内存访问与计算的重叠我们还调整了 L1 共享内存的布局，以消除 bank conflicts。为了提高 L2 cache 的利用率，我们在不同线程块之间进行计算分区，允许相邻线程块重复使用相同的权重。
    * 计算方面，输入 token 数量 m 较少时，我们发现将还原维度 k 划分为多个切片并在 L1 共享内存的不同经线上减少部分和是有益的。

#### KV4 Attention

* Attention 计算也占据了 LLM 推理中的很大一部分，理论上 KV4 相对 KV8 应该有 2x speedup，但实际运行下来在 A100 上 KV4 甚至还比 KV8 要慢，原因在于在 decoding 负责执行 attention 内核是 CUDA 内核。虽然每个单独的分批 GEMV 计算强度为 1 MAC/element，但对于融合了所有算术和 KV 缓存更新的 attention kernel 来说，计算强度会显著增加。仅对 KV 操作数进行反量化就已使这一界限达到饱和，因此 fused KV4 attention kernel 在 A100 这样的 GPU 上变成了 compute-bound。
* 因此，本文通过两个方式消除 compute-bound 的瓶颈：
    * 延缓 Roofline 转折点的到来。这里将 TensorRT-LLM Kernel 中的所有 FP32 操作替换为 FP16，相当于 double computation roof。
    * 降低 fused kernel 里的计算强度。通过应用位技巧，反量化的算术强度可以显著减少到每个元素 2 个操作。

## 实验 

TODO