---
counter: True  
---

# Overloaded operators

可以让用户定义的类型像原生类型一样具有运算的能力。

* Allows *user-defined types* to act like built in types.
* Another way of function call

可以被重载的运算符

不能重载的运算符  
`.` `.*` `::` `?:` `sizeof` `typeid` `static_cast` `dynamic_cast` `const_cast` `reinterpret_cast`  

`a+b` 我们可以通过 `a` 的类型 (receiver) 来决定我们的运算符，但 `a>b?a:b` 没有 receiver.  
`typeid` 获取类的方式。可以用 VPTR 表示（如果有虚函数）  

Restrictions

* Only existing operators can be overloaded.  
不能重载不存在的运算符，如 Python 的 `**`
但重载时可以毫无顾忌运算符原来的语义（如重载 `+`, 但实际上是做减法）  
* Operators must be overloaded on a class or enumeration type  
* Overloaded operators must  
    * Preserve number of operands  
    如对于除法 `/`, 它重载时必须也是双目的。
    * Preserve precedence  
    优先级和结合律是不变的

## C++ overloaded operator

Just a function with an operator name.  
使用 `operator` 关键字作为前缀，后面跟上运算符。`operator *(...)`  

* Can be a member function
    * Implicit first argument  
    `const String String::operator + (const String &that)`
* Can be a global(free) function  
    * Both arguments explicit  
    这两种写法是一样的，但是不能同时存在。

### How to overload

* As a member function  
    * Implicit first argument
    * No type conversion performed on reveiver
    ``` C++
    class A {
    public:
        A(int ii):i(ii){}
        int get() {return i;}
        /* 返回的一定是 A 的一个新的对象 */
        const A operator+(const A &that) const {
            A c(this->i+that.i);        /* 这里可以访问 that. 私有是针对类的，不是针对对象的。 */
            return c;
        }
    private:
        int i;
    }
    int main() {
        A a = 6;
        A b = 7;
        A c = a + b;    /* a + 9 也是可以的；但 9 + a 不行 */
        cout << c.get() << endl;    /* 输出 13 */
    }
    ```
    这里我们不希望返回的对象被修改，否则可能出现 `(a+b) = a` 的情况。  
    如果 `c = a + 9` 编译器会用 9 帮我们构造一个对象。  
    * 二元运算符需要一个参数，一元运算符不需要参数。  
    ***e.g.*** `-a, +a, *p, !a, ~b`  
* As a global function
    * Explicit first argument
    * Developer does not need special access to classes
    * May need to be a friend
    ``` C++
    const A operator - (const A&r, const A&l)
    {
        A c(r.i-l.i);
        return c;
    }
    ```
    这里全局函数是不能访问类的私有变量的。因此要 `friend const A operator - (const A&r, const A&l)` 声明友元。
    这样就可以写 `A c = 9-b;` 但 `A c = 9-7;` 不会重载。

!!! Note "Members vs. Free Functions"
    * Unary operators should be members.
    * assignment `= () [] -> ->*` must be memebers;
    * All other binary operators as non-members.

### Argument Passing

* if it is read-only pass it in as a const reference (except built-ins) 
* make member functions const that don't change the class (boolean operators, +, -, etc) 
* for global functions, if the left-hand side changes pass as a reference (assignment operators)
* Select the return type depending on the expected meaning of the operator.  
如加减乘除只能作为右值，因此要 const. 而 `[]` 可以作为左值，就不能 const.    

The prototypes of operator

* `+ - * / % ^ & | ~`   
`const T operator X(const T&l, const T&r);`    
这里返回的必须是一个新的对象。如果这里返回引用，那必须返回一个全局的地址，但函数只有本地空间。
* `! && || < <= == >= >`  
`bool operator X(const T&l, const T&r);`    
* `[]`  
返回的是左值（不能为 const），而且不能是一个新对象（否则 `a[6]=7` 执行后就被丢掉了）  
`E& T::operator[](int index);`  

``` C++
class Integer { 
 public: 
 ... 
 const Integer& operator++(); //prefix++ 
 const Integer operator++(int); //postfix++ 
 const Integer& operator--(); //prefix-- 
 const Integer operator--(int); //postfix-- 
 ... 
 };
// 
const Integer& Integer::operator++() { 
*this += 1; // increment 
return *this; // fetch 
} 
// int argument not used so leave unnamed so 
// won't get compiler warnings 
const Integer Integer::operator++( int ){ 
Integer old( *this ); // fetch 
++(*this); // increment 调用了刚刚的函数
return old; // return 
```
第一个是前缀 `++a`, 第二个是后缀 `a++`.  
要 overload `+=` 运算符，可以直接写 `i++` 后返回 `*this`, 节省开销，不用新建对象。
``` C++
++x; // calls x.operator++(); 
x++; // calls x.operator++(0); 
--x; // calls x.operator--(); 
x--; // calls x.operator--(0); 
```

