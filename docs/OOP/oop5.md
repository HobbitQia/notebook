---
counter: True  
---

# Constant and Static

??? Abstract
    * `const`
        * const objects
        * const member functions
    * `static`
        * static member
        * static objects
    * `namespace`

## `const`

declare a variable to have a constant value.

``` C++
const int x = 123;  // const, literal
x = 27;     // illegal!
x++;    // illegal!
int y = x;  // ok, copy const to non-const
y = x;  // ok, same thing
const int z = y;    // ok, const is safer
```

我们通过编译器来防止常量被修改

* Constants are variables
    * Observe scoping rules
    * Declared with `const` type modifier
* A const in C++ defaults to internal linkage
    * the compiler tries to avoid creating storage for a const -- holds the value in its
    symbol table.  
    一个局部变量的作用域就在内部，编译器主动把它生成，不把它作为一个变量。
    * extern forces storage to be allocated.

* Compile time constants  
声明的时候不能给值(`extern const int ...`)，只有定义的时候才可以。
* Run-time constants  
``` C++
const int class_size = 12;
int finalGrade[class_size]; // ok
int x;
cin >> x;
const int size = x;
double classAverage[size]; // error! C++11 is ok.
```
* Aggregates
``` C++
const int i[] = { 1, 2, 3, 4 };
float f[i[3]]; // Illegal(in C++98)
struct S { int i, j; };
const S s[] = { { 1, 2 }, { 3, 4 } };
double d[s[1].j]; // Illegal
```  
Itʼs possible to use const for aggregates, but storage will be allocated. In these
situations, const means.  
However, the value cannot be used at compile time because the compiler is not
required to know the contents of the storage at compile time.

### Pointers and const

<div align=center> <img src="http://cdn.hobbitqia.cc/202304040815753.png" width = 50%/> </div>

``` C++
char * const q = "abc"; // q is const
*q = 'c'; // ERROR
// char a[] = "abc"; *q = 'c' is ok.
q++; // ERROR
const char *p = "ABCD"; // (*p) is a const char
*p = 'b'; // ERROR! (*p) is the const
```

C/C++ 把字符字面量做成字符数组，并加上 `\0`, 放在一个不可修改的地方。  
`char * const q` 表示 q 指向 abc 的地址，则 q 不能再指向其他地方。  
`const char * q` p 指向的地址可以修改，但不能通过 p 修改 p 指向的值。

!!! Example
    ``` C++
    string p1("Fred");
    const string* p = &p1;
    string const* p = &p1;
    string *const p = &p1;
    ```
    * 对象不能改
    * 对象不能改
    * 指针不能改

    `*` 的位置，const 在星号前面则对象不能改，否则表示指针不能改。

||**`int i;`**|**`const int ci = 3;`**|
|:-|-|-|
|`int *ip;`|`ip = &i;`|`ip = &ci; // ERROR`|
|`const int *cip`|`cip = &i;`| `cip=&ci;`|

如果 `ip = &ci` 不报错，那么我们就无法在运行时对程序修改常量做出任何限制。  
`cip = &i;` 之后 `i` 仍然可以修改，只是不能通过 `cip` 修改 `i` 的值。

``` C++
char* s = "Hello, world!";
```

* `s` is a pointer initialized to point to a string constant
* This is actually a `const char *s` but compiler accepts it without the const  
为了向后兼容
* Don't try and change the character values (it is undefined behavior)
* If you want to change the string, put it in an array:  
``` C++
char s[] = "Hello, world!";
```

Can always treat a non-const value as const.  
返回 const 指针是有意义的，只能读不能写

### Const Object

``` C++
const Currency the_raise(42, 38);
```

* What members can access the internals?
* How can the object be protected from change?
* Solution: declare member functions const


``` C++
int Date::set_day(int d) {
    //...error check d here...
    day = d; // ok, non-const so can modify
}
int Date::get_day() const {
    day++; // ERROR modifies data member
    set_day(12); // ERROR calls non-const member
    return day; // ok
}
```
这个 const 表明在在函数里不会改变成员变量，也不会调用其他非 const 的成员函数。不加 const 表明我们不一定修改。

Repeat the const keyword in the definition as well as the declaration.
``` C++
int get_day () const;
int get_day() const { return day };
```

const 定义的对象，只能调用带 const 属性的成员函数。

``` C++
void f() const;
void f();
```
可以重载，会根据对象调用时是否 const 来决定调用哪个成员函数。事实上 const 后的成员函数参数，相当于 `const A *this`, 而不加 const 就只是 `A *this`. 

