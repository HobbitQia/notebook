---
counter: True  
---

# Container

!!! Abstraction
    * Referennce
    * STL Containers
        * vector
        * list
        * map
    * STL Iterator

## Declaring References

``` C++
char c; // a character
char *p = &c; // a pointer to a character
char &r = c; // a reference to a character
```

`*， &` 可以是标点，也可以是运算符，如 `&` 在第二行是一个运算符，在第三行是一个标点。  
当我们声明引用时，必须有引用的变量。此后，r 相当于是 c 的一个别名。

!!! Example
    ``` C++
    char c = 'A';
    char &r = c;
    r = 'B';
    cout << "c: " << c << endl;
    cout << "b: " << b << endl;
    ```
    此时我们发现两行的输出都是 B. 

* Local or global variables   
    * `type& refname = name;`
    * For ordinary variables, the initial value is required.
* In parameter lists and member variables
    * `type& refname`
    * Binding defined by caller or constructor     
    函数只有在调用时，参数才能绑定。   
    ``` C++
    void f ( int& x );
    f(y); // initialized when function is called
    ```
    这样可以实现函数对函数外变量的值的修改。

`const int& z = x;` 这里的 `const` 是对引用的限制，表示我们不能写 z, 但 x 依然是可写的。

``` C++
void f(int &x)
{
    x++;
}
int main()
{
    int a = 51;
    cout << "a=" << a << endl;
    f(a);
    cout << "a=" << a << endl;
}
```
我们可以看到 a 的值经过函数调用后值自增一，这表明函数可以对参数的值进行修改。  

The target of a reference must have a location!   
即右值不能用于引用绑定。
``` C++
void func(int &);
func (i * 3); // Warning or error!
```

!!! Info "Pointers vs. References"
    * References
        * can't be null
        * are dependent on an existing variable, they are an alias for an variable
        * can't change to a new "address" location
    * Pointers
        * can be set to null
        * pointer is independent of existing objects
        * can change to point to a different address

    实际上, C++ 内部实现引用也是通过指针，只是限制这个指针只能指向初始化的变量。

**Restrictions**

* No references to references
* No pointers to references
* Reference to pointer is ok
* No arrays of references

## Container

Collection objects are objects that can store an arbitrary number of other objects.  

在 C++ 中，容器在 STL 中。

* **STL** = **Standard Template Library**
* Part of the ISO Standard C++ Library
* Data Structures and algorithms for C++.

??? Info "Why should I use STL?"
    * Reduce development time.  
    Data-structures already written and debugged.
    * Code readability  
        * Fit more meaningful stuff on one page.
    * Robustness  
    STL data structures grow automatically.
    * Portable code.
    * Maintainable code
    * Easy

Library includes

* A `pair` class (pairs of anything, int/int, int/char, etc)
* containers
    * `vector` (expandable array)
    * `deque` (expandable array, expands at both ends)
    * `list` (double-linked)
    * `sets` and `maps`
* Basic Algorithms (`sort`, `search`, etc)  
All identifiers in library are in std namespace: using namespace std;

### Vector

每个容器是一个头文件，需要 include. 如 `#include<vector>`.  

``` C++
#include <iostream>
#include <vector>
using namespace std;
int main( ) {
    // Declare a vector of ints (no need to worry about size)
    vector<int> x;
    // Add elements
    for (int a=0; a<1000; a++)
    x.push_back(a);
    // Have a pre-defined iterator for vector class, can use it to print out the items in vector
    vector<int>::iterator p;
    for (p=x.begin(); p<x.end(); p++)
    cout << *p << " ";
    return 0;
}
```
* 这是**泛型定义 (generic classes)**，我们需要指定`vector` 和 `vector` 内的元素类型。（`vector<int> x`）
* `vector<int>::iterator` 是一个类型。实际上 p 不是一个指针，这里利用了 C++ 的运算符重载。

今天有语法糖（C++11）
``` C++
for (auto i:x) {
    cout << i << " ";
}
```
`auto` 的意思是类型自动推断。这里会从 `x` 中依次取出一个值，随后放到 `i` 里去。

**vector**

* It is able to increase its internal capacity as required: as more items are added, it simply makes enough room for them.
* It keeps its own private count of how many items it is currently storing. Its size method returns the number of objects currently stored in it.
* It maintains the order of items you insert into it. You can later retrieve them in the same order.

#### Basic Vector Operations

* Constructor  
    * `vector<Elem>c;`  
    * `vector<Elem>c1(c2);`
* Simple Methods  
    * `V.size(); // num items`  
    * `V.empty(); // empty?`  
    * `==, !=, <, >, <=, >=`  
    * `V.swap(v2); // swap`
* Iterators  
    * `I.begin() // first position`
    * `I.end() // last position`
* Element access
    * `V.at(index)`
    * `V[index]`
    * `V.front() // first item`
    * `V.back() // last item`
