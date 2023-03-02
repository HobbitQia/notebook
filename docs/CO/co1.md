
## 8 Ideas in Computer Architecture

* Moore's Law  
The integrate circuit resource double every 18-24 months.
* User abstraction to simplify design  

    * Lower-level details are hidden to higher levels 
    * Instruction set architecture -- the interface between HW and SW. 
* Make the common cases fast
* Performance via Parallelism
* Performance via Pipelining 
* Performance via Prediction
* Hierarchy of memory
* Dependability via redundancy

<div align=center> <img src="http://cdn.hobbitqia.cc/202303011121549.png" width = 55%/> </div>  


## Performance

* **Response time**: How long it takes to do a task.  
* **Throughput (吞吐量)**: Total work done per unit time.  

Define $Performance = \dfrac{1}{Execution\ Time}$  

### Execution time 

* Elapsed Time  
Total response time, including all aspects ***e.g.*** Processing, I/O, OS overhead, idle time.  
* CPU Time    
Discounts I/O time, other jobs’ shares  
这里我们只考虑 CPU 时间

### CPU Clocking 

* Clock period: duration of a clock cycle.  
用时钟周期代替具体的秒数。 
* Clock frequency(rate): cycles per second.  

$$
\begin{align*} 
CPU\ Time &= CPU\ Clock\ Cycles \times Clock\ Cycle\ Time \\
&=\dfrac{ CPU\ Clock\ Cycles}{Clock\ Rates}
\end{align*}
$$ 

Performance improved by
* Reducing number of clock cycles
* Increasing clock rate
* Hardware designer must often trade off clock rate against cycle count

$$
\begin{align*}
Clock\ Cycles &= Instruction\ Count \times Cycles\ per\ Instruction(CPI)\\
CPU\ Time & = Instruction\ Count \times CPI\times CPI\ Cycle\ Time\\
& = \dfrac{Instruction\ Count \times CPI}{Clock\ Rate}
\end{align*}
$$

CPI is determined by CPU hardware.  
如果不同指令有不同的 CPI, 我们可以用 Average CPI. 

综上, $CPU\ Time = \dfrac{Instructions}{Program}\times \dfrac{Clock\ Cycles}{Instruction}\times \dfrac{Seconds}{Clock Cycle}$ 

Performance depends on  

* Algorithm: affects IC, possibly CPI
* Programming language: affects IC, CPI
* Compiler: affects IC, CPI
* Instruction set architecture: 