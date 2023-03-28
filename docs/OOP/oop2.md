---
counter: True  
---

# Class

!!! Abstract
    * How to decalare a class
    * The declaration and definition of a class
    * Constructor and Destructor
    * Seperated head and code file

## Introduction

``` C++
typedef struct point {
    float x;
    float y;
} Point;

void print(const Point *p)
{
    printf("%d %d\n", p->x, p->y);
}

void move(Point* p,int dx, int dy)
{
    p->x += dx;
    p->y += dy;
}

int main()
{
    Point a;
    a.x = 1;
    a.y = 2;
    print(&a);
    move(&a, 10, 20);
    print(&a);
}
```


以上是 C 语言能做的，在 C++ 里我们可以把函数也放到结构里面。  
``` C++
typedef struct point {
    int x;
    int y;
    void print();       
}Point;
```

这里只是声明，并不会产生实际代码（包括结构里的变量也只是声明）。我们往结构里放了函数原型（即函数声明）  

结构外面的 `print()` 称为自由函数，和任何类都没有关系，左为函数自身是独立的。 
声明在结构内的函数不是独立的，从属于 `Point` 结构。还需要一个 body.  

``` C++
struct Point {
    int x;
    int y;
    void print();       
}Point;

void Point::print()
{
    printf("%d %d\n", x, y);
}
```

C++ 中不需要 `typedef` 来声明结构体。  
`a.print()` 即可调用结构体内成员函数。但是这个成员函数如何知道我们要输出的就是 `a.x a.y` ?  

我们在成员函数内 `cout << this << endl;` 发现 `this` 和 `&a` 相同。  

``` C++
void Point::init(int x, int y)
{
    this->x = x;
    this->y = y;
}
```
这里必须加 `this`, 否则类似于局部变量会屏蔽全局变量，编译器会认为 `x = x` 什么也没做。

## `::` Resolver 

预解析器

* `<Class Name>::<function name>`
* `::<function name>`

``` C++
void S::f() {
    ::f(); // Would be recursive otherwise!
    ::a++; // Select the global a
    a--; // The a at class scope
}
```

`this`: the hidden parameter  

* `this` is a hidden paramater for all member functions, with the type of the class.   
***e.g.*** `void Point::move(int dx, int dy);` can be recognized as `void Point::initialize(Point *this, int dx, int dy);` 
* To call the function, you must specify a variable.  
***e.g.*** `p.move(10,10);` can be recognized as `Point::move(&p,10,10);`

??? Info
    `Point` 是姓, `init` 是名，因此 `Point::init` 共同构成了成员函数的名字，因此 `void` 需要放在函数名前面，即 `void Point::init`.  


## Object

**Object = Attributes + Services**

* Data: the properties or status
* Operations: the functions  

<div align=center> <img src="http://cdn.hobbitqia.cc/202303070853521.png" width = 20%/> </div>  

* In C++, an object is just a variable, and the purest definition is "a region of storage".   
* The struct variables learned before are just objects in C++.

### Object vs Class

* Object (this cat)  
    * Represent things, events, or concepts 实体
    * Respond to messages at runtime
* Classes (the cat) 
    * Define properties of instances
    * Act like types in C++

<div align=center> <img src="http://cdn.hobbitqia.cc/202303070915089.png" width = 20%/> </div>  

### OOP Characteristics

* Everything is an object.
* A program is a bunch of objects telling each other what to do by sending messages.  
程序就是一堆对象，互相发送消息，告诉对方要做什么 (what instead of how)   
***e.g.*** 上课的时候，老师在讲课，电脑在发送消息给投影仪...  
老师让同学站起来，这个消息发送过后，具体如何站起来，只由同学自己决定。
* Each object has its own memory made up of other objects.
* Every object has a type.
* All objects of a particular type can receive the same messages.  
同类的对象，都可以接受相同的消息。  
可以接受相同消息的对象，也可以认为是同个类型。 


## Constructor

我们需要有机制，保证对象被创建时有合理的初值。

* 构造函数名字和结构名字完全相同，没有返回类型。
* 本地变量被创建时，构造函数被调用。

``` C++
struct Point{
    ...
    Point();
}
Point::Point()
{
    ...
}
```

当我们创建变量时 `Point b;` 就会自动调用对应类的构造函数。如果有参数就 `Point a(1, 2);` 即可。

构造函数是可以有参数的。

