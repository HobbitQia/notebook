---
counter: True  
---

# Relational Model

## Structure of Relational Databases

### Concepts 

Formally, given set $D_1, D_2, \ldots, D_n$ a **relation** $r$ is a subset of $D_1\times D_2\times \ldots D_n$.  
Thus a relation is a <u>set</u> of n-tuple $(a_1,a_2,\ldots,a_n)$ where each $a_i\in D_i$.  

$A_1,A_2,\ldots,A_n$ are **attributes**. $R=(A_1,A_2,\ldots,A_n)$ is a **relation schema**.  
***e.g.*** instructor = (ID, name, dept_name, salary).  

A **relation instance** $r$ defined over schema R is denoted by $r(R)$. 

因为关系是一个集合，所以关系都是无序的。

### Attributes

* The set of allowed values for each attribute is called the domain (域)of the attribute
* Attribute values are (normally) required to be **atomic** (原子的); that is, indivisible
* The special value **null** (空值) is a member of every domain

## Database Schema

* **Database schema** -- is the logical structure of the database.
* **Database instance** -- is a snapshot of the data in the database at a given instant in time. 


!!! Example 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303061658549.png" width = 60%/> </div>   

    schema 是抽象的定义, instance 是具体的实例。  

## Keys

Let $K\sube R$   

* $K$ is a **superkey (超键)** of $R$ if values for K are sufficient to identify (唯一确定) a unique tuple of each possible relation $r(R)$  
***e.g.*** $\{ID\}$ or $\{ID, name\}$
* **Superkey** $K$ is a **candidate key (候选键)** if $K$ is minimal.  
即 $K$ 中没有冗余属性  
* One of the candidate keys is selected to be the **primary key (主键)**.
* **Foreign key** (外键) Relation $r_1$ may include among its attributes the primary key of another relation $r_2$. This attribute is called a **foreign key** from $r_1$, referencing $r_2$.  
类似于指针，外键限制就是关系 $r_1$ 引用的主键必须在关系 $r_2$ 中出现。

    ??? Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303061706866.png" width = 60%/> </div>   

        左侧表的老师 ID 必须出现在右侧表中。

    ??? Info "Why we need foreign key constraint?"
        数据库是支持由完整约束条件定义出来的，并维护完整性约束条件。则当我们定义外键后，上述例子中黄色条目是不会出现的。
    
* Referential integrity (参照完整性)  
类似于外键限制，但不局限于主键。  

    ??? Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303061802181.png" width = 60%/> </div>   
    
        这里 $time_slot_id$ 并不是关系 $r_2$ 的主键，所以这里不是外键限制。

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303061811248.png" width = 70%/> </div>   

    * course 指课程信息，无论是否开课，都会有其定义。
    * section 表示教学班，真正开课时就有相应的实例。（类比于高铁的列车号，和每天对应的班次）
    * teachers 具体教哪个教学班的老师
    * takes 表示学生注册课程
    * time_slot 表示一门课的具体上课时间段，如数据库在周一 3, 4, 5 节; 周一 7, 8 节。
    * 上图中红线表示引用完整性的约束；黑线表示外键约束。

## Relational Algebra

Six basic operators

* select: $\sigma$  
* project: $\Pi$
* union: $\cup$
* set difference: $-$ 
* Cartesian product(笛卡尔积): $\times$
* rename: $\rho$

### Select

$\sigma_p(r)=\{t|t\in r\ and\ p(t)\}$  , where $p$ is called **selection predicate**.  

??? Example "Select Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062231578.png" width = 40%/> </div> 

### Project

The **project** operation is a unary operation that returns its argument relation, with certain attributes left out.    
$\prod_{A_1,A_2,\ldots, A_k}(r)$ where $A_i$ are attribute names and $r$ is a relation name.   

The result is defined as the relation of k columns obtained by erasing the columns that are not listed. 会对结果进行去重。  

??? Example "Projection Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062230169.png" width = 40%/> </div> 

### Union

The **union** operation allows us to combine two relations.  
$r\cup s = \{t| t\in r \ or \ t\in s\}$  

* $r$ and $s$ must have the same **arity (元数)** (same number f attributes)  
* The attribute domains must be **compatible**   
当属性有关联类型时，对于每个输入 $i$, 两个输入关系的第 $i$ 个属性的类型必须相同。  

??? Example "Projection Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062249200.png" width = 40%/> </div> 

### Set Difference

The **set-difference** operation allows us to find tuples that are in one relation but are not in another.   
$r-s=\{t|t\in r\ and\ t\notin s\}$  

Set differences must be taken between **compatible** relations.

??? Example "Projection Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062249700.png" width = 40%/> </div> 

### Cartesian-Product

The **Cartesian-product** operation (denoted by $\times$)  allows us to combine information from any two relations.    
$r\times s  =\{t\ q|t\in r\ and\ q\in s\}$  

??? Example "Projection Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062253406.png" width = 40%/> </div> 

### Rename=n

Allows us to refer to a relation by more than one name.  
$\rho_X(E)$

??? Example "Composition of Operations 1"
    Find the names of all instructors in the Physics department, along with the course_id of all courses they have taught.  

    <div align=center> <img src="http://cdn.hobbitqia.cc/202303062306317.png" width = 50%/> </div>   

    这两条语句含义一样，但第二条我们先进行了一次 select, 条目少了更高效。  

