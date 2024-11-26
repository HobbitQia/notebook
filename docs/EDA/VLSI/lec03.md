---
counter: True   
---

# Logic Synthesis

## Introduction

* 什么是 logic synthesis 逻辑综合？
    * **Synthesis** is the process that converts RTL into a technology specific gate-level netlist, optimized for a set of pre-defined constraints.
    * 输入包括一个行为级 RTL 设计、一个 standard cell library 标准单元库，一组设计约束。
    * 输出包括一个映射到标准单元库的 gate-level netlist 门级网表。（例如对 FPGA 来说，是用 LUTs，flip-flops 和 RAM blocks）

        <div align = center><img src="https://cdn.hobbitqia.cc/20241126160722.png" width=50%></div>

    ??? Example "Logic Synthesis"
        将 FSM 转为目标电路：
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126160837.png" width=80%></div>

* Motivation: 为什么需要逻辑综合？
    * 可以自动管理很多设计流程中的细节：
        * Fewer bugs。
        * Improve productivity，不用手工绘制门电路或者逻辑。
        * 将设计数据（HDL 描述）从特定的实现 technology 中抽象出来。
        * Designs can be re-synthesized targeting different chip technologies，即设计可以在不同工艺之间进行迁移。
    * 有时可以带来比人工设计更优的结果。

    ??? Example
        如下图，这里的 `!s0 && s1 || s0` 实际上可以直接由一个 OR 门实现。这个提取的过程可以由逻辑综合工具自动完成。
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126161321.png" width=80%></div>

* 逻辑综合的目标：
    * Minimize area
        * In terms of literal count, cell count, register count, etc.
    * Minimize power
        * In terms of switching activity in individual gates, deactivated circuit blocks, etc.
    * Maximize performance
        * In terms of maximal clock frequency of synchronous systems, throughput for asynchronous systems
    * Any combination of the above
        * Combined with different weights
        * Formulated as a constraint problem ***e.g.,*** 在时钟频率 > 300MHz 的情况下最小化面积
    * More global objectives
        * Feedback from layout

* How does it work?
    * Instantiation 实例化：维护一个 primitive modules 的库（如 AND, OR...）以及用户定义的模块。***e.g.,*** 当 verilog 中有 OR 时，就在综合工具中选择 OR primitive 进行绑定。
    * Macro expansion/substitution: 综合工具将 HDL 中的高级语言操作符（如 +, -, 布尔运算符）和构造（如 if-else、case）展开成特定的电路。
    * Inference: special patterns 会被检测并进行特殊处理。***e.g.,*** `always@(posedge clk)` 会生成一个 FSM。
    * Logic optimization: 在读取设计并转为某种内部数据库之后，利用 logic minimization 技术（如卡诺图）对布尔运算分组、优化。
    * Structural reorganization: 结构重组包括高级技术，如 sharing of operators、retiming of circuits。

* "Basic Synthesis Flow"
    <div align = center><img src="https://cdn.hobbitqia.cc/20241126161321.png" width=80%></div>
    https://cdn.hobbitqia.cc/20241126163123.png

    * Syntax Analysis: 语法分析，读入 HDL 文件，检查语法错误。`read_hdl–verilog sourceCode/toplevel.v`
    * Library Definition: 库定义，提供标准单元库和 IP 库。`read_libs “/design/data/my_fab/digital/lib/TT1V25C.lib”`
    * Elaboration and Binding: 展开和绑定，将 RTL 转为布尔结构，并进行优化（state reduction、encoding、register infering...），并将无法进一步优化的 leaf cell 绑定到标准单元库或者实际 IP。` elaborate toplevel`
    * Constraint Definition: 约束定义，定义时钟频率和其他设计约束。`read_sdc sdc/constraints.sdc`
    * Pre-mapping Optimization: 将 RTL 代码中的逻辑表达式映射到通用的逻辑单元。`syn_generic`
    * Technology Mapping: 将通用的逻辑单元映射到目标技术库中的标准单元。（从 technology independent 到实际的 std cells）`syn_map`
    * Post-mapping Optimization: 对映射后的电路进行优化，包括时序、面积等。`syn_opt`
    * Report and export: 在综合完成后，综合工具会生成一份详细的报告，包括综合结果、时序分析、面积估计等。`report timing –numpaths 10 > reports/timing_reports.rpt`, `write_hdl> export/netlist.v`

