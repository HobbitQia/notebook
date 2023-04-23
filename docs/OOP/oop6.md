---
counter: True  
---

# Inheritance

??? Abstract
    * composition
    * inheritance

继承和组合都是用已有的类来构建新的类。

## Composition

Composition: reusing the implementation

* Composition: construct new object with existing objects
* It is the relationship of "has-a"
* Ways of inclusion
    * Fully
    * By reference (Inclustion by reference allows sharing)  
    ***e.g.*** an employee has  
    ``` C++
    Name    // fully
    Address     // fully
    Health Plan     // fully
    Salary History: Collection of Raise objects // fully
    Supervisor: Another Employee object!    // reference
    ```

Embedded objects

* All embedded objects are initalized
    * The *default constructor* is called if you donʼt supply the arguments, and there is a default constructor (or one can be built)  
* Constructors can have initial

!!! Note
    If we wrote the constructor as (assuming we have the set accessors for the sub-objects):
    ``` C++
    SavingsAccount::SavingsAccount (
        const char* name,
        const char* address,
        int cents ) {
        m_saver.set_name( name );
        m_saver.set_address( address );
        m_balance.set_cents( cents );
    }
    ```
    Default constructors would be called!  
    对于嵌入对象，不用初始化列表，就必须有默认构造函数。

public vs private   
It is common to make embedded objects private.  

## Inheritance

Reusing the interface  
继承是要基于已有的类来设计新的类，新的类的对象可以被当作已有类的对象。  

Inheritance is the ability to define the behavior or implementation of one class as a superset of another class. 

### Example

<div align=center> <img src="http://cdn.hobbitqia.cc/202304110907608.png" width = 60%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202304110907830.png" width = 60%/> </div>

Source Code:
``` C++
class Database {
    vector<CD> cds;
    vector<DVD> dvds;
    public:
        void addCD(CD &aCD);
        void addDVD(DVD &aDVD);
        void list() {
            for (auto x:cds) { cd.print(); }
            for (auto x:dvds) { x.print(); }
        }
}
```
**Critique of DoME**

* code duplication
    * CD and DVD classes very similar (large part are identical)
    * makes maintenance difficult/more work
    * introduces danger of bugs through incorrect maintenance
* code duplication also in Database class

<div align=center> <img src="http://cdn.hobbitqia.cc/202304110910788.png" width = 60%/> </div>

Inheritance allows us to define one class as an extension of another.
<div align=center> <img src="http://cdn.hobbitqia.cc/202304110911858.png" width = 60%/> </div>
<div align=center> <img src="http://cdn.hobbitqia.cc/202304122123129.png" width = 60%/> </div>

这时如果希望增加一个新的类型，如磁带，直接 `class Tape: public Item` 继承即可。

### Inheritance

Advantages of inheritance

* Avoiding code duplication
* Code reuse
* Easier maintenance  
可维护性，指代码修改后可以适应未来的变化。
* Extendibility  
可扩展性，指代码不经修改就可以适应未来的变化。

<div align=center> <img src="http://cdn.hobbitqia.cc/202304110911271.png" width = 40%/> </div>

Class relationship: *Is-A*  ***e.g.*** manager is an employee.  
<div align=center> <img src="http://cdn.hobbitqia.cc/202304122131272.png" width = 40%/> </div>

基类，超类，父类。派生类，子类。

### Scopes and access in C++

<div align=center> <img src="http://cdn.hobbitqia.cc/202304110913975.png" width = 60%/> </div>

clint class 表示这个类要使用另一个类。（只能看到 `public`）  
能接受相同信息的对象可以被认为是同一个类型，因此子类的对象也可以认为是父类的对象。  
子类不能访问父类的私有变量，但私有变量存在于这个类中。  

当调用构造函数时，我们不能调用父类的私有变量，只能用初始化列表的方式调用父类的构造函数。我们不能也不应该在子类对父类的变量做初始化 (code duplication)

``` C++
Employee::Employee( const string& name, const string& ssn )
: m_name(name), m_ssn( ssn) {
    // initializer list sets up the values!
}
class Manager : public Employee {
    public:
        Manager(const std::string& name, const std::string& ssn, const std::string& title);
        const std::string title_name() const;
        const std::string& get_title() const;
        void print(std::ostream& out) const;
    private:
        std::string m_title;
};
Manager::Manager( const string& name, const string& ssn, const string& title = "" )
:Employee(name, ssn), m_title( title ) {
}
```

有什么是没有继承得到：

构造函数没有被继承，但父类的构造会被自动调用。析构同理。   
赋值的运算符不会被继承。  

Inheritance

* Public: `class Derived : public Base ...`
* Protected: `class Derived : protected Base ...`
* Private: `class Derived : private Base ...`
    * default

Inheritance Type (B is)| public| protected| private|
|:-|-|-|-|
public A |public in B| protected in B |hidden|
private A |private in B| private in B| hidden|
protected A| protected in B| protected in B| hidden|

private 继承：私生子，外界不能知道他的父亲是谁。即 B 的用户不能看到 A 的 public 函数。其实是一种组合，父类的函数、变量变为私有。    
