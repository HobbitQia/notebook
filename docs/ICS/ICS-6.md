---
counter: True  
---

# Chapter 6 Programming

!!! Abstract
    Covered in Lecture 6, 2022.7.16  
    Topics:    
    1. Structured Programming    
    2. Debugging

## Structured Programming

The larger tasks are systematically broken down into smaller ones, which is called *systematic decomposition.*  
There are basically 3 constructs for doing this.  

* sequential construct: carry out the first subtask completey, *then* go to the second. Never go back.
* conditional construct: the task consists of doing one of 2 subtasks but not both, depending on some condition.
* iterative construct: the task consists of doing a subtask a number of times as long as some condition is true.

![construct.png](https://s2.loli.net/2022/07/17/1Ie6Wg7NyfPE9Dt.png)  

![code.png](https://s2.loli.net/2022/07/17/eJ5HnxMOPZ31EwW.png)

## Debugging

The debugging program should be able to

* Write values into memory locations and registers.  
* Execute instruction sequences in a program.  
* Stop execution when desired.  
* Examine what is in memory and registers at any point in the program.  

common errors:

* incorrectly setting the loop times.  
* confusing LDI and LD.  
* forgetting the CC so BR tests the wrong condition.  
* corner cases.