## Compilation

在综合之前，我们需要检查 RTL 代码的语法正确性。需要注意的是，综合和编译是两个不同的过程：

* Compiler 
    * Recognizes all possible constructs in a formally defined program language
    * Translates them to a machine language representation of execution process
* Synthesis
    * Recognizes a target dependent subset of a hardware description language
    * Maps to collection of concrete hardware resources
    * Iterative tool in the design flow

可以使用 `ncvlog <filename.v>` 进行编译以实现语法检查。

## Library Definition

The library definition stage tells the synthesizer where to look for **leaf cells** for binding and the **target library** for technology mapping.

* Leaf cells: 在综合过程中，叶子单元是指那些没有子节点的单元，它们通常是综合过程中最基础的单元。
* Target library: 工艺映射时会将 RTL 代码映射到实际的硬件单元的过程，因此综合工具需要知道目标库中的哪些单元可以用于映射。
* 我们可以通过提供一个 paths 的列表来提供库的位置，如 `set_db init_lib_search_path “/design/data/my_fab/digital/lib/”`，以及我们可以提供特定库的名字，进行读取 ` read_libs “TT1V25C.lib”`。

!!! Info "Library"
    准单元库类似于乐高积木，它们必须满足预定义的规格要求，以便综合、布局、布线等 EDA 工具能够无误地操作它们。可以理解为 Libray 就是蕴含了一套特定的信息的库（或文件），EDA 工具可以基于这套信息做出不同的规划决策。

!!! Example
    一个与非门，其包含了 cell 的高度，宽度，Voltage rails 电压轨，Well 阱、引脚放置、PR 边界、金属层等信息。
    <div align = center><img src="https://cdn.hobbitqia.cc/20241126184612.png" width=35%></div>

    * 这里的 PR 边界不是整个 cell，因为 VDD 和 GND 可以与其他 cell 共享。
    * 理想情况下，标准单元应该完全在 Metal1（M1）层上布线，完全在M1层上布线可以减少布线延迟。（实际上由于大小和布局限制，可能需要其他金属层布线）。

* 标准单元库里的 cells:
    * Combinational logic cells (NAND, NOR, INV, etc.):
        * Variety of drive strengths for all cells. cell 里有 output buffer，可以驱动不同的输出电压。
        * Complex cells (AOI, OAI, etc.)
        * Fan-In <= 4，即输入端口数不超过 4，否则 CMOS 工艺难以处理。
        * ECO (Engineering Change Order) Cells: 易于更改的单元，用于在设计过程中进行快速的修改。
    * Buffers/Inverters
        * Larger variety of drive strengths. 
        * “Clock cells” with balanced rise and fall delays.
        * Delay cells: 提供固定的延迟时间的单元，用于时序调整。
        * Level Shifters: 用于将信号从一个电压电平转换到另一个电压电平的单元。
    * Sequential Cells
        * Many types of flip flops: pos/negedge, set/reset, Q/QB, enable，各种类型的触发器。
        * Latches
        * Integrated Clock Gating cells: 集成时钟门控单元，在时钟信号到达时才激活存储单元。
        * Scan enabled cells for ATPG
    * Physical Cells
        * Fillers, Tap cells, Antennas, DeCaps, EndCaps, Tie Cells
* Multiple Drive Strengths and VTs
    * 即使是同样的元件，不同的尺寸也有着不同的驱动强度。更大的驱动能力强，但是对应的面积和 leakage 泄露功耗也更大。通常用 X1, X2 或者 1X 2X 来表示相对大小。
    * Multiple Threshold (MT-CMOS): CMOS 工艺允许添加一个额外的 mask 来改变 threshold voltage 阈值电压。这样可以 trade-off 泄露电流和速度。

!!! Tip 
    我们不需要对 cell 了解的很清楚，而是针对我们使用的工具和执行的操作，明确我们需要什么信息。

