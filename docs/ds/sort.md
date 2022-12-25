
# 排序

我们假设 "<" ">" 运算符存在，这两种运算是仅有的允许对输入数据进行的操作，这称为**基于比较的排序**. 我们假定 N 为要排序的元素个数，数据从位置 0 开始。

## 插入排序

插入排序有 N-1 趟(pass), 对于 $P=1$ 到 $P=N-1$ 趟我们保证位置 0 到位置 $P-1$ 上的元素是已经排序好的，而第 $P$ 趟要做的就是将位置 $P$ 的元素向左移动到它在前 $P+1$ 个元素中的正确位置上。  

``` C
void InsertionSort ( ElementType A[ ], int N ) 
{ 
    int j, P; 
    ElementType  Tmp; 

    for ( P = 1; P < N; P++ ) { 
	Tmp = A[ P ];  /* the next coming card */
	for ( j = P; j > 0 && A[ j - 1 ] > Tmp; j-- ) 
	      A[ j ] = A[ j - 1 ]; 
	      /* shift sorted cards to provide a position 
                       for the new coming card */
	A[ j ] = Tmp;  /* place the new card at the proper position */
      }  /* end for-P-loop */
}
```

* 最佳情况 - 输入数据是已经排好序的，那么运行时间为 $O(N)$  
* 最坏情况 - 输入数据是逆序的，那么运行时间为 $O(N^2)$

## 简单排序算法的下界

> 一个**逆序**是指数组中 $i<j$ 但 $A[i]>A[j]$ 的序偶 $(A[i],A[j])$  

交换不按原序排列的相邻元素会恰好消除一个逆序，因此插入排序的运行时间为 $O(I+N)$. 其中 $I$ 为原始数组中的逆序数，当逆序数较少时插入排序以线性时间运行。

> $N$ 个互异数的数组的平均逆序数为 $\dfrac{N(N-1)}{4}$  

> 通过交换相邻元素进行排序的任何算法平均需要 $\Omega(N^2)$ 时间

## 希尔排序

希尔排序使用一个 $h_1,h_2,\ldots,h_t$ 的**增量序列**($h_1=1$).  
**$h_k$-sort** 的一般做法是，对于 $h_k,h_k+1,\ldots,N-1$ 中的每一个位置 $i$, 将其元素放到 $i,i-h_k,i-2h_k,\ldots$ 中间的正确位置上。相当于对 $h_k$ 个独立的子数组各进行一次插入排序。$h_k$-sort 之后，对于每一个 $i$ 我们都有 $a_i\leq a_{i+h_k}$, 此时成称为 **$h_k$-sorted**. 

希尔排序的一个重要性质: 一个 **$h_k$-sorted** 的文件（此后将是 **$h_{k-1}$-sorted**）保持他的 **$h_k$-sorted** 性质。  

### 希尔增量序列

$h_t=\lfloor N/2 \rfloor, h_k=\lfloor h_{k+1}/2 \rfloor$(可以有更好的增量序列)

``` C
void Shellsort( ElementType A[ ], int N ) 
{ 
      int  i, j, Increment; 
      ElementType  Tmp; 
      for ( Increment = N / 2; Increment > 0; Increment /= 2 )  
	/*h sequence */
	for ( i = Increment; i < N; i++ ) { /* insertion sort */
	      Tmp = A[ i ]; 
	      for ( j = i; j >= Increment; j - = Increment ) 
		if( Tmp < A[ j - Increment ] ) 
		      A[ j ] = A[ j - Increment ]; 
		else 
		      break; 
		A[ j ] = Tmp; 
	} /* end for-I and for-Increment loops */
}
```

* 最坏情形分析  
> 使用希尔增量时的希尔排序的最坏情形运行时间为 $\Theta(N^2)$ 

* Hibbard 增量序列  
$h_k= 2^k-1$, 且其最坏情形下运行时间为 $O(N^{3/2})$

## 堆排序

如果我们先 `BuildHeap`, 再 Delete N 次最小元素，这样需要多使用一个附加数组，使得存储需求增加一倍。  

