
# Chapter 1 Introduction

!!! Abstract
    Covered in Lecture 1 2022.7.11
    Topics:  
    1. Two major themes: Abstraction and Hardware vs Software  
    2. A computer system  
    3. Level of Transfomation

## Two major themes

### Abstraction  

Too much or too tedious **low-level details** are abstracted into **high-level interfaces** that are easy to understand and use, thereby improving **efficiency.**

!!! Example
    You get in a taxi and you tell the driver to go to the airport. By contrast you can tell the driver each step like making a right turn, going down this street ten blocks and so on, which is not efficienct at all. However if you just tell him to go to the airport, then things are done.

There is an underlying assumption, **when everything about the detail is just fine.**  
If we want to combine multiple components into a larger system, we should be careful about the components below the abstractions.  

### Hardware vs Software  

Both are important.

## A computer system  

* CPU : operating data  
* MEM : storage or memory  
* Input & output devices （I/O)  
  * Input: By typing input informations to CPU(keyboard)  
  * Output: Show the outcome done by CPU on monitor  

## Level of Transfomation

problem(in natural languages)->electrons  
by a sequence of transformation called level of transformation  

|     Problem (Natural language)    |
| :-------------------------------: |
|  Algorithm (eliminate ambiguity)  |
|    Program (Python, C++, ...)     |
| Instruction set architecture(ISA) |
|        Micro-architecture         |
|           Logic circuit           |
|        Electronic circuit         |
|             Electrons             |

### problem  

Natural languages may have ambiguity.  

!!! Example
    "安" can mean peace(a woman in a house.), safety(公安 police), contentment while it can also mean inexpensive, cheap in Japenese.  
    “东西” means direction east and west, while it also means item, which may cause ambiguity.
However, The statement of the problem should have **No Ambiguity**.  
  
### Algorithm  

Algorithm is a procedure step by step.

* definite, means no ambiguity.  
* effective computability(可行的), means every step can be successfully carried out.  
* finiteness, means the procedure will terminate.  

### programs  

Transform the algorithm into a computer program in one of the programming languages precisely.  

* high-level languages: they are independent of the computer
on which the programs will execute. We say the language is“machine independent.(Python, C++,...)  
* low-level languages: they are tied to the computer on which the programs will execute. There is generally one such low-level language for each computer. That language is called
the assembly language for that computer.(x86)

### Instruction Set Architecture(ISA)  

ISA is the interface between software(program) and hardware.  

!!! Example
    汽车的 ISA 就是人需要知道他能让车做什么，以及车需要做到人指定的任务的规范。  
    对于一辆车的踏板，人知道如果他踩下去，那么这辆车会刹车。车知道如果踏板受到了压力，车的硬件会让车停下。ISA 的作用就是将人踩刹车和车停下对应起来。
***e.g.*** x86(1979 8086, 286, 386, 486), Power-PC, Sparc  
ISA contains:

* opcode: is used to describe operation  
* data type: a representation of **operand**.  
* addressing mode: mechanism that computer can use to find the address of the operands.(寻址模式)  
* Address ability: how many bytes per memory-slot

### Microarchitecture  

!!! Example
    所有的汽车都有相同的 ISA，例如所有的汽车中三个踏板的定义完全相同，即中间的是刹车、右边的是油门、左边的是离合器。
    而将 ISA 实现的具体组织（微结构）是指车盖板下的“内容”。所有的汽车，其制造和模型都不尽相同，这取决于设计者在制造之前所做的权衡决策，如有的制动系统采用刹车片，有的采用制动鼓；有的是八缸发动机，有的是六缸，还有的是四缸；有的有涡轮增压，有的没有。我们称这些差异性的细节为一个特定汽车的“微结构”，它们反映了设计者在成本和性能之间所做的权衡决策。
***e.g.*** 对同样指令集 x86, 他的微结构从 8086, 80286, 80386, 80486...直到如今的的 Skylake.

!!! Note
    ISA 将我们的程序(language)转化为 01 字符串(类似于汇编中的机器码 如E8 01代表jmp)，而微结构是其对应的物理实现(电路)。
    因此对于同样的 01 字符串，其实现的功能相同，但可以有各种不同的物理实现；但一套微结构只能实现一类 ISA.
    ——by tsjj

Logic Circuit and devices will be discussed later.