### Clock Cells

* General standard cells are optimized for **speed**.
    * 但他们的延时不一定平衡（rise != fall）。
    * 这样会带来 clock skew，即时钟信号在不同的地方到达时间不同。
* 我们有特殊的 clock cells，有 balanced rising/falling delays 来最小化 skew。
    * 但这些 cells 对于数据的优化并不是最好的，因此应该避免在数据传输的单元上使用数据传输路径。
    * 通常，我们只在 buffers/inverters 上使用 clock nets。
    * 特殊的 Integrated Clock Gating 集成时钟门控可以用于时钟网络上的门控逻辑。

### Sequentials

* 时序单元，包括 Flip Flops 触发器和 Latches 锁存器。
* 他们提供了多种选项：
    * Positive/Negative Edge Triggered
    * Synchronous/Asynchronous Reset/Set
    * Q/QB Outputs
    * Enable
    * Scan
    * etc.

### Level Shifters

* 是一种 buffer，可以进行电压域的转换。
* HL (high-to-low) shifter
    * Requires only one voltage
    * Single height cell
* LH (low-to-high) shifter
    * Needs 2 voltages
    * Often double height

<div align = center><img src="https://cdn.hobbitqia.cc/20241126192725.png" width=55%></div>

### Filler and Tap Cells

* Filler cells Must be inserted in empty areas in rows. 
    * 用于填充空的地方。为了确保布局的完整性和性能。
    * 有时需要在行的边界处使用特殊的单元 End Caps Cells，端帽单元的作用是填充行之间的空隙，并提供额外的电气连接。
    * 还有在 VDD 和 GND 中间填充的 MOSCAPs 电容器，称为 DeCAP cells 去耦电容，去耦电容单元有助于减少电源和地之间的噪声，从而提高电路的稳定性。

        <div align = center><img src="https://cdn.hobbitqia.cc/20241126194251.png" width=55%></div>

* Well Taps needed to ensure local body voltage.
    * 消除 latch-up，不用对每个 cell 都 tap。

### ECO Cells

* An Engineering Change Order (ECO) is a very late change in the design.   
    * P&R 之后通常需要 ECOs，但是重新流片或者 P&R 的代价很高。
* 解决方法：使用 Spare(Bonus) cells
    * 不带功能的单元，在设计的时候填充技巧怒。
    * 当出现问题的时候，可以重新赋予它们所需的功能。
* Special standard cells are used to differentiate from real cells.

??? Example 
    绿色的是 ECO cells，起初他们是没有功能的。如果左上角的绿色块旁边的 cell 出现了问题，我们可以把他的连线断开，练到 ECO cell 上，这样就代替了他的功能。
    <div align = center><img src="https://cdn.hobbitqia.cc/20241126194548.png" width=35%></div>

## Library Exchange Format (LEF)

<div align = center><img src="https://cdn.hobbitqia.cc/20241126194831.png" width=75%></div>

* Abstract description of the layout for P&R
    * Readable ASCII Format.
    * Contains detailed PIN information for connecting.
    * Does not include front-end of the line (poly, diffusion, etc.) data，即没有详细的引脚信息。

    ??? Example
        如图，这里包括了 cell 的轮廓（size 和 shape），pin 的位置和层（通常在 M1 层），金属障碍物（即这里被使用了不能在这里布线）
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126195144.png" width=25%></div>

    !!! Example "LEF"
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126195303.png" width=80%></div>
    
### Technology LEF

* Technology LEF: contain (simplified) information about the technology for use by the placer and route
    * Layers:
        * Name，如 M1, M2...
        * Layer type, 如 routing, cut（via，特殊类型，用于连接不同层）
        * Electrical properties（R,C），即电阻、电容
        * Design Rules, Antenna data, Preferred routing direction
    * SITE (x and y grid of the library)
        * COREsites are minimum standard cell size，最小单位。
        * Can have site for double height cells!
        * IOs have special SITE.
    * Via definitions
    * Units
    * Grids for layout and routing
