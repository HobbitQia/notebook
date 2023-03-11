---
counter: True  
---

# 感知机

感知机是二类分类的线性分类模型。将输入向量划分为正负两类的分离超平面，属于判别模型。

## 感知机模型

> **定义**（**感知机**）：假设输入空间（特征空间）是 $\mathcal{X}\subseteq \mathbf{R}^n$, 输出空间是 $\mathcal{Y}=\{+1,-1\}.$ 输入 $x\in \mathcal{X}$ 表示实例的特征向量，对应于输入空间（特征空间）的点，输出 $y\in \mathcal{Y}$ 表示实例的类别。由输入空间到输出空间的函数 $f(x)=sign(w\cdot x+b)$ 称为**感知机**。  
其中 $w,b$ 称为**感知机模型参数**, $w\in \mathbf{R}^n$ 称为**权值**或者**权值向量**, $b\in \mathbf{R}$ 叫做**偏置**. $w\cdot x$ 表示内积, $sign(x)=\left\{\begin{matrix}+1,x\geq 0\\ -1, x<0\end{matrix}\right.$  

几何解释: 

* 线性方程 $w\cdot x + b=0$ 对应特征空间 $\mathbf{R}^n$ 中的一个超平面 $S$, 其中 $w$ 是超平面的法向量, $b$ 是超平面的截距。  
* 感知机模型就是要求这样的超平面, 即求 $\vec w, \vec b$.  

## 感知机学习策略

> **定义**：（**数据集的线性可分性**）给定一个数据集 $T=\{(x_1,y_1),(x_2,y_2),\ldots,(x_N, y_N)\}$ 其中 $x_i\in \mathcal{X}=\mathcal{R}^n, y_i\in \mathcal{Y}=\{+1,-1\},i =1,2,\cdots,N$ 如果存在某个超平面 $S$ 能够将数据集的正实例点和负实例点完全正确地分到超平面的**两侧**，即对所有 $y_i=+1$ 的实例 $i$ 有 $w\cdot x_i + b >0$，对所有 $y_i=-1$ 的实例 $i$ 有 $w\cdot x_i + b <0$, 则称数据集 $T$ 为**线性可分数据集**。   

!!! Note
    注意这里是分到超平面的两侧，没有点在平面上。这与前面 $sign(x)$ 的定义略有不同。  
    $(x_i,y_i)$ 这里 $x_i$ 是一个向量，表示这个点的坐标; $y_i$ 表示这个向量的标签。

**损失函数**

* 自然选择：误分类点的数目，但这样的损失函数不是参数 $w,b$ 的连续可导函数，不易优化。
* 另一选择：误分类点到超平面 $S$ 的总距离   
    * 点 $(x_0,y_0)$ 到超平面 $\vec w\cdot \vec x+b=0$ 的距离: $\dfrac{1}{||w||}|\vec w\cdot \vec x_0+b|$  
    * 误分类点: $-y_i(\vec w\cdot \vec x_i+b) >0$  
    * 误分类点到超平面的距离: $-\dfrac{1}{||w||}y_i(\vec w\cdot \vec x_i+b)$
    * 设超平面 $S$ 的误分类点集合为 $M$, 则误分类点到超平面 $S$ 的总距离: $-\dfrac{1}{||w||}\sum\limits_{x_i\in M}y_i(\vec w\cdot \vec x_i +b)$    
    不考虑 $\dfrac{1}{||w||}$ 就得到了感知机学习的**损失函数**。  
    即 $L(\vec w,b)=-\sum\limits_{x_i\in M}y_i(\vec w\cdot \vec x_i+b)$  
* 损失函数 $L(\vec w,b)$ 是非负的，如果没有误分类点，损失函数值为 $0$. 误分类点越少，误分类点离超平面越近，损失函数值越小。给定训练数据集 $T$, $L(\vec w,b)$ 是 $\vec w, b$ 的连续可导函数。

## 感知机学习算法

### 原始形式

求解最优化问题 $\min\limits_{\vec w,b} L(\vec w,b) = -\sum\limits_{x_i\in M}y_i(\vec w\cdot \vec x_i +b)$  

采用**随机梯度下降法 (Stochastic Gradient Descent, SGD)** 优化  

* 首先选择一个超平面 $\vec w_0,b_0$ 然后用梯度下降法不断地极小化目标函数。  
假设误分类点集合 $M$ 是固定的，则损失函数 $L(\vec w,b)$ 的梯度有 

$$
\begin{align*}
\nabla_w L(\vec w,b) &= -\sum\limits_{\vec x_i\in M} y_i\vec x_i\\
\nabla_b L(\vec w,b) &= -\sum\limits_{\vec x_i\in M}y_i
\end{align*}
$$

* 随机选一个误分类点 $(\vec x_i,y_i)$, 对 $\vec w,b$ 进行更新  
其中 $0<\eta\leq 1$ 是步长，又称为学习率。

$$
\begin{align*}
\vec w & \leftarrow \vec w + \eta y_x\vec x_i\\
b & \leftarrow b + \eta y_i
\end{align*}
$$

* 通过这样迭代，期待损失函数 $L(\vec w,b)$ 不断减小，直到为 $0$.  

!!! Info "随机梯度下降 $VS$ 梯度下降法"
    $\min\dfrac{1}{2m}\sum\limits_{i=1}^m(<\vec w,\vec x_i>-y_i)^2\ \stackrel{\Delta}{=} F(\vec w)$  
    $\nabla_w F(w)=\dfrac{1}{m}\sum\limits_{i=1}^m(<\vec w,\vec x_i>-b)\cdot x_i$  

    * GD: $w_{t+1}=w_t-\eta_t\nabla_w F(w_t)$  
    * SGD: $w_{t-1}=w_t-\eta_t(<\vec w_t,\vec x_{it}>-y_{it})\cdot \vec x_{it}$  

    梯度下降法要求样本梯度的平均值，而随机梯度下降法只需要任一取一个样本梯度即可。同时平均值的期望和和单个样本的期望相同。  
    在这个算法我们应用了随机梯度下降法，为了简化，我们直接用第一个误分类的点作为随机选择的点，并由此更新 $\vec w, b$.  

> **算法**：（感知机学习算法的原始形式）   
> 
> * **输入**：训练数据集 $T=\{(x_1,y_1),(x_2,y_2),\ldots,(x_N, y_N)\}$ 其中 $x_i\in \mathcal{X}=\mathcal{R}^n, y_i\in \mathcal{Y}=\{+1,-1\},i =1,2,\cdots,N$. 学习率 $0<\eta\leq 1$.   
> * **输出**: $\vec w, b$; 感知机模型 $f(x)=sign(\vec w\cdot \vec x + b)$
> 
> 1. 选取初值 $\vec w_0,b_0$
> 2. 在训练集中选取数据 $(\vec x_i,y_i)$
> 3. 如果 $y_i(\vec w\cdot \vec x_i + b)\leq 0$, 则 
> 
> $$
\begin{align*}
\vec w & \leftarrow \vec w + \eta y_x\vec x_i\\
b & \leftarrow b + \eta y_i
\end{align*}
$$
>
> 4. 转至 2, 直至训练集中没有误分类点。

??? Example
    正例 $x_1=(3,3)^\top, x_2=(4,3)^\top$ 负例 $x_3=(1,1)^\top$.   
    <div > <img src="http://cdn.hobbitqia.cc/202303112240086.png" width = 85%/> </div>
    <div > <img src="http://cdn.hobbitqia.cc/202303112242322.png" width = 85%/> </div>

### 算法的收敛性

为便于推导，将偏置 $b$ 并入权值向量 $\vec w$, 记作 $\hat w=(w^\top, b)^\top$, 输入向量也做这样的操作，即 $\hat x=(x^\top,1)^\top$. 这样 $\hat w, \hat x\in \mathcal{R}^n, \hat w\cdot \hat x = w\cdot x + b$.  

> 定理：对于训练数据集 $T$ （定义同前） 
> 
> * 存在满足条件 $||\hat w_{opt}|| = 1$ 的超平面将训练数据集完全正确分开；且存在 $\gamma>0$ 对所有 $i=1,2,\cdots, N$ 使得 $y_i(\hat w_{opt} \cdot \hat x_i)=y_i(w_{opt} \cdot x_i + b_{opt}) \geq \gamma $
> * 令 $R=\max\limits_{1\leq i\leq N}||\hat x_i||$, 则感知机算法在训练数据集上的误分类次数 $k$ 满足 $k\leq \left(\dfrac{R}{\gamma}\right)^2$  

* 误分类次数 $k$ 是有上界的，当训练集线性可分时，算法原始形式是收敛的。
* 算法解不唯一，既依赖于初值，也依赖于迭代过程中选择误分类点的选择顺序。
* 若需要唯一分离超平面，需要增加约束，如 SVM (支持向量机)
* 线性不可分数据集上，结果不收敛，迭代震动。

### 对偶形式

**基本想法**：将 $\vec w, b$ 表示为实例 $\vec x_i$ 和标记 $y_i$ 的线性组合形式，通过求解其系数而求得 $\vec w$ 和 $b$.   
在迭代过程中，我们假设 $\vec w,b$ 关于 $(\vec x_i,y_i)$ 的增量是 $\alpha_i y_i \vec x_i$ 和 $\alpha_i y_i$, 那么最后学习到的 $\vec w=\sum\limits_{i=1}^N\alpha_i y_i \vec x_i, b=\sum\limits_{i=1}^N \alpha_i y_i$. 这里 $\alpha_i\geq 0$, 当 $\eta= 1$ 表示第 $i$ 个实例点由于误分而进行更新的次数。  

> **算法**：（**感知机学习算法的对偶形式**）  
> 
> * **输入**：训练数据集 $T=\{(x_1,y_1),(x_2,y_2),\ldots,(x_N, y_N)\}$ 其中 $x_i\in \mathcal{X}=\mathcal{R}^n, y_i\in \mathcal{Y}=\{+1,-1\},i =1,2,\cdots,N$. 学习率 $0<\eta\leq 1$.    
> * **输出**: $\vec alpha, b$; 感知机模型 $f(x)=sign\left(\sum\limits_{j=1}^N \alpha_j y_j \vec x_j\cdot \vec x + b\right)$, 其中 $\alpha=(\alpha_1,\alpha_2,\cdots,\alpha_N)^\top$. 
> 
> 1. $\vec \alpha \leftarrow 0 ,b \leftarrow 0$
> 2. 在训练集中选取数据 $(\vec x_i,y_i)$
> 3. 如果 $y_i\left(\sum\limits_{j=1}^N \alpha_j y_j \vec x_j\cdot \vec x_i + b\right)\leq 0$, 则 
> 
> $$
\begin{align*}
\alpha_i & \leftarrow \alpha_i + \eta \\
b & \leftarrow b + \eta y_i
\end{align*}
$$
> 
> 4. 转至 2, 直至训练集中没有误分类点。 

这里对偶形式的训练实例只以内积形式出现，我们可以预先将训练集中的实例间的内积计算出来并以矩阵的形式存储，即 Gram 矩阵 $\mathbf{G}=[x_i\cdot x_j]_{N\times N}$  

??? Example
    <div > <img src="http://cdn.hobbitqia.cc/202303112319047.png" width = 85%/> </div>
    <div > <img src="http://cdn.hobbitqia.cc/202303112319187.png" width = 85%/> </div>