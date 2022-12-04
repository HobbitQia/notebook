---
counter: True  
---

# 并查集

## 前置知识

> 一个**关系** R 定义在集合 S 上, 表示为对于每一对 $(a,b),a,b\in S$, $aRb$ 要么为真要么为假. 如果 $aRb$ 为真，那么我们称 $a$ 和 $b$ 有关系。

> **等价关系**是满足自反性($\forall a\in S, aRa$)，对称性($aRb\Leftrightarrow bRa$)，传递性($aRb, bRc \Rightarrow aRc$)的关系，一般用 ~ 表示等价关系。

> S 中的两个元素 $x$ $y$ 在同一个等价类中当且仅当 $a$ ~ $b$

## 动态等价性问题

* 集合的元素: $1,2,3\ldots,N$
* 集合: $S_1,S_2,\ldots$ 且 $S_i\cap S_j=\empty$ (若 $i\neq j$), 即集合之间不相交
* 操作:
    * `Find(i)` 返回给定元素的所在的集合（等价类）
    * `Union(i,j)` 求并运算，将含有 a 和 b 的两个等价类合并为一个等价类  

## 基本数据结构

我们用树来表示每一个集合，树的根命名这个集合（代表元），树的集合构成了一个森林。  
初始时，每棵树都只有一个元素。当需要执行 `Union` 操作时，我们将一个节点的根指针指向另一棵树的根节点。当需要执行 `Find` 操作时，我们只需要从元素 X 一直向上直到根为止。
<details>
``` C
void SetUnion ( DisjSet S, SetType Rt1, SetType Rt2 )
{    
    S [ Rt2 ] = Rt1 ;     
}
SetType Find ( ElementType X, DisjSet S )
{   
    for ( ; S[X] > 0; X = S[X] );
    return  X ;
}
```
</details>
实际运用中，`Union` 和 `Find` 操作通常成对出现:
<details>
``` C
/* Algorithm using union-find operations */
{  Initialize  Si = { i }  for  i = 1, ..., 12 ;
   for  ( k = 1; k <= 9; k++ )  {  /* for each pair  i  j */
      if  ( Find( i ) != Find( j ) )
          SetUnion( Find( i ), Find( j ) );
   }
}
```
</details>

## 灵巧求并算法

* 按大小求并  
即每次合并时，我们改变较小的树
设 $T$ 是按大小合并的 $N$ 个节点的树，那么 $height(T)\leq\lfloor \log_2N\rfloor +1$ (可用归纳法证明)   
因此对于 $N$ 个 `Union` 操作 $M$ 个 `Find` 操作，所用时间为 $O(N+M\log_2N)$
* 按高度求并  
即每次合并时，我们改变较矮的树

## 路径压缩

<details>
``` C
SetType  Find ( ElementType  X, DisjSet  S )
{   ElementType  root,  trail,  lead;
    for ( root = X; S[ root ] > 0; root = S[ root ] )
        ;  /* find the root */
    for ( trail = X; trail != root; trail = lead ) {
       lead = S[ trail ] ;   
       S[ trail ] = root ;   
    }  /* collapsing */
    return  root ;
}
```
</details>
路径压缩的效果是，从 X 到根的路径上每一个节点都使它的父节点变成根。  
路径压缩与按大小求并完全兼容，可以同时实现，但不能与按高度求并（有时称为秩）

## 按秩求并和路径压缩的最坏情形

令 $T(M,N)$ 执行 $M\geq N$ 次 `Find` 和 $N-1$ 次 `Union` 操作的最坏用时。那么 $k_1M\alpha(M,N)\leq T(M,N)\leq k_2 M\alpha(M,N)$ 对于某个正常数 $k_1,k_2$.  
其中 $\alpha(M,N)$ 是 Ackermann 函数.  

$$
\begin{align*}
A(i,j)=\left\{ \begin{matrix}2^j\quad    & i=1\ and\ j\geq 1\\
A(i-1,2)\quad & i\geq 2\ and\ j=1\\
A(i-1,A(i,j-1))\ & i\geq 2\ and\ j\geq 2 \end{matrix}\right.
\end{align*}
$$

!!! Info 
    并查集: the disjoint set   
    等价关系: equivalence relations  
    按大小求并: union by size  
    路径压缩: path compression  