每次 `DeleteMin` 后，堆的大小缩小了 1, 因此我们可以用堆中最后的单元来存放刚刚删去的元素。  

整体流程：

* 以线性时间建一个 Max 堆
* 将堆中最后元素与第一个元素交换，缩减堆的大小并进行下滤。执行 N-1 次 `DeleteMax` 操作  
* 算法终止时，数组按顺序即为从小到大的排序结果

``` C
void Heapsort( ElementType A[ ], int N ) 
{  int i; 
    for ( i = N / 2; i >= 0; i - - ) /* BuildHeap */ 
        PercDown( A, i, N ); 
    for ( i = N - 1; i > 0; i - - ) { 
        Swap( &A[ 0 ], &A[ i ] ); /* DeleteMax */ 
        PercDown( A, 0, i ); 
    } 
}
```

注：这里的堆我们是从 0 开始计数的，因此左儿子应该是 `2*i+1`  

> 对 N 个互异项的随机排列进行堆排序，平均比较次数为 $2N\log N-O(N\log\log N)$

## 归并排序

基本操作：合并两个已排序的表，我们可以用双指针的方法在线性时间内完成两个表的合并，具体操作如下

* 取两个输入数组 A 和 B, 一个输出数组 C, 以及三个计数器 Aptr, Bptr, Cptr, 分别对应数组的开端。
* 每次 `A[Aptr]` 和 `B[Bptr]` 中的较小者会被拷贝到 C 中的下一个位置，，相关的计数器向前推进一步。
* 当两个输入表中有一个用完时，将另一个表的剩余部分拷贝到 C 中。
* 我们最多进行 $N-1$ 次比较，因此合并时间显然是线性的。

因此归并排序的流程就是，如果 `N=1` 那么只有一个元素需要排序，答案是显然的；否则递归地将前半部分数据和后半部分数据各自归并排序，得到排序后的两部分数据，然后使用刚刚描述的合并操作将这两个部分合并到一起。  

需要注意的是，如果我们每次递归调用 Merge 都局部声明一个临时数组，那么任意时刻就会有 $\log N$ 个临时数组处于活动期，这对于小内存的机器是致命的。注意到 Merge 只在每次递归调用的最后一行，因此任何时刻只需要一个临时数组活动，而且可以使用该临时数组的任意部分，这样节约了空间。

<details>

``` C
void MSort( ElementType A[ ], ElementType TmpArray[ ], 
		int Left, int Right ) 
{   int  Center; 
    if ( Left < Right ) {  /* if there are elements to be sorted */
	Center = ( Left + Right ) / 2; 
	MSort( A, TmpArray, Left, Center ); 	/* T( N / 2 ) */
	MSort( A, TmpArray, Center + 1, Right ); 	/* T( N / 2 ) */
	Merge( A, TmpArray, Left, Center + 1, Right );  /* O( N ) */
    } 
} 

void Mergesort( ElementType A[ ], int N ) 
{   ElementType  *TmpArray;  /* need O(N) extra space */
    TmpArray = malloc( N * sizeof( ElementType ) ); 
    if ( TmpArray != NULL ) { 
	MSort( A, TmpArray, 0, N - 1 ); 
	free( TmpArray ); 
    } 
    else  FatalError( "No space for tmp array!!!" ); 
}
/* Lpos = start of left half, Rpos = start of right half */ 
void Merge( ElementType A[ ], ElementType TmpArray[ ], 
	       int Lpos, int Rpos, int RightEnd ) 
{   int  i, LeftEnd, NumElements, TmpPos; 
    LeftEnd = Rpos - 1; 
    TmpPos = Lpos; 
    NumElements = RightEnd - Lpos + 1; 
    while( Lpos <= LeftEnd && Rpos <= RightEnd ) /* main loop */ 
        if ( A[ Lpos ] <= A[ Rpos ] ) 
	TmpArray[ TmpPos++ ] = A[ Lpos++ ]; 
        else 
	TmpArray[ TmpPos++ ] = A[ Rpos++ ]; 
    while( Lpos <= LeftEnd ) /* Copy rest of first half */ 
        TmpArray[ TmpPos++ ] = A[ Lpos++ ]; 
    while( Rpos <= RightEnd ) /* Copy rest of second half */ 
        TmpArray[ TmpPos++ ] = A[ Rpos++ ]; 
    for( i = 0; i < NumElements; i++, RightEnd - - ) 
         /* Copy TmpArray back */ 
        A[ RightEnd ] = TmpArray[ RightEnd ]; 
}
```
</details>

