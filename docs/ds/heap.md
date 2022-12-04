---
counter: True  
---

# 优先队列（堆）

## ADT 模型

* 对象：一个有限的有序集
* 操作：
    * 初始化
    * 插入
    * 删除最小的元素
    * 寻找最小的元素

## 简单的实现

* 数组：
    * 插入元素到末尾 $\Theta(1)$  
    * 找到最大/最小元素 $\Theta(n)$, 删除元素移动数组 $O(n)$
* 链表：
    * 插入元素到链表开头 $\Theta(1)$
    * 找到最大/最小元素 $\Theta(n)$, 删除元素 $\Theta(1)$ 
* 有序数组：
    * 插入 找到合适的位置 $O(n)$, 移动数组并插入元素 $O(n)$
    * 删除开头/末尾元素 $\Theta(1)$
* 有序链表：
    * 插入 找到合适的位置 $O(n)$, 插入元素 $\Theta(1)$
    * 删除开头/末尾元素 $\Theta(1)$

## 二叉堆

### 结构性质

堆是一棵被完全填满的二叉树，有可能的例外是在底层：底层上的元素从左到右填入。这样的树称为**完全二叉树**。

一棵高 h 的完全二叉树的节点个数介于 $2^h$ 到 $2^{h+1}-1$ 之间，即完全二叉树的高度是 $\lfloor \log N\rfloor$

对于下标为 $i$ 的元素，其左儿子位于 $2i$ 上，右儿子位于 $2i+1$ 上，他的父亲位于 $\lfloor i/2 \rfloor$ 上。

### 堆序性质

如果一棵树，每个节点的值都不大于其儿子节点的值，那么这是一棵**小根树**。**小根堆**就是满足小根树性质的完全二叉树。

## 基本的堆操作

### 插入

对于新的节点，唯一可以放的位置就是下一个空闲位置，否则堆将不再是完全树，但这样可能破坏堆的序，我们一般采用**上浮**的策略。
<details>
``` C
/* H->Element[ 0 ] is a sentinel */ 
void  Insert( ElementType  X,  PriorityQueue  H ) 
{ 
     int  i; 

     if ( IsFull( H ) ) { 
	Error( "Priority queue is full" ); 
	return; 
     } 

     for ( i = ++H->Size; H->Elements[ i / 2 ] > X; i /= 2 ) 
	H->Elements[ i ] = H->Elements[ i / 2 ]; 

     H->Elements[ i ] = X; 
}
```
</details>
注意这里代码实现中，我们没有使用交换操作，因为交换操作的时间成本更高。

### 删除最小元

我们一般采用**下滤**的策略。删除最小元后，在根节点产生一个空穴。同时堆少了一个元素，我们必须把堆最后一个元素 X 移动到堆的某个地方。从根节点的空穴开始我们将空穴的两个儿子中的较小者移入空穴，这样就把空穴往下推了一层。重复步骤直到 X 可以放入空穴。
<details>
``` C
ElementType  DeleteMin( PriorityQueue  H ) 
{ 
    int  i, Child; 
    ElementType  MinElement, LastElement; 
    if ( IsEmpty( H ) ) { 
         Error( "Priority queue is empty" ); 
         return  H->Elements[ 0 ];   } 
    MinElement = H->Elements[ 1 ];  /* save the min element */
    LastElement = H->Elements[ H->Size-- ];  /* take last and reset size */
    for ( i = 1; i * 2 <= H->Size; i = Child ) {  /* Find smaller child */ 
         Child = i * 2; 
         if (Child != H->Size && H->Elements[Child+1] < H->Elements[Child]) 
	       Child++;     
         if ( LastElement > H->Elements[ Child ] )   /* Percolate one level */ 
	       H->Elements[ i ] = H->Elements[ Child ]; 
         else     break;   /* find the proper position */
    } 
    H->Elements[ i ] = LastElement; 
    return  MinElement; 
}
```
</details>

### 其他的堆操作

需要注意的是，对于小根堆，找除了最小元以外的元素都需要线性搜索整个堆。

* **`DecreaseKey`**  
DecreaseKey(P,$\Delta$,H) 操作降低在位置 P 处的关键字的值。我们需要上滤操作对堆进行调整。
* **`IncreaseKey`**  
IncreaseKey(P,$\Delta$,H) 操作增加在位置 P 处的关键字的值。我们需要下滤操作对堆进行调整。
* **`Delete`**  
Delete(P,H) 操作删除堆中位置 P 上的节点。这个操作首先执行 DecreaseKey(P,$\infty$,H) 再执行 DeleteMin 即可。
* **`BuildHeap`**  
BuildHeap(H) 操作把 N 个关键字作为输出并把它们放在空队中，可以使用 N 个相继的 Insert 操作完成。  
也可以将 N 个关键字以任意顺序放入树中构成一棵完全二叉树，从倒数第二层开始依次 percolate down. 可以证明这时只需要线性的时间复杂度就可以完成树的构建。

**定理**：包含 $2^{h+1}-1$ 个节点，高度为 $h$ 的理想二叉树，其节点的高度和为 $2^{h+1}-1-(h+1)$  
证明：$S=\sum\limits_{i=0}^h 2^i(h-i)$  
因此 BuildHeap 的操作是线性的

## d-Heaps

d-堆是二叉堆的推广，所有的节点都有 d 个儿子（因此二叉堆是 2-堆）
d-堆比二叉堆浅，因此 Insert 操作改进为 $O(\log_dN)$ 但对于大的 d, DeleteMin 会花费更多时间，因为我们每层都要找出 d 个儿子中的最小者。这样操作的用时就是 $O(d\log_dN)$。而且当 d 不是 2 的幂次时，找出儿子和父亲会花费更多的时间。

!!! Info
    Priority queue: 优先队列   
    Binary heap: 二叉堆  
    堆序: heap order  
    上浮：percolate up  
    下滤：percolate down  
