---
counter: True  
---

# Intermediate SQL

??? Abstract
    * Joined Relation
    * SQL Data Types and Schemas
    * Integrity Constraints
    * Views
    * Indexes
    * Transactions
    * Authorization

## Joined Relations

* Join operations take two relations and return as a result another relation.
* Join operations are typically used as subquery expressions in the from clause
* Join condition – defines which tuples in the two relations match, and what attributes are present in the result of the join.
* Join type – defines how tuples in each relation that do not match any tuple in the other relation (based on the join condition) are treated.  
<div align=center> <img src="http://cdn.hobbitqia.cc/202303201002582.png" width = 60%/> </div>    

* using 是一个等值连接，类似于自然连接，这些属性相同才能连接

## SQL Data Types and Schemas

### User-Defined Types

`create type` construct in SQL creates user-defined type.  

!!! Example
    `create type Dollars as numeric (12,2) final` 定义了 `Dollars` 这个类型后，我们就可以把它当作元类型使用。  
    ``` SQL
    create table department
        (dept_name varchar (20),
        building varchar (15),
        budget Dollars);
    ```
这样可以支持强类型检查，可以防止如 200 美元 + 300 RMB 得到 500 元的错误。

### Domains

`create domain` construct in SQL-92 creates user-defined domain types.  

Domains can have constraints, such as `not null`, specified on them.

!!! Example
    `create domain person_name char(20) not null` 
    ``` SQL
    create domain degree_level varchar(10)
        constraint degree_level_test
        check (value in (’Bachelors’, ’Masters’, ’Doctorate’));
    ```
    这里的 constraint 可以对 domain 的取值进行限制。

不同 type 的变量，即使定义相同，也不能进行运算。不同 domain 的变量（基础类型相同）可以运算。

### Large-Object Types

Large objects (photos, videos, CAD files, etc.) are stored as a large object:  

* **blob**: binary large object -- object is a large collection of uninterpreted binary data (whose interpretation is left to an application outside of the database system)  
存储大对象数据类型，实际上只是存放指针。

    ??? Example "BLOB in MySQL"
        * TinyBlob ：  0 ~ 255 bytes.
        * Blob： 0 ~ 64K bytes.
        * MediumBlob ： 0 ~ 16M bytes.
        * LargeBlob : 0 ~ 4G  bytes.

* **clob**: character large object -- object is a large collection of character data  
文本大对象  

## Integrity Constraints

* **`not null`**
* **`primary key`**
* **`unique`**    
`unique(A1, A2, ..., Am)` The unique specification states that the attributes `A1, A2, ..., Am` form a **super key** （不一定是 candidate key)  
比如学生个人信息，我们知道 ID 是主键，但实际上邮箱、电话号码等也不能相同的，所以我们要通过语句告诉数据库，数据库会为我们维护这些约束条件。    
Candidate keys are permitted to be null (in contrast to primary keys).  
* **`check (P)`**, where P is a predicate  
    
    ??? Example
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303201018682.png" width = 60%/> </div>    

    可以有复杂查询，但许多数据库不支持。***e.g.*** `check ((course_id, sec_id, semester, year)  in (select course_id, sec_id, semester, year from teaches))`
* **`foreign key`**

    !!! Info "Integrity Constraint Violation During Transactions"   
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303201020161.png" width = 60%/> </div>   

        在一个人的父母还没插入的时候，无法插入这个人，依次类推。  
        可以规定，在这个事务结束时再检查完整性约束条件，中间状态可以不满足。

* **`assertion`**  
`create assertion <assertion-name> check <predicate>;`  

    ??? Example 
        验证一个学生获得的总学分，要等于获得的每门课的学分的总和。
        <div align=center> <img src="http://cdn.hobbitqia.cc/202303201026200.png" width = 60%/> </div>    

    但使用 `assert` 后，每个元组的每次状态更新时都要进行检查，开销过大，数据库一般不支持。

## Views

A **view** provides a mechanism to hide certain data from the view of certain users.   

### View Definition

A view is defined using the create view statement which has the form `create view v as < query expression >`  

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303201029703.png" width = 60%/> </div>   

view 可以隐掉一些细节，或者加上一些统计数据。可以把 view 当作表进行查询。

* 隐藏不必要的细节，简化用户视野
* 方便查询书写
* 有利于权限控制（如用户可以看到工资总和，但不能看到每个人的工资）
* 有独立性，使得数据库应用具有较强的适应性。

可以基于视图再定义视图。

??? Example "Views Defined Using Other Views"
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303201034734.png" width = 60%/> </div>   

### Update of a View

对一个 view 进行修改，相当于通过这个窗口对原表继续修改。  

!!! Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303201036509.png" width = 60%/> </div>  

    插入后，原表也会有这条数据，对于其缺少的 `salary` 属性，我们设定为 `NULL`. 如果这个属性的约束是 `not NULL` 的，那么我们无法执行这次插入。

如果视图中有统计的属性，那么是不可修改的。  
涉及到单个表，只是选出了部分属性（去掉非主属性）的行列视图是可更新的。

### View and Logical Data Indepencence

If relation $S(a, b, c)$ is split into two sub relations $S1(a,b)$ and $S2(a,c)$ How to realize the logical data independence?   

1. `create table S1...;` `create table S2...;`
2. `insert into S1 select a, b from S;` `insert into S2 select a, c from S;`
3. `drop table S;`
4. `create view S(a, b, c) as select a, b, c from S1 natural join S2;`    

`select * from S where...` 实际上是在做 `select * from S1 natural join S2 where ...` （系统会帮我这样做，程序不用改，只是执行改变了）
`insert into S values (1,2,3)` 实际上是在做 `insert into S1 values (1,2)` 和 `insert into S2 values (1,3)`  

### *Materialized Views

