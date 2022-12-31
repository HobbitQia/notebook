
# 散列

## 基本思想

理想的散列表是一个含有关键字的具有固定大小的数组。

ADT 模型

* 对象：一组 名称-属性 对，其中名称是唯一的。
* 操作
    * 创建散列表
    * 查询关键字是否在散列表中
    * 查询关键字
    * 插入关键字
    * 删除关键字

对每个标识符 `x`, 我们定义了一个**散列函数**   
`f(x)=`position of `x` in `ht[ ]` (**i.e.** the index of the bucket that contains `x`)  

<div align=center> <img src="http://cdn.hobbitqia.cc/202212291922092.png" width = 50%/> </div>  

这里我们用 $T$ 表示 `x` 可能的不同值; $n$ 表示 `ht[]` 中所有不同标识符的个数; 标识符密度定义为 $\dfrac{n}{T}$; 装载密度定义为 $\dfrac{n}{sb}$  

* 当我们把两个不同的标识符映射到同一个桶里时，**冲突**发生了(**i.e.** $f(i_1)=f(i_2), i_1\neq i_2$)
* 当我们将一个新的标识符映射到一个满的桶里时，**溢出**发生了  

没有溢出时, $T_{search} = T_{insert} = T_{delete} = O( 1 )$

## 散列函数

$f$ 要满足的性质：

* 容易计算，最小化冲突的数量
* $f$ 应该是无偏见的，即 $\forall x,i$ 我们有 $P(f(x)=i)=\dfrac{1}{b}$. 这样的散列函数称为**均匀散列函数**.  

TableSize 应该是一个素数，这样对随机输入，关键字的分布比较均匀  
如 $f(x)=(\sum x[N-i-1]*32^i)\%TableSize$  

## 分离链接

解决冲突的第一种方法叫作分离链接法。其做法是将散列映射到同一个值的所有元素保存在一个列表中，一般使用链表的方式存储。

* 结构体定义
    <details>

    ``` C
    struct  ListNode; 
    typedef  struct  ListNode  *Position; 
    struct  HashTbl; 
    typedef  struct  HashTbl  *HashTable; 
    struct  ListNode { 
        ElementType  Element; 
        Position  Next; 
    }; 
    typedef  Position  List; 
    /* List *TheList will be an array of lists, allocated later */ 
    /* The lists use headers (for simplicity), */ 
    /* though this wastes space */ 
    struct  HashTbl { 
        int  TableSize; 
        List  *TheLists; 
    }; 
    ```
    </details>

* 创建空表
    <details>

    ``` C
    HashTable  InitializeTable( int TableSize ) 
    {   HashTable  H; 
        int  i; 
        if ( TableSize < MinTableSize ) { 
            Error( "Table size too small" );  return NULL;  
        } 
        H = malloc( sizeof( struct HashTbl ) );  /* Allocate table */
        if ( H == NULL )    FatalError( "Out of space!!!" ); 
        H->TableSize = NextPrime( TableSize );  /* Better be prime */
        H->TheLists = malloc( sizeof( List ) * H->TableSize );  /*Array of lists*/
        if ( H->TheLists == NULL )   FatalError( "Out of space!!!" ); 
        for( i = 0; i < H->TableSize; i++ ) {   /* Allocate list headers */
        H->TheLists[ i ] = malloc( sizeof( struct ListNode ) ); /* Slow! */
        if ( H->TheLists[ i ] == NULL )  FatalError( "Out of space!!!" ); 
        else    H->TheLists[ i ]->Next = NULL;
        } 
        return  H; 
    } 
    ```
    </details>

* 查询关键字
    <details>

    ``` C
    Position  Find ( ElementType Key, HashTable H ) 
    { 
        Position P; 
        List L; 

        L = H->TheLists[ Hash( Key, H->TableSize ) ]; 

        P = L->Next; 
        while( P != NULL && P->Element != Key )  /* Probably need strcmp */ 
        P = P->Next; 
        return P; 
    } 
    ```
    </details>

* 插入关键字  
    首先我们查找这个值，如果这个值已经存在那么我们就什么也不做。
    <details>

    ``` C
    void  Insert ( ElementType Key, HashTable H ) 
    { 
        Position   Pos, NewCell; 
        List  L; 
        Pos = Find( Key, H ); 
        if ( Pos == NULL ) {   /* Key is not found, then insert */
        NewCell = malloc( sizeof( struct ListNode ) ); 
        if ( NewCell == NULL )     FatalError( "Out of space!!!" ); 
        else { 
            L = H->TheLists[ Hash( Key, H->TableSize ) ]; 
            NewCell->Next = L->Next; 
            NewCell->Element = Key; /* Probably need strcpy! */ 
            L->Next = NewCell; 
        } 
        } 
    } 
    ```
    </details>