**Relational operators**
``` C++
class Integer { 
 public: 
 ... 
 bool operator==( const Integer& rhs ) const; 
 bool operator!=( const Integer& rhs ) const; 
 bool operator<( const Integer& rhs ) const; 
 bool operator>( const Integer& rhs ) const; 
 bool operator<=( const Integer& rhs ) const; 
 bool operator>=( const Integer& rhs ) const; 
 }
bool Integer::operator==( const Integer& rhs ) const { 
 return i == rhs.i; 
} 
// implement lhs != rhs in terms of !(lhs == rhs) 
bool Integer::operator!=( const Integer& rhs ) const { 
 return !(*this == rhs); 
} 
bool Integer::operator<( const Integer& rhs ) const { 
 return i < rhs.i; 
}
// implement lhs > rhs in terms of lhs < rhs 
bool Integer::operator>( const Integer& rhs ) const { 
 return rhs < *this; 
} 
// implement lhs <= rhs in terms of !(rhs < lhs) 
bool Integer::operator<=( const Integer& rhs ) const { 
 return !(rhs < *this); 
} 
// implement lhs >= rhs in terms of !(lhs < rhs) 
bool Integer::operator>=( const Integer& rhs ) const { 
 return !(*this < rhs); 
}
```

**Operator `[]`**  
认为这个类是一个容器
``` C++
class A {
int& operator [] (int idx)
{
    return buf[index];
}
private:
    int size;
    int *buf;
}
```

**stream extractor/inserter**  
``` C++
ostream &operator <<(ostream &, const A &a)
{
    cout << a.size() << endl;
    return os;
}
```
这里 `ostream` 不能是 const, 因为往里面输出会修改 `cout` 内部。  
`cout << a << 5;` 这里实际上是先执行 `cout << a;` 再执行 `(cout << a) << 5`. 因此返回类型必须是 `ostream`.  
这里也要声明友元。
``` C++
istream& operator>>(istream& is, T& obj) {   // 这里没有 const, 因为要往里写入
 // specific code to read obj 
    return is; 
} 
```

You can define your own manipulators.  
``` C++
ostream& manip(ostream& out) { 
    ... 
    return out; 
} 
ostream& tab ( ostream& out ) { 
    return out << '\t'; 
} 
cout << "Hello" << tab << "World!" << endl;
```

### Copying vs. Initialization

* Assignment Operator 
    * Must be a member function  
    必须是成员函数
    * Will be generated for you if you don't provide one    –Same behavior as automatic copy ctor -- memberwise assignment
    * Check for assignment to self  
    拷贝构造之前，内存的指针 `p` 是没有值的，但是赋值的时候 `p` 是有值的。所以需要先 `delete p` 再 `new`. 
    但如果是自己赋值给自己，源操作的内存已经被 `delete` 掉了。 
    * Be sure to assign to all data members
    * Return a reference to `*this`

## Type Conversion

User-defined Type conversions  
`(int)3.5` 单目的运算符，可以重载  
``` C++
class PathName {
 string name;
public:
 // or could be multi-argument with defaults
 PathName(const string&);
 ~ PathName();
};
...
string abc("abc");
PathName xyz(abc); // OK!
xyz = abc; // OK abc => PathName
```
这里我们会先利用 `abc` 构造一个 PathName 的对象，随后赋值给 xyz.  
以其他变量为参数的构造函数可以帮助我们做赋值。  
我们在构造函数前面加上 `explicit` 关键字，即 `explicit PathName(const string&);` 即我们的构造函数只能用来做构造，不能把 `string` 对象赋值给 `PathName`.  
这样编译时就会出错。 

Conversion operations   

* Operator name is any type descriptor
* No explicit arguments
* No return type
* Compiler will use it as a type conversion from $X \Rightarrow T$

``` C++
class Rational {
public:
 ...
 operator double() const; // Rational to double
}
Rational::operator double() const { 
 return numerator_/(double)denominator_;
}
Rational r(1,3); 
double d = r; // r=>double
```  

不需要写返回类型。 
如果我们在重载的运算符前面加上 `explicit`, 那么我们就必须写作 `double d = (double)r;`  
<div align=center> <img src="http://cdn.hobbitqia.cc/202305230853637.png" width = 60%/> </div>

想将 T 转化为 C, 那么需要一个 `C(T)` 的不加 `explicit`的构造函数，或者 `operator C()` 的重载。如果两个都有，编译器会出错。

Use explicit conversion functions. 