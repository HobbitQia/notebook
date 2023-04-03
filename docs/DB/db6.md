---
counter: True  
---

# Entity-Relationship Model

<div align=center> <img src="http://cdn.hobbitqia.cc/202304031001281.png" width = 60%/> </div>

## Example

<div align=center> <img src="http://cdn.hobbitqia.cc/202304031006544.png" width = 80%/> </div>

* 一个方形框就是一个实体的集合，下面列出其属性。
* 实体与实体之间有关系，一个菱形框表示关系。  
一对一($\leftrightarrow$)/一对多/多对一($\leftarrow, \rightarrow$)。  
这里 instructor 实体里不需要 `dept` 属性，因为在 department 实体里有了，否则会冗余。

每个实体直接转换为关系模式。
关系转换为元组，元素为两个表的 primary key. 对于一对多的情况（如 `instructor` 和 `department）转换后` primary key 仍为 ID.  
为了减少表的数量，可以把 primary key 相同的表合并。

双横线与单横线不同  
双横线表示每个对象都必须参与关系，而单横线则表示对象可以不参与关系。如 `inst_dept` 中如果 `department`-`inst_dep` 为双横线，则表示每一个系都要有老师。  
有些联系是隐含的，如授课老师和听课的学生。

`section` 不足以唯一确定元组，称为弱实体，依赖于另一个实体（如 OOP、DB 都可以有同样年份学期的 1 班）。因为课程号 `course_id` 放在 `section` 会有冗余，因此没有这个属性，导致形成了一个弱实体。
`sec_course` 表示联系的是弱实体（双框），`section` 不能离开 `course` 存在。

relationship 上也可以带属性，如 `takes` 上的 `grade`. 

关系双方可以是相同的实体集合，`course` 这里的 `prereq` 是多对多，表示一门课可以有多门预修课，一门课也可以是多门课的预修课。`{}` 里面是多个值，表示复合属性。这里表示 `time_slot_id` 实际上可以由这三个属性复合而成。

## Database Modeling

A database can be modeled as:

* a collection of **entities**,
* **relationship** among entities.

### Entities

An **entity** is an object that exists and is **distinguishable** from other objects.   
***e.g.*** specific person, company, event, plant
* Entities have **attributes**   
***e.g.*** people have names and addresses	  
* An **entity set** is a set of entities of the same type that share the same properties.  
***e.g.*** set of all persons, companies, trees, holidays

Entity sets can be represented graphically as follows:

* Rectangles represent entity sets.
* Attributes listed inside entity rectangle
* Underline indicates primary key attributes

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031500852.png" width = 60%/> </div>

### Relationship Sets

A relationship is an association among several entities.
A relationship set is a mathematical relation among n  2 entities, each taken from entity  $\{(e_1, e_2, ... e_n) | e_1 \in E_1, e_2 \in  E_2, ..., e_n \in  E_n\}$ where $(e_1, e_2, ..., e_n)$ is a relationship.  

本质也是一个集合。最开始的例子中均为是二元联系，即是两个实体集合的关系，但是关系可以是多元的，即多个实体。如老师，同学，SRTP 项目可以共同形成一个关系。

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031501597.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031504699.png" width = 60%/> </div>

#### Relationship Sets with Attributes

An attribute can also be property of a relationship set.

***e.g.*** The advisor relationship set between entity sets instructor and student may have the attribute date which tracks when the student started being associated with the advisor.

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031503296.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031504314.png" width = 60%/> </div>

#### Roles

Entity sets of a relationship need not be distinct.  
Each occurrence of an entity set plays a “role” in the relationship
The labels `course_id` and `prereq_id` are called roles.

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031100985.png" width = 50%/> </div>

#### Degree(度) of a Relationship Set

**binary relationship（二元联系）**

* involve two entity sets (or degree two). 
* most relationship sets in a database system are binary.