## 开放地址

开放地址法，当有冲突发生时，尝试选择其他的单元，直到找到空的单元为止。  
一般地, $h_0(X),h_1(X),\ldots,$ 其中 $h_i(X)=(Hash(X)+F(i)) mod\ TableSize $  
一般来说 $\lambda<0.5$  

``` C
Algorithm: insert key into an array of hash table
{
    index = hash(key);
    initialize i = 0 ------ the counter of probing;
    while ( collision at index ) {
	index = ( hash(key) + f(i) ) % TableSize;
	if ( table is full )    break;
	else    i ++;
    }
    if ( table is full )
	ERROR (“No space left”);
    else
	insert key at index;
}
```

### 线性探测法

在线性探测法中，函数 $F$ 是 $i$ 的线性函数，典型情形是 $F(i)=i$. 这相当于逐个探测单元（必要时可以绕回到第一个单元）以查找出一个空单元。

可以证明，使用线性探测的探测次数对于插入和不成功的查找来说约为 $\dfrac{1}{2}(1+\dfrac{1}{(1-\lambda)^2})$ 次; 对于成功的查找来说则需 $\dfrac{1}{2}(1+\dfrac{1}{1-\lambda})$ 次

### 平方探测法

平方探测法是消除线性探测中一次聚集问题的冲突解决方法。冲突函数为二次函数，一般为 $F(i)=i^2$  

> 定理: 如果使用平方探测，且表的大小是素数，那么当表至少有一半为空时，总能插入一个新的元素。

对于任意元素 $x$, 它有 $\lceil TableSize/2 \rceil$ 个不同的位置可能放置这个元素。如果最多 $\lfloor TableSize/2 \rfloor $ 位置被使用，那么总能找到放 $x$ 的空单元。

* 查找元素  
    $F(i)=F(i-1)+i^2-(i-1)^2=F(i-1)+2i-1$  
    这里 `while` 语句的测试顺序不能改变。如果是 `empty`，则 `key` 没有定义，先判断会出错。  
    假设探测步数 i 不超过 $\dfrac{TS}{2}+1$ 步，即假设表 $<50\%$。这时 `CurrentPos+2i-1 <= 2TS-1`，所以可以用减法。


    <details>
    
    ``` C
    Position  Find ( ElementType Key, HashTable H ) 
    {   Position  CurrentPos; 
        int  CollisionNum; 
        CollisionNum = 0; 
        CurrentPos = Hash( Key, H->TableSize ); 
        while( H->TheCells[ CurrentPos ].Info != Empty && 
        H->TheCells[ CurrentPos ].Element != Key ) { 
        CurrentPos += 2 * ++CollisionNum  1; 
        if ( CurrentPos >= H->TableSize )  CurrentPos  = H->TableSize; 
        } 
        return CurrentPos; 
    } 
    ```
    </details>

* 插入元素
    <details>

    ``` C
    void  Insert ( ElementType Key, HashTable H ) 
    { 
        Position  Pos; 
        Pos = Find( Key, H ); 
        if ( H->TheCells[ Pos ].Info != Legitimate ) { /* OK to insert here */ 
        H->TheCells[ Pos ].Info = Legitimate; 
        H->TheCells[ Pos ].Element = Key; /* Probably need strcpy */ 
        } 
    } 
    ```
    </details>

散列到同一位置上的那些元素将探测相同的备选单元，这称为**二次聚集**。

### 双散列

$f(i)=i*hash_2(X)$  我们在 $X$ 距离 $hash_2(X),2hash_2(X),\ldots$ 等位置进行探测。 常用 $hash_2(X)=R-(X mod R)$, 其中 $R$ 是一个比 $TableSize$ 小的素数。

* 如果正确实现了双重哈希，模拟表明预期的探测数量几乎与随机冲突解决策略相同。
* 二次探测不需要使用第二个哈希函数，因此在实践中可能更简单、更快。

## 再散列

对于使用平方探测的开放地址散列法，如果表的元素过多，那么操作的运行时间将开始消耗过长。  

* 建立一个两倍大的表
* 扫描原始散列表
* 利用新的散列函数将元素映射到新的散列值，并插入

$T(N)=O(N)$  

什么时候再散列？

* 表填满一半就再散列
* 当插入失败时
* 当表达到某一个装填因子时进行再散列。  

通常在重哈希之前应该有 $N/2$ 个插入，所以 $O(N)$ 重哈希只会给每个插入增加一个恒定的代价。  
然而，在交互式系统中，不幸的用户的插入导致重新散列，可能会看到速度减慢。