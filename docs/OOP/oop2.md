---
counter: True  
---

# Class

??? Abstract
    * How to decalare a class
    * The declaration and definition of a class

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

需要有构造函数
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

* 构造函数名字和结构名字完全相同，没有返回类型。
* 本地变量被创建时，构造函数被调用。

``` C++
Point::~Point()
```

<!-- ``` C++
class Point {
    public:
        void init(int x, int y);
        void move(int dx, int dy);
        void print() const;
    private:
        int x;
        int y;
}
``` -->

