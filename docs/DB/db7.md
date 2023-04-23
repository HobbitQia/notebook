---
counter: True  
---

## Relational Database Design

### Introduction

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101020540.png" width = 60%/> </div>

    What about combining instructor and department?
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101025324.png" width = 60%/> </div>

Pitfalls of the “bad” relations

* Information repetition (信息重复)
* Insertion anomalies (插入异常)
* Update difficulty (更新困难)

数据之间存在着隐含的函数约束关系，知道了 id 就可以决定其他元素。 ***e.g.***  id $\rightarrow$ name, salary, dept_name; dept_name $\rightarrow$ building, budget  
产生冗余的原因是 dept_name 决定了部分属性，但他却不是这个表的 primary key.  
好的关系：只有 candidate key 能决定其他属性。  
拆表后要有重叠的属性，否则无法拼接回去。这里的公共属性必须是分拆出一个关系模式的 primary key, 这是无损（没有信息损失）连接。

!!! Example "lossy decomposition"
    `employee(ID, name, street, city, salary)` $\rightarrow$ `employee1 (ID, name)` and `employee2 (name, street, city, salary)`
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101030646.png" width = 60%/> </div>

??? Example "Example of Lossless-Join Decomposition "
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101032602.png" width = 60%/> </div>

####  Lossless-join Decomposition

Let $R$ be a relation schema and let $R_1$ and $R_2$ form a decomposition of $R$. That is $R = R_1  \cup R_2$. 

We say that the decomposition is a **lossless decomposition** if there is no loss of information by replacing  R with the two relation schemas $R = R_1  \cup R_2$.  Formally,   $r = \prod_{R_1}(r)  \bowtie \prod_{R_2}(r)$.  

And,  conversely a decomposition is lossy if $r\subset \prod_{R_1}(r)  \bowtie \prod_{R_2}(r)$   
**Note**: *more tuples implies more uncertainty (less information)*.

A decomposition of $R$ into $R_1$ and $R_2$ is **lossless join** if at least one of the following dependencies holds: (充分条件)

* $R_1\cap R_2\rightarrow R_1$
* $R_1\cap R_2 \rightarrow R_2$  
即公共属性是其中一个关系的 Key.   


### Devise a Theory for the Following

* Decide whether a particular relation R is in “good” form.  
* In the case that a relation R is not in “good” form, decompose it into a set of relations $\{R_1, R_2, \ldots, R_n\}$ such that 
    * each relation is in good form 
    * the decomposition is a lossless-join decomposition   
    如果关系是不好的，我们希望把它无损分解成好的关系。
* Our theory is based on:
    * functional dependencies
    * multivalued dependencies
* Normal  Forms(NF): $1NF \rightarrow 2NF \rightarrow 3NF \rightarrow **BCNF** \rightarrow 4NF$  
有些函数依赖，不能在 BCNF 中得到体现，需要把几个表拼在一起才能体现，叫依赖保持。这时我们需要从 BCNF 回到 3NF.  

## Functional Dependencies

Functional Dependencies  are *constraints* on the set of legal relations. (来自于应用层面的规定)  
Require that the value for a certain set of attributes determines uniquely the value for another set of attributes.   ***e.g.*** dept_name $\rightarrow$ building  
A functional dependency is a generalization of the notion of a *key*.

Let $R$ be a relation schema $\alpha\subseteq R$ and $\beta\subseteq R$ ($\alpha, \beta$ 是属性的集合)
The **functional dependency** $\alpha\rightarrow \beta$ holds on $R$ if and only if for any legal relations $r(R)$, whenever any two tuples $t_1$ and $t_2$ of $r$ agree on the attributes $\alpha$, they also agree on the attributes $\beta$.  That is,   

$$
t_1[\alpha] = t2 [\alpha]   \Rightarrow   t_1[\beta ]  = t_2 [\beta ] 
$$

通过数据库实例可以证伪函数依赖，但不能证实。（依赖是来自应用层面的规定，先有函数依赖，再有数据库中的数据）

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101055618.png" width = 60%/> </div>  

    $A\rightarrow B$ 可以证伪，但也不能因此就说 $B\rightarrow A$

* K is a **superkey** for relation schema $R$ if and only if $K\rightarrow R$
* K is a **candidate key** for $R$ if and only if 
    * $K\rightarrow R$, and
    * for no $\alpha\subset K$, $\alpha\rightarrow R$

A functional dependency is **trivial** if it is satisfied by all relations.  
全集可以决定子集。  
In general, $\alpha\rightarrow \beta$ is trivial if $\beta\subseteq \alpha$

### **Closure(闭包)** 

#### Closure of a Set of Functional Dependencies  

Given a set $F$ of functional dependencies, there are certain other functional dependencies that are logically implied by $F$.  
The set of all functional dependencies logically implied by $F$ is the **closure** of $F$. We denote the closure of $F$ by $F^+$.  

***e.g.*** $F=\{A\rightarrow B,B\rightarrow C\}$ then $F^+=\{A\rightarrow B, B\rightarrow C, A\rightarrow C, AB\rightarrow B, AB\rightarrow C,\ldots\}$

