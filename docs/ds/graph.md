---
counter: True  
---

# 图论

## 定义

* 一个图 $G=(V,E)$ 其中 $V$ 是节点的有限非空集合, $E$ 是边的有限非空集合. 每一条边就是一个点对 $(v,w)$.  

    * 无向图: $(v_i,v_j)=(v_j,v_i)$ 表示同一条边
    * 有向图: $(v_i,v_j)\neq (v_j,v_i)$ 其中 $(v_i,v_j)$ 表示由 $v_i$ (tail) 指向 $v_j$ (head) 的一条边。
    * 限制：自环是不合法的，同时我们不考虑多重图 
    * 对于 $(v_i,v_j)$ 这条边，我们称 $v_i,v_j$ 是邻接的(adjacent), 称 $(v_i,v_j)$ 附属于(incident) $v_i/v_j$
* **完全图**: 每一对节点间都存在一条边的图  
* **子图**: $G'\subset G$ 即 $G'$ 中的点和边都包含在 G 中($V(G')\subseteq V(G)\quad E(G')\subseteq E(G)$)  
* **路径**: $\{v_p,v_{i1},v_{i2},\ldots, v_{in},v_q\}((v_i,v_i)\in E)$ 称为从 $v_p$ 到 $v_q$ 的一条路径
* **路径的长度**：路径经过的边的数量
* **简单路径**: $v_{i1},v_{i2}...$ 各不相同(注意第一个点可以和最后一个点相同)
* **圈**: $v_p=v_q$ 的简单路径
* 如果一个无向图中每一个顶点到另一个其他顶点都存在一条路径，那么无向图是**连通**的。具有这样性质的有向图称为**强连通**。如果有向图不是强连通，但他的**基础图**（边去掉方向所形成的图）是连通的，那么称为**弱联通**。
* **DAG**: Directed Acyclic Graph(有向无环图)，树是连通的有向无环图  
* **度数**: 附属于 $v$ 的边的数量。对于一个有向图，还分为出度和入度。给一个 $n$ 个节点的图 $G$, 我们有 $e=\dfrac{\sum\limits_{i=0}^{n-1}d_i}{2}$ （其中 $d_i=degree(v_i)$

## 图的表示

### 邻接矩阵