如果成员变量中有 const
``` C++
class A {
    const int i;
};
```
has to be initialized in initializer list of the constructor.  
<!-- p22 -->
## `static`

* Two basic meanings
    * Static storage
* allocated once at a fixed address
    * Visibility of a name
    * internal linkage

静态本地变量实际上是全局变量，被存储在静态内存中。    
出现在全局变量/函数前，表示访问限制，只有当前文件可以访问。

In C++, don't use static except inside functions and classes.  

|type| meaning|
|:-|-|
|static free function| internal linkage(deprecated)|
|static global variables |internal linkage(deprecated)|
|static local variables |persistent storage|
|static member  variables| shared by instances|
|static member functions| shared by instances, can only access static member|

Static applied to objects ...
Construction occurs when definition is encountered
Constructor called at-most once
The constructor arguments must be satisfied
Destruction takes place on exit from program
Compiler assures LIFO order of destructors

全局变量的构造发生在 `main()` 之前，在 `main()` 或者 `exit()` 之后析构。  
但是不同编译单元的全局变量，如果存在依赖关系，但这是无法保证的。

Just say no -- avoid non-local static dependencies.

Can we apply static to members?

静态成员变量和静态本地变量是一样的。访问受限，限于类内部，实际上是全局变量。  
表现：在这个类内所有的对象都维持相同的值，对象 A 修改了那么对象 B 的这个变量的值也会改变。  

好习惯：只要不改变成员变量的值，就把成员函数加上 const.  

静态成员函数没有 this, 不能调用非静态成员变量，也不能访问非静态函数。可以在没有创建类的对象的时候就能调用静态成员函数。  

## Namespace

Avoiding name clashes  
``` C++
// old1.h
void f();
void g();

// old2.h
void f();
void g();
```
名字空间，相当于给这些 name 加上了 family name.  
``` C++
// old1.h 
namespace old1 { void f(); void g(); }
// old2.h 
namespace old2 { void f(); void g(); }
```

Namespace

* Expresses a logical grouping of classes, functions, variables, ***etc.***
* A namespace is a scope just like a class
* Preferred when only name encapsulation is needed

### Using names from a namespace

* **Using-Declarations**
    * Introduces a local synonym for name
    * States in one place where a name comes from.
    * Eliminates redundant scope qualification:  
        ``` C++
        void main() {
            using MyLib::foo;
            using MyLib::Cat;
            foo();
            Cat c;
            c.Meow();
        }
        ```
* **Using-Directives**
    * Makes all names from a namespace available.
    * Can be used as a notational convenience.  
        ``` C++
        void main() {
            using namespace std;
            using namespace MyLib;
            foo();
            Cat c;
            c.Meow();
            cout << "hello" << endl;
        }   
        ```
    * Using-directives may create potential ambiguities.
        ``` C++
        // Mylib.h
        namespace XLib {
            void x();
            void y();
        }
        namespace YLib {
            void y();
            void z();
        }
        ```
        Solution: 

        * Using-directives only make the names available.
        * Ambiguities arise only when you make calls.
        * Use scope resolution to resolve.
            ``` C++
            void main() {
                using namespace XLib;
                using namespace YLib;
                x(); // OK
                y(); // Error: ambiguous
                XLib::y(); // OK, resolves to XLib
                z(); // OK
            }
            ```

### **Namespace aliases**
``` C++
namespace short1 = supercalifragilistic;
short1::f();
```

### **Namespace composition**

* Compose new namespaces using names from other ones.
* Using-declarations can resolve potential clashes.
* Explicitly defined functions take precedence.

``` C++
namespace first {
    void x();
    void y();
}
namespace second {
    void y();
    void z();
}

namespace mine {
    using namespace first;
    using namespace second;
    using first::y(); // resolve clashes to first::x()
    void mystuff();
    // ...
}
```

### **Namespace selection**

* Compose namespaces by selecting a few features from other namespaces.
* Choose only the names you want rather than all.
* Changes to "orig" declaration become reflected in "mine".

``` C++
namespace mine {
    using orig::Cat; // use Cat class from orig
    void x();
    void y();
}
```

### **Namspaces are open.** 

* Multiple namespace declarations add to the same namespace.
    * Namespace can be distributed across multiple files.
``` C++
//header1.h
namespace X {
    void f();
}
// header2.h
namespace X {
    void g(); // X how has f() and g();
}
```