尽量不用多元联系，因为二元联系比较清晰。而且任何的多元联系都可以通过引入中介实体转化为二元联系。

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031102595.png" width = 50%/> </div>

    转化为二元联系：把多元联系实体化。如 `proj_guide` 里有老师、学生、工程的 id. 随后这个实体又和另外三个实体各有一个二元联系。

### Attributes

An entity is represented by a set of attributes, that is *descriptive properties* possessed by all members of an entity set.

**Attribute types**:

* **Simple（简单）** and **composite（复合）** attributes.  
* **Single-valued（单值）** and **multivalued（多值）** attributes  
***e.g.*** multivalued attribute: `phone_numbers`  
* **Derived（派生）** attributes
    * Can be computed from other attributes  
    ***e.g.*** `age`, given `date_of_birth`

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031107128.png" width = 60%/> </div>
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031108563.png" width = 25%/> </div>

### Mapping Cardinality Constraints

映射基数约束

Express the number of entities to which another entity can be associated via a relationship set.

* One to one
* One to many
* Many to one
* Many to many 

We express cardinality constraints by drawing either a directed line ($\rightarrow$), signifying “one,” or an undirected line ($—$), signifying “many,” between the relationship set and the entity set.

### Total and Partial Participation

* **Total participation** (indicated by double line): every entity in the entity set participates in at least one relationship in the relationship set  
所有元素都要参与关系
* **Partial participation**: some entities may not participate in any relationship in the relationship set

### Notation for Expressing More Complex Constraints

A line may have an associated minimum and maximum cardinality, shown in the form l..h, where l is the minimum and h the maximum cardinality

* A minimum value of 1 indicates total participation.
* A maximum value of 1 indicates that the entity participates  in at most one relationship
* A maximum value of * indicates no limit.

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031611065.png" width = 60%/> </div>

多元关系里，我们只允许最多有一个箭头。

### Primary Key

Primary Key for Relationship Sets

多元联系的 primary key 是两端 key 的组合。如果是一对一的联系，那么单个实体的 key 也可以作为 primary key. 一对多的联系（如导师和学生就是一对多，那么主键应该为学生）

### Weak Entity Sets

An entity set that does not have a primary key is referred to as a **weak entity set**.

The existence of a weak entity set depends on the existence of a **identifying entity set（标识性实体集）**

* It must relate to the identifying entity set via a *total, one-to-many* relationship set from the identifying to the weak entity set
* **Identifying relationship（标识性联系）** depicted using a double diamond

The **discriminator(分辨符，or partial key)** of a weak entity set is the set of attributes that distinguishes among all the entities of a weak entity set  when the identifying entity  they depend is known.

We underline the discriminator of a weak entity set  with a dashed line. （虚线）
We put the identifying relationship of a weak entity in a double diamond. （双框）

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031625067.png" width = 60%/> </div>

!!! Note "Redundant Attributes"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031626001.png" width = 60%/> </div>


## Reduction to Relational Schemas

一个 ER 图可以转换成多种模式（图数据库、面向对象、关系模式等）

* A **strong entity set** reduces to a schema with the same attributes `course(course_id, title, credits)`
* A **weak entity set** becomes a table that includes a column for the primary key of the identifying strong entity set.    
Primary key of the table is the union of the discriminator of the weak entity set and  the primary key of the identifying strong entity set.   
标识集合的主键加上弱实体集的分辨符。  
`section(course_id, sec_id, semester, year)`
* A **many-to-many relationship set** is represented as a schema with attributes for the primary keys of the two participating entity sets, and *any descriptive attributes* of the relationship set. 
即两个集合的主键拼起来，加上关系的附带属性。  

    ??? Example 
        <div align=center> <img src="http://cdn.hobbitqia.cc/202304031634616.png" width = 60%/> </div>
        
        `advisor = (s_id, i_id)`

    ??? Question "为什么多对多的关系一定要转化成一个关系模式"

