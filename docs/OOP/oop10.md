---
counter: True  
---

# Templates

Reuse source code for generic programming.

## Function Templates

``` C++
template < class T > 
void swap( T& x, T& y ) { 
 T temp = x; 
 x = y; 
 y = temp; 
}
```

* The template keyword introduces the `template`  
`template` 下面的内容就是模板，比如这里就是函数模板。如果下面是类那就是类模板。
* The `class T` specifies a parameterized type name 
    * class means any built-in type or user-defined type 
    * Inside the template, use T as a type name

**Template Instantiation**  
``` C++
int i = 3; int j = 4; 
swap(i, j); // use explicit int swap 
float k = 4.5; float m = 3.7; 
swap(k, m); // instanstiate float swap 
std::string s("Hello"); 
std::string t("World"); 
swap(s, t); // std::string swap 
```
这里 `swap(k,m)` 会调用函数模板，随后生成 float swap, 编译器会插入函数，调用。  
在 C++ 中编译后重载函数的名字不再是 f, 而是 _f_int/_f_double/_f_void..., 把函数的参数类型编入函数的名字。  

* Only exact match on types is used 
* No conversion operations are applied 
    ``` C++
    swap(int, int); // ok 
    swap(double, double); // ok 
    swap(int, double); // error!
    ```
* Even implicit conversions are ignored 
* Template functions and regular functions coexist

如果函数里没有类型 T, 可以直白地告诉编译器?

## Class templates

``` C++
template <class T> 
class Vector { 
public: 
 Vector(int); 
 ~Vector(); 
 Vector(const Vector&); 
 Vector& operator=(const Vector&); 
 T& operator[](int); 
private: 
 T* m_elements; 
 int m_size; 
};
```

类模板一定是显式的(如 STL 模板)

``` C++
Vector<int> v1(100); 
Vector<Complex> v2(256); 
v1[20] = 10; 
v2[20] = v1[20]; // ok if int->Complex define
```

在成员函数定义都要加上模板。

``` C++
template <class T> 
Vector<T>::Vector(int size) : m_size(size) { 
m_elements = new T[m_size]; 
} 
template <class T> 
T& Vector<T>::operator[](int indx) { 
 if (indx < m_size && indx > 0) { return m_elements[indx]; 
 } else { 
 ... 
 } 
}
```
注意 `template <class T>`, `Vector<T>`.  

类模板的函数是声明而不是定义，没有分离的 `.h` 文件。（不需要 `inline` 关键字）  

* Templates can use multiple types   
    ``` C++
    template< class Key, class Value> 
    class HashTable { 
    const Value& lookup(const Key&) const; 
    void install(const Key&, const Value&); 
    ... 
    }; 
    ```
* Templates nest — they’re just new types!   
`Vector< Vector< double *> > // note space > > `
* Type arguments can be complicated 
`Vector< int (*)(Vector<double>&, int)>`  