* std cell 的高度用 Tracks 来衡量的。
    * A Track is one M1 pitch，例如 8-Track cell 有空间插入 8 条水平 M1 导线（可以在 VDD 和 GND 之间插入多少个 track 的 M1）。
    * 用 track 衡量的原因：track 越多，说明可以放更多的金属，晶体管更宽，那么 cell 更快。
        * 7-8 low-tracklibraries for area efficiency
        * 11-12 tall-tracklibraries for performance, but have high leakage
        * 9-10 standard-tracklibraries for a reasonable area-performance tradeoff

    ??? Example 
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126195144.png" width=30%></div>
        https://cdn.hobbitqia.cc/20241126200359.png

* Cells must fit into a predefined grid
    * 最小高度和宽度被称为 SITE，必须是最小 x-grid 单元和行高的倍数。

## Liberty Timing Model (.lib)

* `.lib` 文件，其包含单元的时序和功耗特性。这些文件用于静态时序分析（Static Timing Analysis, STA），以确保设计满足时序要求，并优化功耗性能。
* 目标：
    * 对于每个 timing arc，计算 propagation delay $t_{pd}$，以及 output transition $t_{rise}, t_{fall}$。基于 input net transition $t_{rise}, t_{fall}$ 和 output load capacitance $C_{load}$ 进行计算。

!!! Note
    每个 `.lib` 文件通常只针对一个特定的工艺条件，即 corner 角点。例如，一个 `.lib` 文件可能会包含在 25°C 温度、标准工艺窗口和 1.2V 供电电压下的时序参数。另一个 `.lib` 文件可能会包含在 100°C 温度、最小工艺窗口和 1.2V 供电电压下的时序参数。

* Liberty 包含的时序数据内容：
    * Library:
        * General information common to all cells in the library. ***e.g.,*** 操作条件，线负载模型，查找表。
    * Cell:
        * Specific information about each standard cell. ***e.g.,*** 功能，面积。
    * Pin:
        * Timing, power, capacitance, leakage, functionality, etc. characteristics of each pin in each cell.

    ??? Example
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126204823.png" width=55%></div>

### Timing Models

* Non-Linear Delay Model (NLDM)
    * Driver model: 描述了驱动单元的时序行为，包括驱动单元的输出电容、输出电阻等，例如使用一个斜坡电压源和一个固定的驱动电阻来模拟驱动单元的时序行为。
    * Receiver model: 描述了接收单元的时序行为，包括接收单元的输入电容、输入电阻等，例如使用最小/最大上升/下降输入电容来模拟接收单元的时序行为。
    * NLDM 模型有一些局限性，它不建模电容随信号过渡过程中的变化，因此在超过 130nm 工艺节点时可能会失去准确性。

    ??? Example "NLDM"
        对每个元件，我们有三张表，横纵坐标分别是输入延时和输出电容，表格中的时间是延时。$t_{pd}=f(t_{input}, C_{load})$。给定输入延时和输出电容，我们可以查表并进行插值得到结果。
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126205114.png" width=65%></div>

* Current Source Models (CCS, ECSM)
    * Model a cell's nonlinear output behavior as a current source
    * Driver 模型是 nonlinear current source，Receiver 模型是 Changing Capacitance 可变电容。

    ??? Note
        <div align = center><img src="https://cdn.hobbitqia.cc/20241126205652.png" width=60%></div>

### Wire Load Models

* Wire Load Models 是 `.lib` 文件中描述电源和地网络特性的模型。包括电阻和电容，来模拟电源和地网络的传播延迟，这些延迟会影响信号在电源和地网络上的传播时间。
* 基本方法是根据 fanout 来查表估算电阻电容，但是这样可能会不准确。

    <div align = center><img src="https://cdn.hobbitqia.cc/20241126205844.png" width=80%></div>

### Physical-Aware Synthesis

* wireload models 准确度不高，反之可以在综合的时候使用物理信息。
*  Physical-Aware Synthesis 物理感知综合基本上在综合器内部运行布局，以获得更准确的寄生估计。可以在没有 floorplan 的情况下，仅使用 `.lef` 文件进行操作。在第一次迭代后，可以将 floorplan `.def` 文件导入综合器，以进一步优化设计。`syn_opt-physical`