``` C++
struct X {
    int i;
    X(int i); 
    void prt(); 
}
X::X(int i)
{
    // i = 0;
    this->i = i;
}
void prt()
{ 
    cout << i << endl;
}
int main()
{
    X a;    // a.X() 
    // X a(1);
    a.prt();
}
```

这样会报错，因为找不到对应的构造函数。改为 `X a(1);`  或者 `X a=1;` 即可。  
这两种初始化的方法是等价的，也就是说 `int m(10)` 和 `int m=10` 是等价的，`X a=1` 和 `X a(1)` 也是如此。  

如果希望给结构里的元素赋初值，还可以直接在 `struct` 中定义写，如

``` C++
struct X {
    int i = 100;
    ...
}
```
会报 Warning: 要用 C++11 的标准编译才行。

### The default constructor

* 有参数的构造函数。
* 缺省构造函数：没有参数的构造函数。
* 当我们没有写构造函数时，编译器会为我们生成没有参数的自动缺省构造函数。

如果我们有有参数的构造函数，那么我们创建对象时必须提供参数；否则我们可以直接构造一个对象。

``` C++
struct Y {
float f;
int i;
Y(int a);
};
Y y1[] = { Y(1), Y(2), Y(3) }; // OK
Y y2[2] = { Y(1) }; Y y3[7]; // Error
Y y4; // Error
```

## Destructor

The destructor is named after the name of the class with a leading tilde (`~`).The destructor never has any arguments.   
如打开的文件，需要在结束前关闭句柄。

``` C++
struct X() {
    int i;
    X(int i);
    ~X();
}
X::X(int i)
{
    this->i = i;
}
X::~X() 
{
    cout << "~X()" << i << endl;
}
int main()
{
    X a(7);
    X b(11);
    a.prt();
    b.prt();
}
```

得到了如下输出
``` C++
7
11
~X()11
~X()7
```

没有返回类型，没有参数。   
当其作用域结束时，析构会被自动调用。  
因为后构造的可能会用到先构造的元素，所以我们看到是逆序，先析构后构造的。

!!! Info "作用域是以大括号为界的"
    ``` C++
    int main()
    {
        X a(7);
        {
            X b(11);
        }
        a.prt();
    }
    ```
    这样我们会得到输出
    ``` C++
    ~X()11
    7
    ~X()7
    ```
    可以看到在 7 输出前 `b` 就已经被析构。

进入函数，函数所有的本地变量的空间都已经被分配好了，但如果没有执行到具体的构造函数行，是不会调用构造函数的。同理，当进入 `switch case` 语句时，对象的空间已经生成，但没有构造，这样析构时可能会出现问题。

!!! Example 
    ``` C++
    void f(int i) {
        if(i < 10) {
        //! goto jump1; // Error: goto bypasses init
        }
        X x1;  // Constructor called here
        jump1:
        switch(i) {
            case 1 :
            X x2;  // Constructor called here
            break;
        //! case 2 : // Error: case bypasses init
            X x3;  // Constructor called here
            break;
        }
    } 
    ```
    这里 `jump` 跳过了 `x1` 的构造，但在进入函数 `f` 时空间已经被分配好了，当函数结束时，析构仍然会自动进行，如果没有默认零值的话析构会出问题。  
    `switch case` 并不能隔绝变量的作用域，里面的 `x2, x3` 的作用域就是这对大括号，当我们进入 `switch case` 时空间就已经分配，当离开大括号时析构出现问题。


## Definition of Class

* In C++, separated `.h` and `.cpp` files are used to define one class.
* Class declaration and prototypes in that class are in the header file ( `.h` ).
* All the bodies of these functions are in the source file (`.cpp`)

一个 `.cpp` 文件是一个编译单元。编译时我们只看一个 `.cpp` 文件，当引用其他函数的原型时，我们需要头文件来告诉编译器。

<div align=center> <img src="http://cdn.hobbitqia.cc/202303142014426.png" width = 50%/> </div>  

### `#include`

`#include` is to insert the included file into the `.cpp` file at where the `#include` statement is.  

* `#include "xx.h"` : search in the *current directory firstly*, then the directories  
declared somewhere
* `#include <xx.h>` : search in the specified directories
* `#include <xx>` : same as `#include <xx.h>`

!!! Notes "Tips for header"
    * 一个头文件里放一个类的声明
    * 以相同的文件名前缀与一个源文件关联
    * 头文件的内容被`#ifndef #define #endif`包围