* Add/Remove/Find
    * `V.push_back(e)`
    * `V.pop_back()`
    * `V.insert(pos, e)`
    * `V.erase(pos)`
    * `V.clear()`
    * `V.find(first, last, item)`

Two ways to use `vector`
可以预先分配，但增长只能用 `push_back`.  

### List Class

Same basic concepts as vector 

* Constructors
* Ability to compare lists `(==, !=, < , <=, > , >=)`
* Ability to access front and back of list

``` C++
x.push_back(item)
x.push_front(item)
x.pop_back()
x.pop_front()
x.remove(item)
```

??? Example "Sample List Application"
    ``` C++
    #include <iostream>
    #include <list>
    #include <string>
    using namespace std;
    int main()
    {
        list<string>s;
        s.push_back("hello");
        s.push_back("world");
        s.push_front("tide");
        s.push_front("crimson");
        s.push_front("alabama");
        list<string>iterator:: p;
        for (p=s.begin(); p!=s.end(); p++)
            cout << *p << " ";
        cout << endl;
    }
    ```
    这里是 `p!=s.end()` 因为列表每个空间是动态分配的，后申请的空间不能保证在先申请的空间后面。对 `vector` 来说空间是连续的。

??? Example
    ``` C++
    list<int> L;
    for(int i=1; i<=5; ++i)
    L.push_back(i);
    //delete second item.
    L.erase( ++L.begin() );
    copy( L.begin(), L.end(),ostream_iterator<int>(cout,",")); //Prints: 1,3,4,5,
    ```
### Maps

* Maps are collections that contain pairs of values.
* Pairs consist of a key and a value.
* Lookup works by supplying a key, and retrieving a value.

``` C++
#include <map>

map<long,int> root;
root[4] = 2;
root[1000000] = 1000;
long l;
cin >> l;
if (root.count(l))
    cout<<root[l]
else cout<<“Not perfect square”;
```

## Iterators

* Declaring   
`list<int>::iterator li;`
* Front of container  
`list<int>L;li = L.begin();`
* Past the end  
`li = L.end();`
* Can increment  
``` C++
list<int>::iterator li; list<int> L;
li=L.begin();
++li; // Second thing;
```
* Can be dereferenced  
`*li = 10;`

### for-each loop

A for-each loop iterates over the elements of arrays, vectors, or any other data sets. It assigns the value of the current element to the variable iterator declared inside the loop.   
``` C++
for(type variable_name : array/vector_name) {
    loop statements
    ...
}
```
for-each loop 每轮拿到的是容器里的值，因此我们不能修改容器里的值，只能读。

??? Example
    ``` C++
    #include<iostream>
    using namespace std;
    int main()
    {
        int arr[]={1,2,3,4,5}; //array initialization
        cout<<"The elements are: ";
        for(int i : arr) // auto
        {
            cout<<i<<" ";
        }
    return 0;
    }
    ```
    也可以使用 `auto` 自动推断。

* 写起来简单，不需要预先初始化迭代器。  
* 缺点是不能获得下标，也不能逆序遍历，也不能跳过某个单元，不能修改容器的值。

如果觉得名字很长，可以用 `typedef`. ***e.g.*** `typedef PB map<Name,list<PhoneNum> >;`

!!! Warning
    The type in containers
    ``` C++
    vector<Student> v1;
    vector<Student&> v2;
    vector<Student*> v3;
    ```
    `v1.push_back(x)` 会拷贝 x, 拷贝后 `vector` 里最后一个元素的值和 x 相同，但二者没有关系。  
    `v2.push_back(x)` 会生成一个 x 的引用。 
    ``` C++
    while () {
        Student s;
        cin >> ...
        v.push_back(s);
    }
    ```
    实际上这个循环中 s 作为本地变量，地址是不变的，如果我们采取后面两种定义 `vector` 的方法，最后 `vector` 中每个元素都是一样的。  
    后面两种定义方法内存开销小，但易出错。 

!!! Warning "Pitfalls"
    * Accessing an invalid  
    ``` C++
    vector<int> v;
    v[100]=1; // Whoops!
    ```
    Solutions
        * use `push_back()`
        * Preallocate with constructor.
        * Reallocate with `reserve()`
        * Check `capacity()`
    * Inadvertently inserting into `map<>`
    ``` C++
    if (foo["bob"]==1)
    //silently created entry “bob”
    ```
    Solutions: Use `count()` to check for a key without creating a new entry. `if ( foo.count("bob") )`
    * DO not use empty() on `list<>`
    ``` C++
    if ( my_list.count() == 0 ) { ... } // Slow
    if ( my_list.empty() ) {...} // Fast
    ```
    * Use invalid iterator
    ``` C++
    list<int> L;
    list<int>::iterator li;
    li = L.begin();
    L.erase(li);
    ++li; // WRONG
    // Use return value of erase to advance
    li = L.erase(li); // RIGHT
    ```