* 运行时间分析  

$$
\begin{align*}
T(1) & = 1\\
T(N) & = 2T(N/2)+O(N) \\
	& = 2^kT(N/2^k) + k*O(N)\\
	& = N *T(1) +\log N *O(N)\\
	& = O(N+N\log N)
\end{align*}
$$

注：Mergesort 需要线性外部内存，复制数组缓慢，因此不适合用于内部排序，但对于外部排序是有用的。

## 快速排序

快速排序是在实践中已知的最快的排序算法，平均运行时间是 $O(N\log N)$  
快速排序的算法流程：（将数组 S 排序）

* 如果 S 中的元素个数是 0 或者 1 则返回
* 从 S 中取任意元素为**主元**
* 将 $S-\{v\}$ 分为两个不相交的集合 $S_1=\{x\in S-\{v\}|x\leq v\}, S_2=\{x\in S-\{v\}|x\geq v\}$  
* 返回 $quicksort(S_1), v, quicksort(S_2)$  

对于不同主元的选取，分割的描述不是唯一的。

### 选取主元

* 错误的方法 `Pivot=A[0]`  
这样如果输入是顺序或者反序的，那么每次划分所有元素全部落入 $S_1$ 或者 $S_2$, 选取主元并没有带来任何帮助，完成排序需要 $O(N^2)$ 的时间。  
* 安全做法 `Pivot = random select from A[]`  
但随机数的产生是昂贵的  
* 三数中值分割法 `Pivot = median(left, center, right)`  
一组 N 个数的中值是第 $\lceil N/2 \rceil$ 大的数，主元最好是选择中值，但这很难算出，而且会明显减慢排序的速度。因此我们可以使用左端、右端和中心位置上的三个元素的中值作为主元。  
这样消除了错误方法中的最坏情形，减少了快速排序大概 5% 的运行时间。  

### 划分策略

首先我们将主元和最后的元素交换，使得主元离开将要分割的数据段，随后 i 从第一个元素开始，j 从倒数第二个元素开始。（假设所有元素互异）  

* 当 i 在 j 的左边时，我们将 i 右移，移过那些小于主元的元素，并将 j 左移，移过那些大于主元的元素。
* 当 i 和 j 停止时，i 指向一个大元素而 j 指向一个小元素，如果 i 在 j 的左边那么将这两个元素互换。
* 直到 i 和 j 彼此交错时，停止交换
* 将 i 和主元交换

对于那些等于主元的关键字，我们采用停止 i j 并交换的策略。因为若 i j 不停止，对于数组中所有关键字都相同的情况，我们需要有程序防止 i j 超出数组的界限。最后我们会把主元交换到 i 的最后位置上，也就是倒数第二个位置，这样我们又陷入了最坏情况。

### 小数组

对于很小的数组($N\leq 20$)快速排序不如插入排序，因此我们可以设置一个截止范围 Cutoff(***e.g.*** 10). 当 N 小于阈值的时候采用插入排序.  

### 实现

<details>