物化视图

**Materializing a view**: create a physical table containing all the tuples in the result of the query defining the view.  
本来的视图是一个虚的表，为了查询执行效率，我们可以把 view 定义为 Materializing view, 即生成一张临时表与其对应。  

If relations used in the query are updated, the materialized view result becomes out of date.  
    * Need to *maintain the view*, by updating the view whenever the underlying relations are updated.   

## Indexes

Indices are data structures used to speed up access to records with specified values for index attributes.  

Index 相当于在数据上建立了 B+ 树索引。（物理层面）

??? Example
    ``` SQL
    create table student	
    (	ID varchar (5),
    	name varchar (20) not null,
        	dept_name varchar (20),
            	tot_cred numeric (3,0) default 0,
                	primary key (ID) )
    create index studentID_index on student(ID)
    ```
    `select * from student where ID = ‘12345’` 在数据库内不同的物理实现有不同的查找方法。  
    如果没有定义索引，只能顺序查找。如果有索引，系统内会利用索引查找。  
    
## Transactions

* Transactions begin implicitly  
Ended by commit work or rollback work  
* By default on most databases: each SQL statement commits automatically  
    * Can turn off auto commit for a session ***e.g.*** in MySQL, `SET AUTOCOMMIT=0;`  

??? Example "Transaction examplex"
    ``` SQL
    SET AUTOCOMMIT=0

    UPDATE account SET balance=balance-100 WHERE ano=‘1001’;
    UPDATE account SETbalance=balance+100 WHERE ano=‘1002’;
    COMMIT;
    
    UPDATE account SET balance=balance -200 WHERE ano=‘1003’;
    UPDATE account SET balance=balance+200 WHERE ano=‘1004’;      COMMIT;

    UPDATE account SET balance=balance+balance*2.5%;
    COMMIT;
    ```

### ACID Properties

A  transaction  is a unit of program execution that accesses and possibly updates various data items.To preserve the integrity of data the database system must ensure: (原子性、一致性、独立性、持续性)

* **Atomicity**. Either all operations of the transaction are properly reflected in the database or none are.
* **Consistency**. Execution of a transaction in isolation preserves the consistency of the database.  
数据库执行事务前后都是一致的。
* **Isolation**. Although multiple transactions may execute concurrently, each transaction must be unaware of other concurrently executing transactions.  Intermediate transaction results must be hidden from other concurrently executed transactions.    
很多事情共同执行，他们不能互相影响。
    * That is, for every pair of transactions $T_i$ and $T_j$, it appears to $T_i$ that either $T_j$, finished execution before $T_i$ started, or $T_j$ started execution after $T_i$ finished.
* **Durability**. After a transaction completes successfully, the changes it has made to the database persist, even if there are system failures.   
数据库的事务一旦提交，这个修改就要持续地保存到数据库中去，不能丢失。如磁盘出问题了，断电了等会引发这个问题。  
通常使用日志。

## Authorization

* Forms of authorization on parts of the *database*  
数据层面，即表已经存在我们可以对其进行的操作  
    * *Select* - allows reading, but not modification of data.
    * *Insert* - allows insertion of new data, but not modification of existing data.
    * *Update* - allows modification, but not deletion of data.
    * *Delete* - allows deletion of data.
* Forms of authorization to modify the *database schema*  
能否定义表，索引等  
    * *Index* - allows creation and deletion of indices.
    * *Resources* - allows creation of new relations.
    * *Alteration* - allows addition or deletion of attributes in a relation.
    * *Drop* - allows deletion of relations.

### Authorization Specification in SQL

`grant <privilege list> on <relation name or view name> to <user list>`  
把某个表或者视图上的权限授权给用户  

`<user list>` is:  

* a user-id
* **`public`**, which allows all valid users the privilege granted
* A role (more on this later)

??? Example
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303202305455.png" width = 60%/> </div>    

    update 可以细化到具体可以对哪列进行修改。  

### Revoking Authorization in SQL

The revoke statement is used to revoke authorization.  
`revoke <privilege list> on <relation name or view name> from <user list>`  


### Roles

Privileges can be granted to roles.  
角色可以理解为一组权限的集合，如学校的教务管理员、老师。  

`create role <role-name>` 创造角色，随后可以把权限授予给他。  
然后我们可以把角色的权限授予给用户/其他角色。  
<div align=center> <img src="http://cdn.hobbitqia.cc/202303202311665.png" width = 60%/> </div>    

??? Example
    ``` SQL
    create role instructor;
    grant select on takes to instructor;  // 授予权限给角色
    grant instructor to Amit;   //将角色的权限授予给用户

    create role teaching_assistant;
    grant teaching_assistant to instructor;  // 可以将角色的权限授予给其他角色   
    ```

### Other Authorization Features

引用的权限比较特殊

`references privilege to create foreign key`


!!! Example
    `grant reference (dept_name) on department to Mariano;`
    <div align=center> <img src="http://cdn.hobbitqia.cc/202303202316369.png" width = 50%/> </div>    

如果不作为权限，我们可以通过间接的外键约束和 cascade 删掉被引用的数据。（删掉饮用者，则被引用者也要被删除）因此这也是个权限
    
* transfer of privileges
    * `grant select on department to Amit with grant option;`   
    加上 `with grant option` 后，用户可以把获得的权限传递下去。  
    * `revoke select on department from Amit, Satoshi cascade;`   
    `cascade` 把该用户及其授予的权限全部收回，级联反应。  
    * `revoke select on department from Amit, Satoshi restrict;`  
    `restrict` 只收回该用户的权限。  
    * `revoke grant option  for select on department from Amit;`  
    收回用户转授的权力。  

<div align=center> <img src="http://cdn.hobbitqia.cc/202303202319768.png" width = 50%/> </div>    
        