We can find $F^+$, the closure of $F$, by repeatedly applying *Armstrong’s Axioms*:

* if $\beta\subseteq \alpha$ then $\alpha \rightarrow \beta$ (**reflexivity**, 自反律)
* if $\alpha\rightarrow \beta$ then $\gamma \alpha \rightarrow \gamma \beta$ (**augmentation**, 增补律)
* if $\alpha\rightarrow \beta$ and $\beta \rightarrow \gamma$ then $\alpha\rightarrow \gamma$ (**transitivity**, 传递律)

These rules are 

* **Sound（正确有效的）** generate only functional dependencies that actually hold
* **Complete（完备的）** generate all functional dependencies that hold

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101109102.png" width = 60%/> </div>

Additional rules:

* If $\alpha\rightarrow \beta$ holds and $\alpha\rightarrow \gamma$ holds,  then $\alpha\rightarrow \beta\gamma$ holds (**union**, 合并)
* If $\alpha\rightarrow \beta\gamma$ holds, then $\alpha\rightarrow \beta$ holds and $\alpha\rightarrow \gamma$ holds (**decomposition**, 分解)
* If $\alpha\rightarrow \beta$ holds and $\gamma \beta\rightarrow \delta$ holds, then $\alpha \gamma\rightarrow \delta$ holds (pseudotransitivity，伪传递)

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101114195.png" width = 60%/> </div>

    函数依赖，右边的公共属性可以去掉，使得函数双方没有交集。

#### Closure of Attribute Sets

Given a set of attributes $a$, define the closure of a under $F$ (denoted by $a+$) as **the set of attributes that are functionally determined by $a$ under $F$**  
<div align=center> <img src="http://cdn.hobbitqia.cc/202304101117364.png" width = 60%/> </div>

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101121964.png" width = 60%/> </div>

#### Uses of Attribute Closure

* Testing for **superkey**:
To test if $\alpha$ is a superkey, we compute $\alpha+$, and check if $\alpha+$ contains all attributes of $R$.
* Testing **functional dependencies**
    * To check if a functional dependency $\alpha\rightarrow \beta$ holds (or, in other words, is in $F+$), just check if $\beta\subseteq\alpha+$. 
    * That is, we compute $\alpha+$ by using attribute closure, and then check if it contains $\beta$. 
    * Is a simple and cheap test, and very useful
* **Computing closure of F**
For each $\gamma\subseteq R$, we find the closure $\gamma+$, and for each $S \subseteq \gamma+$, we output a functional dependency $\gamma\rightarrow  S$.  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101128961.png" width = 60%/> </div>

### Canonical Cover（正则覆盖）

函数依赖是最简单的形式，不存在冗余的函数依赖。

a **canonical cover** of F is a *“minimal”* set of functional dependencies equivalent to F, having no redundant dependencies or redundant parts of dependencies.  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101132902.png" width = 60%/> </div>
<!-- Extraneous Attributes(无关属性)

Consider a set $F$ of functional dependencies and the functional dependency $\alpha\rightarrow \beta$ in $F$.  

* Attribute A is **extraneous** in $\alpha$ if $A\in \alpha$ and $F$ logically implies $(F – \{\alpha\rightarrow \beta\})\cup {(\alpha  – A) \rightarrow \beta}$.
* Attribute A is **extraneous** in $\beta$ if $A\in \beta$ and the set of functional dependencies   (F  – {  })  { ( – A)} logically implies F. -->

A **canonical cover** for $F$ is a set of dependencies Fc such that 

* $F$ logically implies all dependencies in $F_c$
* $F_c$ logically implies all dependencies in $F$
* No functional dependency in $F_c$ contains an extraneous attribute
* Each left side of functional dependency in $F_c$ is unique.

<div align=center> <img src="http://cdn.hobbitqia.cc/202304101145812.png" width = 60%/> </div>

??? Example "Computing a Canonical Cover"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101146415.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101148828.png" width = 60%/> </div>

### Boyce-Codd Normal FormAZSX

A relation schema $R$ is in **BCNF** with respect to a set $F$ of functional  dependencies if for all functional dependencies in $F^+$ of the form where $\alpha \subseteq R$ and $\beta \subseteq R$, at least one of the following holds  

* $\alpha \rightarrow \beta$ is trivial
* $\alpha$ is a superkey for $R$.  

任何非平凡的函数依赖的左边都是一个 key.  

#### Decomposing a Schema into BCNF

对于不是 key 的函数依赖，就把它分解出来作为单独的关系模式。  
Suppose we have a schema $R$ and a non-trivial dependency $\alpha\rightarrow \beta$ causes a violation of BCNF. We decompose $R$ into:
$(\alpha \cup \beta)$ and $(R-(\beta-\alpha))$  
$\alpha$ 作为两个关系模式的公共属性，也是一个关系的 key, 这样才是无损分解。
<div align=center> <img src="http://cdn.hobbitqia.cc/202304101203717.png" width = 60%/> </div>

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304101207303.png" width = 60%/> </div>