??? Example "Composition of Operations 2"
    Find the largest salary in the university.  

    * find instructor salaries that are less than some other instructor salary (**i.e.** not maximum)  
    using a copy of instructor under a new name $d$.   
    $\prod_{instructor.salary}(\sigma_{instructor.salary<d.salary}(instructor \times \rho_d(instructor)))$  
    * find the largest salary  
    $\prod_{instructor}-\prod_{instructor.salary}(\sigma_{instructor.salary}<d.salary(instructor\times \rho_d(instructor)))$  

    我们第一步将两个关系拼起来之后，限定 instructor 的工资小于 d, 随后投影我们就可以获得所有不是最大值的薪水。（因为任何不是最大值的薪水都会在笛卡尔积 select 后至少存在一个元组，这样投影之后仍会存在。但最大值就不会有元组存在），最后用全集减掉即可。

### Additional Operations

* Set intersection: $r \cap s$ 
* Natural join:  $r\bowtie s$
* Assignment: $\leftarrow$
* Outer join : $r \rtimes       s$,  $r  \ltimes    s$, $r$⟗$s$
* Division Operator: $r \div s$ 

#### Set-Intersection

The **set-intersection** operation allows us to find tuples that are in both the input relations.  
$r\cap s=\{t| t\in r\ and\ t\in s\}$  

* $r, s$ have the same arity 
* attributes of $r$ and s are compatible


??? Example "Set-Intersection Operation Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072149842.png" width = 40%/> </div> 

#### Natural-Join Operation

Let r and s be relations on schemas R and S respectively.  Then,  $r\bowtie     s$ is a relation on schema $R \cup S$ obtained as follows:

* Consider each pair of tuples $t_r$ from $r$ and $t_s$ from $s$.  
* If $t_r$ and $t_s$ have the same value on each of the attributes in $R \cap S$, add a tuple $t $ to the result, where
    * $t$ has the same value as $t_r$ on $r$
    * $t$ has the same value as $t_s$ on $s$

即共同属性要有相同的值，才能在拼接后的结果中保留。  
对乘法的扩展，相当于先 $\times$ 再 select, 最后 project.  

??? Example "Natural Join Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072155154.png" width = 40%/> </div> 

* **Theta Join**  
$r\bowtie_\theta s=\sigma_\theta (r\times s)$  
条件连接

#### Outer Join

Computes the join and then adds tuples form one relation that does not match tuples in the other relation to the result of the join.   

Uses *null values*:
* **null** signifies that the value is unknown or does not exist 
* All comparisons involving null are (roughly speaking) false by definition

Outer join can be expressed using basic operations.  
* $r\rtimes s=(r\bowtie s)\cup (r-\cap_R(r\bowtie s)\times \{null,\ldots,null\})$
* $r\ltimes s=(r\bowtie s)\cup \{null,\ldots,null\}\times (s-\cap_R(r\bowtie s))$
* $r$⟗$s$ $=(r\bowtie s)\cup (r-\cap_R(r\bowtie  s))\times \{(null, \ldots)\}\cup\{(null,\ldots,null)\}\times (s-\cap_s(r\bowtie s))$

??? Example "Outer Join Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072200423.png" width = 40%/> </div> 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072200997.png" width = 40%/> </div>  

#### Semijoin  

$r\ltimes_\theta s$ 保留 $r$ 中能与 $s$ 相连的元组。

??? Example "Semijoin Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072212171.png" width = 40%/> </div> 

#### Division

Given relations $r(R)$ and $s(S)$, such that $S \sub R$, $r\div s$ is the largest relation $t(R-S)$ such that $t\times s \sube r$  

We can write $r\div s$ as  
$$
\begin{align*}
    temp1 & \leftarrow \Pi_{R-S}(r)\\
    temp2 & \leftarrow \Pi_{R-S}((temp1 \times s)- \Pi_{R-S,S}(r))\\
    result & = temp1 - temp2
\end{align*}
$$

??? Example "Division Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072217412.png" width = 40%/> </div> 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072217774.png" width = 40%/> </div> 

### Aggregate Functions and Operations

* **Aggregation function**（聚合函数）takes a collection of values and returns a single value as a result.  
    * *avg*: average value
    * *min*: minimum value
    * *max*: maximum value
    * *sum*: sum of values
    * *count*: number of values

* **Aggregate operation** in relational algebra $G_1,G_2,\ldots,G_n \mathcal{G}_{F_1(A_1),\ldots F_n(A_n)}(E)$  

!!! Example "Aggregate Operation Example"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303072224552.png" width = 50%/> </div> 

分组结果没有名字，可以用 rename 或者 as 进行改名。  
***e.g.*** `dept_name G avg(salary) as avg_sal (instructor)`

### Multiset Relational Algebra

关系代数中，我们要求关系要是一个严格的集合。  
但实际数据库中并不是，而是一个多重集，允许有重复元素存在。  
因为一些操作的中间结果会带来重复元素，要保持集合特性开销很大，因此实际操作中不会去重 。 

## SQL and Relational Algebra

* `select A1, A2, ... An from r1, r2, ... rm where P` is equivalent to $\Pi_{A_1,\ldots, A_n}(\sigma_P(r_1\times r_2\ldots r_m))$ 
* `select A1, A2, sum(A3) from r1, r2, ... rm where P group by A1, A2` is equivalent to $A_1, A_2 \mathcal{G} sum(A_3)(\sigma_P(r_1\times r_2\times\ldots r_m))$  
这里按 $A_1,A_2$ 分组，那么结果的表中会有 $A_1,A_2,sum(A_3)$ 三列（分组依据+分组后的聚合结果），这里我们需要的就是这三列，所以分组即可。但是假设我们只需要 $A_1, sumA3$ 那么最后还需要投影。
 