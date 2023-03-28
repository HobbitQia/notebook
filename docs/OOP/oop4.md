---
counter: True  
---

# Functions

!!! Abstract
    * Access control
    * Local and member variables
    * Overloaded functions
    * Default arguments
    * Inline functions

## Local and member variables

||local|global|member|
|:-|-|-|-|
|lifecycle|`{}`|全局|对象|
|scope|`{}`|全局|成员函数内|

* 成员变量的作用域和生存期是分离的。如 C 语言中的 `static` 静态变量，和全局变量一样最开始就存在，但是只能作用于这个函数。

## C++ access control

The members of a class can be cataloged, marked as:

* `public` public means all member declarations that follow are available to everyone.  
* `private` The private keyword means that no one can access that member except inside function members of that type.  
只有在<u>**类（不是对象）**</u>内部（内部变量、函数）可以访问。  
可以利用指针访问类其他对象的私有变量。

??? Example
    ``` C++
    struct B {
    private:
        int j;
    public:
        void f(B *p) {
            p->j = 'A';
        }
    }

    B b, bb;
    B.f(&bb);
    ```
    这样是正确的。`b, bb` 是同一个类的不同对象。
    
* `protected`  
不让外界访问，但可以让继承者访问

**Friends** 友元  
其他函数，结构就可以访问本对象的变量。只有自己可以决定友元。

``` C++
struct X {
private:
    int i;
public:
    void initialize();
    friend void g(X*, int i);
    friend void Y::y();
}
```

!!! Info "class vs. struct"
    * class defaults to private
    * struct defaults to public.

## Initialization

### Initializer list

``` C++
class Point {
private:
    const float x, y;
public:
    Point(float xa = 0.0, float ya = 0.0) : y(ya), x(xa) {}
};
```

这里的 `const` 变量不能被赋值，只能被初始化。成员 `const` 变量的初始化，可以 `const float x = 1.0;` 但这样所有类的对象的值都是一样的。而类里另一个可以初始化的地方就是构造函数的初始化列表。

* Can initialize any type of data  
`:` 后是初始化列表，只有在构造函数中使用。会在构造函数执行之前，调用 Initializer list 的构造
* Order of initialization is order of declaration – Not the order in the list!  
**按照成员变量声明的顺序初始化**

!!! Info "Initialization vs. assignment"
    * Initialization  
        ``` C++
        Student::Student(string s):name(s) {}
        ```
        before constructor
    * Assignment
        ``` C++
        Student::Student(string s) {name=s;}
        ```
        inside constructor. *string must have a default constructor.*(先构造出 string 的对象 name, 再赋值)  

    建议均使用 Initializer list. 

## Overloaded constructors

我们可以有重名的函数，但是必须要有不同，以便编译器可以区分。如参数个数，参数类型。

``` C++
void print(char * str, int width); // #1 
void print(double d, int width); // #2 
void print(long l, int width); // #3 
void print(int i, int width); // #4 
void print(char *str); // #5 
print("Pancakes", 15); 
print("Syrup"); 
print(1999.0, 10); 
print(1999, 12); 
print(1999L, 15);
```

!!! Example "Overload and auto-cast"
    ``` C++
    void f(short i);
    void f(double d);
    f('a');
    f(2);
    f(2L);
    f(3.2);
    ```
    除了最后一个，其他都是不能分辨的。

## Default arguments

``` C++
Stash(int size, int initQuantity = 0);
```
A default argument is a value given in the declaration that the compiler automatically inserts if you donʼt provide a value in the function call.  

``` C++
int harpo(int n, int m = 4, int j = 5);
int chico(int n, int m = 6, int j); // illegal
int groucho(int k = 1, int m = 2, int n = 3);
beeps = harpo(2);
beeps = harpo(1,8);
beeps = harpo(8,7,6);
```
To define a function with an argument list, defaults must be added from right to left.  
默认值必须从右到左。

!!! Warning "Pitfall of default arguments"
    ``` C++
    void f(int i, int j = 10);
    int main()
    {
        ...
    }
    void f(int i, int j = 10){
        ...
    }
    ```
    这样会报错: redefinition of default argument. **默认值只能出现在函数原型**。（声明和定义一起是可以的）  
    默认参数值不会在函数代码里出现，只是编译器把编译时会把默认值放进堆栈调用里。因此可能会被其他原型声明改变默认值。  

## Overhead for a function call

the processing time required by a device prior to the execution of a command

* Push parameters
* Push return address
* Prepare return values
* Pop all pushed

### inline function

An **inline** function is expanded in place, like a preprocessor macro, so the overhead of the function call is eliminated.

``` C++
inline int f(int i) {
    return i*2;
}
main() {
    int a=4;
    int b = f(a);   // become b = a * 2;
}
```

inline 不会真正编译函数，当调用函数时，编译器把函数替换到实际位置。

``` C++
inline int plusOne(int x);
inline int plusOne(int x) {return ++x; };
```

* Repeat inline keyword at declaration and definition.  
原型声明和定义都必须有 inline.  
* An inline function definition may not generate any code in .obj file.  

inline 函数的 body 不是定义，只是一个声明。即如果有 inline 函数，我们应该把它放在头文件里。

### Tradeoff of inline functions

* Body of the called function is to be inserted into the caller. 
* This may expand the code size but deduces the overhead of calling time. So it gains speed at the expenses of space. In most cases, it is worth.   
以空间换时间。
* It is much better than macro in C. It checks the types of the parameters.  
宏没有类型检查。  

!!! Info "Inline may not in-line"   
    编译器可能为我们自作主张，决定哪些函数是可以 inline, 哪些不能 inline.  
    The compiler does not have to honor your request to make a function inline. It might decide the function is too large or notice that it calls itself (recursion is not allowed or
    indeed possible for inline functions), or the feature might not be implemented for your particular compiler.  
    
将成员函数的定义写在声明内，就会自动 inline. 也可以在 body 的地方加上 inline.  
Access functions
``` C++
class Cup {
    int color;
public:
    int getColor() { return color; }
    void setColor(int color) {
        this->color = color;
    }
};
```
They are small functions that allow you to read or change part of the state of an object. that is, an internal variable or variables.

!!! Info "Inline or not?"
    * Inline:
        * Small functions, 2 or 3 lines
        * Frequently called functions, e.g. inside loops
    * Not inline?
        * Very large functions, more than 20 lines
        * Recursive functions
    * A lazy way
        * Make all your functions inline, or Never make your functions inline.  