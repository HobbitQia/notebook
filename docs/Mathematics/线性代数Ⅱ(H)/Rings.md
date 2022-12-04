---
counter: True  
---


# Rings

## Definition

>A ring satisfies
>
>* $R\neq \empty$
>* $R\times R \rightarrow R \quad i.e.(r,s) \rightarrow r+s$
>
> (R,+) is an Abelian group(associativity, commutativity, inverse element, identity element).
> 
>* $R\times R \rightarrow R \quad i.e.(r,s) \rightarrow r\cdot s$
>
> (R,$\cdot$) satisfying associative law.
> 
>* $a(b+c)=ab+ac \quad (b+c)a=ba+ca$

**e.g.**

* $F$ is a field, which is also a ring.($Q,R,C$)

* $F[x]={\sum\limits_{i=0}^na_ix^i|a_i\in F}$ is a ring.

* $Z_n=\{\overline0,\overline1,\ldots,\overline{n-1}\}$ where $\overline k =\{np+k\mid p\in Z\}$ 

  and it satisfies

  * $\overline k + \overline l =\{n(p+q)+k+l\mid p,q\in Z\}=\overline{k+l}$
  * $\overline k \cdot \overline l=\{(np+k)(nq+l)\mid p,q \in Z\}=\overline{kl}$
  * $\overline {k}(\overline l + \overline s)=\overline  k \overline l + \overline k \overline  s=\overline k\ \overline{l+s}=\overline{kl+ks}$

* $M_n(F)=F^{n\times n}=\{(a_{ij}\mid a_{ij}\in F)\}$ and $(M_n(F), +, \cdot)$ is a ring

* $R_1\times R_2=\{(a,b)\mid a\in R_1,b\in R_2\}$ and we define 

  $(a_1,b_1)+(a_2,b_2)=(a_1+b_1,a_2+b_2)$ 

  $(a_1,b_1)(a_2,b_2)=(a_1 b_1,a_2 b_2)$

## Properties

### Unit, identity(单位元, 恒等元)

> **def:** an element $a$ is called an **identity** if $\forall a \in R \quad 1\cdot a = a\cdot 1 =a$

Not every ring has an identity.    **e.g.** $2\Z=\{2n\mid n \in \Z\}$

suppose $R$ is a ring, $\Z\times R =\{(n,r)\mid n\in \Z r\in R\}$ and we define $(n,r)+(m,s)=(n+m,r+s)\quad (n,r)\cdot (m,s)=(nm,rs+ns+rm)$

then $\Z\times R$ has a unit $(1,0)$

and we find $(0,r)+(0,s)=(0,r+s)\quad (0,r)\cdot(0,s)=(0,rs)$

Note:任意环可以通过这样的操作扩充为有单位元的环, 而且还保留了$R$上的运算.

### Commutative Ring

> **def:** A ring is called **commutative** if $\forall a,b\in R\quad ab=ba$, otherwise if $\exist a,b\in R ab\neq ba$ it is called **noncommutative**.

***e.g.*** $\mathbb{R},\mathbb{C}[x]$ are commutative, while $M_n(R)$ is noncommutative.

### Domain Ring(整环)

> **def:** $a \in R$ there is a nonzero element $b$ such that $ab=0$, $a$ is called **left zero-divisor(左零因子)**. Similarily we can define **right zero-divisor**.

* 0 must be zero-divisor. 

  proof: $0\cdot a = (0+0)a=0\cdot a + 0\cdot a$ 

  so $0=0\cdot a +(- 0\cdot a)=0\cdot a +0\cdot a +(-0\cdot a)=0\cdot a$

  thus we get $0\cdot a =0$

>**def:** A ring is called **domain ring** if   
> 
>* $\lvert R \rvert \ge 2$    
>* $R$ has no nonzero zero-divisor.  

***e.g.***

* $\overline Z_6$ is not a domain ring since $\overline 2 \cdot \overline 3 = \overline 0$

* $H=\{      \left[\begin{matrix}
a+bi & c+di\\ -c+di & a-bi
\end{matrix}  \right]    \mid a,b,c,d\in R \ and\ i=\sqrt{-1}            \}$

  $H$ is noncommutative but it is a domain ring.(proof?)

### Division Ring(除环)

> **def:** $a\in R$ is **invertible** if $\exist b \ s.t.ab=ba=1$

***e.g.***

