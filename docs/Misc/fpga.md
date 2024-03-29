---
counter: True   
---

# FPGA

!!! Abstract
    用来记录在 FPGA 编程和开发中遇到的问题和解决方案，以及一些小 tips。

    * 特别鸣谢：[张杰学长](https://github.com/carlzhang4)
    * 主要使用的开发语言为 Chisel、Verilog，开发平台为 Xilinx Vivado.
    * 相关代码来自 [RC4ML](https://github.com/RC4ML) 的私有仓库，以及本人在 FPGA 编程中书写的代码。

## ILA

ILA 可以用来在上板之后观察信号的变化，用于调试。

* **1 个 ILA 核只能和 1 个时钟域内的信号交互**，即来自不同时钟域的信号不能同时接入同一个 ILA 核。ILA 的时钟和这个时钟域的时钟保持一致。
* 如果传入 ILA 的数据过大，可能会有延迟问题，可以选择打 6 拍缓解时序。
* 使用 ILA debug 时，要找到最里层的信号进行查看。

??? Example
    比如在我的工程 `Foo` 里实例化了 `qdma`，并将一些信号送入 `qdma` 里的 ip 核。在实验里发生了 QDMA 无法正确完成 C2H (FPGA->CPU) 的工作，这时应该将 `qdma` 内的 ip 核 `qdmaInst` 的输入信号接入 ILA，同时此时的时钟并不是 `qdma` 模块的时钟 `user_clk`，而是 `qdmaInst` 的时钟 `pcie_clk`（在 `qdma` 模块内可以看到有一个 FIFO 进行时钟域的转化）。

## Register Slice

用来打拍，缓解时序。

* 将一个比较大的数据包（如 AXI 接口）与其他模块接口相连时，可能需要用 RegSlice 来打（2）拍。
* 或者通过 Vivado 的时序报告可以看到 critical path，有的地方即使是直接相连也会有很大的延迟，这时也可以用 RegSlice 来打拍。

## FIFO

不同时钟域的数据相连，需要使用 FIFO (`XConverter`, `XAXIConverter`)，最好在 FIFO 后再加上 `RegSlice` 打拍。

## Vivado 时序报告

Vivado 中的 WNS 不能为负。否则非常容易出现时序问题，也会消耗更多的综合时间。因为 `route_design` 中会尝试不同的布线，时序紧张时 `route_design` 也会需要大量的时间。（一般 -0.0x 可以考虑跑下，可能没有问题。）

* 可以通过 Vivado 中 `Report Timing` 或者 `Open Runs` 查看哪里的 path 时序负的多。
* 常见的问题是 reset: 因为 reset 信号一般是异步的，这样就会带来时序问题。解决方法是 `set_false_path` 表示不应分析设计中的逻辑路径。

??? Example
    这里是我的工程的时序分析，这里 `apb_complete_0_reg` 是 HBM 内用于生成 `reset` 信号的值，随后 reset 信号接出到了 `axi2hbm` 模块，因此这里存在异步的问题。通过时序报告找到这两个时钟，`set_false_path` 即可。
    ![](https://cdn.hobbitqia.cc/20240323131944.png)