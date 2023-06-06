---
counter: True  
---

# Exceptions

## Exceptions

Run-time Error

The basic philosophy of C++ is that “badly formed code will not be run.  

Exception 我们能预见他发生，但不是每次都发生。

!!! Example "read a file"
    * open the file;
    * determine its size;
    * allocate that much memory;
    * read the file into memory;
    * close the file;

    可以预见的错误：找不到文件，文件虽然存在但是打不开（没有权限、被别的进程打开），文件大小判断失败（可能是一个串口，不是磁盘上的文件，串口是没有结束的）可以 fseek 到文件末尾，再 ftell 末尾的值。
    ``` C++
    errorCodeType readFile { initialize errorCode = 0;
        open the file;
        if ( theFilesOpen ) { determine its size;
        if ( gotTheFileLength ) { allocate that much memory;
        if ( gotEnoughMemory ) { read the file into memory;
        if ( readFailed ) { errorCode = -1;
        } } else {
        errorCode = -2;
        } } else {
        errorCode = -3;
        }
        close the file;
        if ( theFILEDidntClose && errorCode == 0 ) { errorCode = -4;
        } else {
        errorCode = errorCode and -4;
        } } else {
        errorCode = -5;
        }
        return errorCode;
    }
    ```
    这是好的代码，我们可以知道是否成功，如果失败会失败在哪一步。但这样的可读性不好，可以用异常改写为下面这样。
    ``` C++
    try {
        open the file;
        determine its size;
        allocate that much memory;
        read the file into memory;
        close the file; 
    } 
    catch ( fileOpenFailed ) { doSomething; } 
    catch ( sizeDeterminationFailed ) { doSomething; } 
    catch ( memoryAllocationFailed ) { doSomething; } 
    catch ( readFailed ) { doSomething; } 
    catch ( fileCloseFailed ) { doSomething; }
    ```
    把业务逻辑和错误处理分开了。

At the point where the problem occurs, you might not know what to do with it, but you do know that you can’t just continue on merrily; you must stop, and somebody, somewhere, must figure out what to do.  
运行时刻影响程序运行的，能预见会发生但不是每一次发生的事件。

* The significant benefit of exceptions is that they clean up error handling code.
* It separates the code that describes what you want to do from the code that is executed.

!!! Example "Vector"
    ``` C++
    template <class T> class Vector { 
    private: 
        T* m_elements; 
        int m_size; 
    public: 
        Vector (int size = 0) : 
        m_size(size) ... 
        ~Vector () { delete [] m_elements; } 
        void length(int); 
        int length() { return m_size; } 
        T& operator[](int); 
    };
    ```
    这里 [] 操作符可能会出现越界的情况。最佳的处理方式是抛异常。
    ``` C++
    if (indx < 0 || indx >= m_size) { 
        // throw is a keyword 
        // exception is raised at this point 
        throw <<something>>; 
    } 
    ```
    抛异常之后，后续的代码都不会执行（没遇到的 `try{}` 的大括号都可以看作异常），然后往外走。上面这里 throw 之后，如果大括号是语句就离开语句，如果是函数就离开函数，如果是 `try{}`, 我们就判断匹配。  
    一个异常类
    ``` C++
    class VectorIndexError { 
    public: 
    VectorIndexError(int v) : m_badValue(v) { } 
    ~VectorIndexError() { } 
    void diagnostic() { 
    cerr << "index " << m_ badValue << "out of range!"; } 
    private: 
    int m_badValue; 
    };
    ```
    这样我们就可以 `throw VectorIndexError(indx);`. 外部就会拿到这个对象。需要用 try catch 捕捉，否则会直接结束。捕捉之后整个 try catch 就执行结束。  
    可以捕捉到异常后再继续 throw. 
    ``` C++
    void outer2() { 
    String err("exception caught"); 
    try {
        func(); 
    } catch (VectorIndexError) { 
        cout << err; 
        throw; // propagate the exception 
        } 
    }
    ```
    `catch(...)` 表示捕捉所有异常，但这样无法获得异常的对象。

* Is that surrounding a trye
    * NO: leave that scope
        * Is it a method body
            * YES: return to the caller, then 
            * NO: go to 1st line
    * YES: try to match a catch
        * YES: do the clause and
        * NO:

发生异常离开 fun 的时候本地变量会被析构。  
`throw VIEE(idx)` 的对象在堆里，但是不被清除，会一直留在原地. catch 捕捉到对象之后，结束 try catch 之后会把对象清除。（这里不会发生拷贝构造，仍然是刚刚堆里的对象）  

`throw;` reraises the exception being handled. valid only within a handler

### Try blocks

try 后面可以跟任意数量的 catch. 

Two forms 

* `catch (SomeType v) { // handler code }`
* `catch (...) { // handler code }`

throw 可以抛的任意类型, int/double/... 也是可以的。一般不会抛原始数据类型，因为表达的信息有限。通常会做一个类，抛类的对象。  

Handlers are checked in order of appearance  
按顺序匹配，先匹配前面的，匹配成功后不会寻求下一个匹配。

* Check for exact match 
* Apply base class conversions 
Reference and pointer types, only  
对象会进行基类转换。一般把子类放在前面。
* Ellipses (...) match all

### Exceptions and new

`new` does NOT returned 0 on failure. `new` raises a `bad_alloc()` exception.  

Standard library exceptions
<div align=center> <img src="http://cdn.hobbitqia.cc/202306060921173.png" width = 60%/> </div>

### Exception specifications

Declare which exceptions function might raise  
Part of function prototypes  
***e.g.*** `void abc(int a) : throw(MathErr) {}` 

调了别人的函数，要为了别人抛异常做准备。
可以在函数头部声明会抛什么异常。不会在编译时期检查。    
限制 `abc` 而非调用 `abc` 函数。如果抛出了比你声明更多的异常，异常检查机制会抛出一个终止程序的异常。

``` C++
Printer::print(Document&) : 
 throw(PrinterOffLine, BadDocument) 
{ ... 
PrintManager::print(Document&) : 
 throw (BadDocument) { ... 
 // raises or doesn’t handle BadDocument 
void goodguy() : throw () { 
 // handles all exceptions 
void average() { } // no spec, no checking,
```

* 第一个表示会抛 `PrinterOffLine, BadDocument` 异常。（不一定抛，但可能）  
* 第三个表示不会抛任何异常，这样调用的时候不需要 try catch. 
* 第四个可能会抛异常，但是编译器不会进行检查。

## Design considerations

* Exceptions should indicate errors.   
exception 不是 routine. 
* Don’t use exceptions in place of good design.  

!!! Summary
    * Error recovery is a hard design problem 
    * All subsystems need help from their clients to handle exceptional cases 
    * Exceptions provide the mechanism 
        * Propagated dynamically 
        * Objects on stack destroyed properly 
        * Act to terminate the problematic function 
    * Another big use:   
    Constructors that can’t complete their work

## More exceptions

### Exceptions and constructors 

如果在构造的时候发生了异常。  
先分配内存，再执行构造。
``` C++
f() {
    A *p = new A();
    ...
    delete p;
}
```
如果构造的时候出异常, p 无法得到分配的地址，但是内存却没有被析构。内存泄漏！