* in $M_n(R)$, $A$ is invertible $ \Leftrightarrow\lvert {A} \rvert \neq 0$
* $0$ is always not invertible since $0 \cdot a =1 \Rightarrow 0\cdot a = 0 =1$then $R=\{0\}$  where $\forall r \in R,\ r=1\cdot r=0\cdot r =0$
* $H$ is a domain ring since $\left[\begin{matrix} a+bi & c+di \\ -c+di& a-bi \end{matrix} \right]^{-1}=\frac{1}{a^2+b^2+c^2+d^2}\left[\begin{matrix} a-bi & -c+di \\ c+di& a+bi \end{matrix} \right]$

> **def:** A ring is called **division ring(or skew-field斜域)** if
>
> * $\lvert R \rvert \ge 2$   
> * nonzero element is invertible.

***e.g.*** Z is not division ring while Q is division ring.

### Field(域)

> **def:** A commutative division ring is called **field.**

**Note**: 域中必有单位元.

## Subring

>**def:** $\empty\neq S\subseteq (R,+,\cdot)$ it is called a **subring** of $R$ if it satisfies
>
>* $\forall a,b\in R\quad a-b\in S$
>* $\forall a,b\in R\quad ab\in R$

**Note**: 为什么是$a-b\in S$而不是$a+b\in S$?    为了确保任意元素的负元也在集合中

而线性空间中因为要对数乘封闭, $(-1)a=-a$ 故负元一定在集合中.

suppose $S_1,S_2$ are subring of $R$, then $S_1+S_2=\{a_1+a_2\mid a_1\in S_1,a_2\in S_2\}$ is not a subring of $R$, $S_1\cap S_2$ is a subring, and $S_1\cup S_2$ is not a subring.

***e.g.***

* $R=\mathbb{Q}[\sqrt2,\sqrt3,\sqrt{6}]=\{a+b\sqrt2+c\sqrt3+d\sqrt6\mid a,b,c,d\in \mathbb{Q}\}$ and $R\leq (\R,+,\cdot)$

  let $S_1=Q[\sqrt2]=\{a+b\sqrt2\mid a,b\in \mathbb{Q}\}$ $S_2=Q[\sqrt3]=\{a+b\sqrt3\mid a,b\in \mathbb{Q}\}$ and both are subrings of $R$

  but $S_1+S_2=\{a+b\sqrt2+c\sqrt3\mid a,b,c\in \mathbb{Q}\}$ is not a subring since $\sqrt2\cdot\sqrt 3 =\sqrt 6 \notin S_1+S_2$

* $Z$ has an identity, but its subring $2\Z$ has no identiy.

* $S=\{\left[ \begin{matrix}a&b&0\\c&d&0\\0&0&0\end{matrix}\right]\mid a,b,c,d\in\R\}\leq M_n(R)$

  their identities are not the same.($S:\left[ \begin{matrix}1&0&0\\0&1&0\\0&0&0\end{matrix}\right]$ abd $M_n(R):\left[\begin{matrix}1&0&0\\0&1&0\\0&0&1\end{matrix}\right]$) 

## Ideal

>**def:** $\empty\neq S\subseteq (R,+,\cdot)$ it is called a **left ideal** of $R$ if it satisfies
>
>* $\forall a,b\in R\quad a-b\in S$
>* $\forall a\in S,b\in R \quad ba\in S$
>
>and we denote it by $I\lhd R$
>
>Similarily we define **right ideal.**

ideal = left ideal + right ideal.

**proposition**: suppose $I_1,I_2$ are left ideal, then $I_1+I_2=\{a+b\mid a\in I_1,b\in I_2\}, I_1\cap I_2=\{a\cdot b\mid a\in I_1,b\in I_2\}$ are also ideals.

proof: suppose $\forall a_i,b_i\in I_i$ where $i=1,2$

* $(a_1+a_2)-(b_1+b_2)=(a_1-b_1)+(a_2-b_2)\in I_1 +I_2$
* $\forall r\in R \quad r(a_1+a_2)=ra_1+ra_2\in I_1+I_2$ 

0 always in ideal since $a-a=0$

