---
counter: True  
---

# Smart Pointers

Reference counting  

C++ 没有单根结构，也没有自动垃圾回收。

Goal: Introduce the code for maintaining reference counts. 

* A reference count is a count of the number of times an object is shared.  
表示当前对象被几个指针指着。
* Pointer manipulations have to maintain the count  
在指针操作时，需要修改对象的引用计数。如果一个对象的计数是 0, 我们需要把它析构，这样就实现了垃圾回收。

Class `UCObject` holds the count  
`UCPointer` is a smart pointer to a `UCObject`  

## Reference counts

Shared memory maintains a count of how many times it is shared.  
<div align=center> <img src="http://cdn.hobbitqia.cc/202306101400268.png" width = 40%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202306101401142.png" width = 40%/> </div>

为了节约内存，我们让这两个字符串指向的 "abcdef" 是同一个对象。
<div align=center> <img src="http://cdn.hobbitqia.cc/202306101402182.png" width = 40%/> </div>

* Each sharable object has a counter  
Initial value is 0
* Whenever a pointer is assigned: `p = q;` Have to do the following 
``` C++
p->decrement(); // p's count will decrease 
p = q; 
q->increment(); // q/p's count will increase
```

<div align=center> <img src="http://cdn.hobbitqia.cc/202306101405897.png" width = 50%/> </div>

`StringRep` 继承自 `UCObject`, 因此内部有引用计数。  
`String` 是外部接口，有一个成员变量是 `UCPointer`, 指向 `StringRep`. 

### UCObject

``` C++
#include <assert.h> 
class UCObject { 
public: 
    UCObject() : m_refCount(0) { } 
    virtual ~UCObject() { assert(m_refCount == 0);};   // 这里 assert, 因为不是对象的问题，是外部的问题。
    UCObject(const UCObject&) : m_refCount(0) { }      // 不拷贝 refcount
    void incr() { m_refCount++; } 
    void decr(); 
    int references() { return m_refCount; } 
private: 
    int m_refCount; 
};
inline void UCObject::decr() { 
    m_refCount -= 1; 
    if (m_refCount == 0) { 
    delete this; 
    } 
} 
```
`delete this;` 是合法的，但之后不应该再使用 `this` 指针。

### UCPointer

``` C++
template <class T> 
class UCPointer { 
private: 
    T* m_pObj; 
    void increment() { if (m_pObj) m_pObj->incr(); } 
    void decrement() { if (m_pObj) m_pObj->decr(); } 
public: 
    UCPointer(T* r = 0): m_pObj(r) { increment();} 
    ~UCPointer() { decrement(); }; 
    UCPointer(const UCPointer<T> & p); 
    UCPointer& operator=(const UCPointer<T> &); 
    T* operator->() const; 
    T& operator*() const { return *m_pObj; }; 
}
template <class T> 
UCPointer<T>::UCPointer(const UCPointer<T> & p){ 
    m_pObj = p.m_pObj; 
    increment(); 
}
template <class T> 
UCPointer<T>& 
UCPointer<T>::operator=(const UCPointer<T>& p){ 
    if (m_pObj != p.m_pObj) { 
    decrement(); 
    m_pObj = p.m_pObj; 
    increment(); 
} 
    return *this; 
}
template<class T> 
T* UCPointer<T>::operator->() const { 
    return m_pObj; 
}
```
隐含了 `T` 必须继承自 `UCObject`, 这样才有 `incr` 的成员函数。    
这里只要构造了对象，就会调用 `increment` 函数。  
拷贝构造后要对计数加一。   
赋值我们要先检查二者指向的是不是同一个对象。

??? Example "Example: Shape inherits from UCObject"
    ``` C++
    Ellipse elly(200F, 300F); 
    UCPointer<Shape> p(&elly); 
    p->render(); // calls Ellipse::render() on elly!
    ```

### StringRep  

Envelope and Letter  
<div align=center> <img src="http://cdn.hobbitqia.cc/202306101447197.png" width = 50%/> </div>

``` C++
class StringRep : public UCObject { 
public: 
    StringRep(const char *); 
    ~StringRep(); 
    StringRep(const StringRep&); 
    int length() const{ return strlen(m_pChars); } 
    int equal(const StringRep&) const; 
private: 
    char *m_pChars; 
    // reference semantics -- no assignment op! 
    void operator=(const StringRep&) { }    // 私有，外界不能做 StringRep 的赋值
};
```
具体实现
``` C++
StringRep::StringRep(const char *s) { 
    if (s) { 
    int len = strlen(s) + 1; 
    m_pChars = new char[len]; 
    strcpy(m_pChars , s); 
    } else { 
    m_pChars = new char[1]; 
    *m_pChars = '\0'; 
    } 
} 
StringRep::~StringRep() { 
    delete [] m_pChars ; 
}
StringRep::StringRep(const StringRep& sr) { 
    int len = sr.length(); 
    m_pChars = new char[len + 1]; 
    strcpy(m_pChars , sr.m_pChars ); 
} 
int StringRep::equal(const StringRep& sp) const { 
    return (strcmp(m_pChars, sp.m_pChars) == 0); 
}

```
补: C++ 内字符串不是通过 char 的方式实现(没有 `\0`), 一个字符串和一个长度变量。  
拷贝构造时会调用 UCObject 的拷贝构造。


### String

``` C++
class String { 
public: 
    String(const char *); 
    ~String(); 
    String(const String&); 
    String& operator=(const String&); 
    int operator==(const String&) const; 
    String operator+(const String&) const; 
    int length() const; 
    operator const char*() const; 
private: 
    UCPointer<StringRep> m_rep; 
};
```
具体实现
``` C++
String::String(const char *s) : m_rep(0) { 
    m_rep = new StringRep(s); 
} 
String::~String() {} 
// Again, note constructor for rep in list. 
String::String(const String& s) : m_rep(s.m_rep) {  // 做 UCPointer<StringRep> 的拷贝构造
} 
String& String::operator=(const String& s) { 
    m_rep = s.m_rep; // let smart pointer do work! 
    return *this; 
}
```
这里 `m_rep(0)` 实际上是用 0 去做 UCP 的构造(也可以不写，因为默认 0). `new` 返回的是 `StringRep *`, 而左边是 `UCP<StringRep>`, 这里赋值时就会把 `StringRep *` 转化为 `UCP<StringRep>`, 再赋值。

``` C++
int String::operator==(const String& s) const { 
    // overloaded -> forwards to StringRep 
    return m_rep->equal(*s.m_rep); // smart ptr * 
} 
int String::length() const { 
    return m_rep->length(); 
}
```

!!! Summary
    * UCPointer maintains reference counts 
    * UCObject hides the details of the count   
    String is very clean 
    * StringRep deals only with string storage and manipulation 
    * UCObject and UCPointer are reusable  
    代码是可复用的。
    * Objects with cycles of UCPointer will never be deleted  
    UCP 指向的对象永远不被删除。