$$
adj\_mat[i][j]=\left\{ \begin{matrix} 1\quad if\ (v_i,v_j)\ or\ <v_i,v_j>\in E(G)\\ 0\quad \quad \quad \quad \quad \quad  \quad \quad \quad \ \ \ otherwise \end{matrix} \right.
$$

如果 $G$ 是无向图，那么邻接矩阵是对称的，因此我们可以只存一半的数据。

$deg(i)=\sum\limits_{j=0}^{n-1}adj\_mat[i][j]+\sum\limits_{j=0}^{n-1}adj\_mat[j][i]$

但这样的空间需求是 $\Theta(|V|^2)$, 对于非稠密图开销太大。

### 邻接表

对每一个顶点，我们使用一个链表存放其所有邻接的顶点，此时的空间需求为 $O(|E|+|V|)$

在无向图上，每条边 $(u,v)$ 出现在两个表中，因此空间的使用是双倍的，$S=n\ heads + 2e\ edges $

在无向图中，$v$ 的度数就是 $graph[v]$ 中的节点个数。如果 $G$ 是 有向图，这样只能找到出度，对于入度，我们有两种方法:

* 增加一个链表，将边反向并存入 
* 使用多重表

### 邻接多重表列

## 拓扑排序

* AOV 网络：有向图中，用顶点表示活动，用弧表示活动之间的优先关系
* 在有向图中，我们称 $i$ 是 $j$ 的**前驱**，如果存在一条从 $i$ 到 $j$ 的路径  
* 我们称 $i$ 是 $j$ 的**直接前驱**，如果 $<i,j>\in E(G)$. 同时 $j$ 称为 $i$ 的**直接后继**
 
可实现的 AOV 网络一定是 DAG.  

> **拓扑排序**是对有向无环图的顶点的一种排序，它使得如果 $i$ 是 $j$ 的前驱，那么在拓扑序列中 $i$ 一定出现在 $j$ 的前面。

实现思路：在容器中（队列/栈）放未被排序且度数为 0 的节点

<details>
``` C
void Topsort( Graph G )
{   Queue  Q;
    int  Counter = 0;
    Vertex  V, W;
    Q = CreateQueue( NumVertex );  MakeEmpty( Q );
    for ( each vertex V )
	if ( Indegree[ V ] == 0 )   Enqueue( V, Q );
    while ( !IsEmpty( Q ) ) {
	V = Dequeue( Q );
	TopNum[ V ] = ++ Counter; /* assign next */
	for ( each W adjacent to V )
	    if ( – – Indegree[ W ] == 0 )  Enqueue( W, Q );
    }  /* end-while */
    if ( Counter != NumVertex )
	Error( “Graph has a cycle” );
    DisposeQueue( Q ); /* free memory */
}
```
</details>

!!! Note
    拓扑排序可能不是唯一的

## 最短路

给定有向图 $G=(V,E)$ 以及一个花费函数 $c(e), e\in E(G)$. 从源点到终点的一条路径 $P$ 的长度定义为 $\sum\limits_{e_i\subset P}c(e_i)$ （也称为带权路径长） 

### 单源最短路径

给定一个赋权图和一个特定顶点 $s$ 作为输入，找出从 $s$ 到 $G$ 中每一个其他顶点的最短带权路径。
**注意**: 如果这里有负环，那么最短路径定义为 0. 

#### 无权最短路径

采用 BFS(Breadth-First Search) 的方式，从 $s$ 出发寻找所有距离为 1 的顶点(即与 $s$ 邻接)随后寻找与 $s$ 距离为 2 的顶点，即与刚刚那些顶点邻接的顶点，以此类推。

<details>
``` C
void Unweighted( Table T )
{   /* T is initialized with the source vertex S given */
    Queue  Q;
    Vertex  V, W;
    Q = CreateQueue (NumVertex );  MakeEmpty( Q );
    Enqueue( S, Q ); /* Enqueue the source vertex */
    while ( !IsEmpty( Q ) ) {
        V = Dequeue( Q );
        T[ V ].Known = true; /* not really necessary */
        for ( each W adjacent to V )
	if ( T[ W ].Dist == Infinity ) {
	    T[ W ].Dist = T[ V ].Dist + 1;
	    T[ W ].Path = V;
	    Enqueue( W, Q );
	} /* end-if Dist == Infinity */
    } /* end-while */
    DisposeQueue( Q ); /* free memory */
}
```
</details>

#### Dijkstra 算法

令 S 表示源点 s 以及其他已经找到最短路的节点的集合，对于不在 S 集合中的节点 u, 我们定义 $dist[u]$ 表示最短的路径长度，其中路径是从 $s\rightarrow v_i\rightarrow u(v_i\in S)$. 如果路径是非降序生成的，那么

* 最短路径一定是从 $S$ 中的某个点 $v_i$ 到 $u$.  
* $dist[u]=\min\{w\notin S\ |\ dist[w]\}$. 即我们从 $S$ 之外的节点中选择 $dist[u]$ 最小的作为下一个 $u$.  
* 如果 $dist[u_1]<dist[u_2]$ 同时我们将 $u_1$ 加入了 $S$, 那么 $dist[u_2]$ 可能会改变，如果改变了，那么 $dist[u_2]=dist[u_1]+length<u_1,u_2>$.  

<details>
``` C
void Dijkstra( Table T )
{   /* T is initialized by Figure 9.30 on p.303 */
    Vertex  V, W;
    for ( ; ; ) { /* O( |V| ) */
        V = smallest unknown distance vertex;
        if ( V == NotAVertex )
	break; 
        T[ V ].Known = true;
        for ( each W adjacent to V )
	if ( !T[ W ].Known ) 
	    if ( T[ V ].Dist + Cvw < T[ W ].Dist ) {
	    	Decrease( T[ W ].Dist  to
			 T[ V ].Dist + Cvw );
		T[ W ].Path = V;
	    } /* end-if update W */
    } /* end-for( ; ; ) */
}
/* not work for edge with negative cost  */
```
</details>

总的运行时间 $O(|E|+|V|^2)$ 

具体实现:

* 通过扫描整个表来找到 smallest unknown distance vertex - $O(|V|^2+|E|)$ （当图是稠密的时候，这种方法是好的）
* 使用堆。首先我们 `DeleteMin`, 随后可以 `DecreaseKey` 来进行更新，这样我们需要记录 $d_i$ 的值在堆中的位置，当堆发生变化时我们也需要更新；另一种方式是在每次更新后将 $w$ 和新值 $d_w$ 插入堆，这样堆中可能有同一顶点的多个代表。当删除最小值的时候需要检查这个点是不是已经知道的。

#### 负权边的图

<details>
``` C
void  WeightedNegative( Table T )
{   /* T is initialized by Figure 9.30 on p.303 */
    Queue  Q;
    Vertex  V, W;
    Q = CreateQueue (NumVertex );  MakeEmpty( Q );
    Enqueue( S, Q ); /* Enqueue the source vertex */
    while ( !IsEmpty( Q ) ) { /* each vertex can dequeue at most |V| times */
        V = Dequeue( Q );
        for ( each W adjacent to V )
	if ( T[ V ].Dist + Cvw < T[ W ].Dist ) {
	    T[ W ].Dist = T[ V ].Dist + Cvw;
	    T[ W ].Path = V;
	    if ( W is not already in Q )
	        Enqueue( W, Q );
	} /* end-if update */
    } /* end-while */
    DisposeQueue( Q ); /* free memory */
}
/* negative-cost cycle will cause indefinite loop */
```
</details>

#### 无圈图

如果图是无圈的，我们以拓扑序选择节点来改进算法。当选择一个顶点后，按照拓扑序他没有从未知顶点发出的进入边，因此他的距离不可能再降低，算法得以一次完成。

$T=O(|V|+|E|)$ 而且不需要堆

应用：AOE (Activity On Edge) 网络

!!! Info
    digraph: 有向图
    Multigraph: 多重图，即有重边的图   
    cycle: 圈   
    underlying graph: 基础图    
    Adjacency Matrix: 邻接矩阵    
    Adjacency Lists: 邻接表  
    Adjacency Multilists: 邻接多重表列  