* Many-to-one and one-to-many relationship sets that are total on the many-side can be represented by adding an extra attribute to the “many” side, containing the primary key of the “one” side.  
多对一可以不转换为单独的关系模式，直接在“多“那个表上添加”一“的主键即可。

    ??? Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202304031637004.png" width = 60%/> </div>

        `inst_dept` 本质就是将 `instructor` 和 `department` 合并，在 `instrutor` 的属性上添加 `dept_name`.   
        ``` SQL 
        department(dept_name, building, budget)
        instructor(ID,name,salary)
        inst_dept(ID, dept_name)
        // 转换后（即合并）
        department(dept_name, building, budget)
        instructor(ID, name, salary, dept_name)
        ```

        各有利弊，第一种写法表可能会太多，第二种写法合在一起表可能太大，不利于管理。

### Composite and Multivalued Attributes

*Composite attributes* are flattened out by creating a separate attribute for each component attribute.  

就像在 C 语言里定义一个结构。但是关系数据库里每个属性都必须是简单数据类型，就必须把这些复合属性铺平。

***e.g.*** 
``` SQL
instructor(ID, 
        first_name, middle_initial, last_name,      
        street_number, street_name, apt_number, 
        city, state, zip_code, date_of_birth, age)
```

*A multivalued attribute* M of an entity E is represented by a separate schema EM.  

Schema EM has attributes corresponding to the primary key of E and an attribute corresponding to multivalued attribute M.  

??? Example 
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031658751.png" width = 60%/> </div>

!!! Example "Special Case"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031702516.png" width = 60%/> </div>

## Design Issues

### Common Mistakes in E-R Diagrams

* 信息冗余  
student 的 `dept_name` 应该去掉
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031711528.png" width = 40%/> </div>

* 关系属性使用不当  
这里一门课可能有很多次作业，不能只用一个实体。
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031711934.png" width = 40%/> </div>

    解决方法：
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031713100.png" width = 40%/> </div>

### Use of entity sets vs. attributes  

<div align=center> <img src="http://cdn.hobbitqia.cc/202304031716208.png" width = 40%/> </div>

* 第一种方法，明确放一个电话号码。
* 第二种方法，电话号码可以附属更多属性，一个电话号码可以由多人共享。（如办公室的公共电话）

### Use of entity sets vs. relationship sets

Possible guideline is to designate a relationship set to describe an action that occurs between entities.

<div align=center> <img src="http://cdn.hobbitqia.cc/202304031720996.png" width = 40%/> </div>

实体可以便于与其他实体建立联系。

如电商，我们可以简单的把客户和商品用 `buy` 联系起来，但后续还会有付款、物流等情况，我们最好把 `buy` 实体化为订单。

### Placement of relationship attributes

<div align=center> <img src="http://cdn.hobbitqia.cc/202304031724515.png" width = 40%/> </div>

* 第一种方法，可以记录每次访问的访问日期。
* 第二种方法，只能记录用户最近一次访问日期，不完整。

### Binary Vs. Non-Binary Relationships

* Binary versus n-ary relationship sets   
Although it is possible to replace any nonbinary (n-ary, for $n >2$) relationship set by a number of distinct binary relationship sets, a n-ary relationship set shows more clearly that several entities participate in a single relationship.

* Some relationships that appear to be non-binary may be better represented using binary relationships
***e.g.*** A ternary relationship parents, relating a child to his/her father and mother, is best replaced by two binary relationships,  father and mother
Using two binary relationships allows partial information (***e.g.*** , only mother being know)
But there are some relationships that are naturally non-binary
***e.g.*** : `proj_guide`

??? Example "Converting Non-Binary Relationships "
    <div align=center> <img src="http://cdn.hobbitqia.cc/202304031729503.png" width = 60%/> </div>

## Extended ER Features

* **Specialization（特化）**   
    * Top-down design process; we designate subgroupings within an entity set that are distinctive from other entities in the set.
    * Attribute inheritance – a lower-level entity set inherits all the attributes and relationship participation of the higher-level entity set to which it is linked.
* **Generalization（概化）**  
A bottom-up design process – combine a number of entity sets that share the same features into a higher-level entity set.
