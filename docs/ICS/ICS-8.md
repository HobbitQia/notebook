
# Chapter 8 Data Structures

!!! Abstract
    Covered in Lecture 6, 2022.7.16 and Lecture 7, 2022.7.18  
    Topics:  
    1. Stack
    2. Subroutine
    3. Linked-List
    4. Queue(self-learning)
    5. Character Strings  
    6. Recursion

## The Stack

We say the stack is an *abstract data type*.  
The concept of a stack has nothing to do with how it is implemented. The concept of a stack is the specification of how it is to be accessed: **Last In, First Out, or LIFO**.

### Implementaions

![stack.png](https://s2.loli.net/2022/07/19/veGzElbIUDuWaHS.png)

**Stack pointer**: keeps track of the top of the stack. We use R6 to contain the address of the top of the stack.

Note that elements that were popped are still present in memory. However, those values cannot be accessed from memory, as long as every access to memory is controlled by the stack mechanism.  
When values are pushed and popped to and from a stack implemented in sequential memory locations, the data already stored on the stack does not physically move.  

#### Push

We say we *push* an element onto the stack when we insert it.

```
PUSH    ADD R6, R6, #-1
        STR R0, R6, #0
```

!!! Info "Overflow"
    If we run out of available space, we cannot store the value, which is called *overflow* situation.
    ```
    PUSH    LD R1, MAX  ;MAX <-- negative of the top of the stack.
            ADD R2, R6, R1
            BRz OVERFLOW
            ;
            ADD R6, R6, #-1
            STR R0, R6, #0
            RET
    ```

#### Pop

We say we *pop* an element from the stack when we remove it.

```
POP     LDR R0, R6, #0
        ADD R6, R6, #1
```

!!! Info "Underflow"
    Poping items that have not been previously pushed results is called *underflow* situation.
    ```
    POP     LD R1, EMPTY  ;EMPTY <-- negative of the bottom of the stack.
            ADD R2, R6, R1
            BRz OVERFLOW
            ;
            LDR R0, R6, #0
            ADD R6, R6, #1
            RET
    ```

## Subroutine

It is often useful to be able to invoke a program fragment multiple times within the same program without having to specify its details in the source program each time it is needed. Such program fragments are called **subroutines**, or alternatively, procedures, or in C terminology, functions.

### JSR & JSRR

The instruction `JSR` and `JSRR` loads the PC by the addressing mode, then it will **save the return address in R7(incremented PC).**

![opcode.png](https://s2.loli.net/2022/07/19/fBcpMIOnk2L8y7D.png)

* opcode: bit[15:12], 0100 for both `JSR` and `JSRR`.
* Addressing mode: it depends on bit[11].
  * **JSR**: bit[11]=1, it uses PCoffset11.
    bit[10:0] will be signed extension
  * **JSRR**: bit[11]=0, it uses BaseR. bits[8:6] identifies the Base Register and the the other bits is 0(offset is set to 0).

### The Call/Return Mechanism

<img src="https://s2.loli.net/2022/07/19/bdTVmnu2GeI8WPq.png" style="zoom:50%;" />  

* **caller**: The program contains the call(i.e. `JSR(R)`).
* **callee**: The subroutine that contians the return(i.e. `JMP R7`).

### Saveing and Restoring Registers

* **caller save**: the calling program saves the restores the registers.  
* **callee save**: the subroutine saves and restores the registers.

## Character Strings

ZEXT the characters in ASCII and place them in sequential memory. End with x0000.

![QQ图片20220724220614.png](https://s2.loli.net/2022/07/24/9ROiEMtH1VNY5as.png)

## Linked-Lists