``` C
void  Quicksort( ElementType A[ ], int N ) 
{ 
	Qsort( A, 0, N - 1 ); 
	/* A: 	the array 	*/
	/* 0: 	Left index 	*/
	/* N – 1: Right index	*/
}
/* Return median of Left, Center, and Right */ 
/* Order these and hide the pivot */ 

ElementType Median3( ElementType A[ ], int Left, int Right ) 
{ 
    int  Center = ( Left + Right ) / 2; 
    if ( A[ Left ] > A[ Center ] ) 
        Swap( &A[ Left ], &A[ Center ] ); 
    if ( A[ Left ] > A[ Right ] ) 
        Swap( &A[ Left ], &A[ Right ] ); 
    if ( A[ Center ] > A[ Right ] ) 
        Swap( &A[ Center ], &A[ Right ] ); 
    /* Invariant: A[ Left ] <= A[ Center ] <= A[ Right ] */ 
    Swap( &A[ Center ], &A[ Right - 1 ] ); /* Hide pivot */ 
    /* only need to sort A[ Left + 1 ] … A[ Right – 2 ] */
    return  A[ Right - 1 ];  /* Return pivot */ 
}
void  Qsort( ElementType A[ ], int Left, int Right ) 
{   int  i,  j; 
    ElementType  Pivot; 
    if ( Left + Cutoff <= Right ) {  /* if the sequence is not too short */
        Pivot = Median3( A, Left, Right );  /* select pivot */
        i = Left;     j = Right – 1;  /* why not set Left+1 and Right-2? */
        for( ; ; ) { 
	 while ( A[ + +i ] < Pivot ) { }  /* scan from left */
	 while ( A[ – –j ] > Pivot ) { }  /* scan from right */
	 if ( i < j ) 
	    Swap( &A[ i ], &A[ j ] );  /* adjust partition */
	 else     break;  /* partition done */
        } 
        Swap( &A[ i ], &A[ Right - 1 ] ); /* restore pivot */ 
        Qsort( A, Left, i - 1 );      /* recursively sort left part */
        Qsort( A, i + 1, Right );   /* recursively sort right part */
    }  /* end if - the sequence is long */
    else /* do an insertion sort on the short subarray */ 
        InsertionSort( A + Left, Right - Left + 1 );
}
```
</details>

* 在最开始选取主元时，我们将 `A[left],A[mid],A[Right]` 进行排序。这样的话我们将较小值放在了最左边，较大值放在了最右边，这符合分割的要求。此外由于 `A[left]` 比主元小，我们不用担心 j 越界。

### 复杂度分析

$T(N)=T(i)+T(N-i-1+)+cN$ 其中 $i=|S_1|$  

* 最坏情形：主元始终是最小元素，此时 $i=0$ 则递推关系为 $T(N)=T(N-1)+cN,N>1$ 那么 $T(N)=T(1)+d\sum\limits_{i=2}^N i=O(N^2)$  
* 最好情形：主元正好位于中间 $T(N)=2T(N/2)+cN\Rightarrow T(N)=O(N\log N)$   
* 平均情形：$T(N)=\dfrac{2}{N}\sum\limits_{j=0}^{N-1}T(j)+cN\Rightarrow T(N)=O(N\log N)$

## 大型结构的排序

交换两个大型的结构可能是非常昂贵的，因此我们让输入数组包含指向结构的指针，通过比较指针指向的关键字，必要时交换指针来进行排序。

## 排序的一般下界

> 只使用比较的任意排序算法最坏情形下都需要 $\Omega(N\log  N)$  

使用决策树证明：共 $N!$ 种排序可能，因此决策二叉树有 $N!$ 片叶子，则树的深度至少为 $\log(N!)=\Omega(N\log N)$  

## 桶排序

若输入数据 $A_1,A_2,\ldots,A_N$ 都小于 $M$, 那么我们可以用一个大小为 $M$ 的 `Count` 数组，初始化为全 0. 于是 `Count` 有 $M$ 个桶，读入到 $A_i$ 时 `Count[Ai]` 自增一。所有数据读完后扫描数组 `Count` 打印排序后的表。  

<details>

``` C
{
    initialize count[ ];
    while (read in a student’s record)
        insert to list count[stdnt.grade];
    for (i=0; i<M; i++) {
        if (count[i])
            output list count[i];
    }
}
```
</details>

$O(M+N)$


LSB MSB