---
counter: True  
---

# Copy Constructor 

## Copying

Create a new object from an existing one.  

* Copying is implemented by the copy constructor  
* Has the unique signature `T::T(const T&);`  
* C++ builds a copy ctor for you if you don't provide one!  
如果没有给拷贝构造, C++ 会自动创造一个  
memberwise 而非 bitwise. 如果有成员是一个对象，会调用对象自己的拷贝函数。  
如果有成员变量是指针，会和原来对象一样指向同一块内存。如果有一个对象被析构，那么这块内存就被 delete, 这就变成了无效内存。  
因此我们不一定要有拷贝构造函数，有指针时必须要有。   
    * Copies each member variable
        * Good for numbers, objects, arrays  
        Copies each pointer
    * Data may become shared!

什么时候拷贝构造会被调用？

* During call by value  
只有对象本身才会有拷贝构造（指针、引用不会）  
* During initialization    
定义变量时做的是初始化，其他时候是赋值。   
初始化是要拷贝构造，赋值要重载赋值运算符。
``` C++
Person baby_a("Fred");
// these use the copy ctor
Person baby_b = baby_a; // not an assignment
Person baby_c( baby_a ); // not an assignment
```
* During function return  
不同编译器可能会做不同的优化。函数返回一个对象时，可能会发生拷贝构造。

一个对象只能被构造（初始化）一次，析构一次，但可以被赋值很多次。  

`string` 有自己的拷贝构造函数。 

!!! Note "Copy ctor guidelines"
    * In general, be explicit  
    Create your own copy ctor -- don't rely on the default
    * If you don't need one declare a `private` copy ctor  
    私有的拷贝构造函数使得对象不能被拷贝构造。
        * prevents creation of a default copy constructor
        * generates a compiler error if try to pass-by-value - don't need a defintion

## types of function parameters and return value

way in

* a new object is to be created in f  `void f(Student i);`  
* better with const if no intend to modify the object  `void f(Student *p);`
* better with const if no intend to modify the object  `void f(Student& i);`

way out

* a new object is to be created at returning  `Student f();`
* what should it points to?  `Student* f();`
* what should it refers to?  `Student& f();`

``` C++
char *foo() {
    char *p;    
    p = new char[10];
    strcpy(p, "something");
    return p;
}
void bar() {
    char *p = foo();
    printf("%s", p);
    delete p;
}
```
`p` 本身是本地变量，但指向的地方是全局的空间。

!!! Note
    * Pass in an object if you want to store it  
    函数要存一个对象，不用用指针或者引用传入，而是直接传入。  
    * Pass in a const pointer or reference if you want to get the values
    * Pass in a pointer or reference if you want to do something to it
    * Pass out an object if you create it in the function  
    如果创建了新的对象，就要传对象出去。
    * Pass out pointer or reference of the passed in only  
    传出去的指针/引用只能是传入的指针/引用。
    * Never new something and return the pointer  
    在哪里 `new` 就在哪里 `delete`.(类内是可以的，比如在构造的 `new` 在析构的时候 `delete`)

## Move Constructor

### Left Value vs Right Value

* 可以简单地认为能出现在赋值号左边的都是左值：
    * 变量本身、引用
    * `*` 、 `[]` 运算的结果
* 只能出现在赋值号右边的都是右值
    * 字⾯量
    * 表达式
* 调用只能接受左值—>引用是左值的别名
* 调用函数时的传参相当于参数变量在调用时的初始化

`&&` 成为右值引用。
``` C++
int x=20; // 左值
int&& rx = x * 2; // x*2的结果是一个右值，rx延长其⽣命周期
int y = rx + 2; // 因此你可以重用它:42
rx = 100; // 一旦你初始化一个右值引用变量，该变量就成为了一个左值，可以被赋值
int&& rrx1 = x; // 非法:右值引用无法被左值初始化
const int&& rrx2 = x; // 非法:右值引用无法被左值初始化
```
`x` 不存在了，右值引用依然可以使用。注意右值引用本身是个左值。
``` C++
int x = 10;
int &&a = x + 2;
int y = a + 2;
cout << y << endl;
x = 5;
cout << y << endl;
a = 40;
cout << y << endl;
cout << a << endl;
int &&b = x;        // ERR: 右值引用不能绑左值（为了区分
int &&b = x+0;      // ok
```
如果函数返回了一个对象，我们可以用右值引用，避免拷贝构造。  

``` C++
void fun(int &lref) {
    cout << "l-value" << endl;
}
void fun(int &&rref) {
    cout << "r-value" << endl;
}
int main() {
    int x = 10;
    fun(x);     // l value
    fun(10);    // r value
}
```

没有接受右值的函数时这样的函数也能接受右值
``` C++
void fun(const int& clref) {
    cout << "l-value const reference\n";
}
```

### Move Constructor

移动拷贝构造函数：参数为右值引用的拷贝构造函数。

如果有一个对象，里面有指针指向一块内存。拷贝构造就是重新申请一块内存并将原内存的数据拷贝过来。而移动构造就是让新对象的指针指向内存，但原指针不再指向这个内存(`nullptr`). 

``` C++
DynamicArray(DynamicArray&& rhs) : m_size{rhs.m_size}, m_array{rhs.m_array}
{
    rhs.m_size = 0;
    rhs.m_array = nullptr;
    cout << "Move constructor: dynamic array is moved!\n";
}
```

什么时候需要移动构造？  
类内有指针，而且对象会在函数内传进传出。    

`std::move()`  
``` C++
vector<int> v1{1, 2, 3, 4};
vector<int> v2 = v1;
vector<int> v3 = std::move(v1);// 此时调用用移动构造函数  
```
此时调用复制构造函数，v2是v1的副本 
通过 `std::move` 将 v1 转化为右值，从⽽激发 v3 的移动构造函数，实现移动语义  
* 对象初始化的形式
    ``` C++
    //小括号初始化
    string str("hello");
    //等号初始化
    string str = "hello";
    //大括号初始化
    struct Studnet
    {
    char *name;
    int age;
    };
    Studnet s = {"dablelv", 18};//Plain of Data类型对象
    Studnet sArr[] = {{"dablelv", 18}, {"tommy", 19}}; //POD数组
    ```
* 列表初始化的形式
    ``` C++
    class Test
    {
    int a;
    int b;
    public:
    Test(int i, int j);
    };
    Test t{0, 0}; //C++11 only，相当于 Test t(0,0);
    Test *pT = new Test{1, 2}; //C++11 only，相当于 Test* pT=new Test(1,2);
    int *a = new int[3]{1, 2, 0}; //C++11 only
    ```

Delegating Ctor