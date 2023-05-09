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
