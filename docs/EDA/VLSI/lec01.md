---
counter: True   
---

# Introduction

* Motivation and Introduction
* Building a Chip
* Design Automation
* Chip Design Flow

## Motivation and Introduction

<div align = center><img src="https://cdn.hobbitqia.cc/20240817175751.png" width=75%></div>

Moore's law of engineers

每芯片逻辑晶体管的增长规模远大于个人处理能力，即使我们使用了各种工具来辅助。这称为工程师的摩尔定律。

Solution:

* Design Abstraction: 抽象出设计工程的每个部分，每位工程师都专注于其中的一部分，但能够从其他工程师那里获得输入，或者向其他工程师提供输出，我们可以专注于自己的部分。
* Design Automation: 设计自动化（EDA），通过软件工具来自动化设计流程，提高设计效率。
* Design Re-use(IP): IP（知识产权），如果有现成的，可以直接使用，不需要重复设计。

## Building a Chip

General Design Approach: Divide and Conquer

* **Partition** design problem into many sub-problems, which are manageable
* Define mathematical **model** for sub-problem and find an **algorithmic** solution
    * Beware of model limitations and check them !!!!!!!
* Implement algorithm in **individual design tools**, define and implement general **interfaces** between the tools

    实现上下层抽象之间的接口。

* Implement **checking tools** for boundary conditions

    通常会由第三方人员来进行检查。

* Concatenate design tools to general **design flows** which can be managed
* See what doesn’t work and start over

<div align = center><img src="https://cdn.hobbitqia.cc/20240817181108.png" width=25%></div>

### Basic Design Abstraction

<div align = center><img src="https://cdn.hobbitqia.cc/20240817181443.png" width=50%></div>

* System Level
    * 高级行为的抽象算法描述（如 C 语言），不包括任何内部数据、时序的实现细节。
* Register Transfer Level(RTL)
    * 我们有一个 cycle accurate 的 model，接近于硬件实现。
    * 位向量的数据类型和操作，用来抽象 bit-level 的实现。
    * 顺序结构（如 if-then-else），用来支持建模复杂的控制流。
* Gate Level: Model on finite-state machine level
    * RTL 会被综合为门级描述，展示了我们如何拥有不同的逻辑数字门以及它们之间如何连接。
    * 将状态机转换成一组逻辑门，执行我们在 RTL 层面所写的布尔逻辑。
    * Various delay models for gates and wires.
    * 本课程会涉及到的最底层的层次。
* Transistor Level: Use compact models to enable accurate circuit simulation
    * 门是由晶体管或者单个器件构成的。如果我们有这些晶体管，并连接起来就可以构建一个门。
* Layout Level: Draw polygons to implement the devices and interconnect
    * 晶体管是一系列以特定方式生成的光刻掩模，随后他们会经历工业设计步骤，将物理转化为实际的电子器件，从而制造出晶体管。
* Mask Level: Create actual photo-masks for performing lithography during fabrication process.
    * 用于制造晶体管的实际掩模。

## Design Automation

我们有针对设计自动化各个层级的工具：

* Design: 
    * High-Level Synthesis (RTL / System level)
    * Logic Synthesis (RTL / System level)
    * Schematic Capture (Transistor Level)
    * Layout (Layout Level)
    * PCB Design
* Simulation:
    * Transistor Simulation
    * Logic Simulation
    * Hardware Emulation
    * Technology CAD
    * Field Solvers
* Validation:
    * ATPG
    * BIST
* Analysis and Verification:
    * Functional Verification
    * Clock Domain Crossing
    * Formal Verification
    * Equivalence Checking
    * Static Timing Analysis
    * Physical Verification
* Mask Preparation:
    * Optical Proximity Correction (OPC)
    * Resolution Enhancement Techniques
    * Mask Generation

!!! Info "EDA in this course"
    * RTL
        * Verilog
    * Synthesis
        * Cadence Genus
    * Place and Route
        * Cadence Innovus
        * Static Timing Analysis – Tempus
        * Power Estimation – Voltus
        * Parasitic Extraction – QRC
        * Clock Tree Synthesis - CCOpt
    * Logic Simulation
        * Cadence Incisive

## Chip Design Flow

<div align = center><img src="https://cdn.hobbitqia.cc/20240817225044.png" width=30%></div>

* Definition and Planning
    * Marketing Requirements Document (MRD)
    * 确定芯片的架构，如带宽，功耗范围，面积范围，软硬件划分等等。
    * 设计文档，确定 Floorplan 需求，用什么工艺，找什么 Foundry。
        * 通常将芯片整体规划，内部数字、模拟电路的位置、面积、形状等特征的规划称为版图布局规划（FloorPlan）。连接关系最初并不一定能确定，在研发过程中经常会调整 FloorPlan 规划。
* Design and Verification (Frontend)
    * RTL 设计
    * IP 集成：分为软核和硬核。
        * Hard IP：以预先存在的布局形式（Layout）提供的，通常包括时序模型、布局抽象、行为模型（Verilog/VHDL）、有时还包含 Spice 模型和完整的布局。如 RAMs, ROMs, PLLs.
        * Soft IP：以 RTL 代码的形式提供，这些代码可以用硬件描述语言编写。很多时候为了保护 IP 的知识产权，供应商可能会对 RTL 代码进行加密。
    * 功能验证分为单元验证、子系统验证、SoC 层面的验证（Chip (SOC) level）。
    * 验证阶段有仿真验证，形式验证，FPGA 原型验证，硬件仿真器等。
        * FPGA Prototyping 会综合到 FPGA 上并进行验证。
* Logic Synthesis (Frontend and Backend)
    * 输入有 Technology library 文件、RTL 文件、约束文件（SDC）、DFT 定义；输出为 Gate-level netlist 门级网表。
    * 会经过 Synthesis->Mapping->Optimzation->Post Synthesis checks
        * Synthesis: 将 RTL 转换为通用逻辑网表。
        * Mapping: 将通用逻辑网表映射到核心库中的标准单元格（standard cell）。
        * Optimzation: 满足 Timing/Area/Power 约束。
        * Post Synthesis checks: 进行门级仿真、形式化验证（Logic Equivalence）、静态时序分析（STA）、Power/Area 估计。
* Physical Design (Backend): 可以简单理解为布局布线，IC 后端。
    <div align = center><img src="https://cdn.hobbitqia.cc/20240818134123.png" width=50%></div>
    <div align = center><img src="https://cdn.hobbitqia.cc/20240818134136.png" width=50%></div>

* Signoff and Tapeout
    * 当后端完成版图以后，需要经过时序和功耗检查，合格才能交给 Foundry，这种检查叫做 SignOff 检查。
    * 在 SignOff 合格以后，需要将最终网表和延迟信息提供给验证人员，进行后仿真（Post-layout Gate-level Simulation）。
* Silicon Validation