#### Dependency Preservation

依赖保持：原来的函数依赖，都可以在分解后的函数依赖中得到单独检验。否则需要把几个关系连接在一起才能检验依赖的，称为依赖不保持。

Constraints, including functional dependencies, are costly to check in practice unless they pertain to only one relation.  

If it is sufficient to test only those dependencies on each individual relation of a decomposition in order to ensure that all functional dependencies hold, then that decomposition is **dependency preserving (保持依赖)**.
（如果通过检验单一关系上的函数依赖，就能确保所有的函数依赖成立，那么这样的分解是依赖保持的）
（或者，原来关系R上的每一个函数依赖，都可以在分解后的单一关系上得到检验或者推导得到。）
Because it is not always possible to achieve both BCNF and dependency preservation, we consider a weaker normal form, known as **third normal form**.

Let $F_i$ be the set of all functional dependencies in $F^+$ that include only attributes in $R_i$. ($F_i$:  the restriction of $F$ on $R_i$)

* A decomposition is dependency preserving, if $(F_1\cup F_2 \cup \ldots \cup F_n )^+ = F^+$
* If it is not, then checking updates for violation of functional dependencies may require computing joins, which is expensive.

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304102252437.png" width = 60%/> </div>

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304102300227.png" width = 60%/> </div>

### Third Normal Form

任何一个非平凡函数依赖，如果左边不是一个 super key, 那么右边必须包含在一个 candidate key 里面。

A relation schema $R$ is in third normal form (3NF) if for all: $\alpha\rightarrow \beta $ in $F^+$ at least one of the following holds:

* $\alpha\rightarrow \beta$ is trivial (i.e., $\beta \in \alpha$)
* $\alpha$ is a superkey for R
* Each attribute A in $\beta-\alpha$ is contained in a candidate key for $R$.  
候选码有很多个，包含在某一个候选码即可。  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171009939.png" width = 60%/> </div>

<div align=center> <img src="http://cdn.hobbitqia.cc/202304171012987.png" width = 60%/> </div>

**Goals of Normalization**

In the case that a relation scheme R is not in “good” form, decompose it into a set of relation scheme  $\{R_1, R_2, \ldots, R_n\}$ such that 

* each relation scheme is in good form (**i.e.**, BCNF or 3NF)
* the decomposition is a lossless-join decomposition
* Preferably, the decomposition should be dependency preserving

??? Example "E-R Modeling and Normal Forms"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171022642.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171019402.png" width = 60%/> </div>

    这里的无损分解，先指定一个路径，考虑每两个关系直接是否无损（公共属性是否为其中一个关系的 key）。

## Multivalued Dependencies

There are database schemas in BCNF that do not seem to be sufficiently normalized.  

!!! Example 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171028076.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171031482.png" width = 60%/> </div>

    存在两种不相关的多值依赖。老师 id 可以多值决定 child_name, 又可以多值决定 phone, 但这两个属性是不相关的，放在一个表里就会组合。  
    第二张图的为 **Fourth Normal Form (4NF)**.

四范式：不存在非平凡的多值依赖。

Let R be a relation schema and let $\alpha\subset R$ and $\beta\subset R$. The **multivalued dependency** $\alpha\rightarrow\rightarrow\beta$ holds on $R$ if in any legal relation $r(R)$, for all pairs for tuples $t_1$ and $t_2$ in $r$ such that $t_1[\alpha] = t_2 [\alpha]$, there exist tuples $t_3$ and $t_4$ in $r$ such that: 

$$
t_3[\alpha] = t_4[\alpha] = t_1[\alpha]=t_2[\alpha]\\
t_3[\beta]=t_1[\beta]\\
t_3[R-\beta]=t_2[R-\beta]\\
t_4[\beta]=t_2[\beta]\\
t_4[R-\beta]=t_1[R-\beta]
$$

<div align=center> <img src="http://cdn.hobbitqia.cc/202304171035922.png" width = 60%/> </div>

A relation schema $R$ is in **4NF** with respect to a set $D$ of functional and multivalued dependencies if for all multivalued dependencies in $D^+$ of the form $\alpha\rightarrow \rightarrow \beta$, where $\alpha\subset R$ and $\beta\subset R$, at least one of the following hold:

* $\alpha\rightarrow \rightarrow \beta$ is trivial (i.e., $\beta \subset \alpha$ or $\alpha \cup \beta= R$)    
即除了 $\alpha,\beta$ 为没有其他属性。
* $\alpha$ is a superkey for schema $R$

任何一个多值依赖，要么左边就是个 key, 要么这个依赖是平凡的。

<div align=center> <img src="http://cdn.hobbitqia.cc/202304171039053.png" width = 60%/> </div>

??? Example "E-R Modeling and Normal Forms"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171039627.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171044548.png" width = 60%/> </div>

    不是 BCNF, 因此也不是 4NF. 

## Overall Database Design Process

Denormalization for Performance

Some aspects of database design are not caught by normalization.  
有时候我们需要引入冗余，来保持性能。

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304171100043.png" width = 60%/> </div>