we can define $(a\rangle=\cap \{I$ is a left ideal of $R$ containg $a$$\}$

**proposition**: $(a\rangle=\{na+ra\mid n\in Z, r\in R\}$ this ideal containg $a$ and $\forall$ ideal containing $a$ $\Rightarrow (a\rangle \sube I$

**proof**:

* $a$ in this set    $a = 1*a+0*a$ where $1\in Z,0\in R$ thus $a\in (a\rangle$

* this set is an ideal
  *  $\forall n_1a+r_1a, n_2a+r_2a\in(a\rangle$  then $(n_1a+r_1a)-(n_2a+r_2a)=(n_1-n_2)a+(r_1-r_2)a\in (a\rangle$ where $n_1-n_2\in \Z,r_1-r_2\in R$
  * $\forall b\in R, na+ra \in (a\rangle$ then $b(na+ra)=nba+bra\in (a\rangle$ where $nb$ 
  
* the minimum ideal containg $a$

  suppose an ideal $I$ containing  $a$, out target is to prove $(a\rangle\sube I$

  $\forall\ na+ra\in (a\rangle$ then $a\in I, r\in R \Rightarrow ra\in I$

  and $na = \left\{ \begin{matrix}a+a+\ldots+a,n>0 \\ 0,n=0 \\ (-a)+(-a)+\ldots+(-a),n<0\end{matrix}\right.$	so $na\in I$

  thus $na+ra\in I$	$\square$

suppose $R$ has an identity, $na =1_R\cdot a+1_R\cdot a+\dots+1_R\cdot a= (n1_R)\cdot a$ where $n1_R\in R$

so $(a\rangle$ can be writed as $\{ra\mid r\in R \}=Ra$

Similarily, $(a)=\{\sum\limits_{i=0}^nr_ias_i+ra+as+na\mid r_i,s_i,r,s\in R, n\in\N\}\stackrel{+1_R}=\{\sum\limits_{i=0}^nr_ias_i\mid r_i,s_i\in R, n\in \N\}=RaR$

suppose $R$ is commutative, then $\langle a)=(a\rangle=(a)$

### PID(主理想整环)

> **def:** An ideal is called **principa**l if it can be generated by one element.
>
> **def:** $R$ is called **left(resp. right) principal ring** if every left(resp. right)ideal is generated by one element.
>
> **def:** A commutative principal domain is simply denoted by **PID**.

**e.g.**

* $(\Z,+,\dot)$ is a PID.

  proof: let $I$ be an ideal of $Z$

  * $I=\{0\}=(0)=Z\cdot0=\{0\}$ $0$ ideal must be principal ideal.

  * $I\neq\{0\}$ so $\exist n\in I,n\neq0$

    without loss of generalization, we assume $n\in I$ and $n>0$ (since $-n=0-n\in I$, so both $n$ and $-n$ in $I$)

    let $n$ be the least of the set $\{n\in I,n>0\}$ our target is to show $I=(n)=n\Z$

    * $n\in I \Rightarrow(n)\sube I$
    * $\forall m\in I\quad m=qn+r(0\le r\leq n-1)$ so $r=m-qn\in I$ where $m\in I$ and $qn\in(n)\sube I$
    * by choice of n, $r$ must be $0$. Otherwise $r\neq0, r<n$ contradicts the assumption that $n$ is the least element which is gereater than $0$.
    * Thus, $m=qn\in(n)$    $\Z$ is a principal ideal.

  * Apparently, $Z$ is commutative and domain.

* By the proof above, we can similarily prove $(F[x],+,\cdot)$ is a PID where $F$ is a field.

* Every field is a PID.

  **proof**: suppose $F$ is a field, $I$ is an ideal of $F$. We assert that $I$ can be either $(0)$ or $(1)=F$.

  * $I=\{0\}=(0)$

  * $I\neq\{0\}$ we get $a\in I,a\neq0\Rightarrow a^{-1}a=1\in I$ where $a^{-1}\in F,a\in I$

    $\forall b\in F,b=b\cdot 1\in I$ where $b\in F, 1\in I$ so we know $F\sube I$ and obviously $I\sube F$

    thus $I=F=(1)$

  **Note**: 域(除环)中没有非平凡理想.

* $M_n(\R)$ is PID.

  * $I=\{0_{n\times n}\}=(0_{n\times n})$

  * $I\neq\{0_{n\times n}\}$ then $\forall A=(a_{ij})\in I, A\neq 0$    so $\exist a_{kl}\neq 0$

    thus $\forall i,j\in \N,E_{ik}AE_{lj}=a_{kl}E_{ij}$ where $E_{ij}$ represent a matrix whose $(i,j)$ element is $1$.

    so $a_{kl}^{-1}E_{ik}AE_{lj}=E_{ij}\in I$ where $E_{lj}\in M_n(\R), A\in I$ and $a_{kl}^{-1}E_{ik}=(a_{kl}^{-1}E)E_{ik}\in M_n(\R)$ for the definition of ideal.

    $\Rightarrow \forall M=(b_{ij})\in M_n(\R)\quad M=\sum x_{ij}E_{ij}=\sum (x_{ij}E)E_{ij}\in I $

    Therefore, $M_n(\R)\sube I\Rightarrow I=M_n(\R)$	

  **Note**: 非交换, 非整环也可以只有两个理想. 

**Proposition:** $A$ is similar to a diagonal matrix $\Leftrightarrow$ there is a splitting polynomical $f(x)$ which has no mutiplicity roots(重根) $s.t. f(A)=0$

proof 

### Quotient Ring(商环)

> **def:** suppose $I$ is an ideal of $R$, then $R/I=\{a+I\mid a\in R\}$ is called **quotient ring.**
>
> ​		and we define $(a+I)+(b+I)=(a+b)+I,(a+I)(b+I)=ab+I$

**Note**: 

* 商环中的元素$a+I=\{a+b\mid b\in I\}$也是一个集合, 若$a\in I$则$a+I=0+I=0$. 
* 若$R=I$, 则规定$R/I=0$

**proposition:** $a_1+I=a_2+I\Leftrightarrow a_1-a_2\in I$

**proof:**

* $\Rightarrow$ $a_1\in a_1+I=a_2+I$ so $\exist x\in I\ s.t.a_1=a_2+x$ thus $a_1-a_2=x\in I$

*  $\Leftarrow$ $\forall a_1+x\in a_1+I$ where $x\in I$ so $a_1+x=a_2+x+(a_1-a_2)\in a_2+I$ since $x\in I,(a_1-a_2)\in I$

  therefore, $a_1+I\sube a_2+I$. Similarily, we can prove $a_2+I\sube a_1+I$ so $a_1+I=a_2+I$. 

**Note:** 对于商环$R/I$ 我们需要验证**well-defined**. 即若$a+I=a'+I,b+I=b'+I$ 则要满足$a+b+I=a'+b'+I,ab+I=a'b'+I$ 即不同形式同一本质的元素应该映射后得到的元素应该相同.

### Maximal Ideal(极大理想)

> **def:** suppose $I\neq R$ is an ideal of $R$, $I$ is called to be **maximal ideal** if $\forall J\lhd R,J\supe I \Rightarrow \left\{\begin{matrix}J=I \\ R\end{matrix}\right.$

**Note:** 极大理想$I$即只被$I$和$R$包含.($R$是自身的理想.)

**Proposition:** suppose $R$ is commutative ring with identity, then $M$ is a maximal ideal $\Leftrightarrow$ $R/M$ is a field.

**proof:** 



## Homomorphism(同态)

>**def:** $\phi:R_1\rightarrow R_2$ and it statisfies $\phi(a+b)=\phi(a)+\phi(b),\phi(ab)=\phi(a)\phi(b),\phi(1)=1$ then it is called a **homomorphism.**
>
>**def:** $\phi$ is called **monomorphism(单同态)** if $a\neq b \Rightarrow\phi(a)\neq\phi(b)$
>
>**def:** $\phi $ is called **epiomorphism(满同态)** if $r\in R_2\ \exist a\in R_1\ s.t.\phi(a)=r$.

isomorphism(同构) = injective + surjective

we define $\ker\phi=\{a\in R_1\mid \phi(a)=0\}$    $Im\phi=\{\phi(a)\mid a\in R_1\}$

**e.g.** $\phi:\Z\rightarrow \Z_n$ and $a\rightarrow \overline{a}=\{a+kn\mid k\in \Z\}$ and it’s easy to verify it is a homomorphism.

​		$\ker\phi={a\in\Z\mid \overline a=\overline 0}=n\Z=(n)\quad Im\phi=\Z_n$

**proposition:** $\ker\phi$ is an ideal of $R$.

**proof:** 

* $0\in \ker\phi$ since $\phi(0)=\phi(0+0)=\phi(0)+\phi(0)\Rightarrow \phi(0)=0$		thus $ker\phi$ is nonempty.
* $\forall a,b\in \ker\phi\quad \phi(a-b)=\phi(a)-\phi(b)=0-0=0\Rightarrow a-b\in \ker\phi$
* $\forall a\in \ker\phi,b\in R\quad\phi(ba)=b\phi(a)=b\cdot0=0\Rightarrow ba\in \ker\phi$

**proposition:** $Im\phi$ is a subring of $R$.

**proposition:** $\phi$ is injective $\Leftrightarrow$ $\ker\phi =0$









