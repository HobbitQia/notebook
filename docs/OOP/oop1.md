---
counter: True  
---

# Introduction

!!! Abstract
    * Input and output in C++ with `cin` and `cout`
    * The string class, the dot `.` operator
    * Pointer to an object, the arrow `->` operator
    * Dynamic memory allocation with `new` and `delet`

## The First C++ Program

``` C++
#include<iostream>
usingnamespace std;
int main()
{  
    int age;
    int sid;
    cin >> age >>sid;
    cout << "Hello, World! I am " << age << Today!" << endl;  
    return 0;
}
```

* `cout`: 标准输出流  
* `<<` : 把东西插入到左边去  
* `cout << ""` 的副作用是字符串被输出，但结果是字符串本身。   
* `cin >> age` 同理，副作用是读入，结果是 `age` 本身。(读到空格为止)

## String

* `string` is a class in C++. (需要 `#include <string>`)  
* 可以像定义其他类型一样定义变量。 ***e.g.*** `string str;`
* 可以对字符串初始化，用 `cin, cout` 输入输出。


### Assignment for string

``` C++
char charr1[20];
char charr2[20] = "jaguar"; 
string str1;
string str2 = "panther"; 
carr1 = char2; // illegal 
str1 = str2; // legal
```

字符数组不能赋值，字符串是可以的。   
这里 `"panther"` 是一个字符串字面量。

### Concatenation for string

``` C++
string str3;
str3 = str1 + str2;
str1 += str2;
str1 += "lalala";
```

!!! Warning
    ``` C++
    string name;
    name = name + "Johnson";
    ```

    这里 `name` 已经有确定值了，因为这里是一个 class 态，为空字符串。

### Length

`s.length()` 得到字符串的长度。(C++ 中字符串没有 `\0`.)

* `.` 用来检索结构里的成员。(in C)
* C++ 的做法是在结构里放入了函数，成了类。

### Create a string

`string major("CS");` 这样也可以初始化一个字符串。(类似地也可以 `int age(18);`)

### Other Member Functions

* sub-string  
`substr(int pos, int len);` 拷贝字符串从 `pos` 位置开始的 `len` 个字符
    * 如果 `pos` 超出了字符串长度，那么会产生异常；
    * 如果 `pos` 等于字符串长度，那么会得到空字符串；
    * 如果 `pos+len` 超出了字符串长度，那么只会拷贝到字符串末尾。
* alter string  

    * `assign` 将一个新的值赋给字符串   
        ``` C++
        assign (const string& str);     //string
        assign (const string& str, size_t subpos, size_t sublen);   //substring
        assign (const char* s);     //C-string
        assign (const char* s, size_t n);   //buffer
        assign (size_t n, char c);      //fill
        ```
    * `insert` 在 `pos` 之前插入字符  
        ``` C++
        insert (size_t pos, const string& str);
        insert (size_t pos, const string& str, size_t subpos, size_t sublen);
        insert (size_t pos, const char* s);
        insert (size_t pos, const char* s, size_t n);
        insert (size_t pos, size_t n, char c);   
        ```
    * `erase (size_t pos = 0, size_t len = npos);` 擦除从 `pos` 开始 `len` 个字符的字符串（如果超出字符串长度则到字符串末尾）  
    默认参数擦除字符串中所有字符
    * `replace` 代替从 `pos` 开始 `len` 的字符串。
        ``` C++
        replace (size_t pos,  size_t len,  const string& str);
        replace (size_t pos,  size_t len,  const string& str,  size_t subpos, size_t sublen);
        replace (size_t pos,  size_t len,  const char* s);
        replace (size_t pos,  size_t len,  const char* s, size_t n);
        replace (size_t pos,  size_t len,  size_t n, char c);
        ```
    * `find (const string& str, size_t pos = 0)` 从 `pos` 开始查找字符串 `str`, 返回第一次匹配的第一个字符的位置。


## Dynamically Allocated Memory

operator(not function)  
运算符是编程产生代码来做这件事。

* `new`   
`new` 返回指向地址空间的指针。但 `new` 知道地址空间的类型（与 `malloc` 不同）。

    * `new int;`
    * `new Stash;`
    * `new int[10];`
* `delete`
如果要删除的是一个对象，那么会执行其析构函数  

    * `delete p;`
    * `delete[] p;`

* Dynamic Arrays    

    ``` C++
    int * psome = newint [10];
    delete[] psome;
    ```

!!! Warning "这里 `delete[]` 的括号是不能少的"
    `p1 = new int;` 返回一块四个字节的空间的地址，同时有一个表记录某个地址有我们申请的四字节。同理 `p2 = new int [10];` 也会在表中记录.`delete p1` 不会去抹掉地址的数据，只是将表中条目去掉。但如果 `p2++;` 再 `delete p2;` 找不到 p2, 这是一个异常操作。  
    `p1 = new Student;` 那么 `delete p1;` 时会执行 `Student` 的析构函数. `delete p2;` 认为 `p2` 指的是一个对象，所以只将第一个对象析构。这样空间是可以回收的 `delete [] p2;` 就是告诉系统不止一个对象，会帮我们将所有对象都析构。