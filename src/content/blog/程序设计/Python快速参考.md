---
title: Python算法竞赛速通
tags: python
categories: 程序竞赛
comments: true
swiper_index: 10
copyright_author: 薛定谔柠檬
abbrlink: '58541536'
date: 2026-05-30 18:50:40
updated: 2026-05-30 15:50:40
---
{% note primary flat %}

## 变量与对象

{% endnote %}

Python 变量只存储对象的引用（内存地址），只能被重新绑定，变量名在变量名表中独立存储。对象是 Python 对数据的抽象，代表一块内存，里面有身份、值、类型等信息。变量名（比如 x、func）只是代码中的标识符，本身不是对象。

变量名被存储为命名空间字典中的字符串键。命名空间（如 `globals()` 返回的字典）是一个 dict 对象，它的键是字符串对象（str 实例）。

C++ 变量对应内存中的某块空间，变量名是内存位置的别名；引用就是变量的别名，无独立存储，操作引用即操作原变量。变量持有值本身，变量与存储空间捆绑在一起，而不是指向值的指针（指针类型除外）。

"一切皆对象"是指程序中用到的任何数据（包括数字、字符串、函数、类等）都被视为一个"对象"。在 Python 里，任何东西都可以像操作一个普通变量一样去操作。

{% note primary flat %}

## 数字运算

{% endnote %}

```python
import numpy as np

print(15/3, 15//3, -5/3, 3**4, pow(2, 512, 998244353), sep=',', end='')
```

{% note primary flat %}

## 字符串

{% endnote %}

```python
a = '123'
if '23' in a:
    print(len(a), str(a[2]) + str(a[1]))

a = a[2] * 2 + a[::-1]
for i in range(0, len(a)):
    print(id(a[i]))
```

{% note primary flat %}

## 数组（列表）

{% endnote %}

```python
nums = [1, 2, 3] + [5]
nums.append(6)
nums.pop()
nums.insert(0, 1)
del nums[0]
nums.reverse()          # 原地倒置
nums2 = sorted(nums)    # 非原地排序！！！！！！
nums.count(3)           # 查找数量
nums.clear()

nums = list(range(65, 70))          # 左闭右开
nums = [chr(x) for x in nums]

s = ''.join(nums)       # 字符数组转字符串
nums = list(s)          # 字符串转数组

s = ''.join([chr(ord(ch) - 65 + 97) for ch in s if ch >= 'A' and ch <= 'Z'])  # 表达式嵌套

nums2 = nums[:]         # ！！！！注意！！！！正确赋值方式
nums3 = nums            # 相当于引用

tmp = np.zeros(5, dtype=int)
tmp = [0 for _ in range(5)]
mat = [[int(x) for x in input().split()] for _ in range(10)]
```

{% note info flat %}

### 拼接并输出2进制

{% endnote %}

```python
s = []
for i in tmp:
    s.append(bin(i.val)[2:])
s = ''.join(s)
print(int(s, 2))
```

{% note info flat %}

### 排序（lambda 与类比较）

{% endnote %}

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

people = [Person("Bob", 25), Person("Alice", 30), Person("Charlie", 20)]

people.sort(key=lambda p: p.age)                    # 按 age 升序
people.sort(key=lambda p: p.name, reverse=True)     # 按 name 降序
people.sort(key=lambda p: (p.age, p.name))          # 多级排序：先 age 升序，再 name 升序

# 多级排序：先 age 升序，再 name 降序
people.sort(key=lambda p: p.name, reverse=True)
people.sort(key=lambda p: p.age)
```

或者用类来实现排序：

```python
class Task:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority

    def __lt__(self, other):
        return self.priority < other.priority
```

{% note primary flat %}

## 深浅拷贝与二维数组

{% endnote %}

```python
vis1 = [[0] * 3 for _ in range(3)]
vis2 = vis1             # 相当于引用
vis3 = vis1[:]          # 浅拷贝；里面每个元素的id依旧相同，但id(vis3)!=id(vis1)。相当于浅拷贝函数copy()
vis4 = [0] * 3          # 复制的是对【整数这一不可变类型】的引用，故无副作用
vis5 = vis1 * 3         # 复制的是外层引用

def deep_copy(obj):
    if isinstance(obj, list):
        return [deep_copy(x) for x in obj]
    else:
        return obj
```

{% note primary flat %}

## NumPy 用法

{% endnote %}

```python
a = np.zeros((3, 3))
a2 = np.zeros((3, 3), dtype=int)    # 需要指定类型！！！

a32 = a         # 引用，完全等价
a33 = a[:]      # 依旧是浅拷贝；因为numpy中的[:]是视图，相当于共享同一块数据内存
a3 = a.copy()   # 此时作用相当于深拷贝；因为numpy的元素是对不可变元素的引用

print(a2.max())

a.flatten()             # 转为一维数组
a.sort(axis=1)          # 沿行方向对数组进行原地排序
a.reshape(1, 9)         # 改变数组形状
```

{% note primary flat %}

## 格式化输入输出

{% endnote %}

```python
a, b, c = [int(x) for x in input().split()]     # input() 函数的行为接近 C++ 中的 getline()
                                                 # ！！！！注意：当左边等个数时，返回的不为列表
a1, b1, c1 = map(int, input().split())          # 与上式相同

print('%.4f %d' % (1.999999, 2), sep='\n')

mat = [[int(x) for x in input().split()] for i in range(10)]  # 读入10行

aa, bb, cc = map(list, zip(*mat))   # ！！！重点！！！ *解包获取内部的多个列表、
                                     # zip用于将多个列表中对应元素聚合成元组、map用于将所有输出转化为list

a2, b2, c2 = [1, 2, 3]      # a=1, b=2, c=3
a3, b3, c3 = (1, 2, 3)      # 同上
a4, b4, c4 = "123"          # a='1', b='2', c='3'
a5, b5, c5 = range(3)       # a=0, b=1, c=2
```

{% note info flat %}

### 循环读入法

{% endnote %}

```python
u, v, w = ([] for i in range(3))    # 多变量赋值
for i in range(4):                  # 这里假设输入 4 行数据
    _u, _v, _w = [int(x) for x in input().split()]
    u.append(_u), v.append(_v), w.append(_w)
```

{% note info flat %}

### 不定行数读入法

{% endnote %}

```python
s = input()     # 注意 Python 中赋值语句不能放在条件表达式中
while s:        # 不能像 C 那样 while(!scanf())
    # 用切片拼接避免了 append()，注意列表推导式中又嵌套了列表
    u[len(u):], v[len(v):], w[len(w):] = [[int(x)] for x in s.split()]
    s = input()
```

{% note primary flat %}

## 字典与集合

{% endnote %}

{% note info flat %}

### 字典（哈希表实现，类似 unordered_map）

{% endnote %}

```python
dic = {'a': 1, 'b': '1'}
del dic['a']
dic.clear()

dic = {chr(i): i for i in range(65, 91)}                    # 可哈希的对象都可作为字典的键
dic = dict(zip([chr(i) for i in range(65, 91)], range(65, 91)))  # 效果同
dic = {dic[k]: k for k in dic}                              # 将键值对逆转，for k in dic 迭代其键
dic = {v: k for k, v in dic.items()}                        # 和上行作用相同，dic.items() 以元组存放单个键值对

dic.update(dic)
dic['a'] = 97
del dic['a']

for (a, b) in dic.items():
    print(a, b)

dict.update(dic, {1: 1, 2: 2})  # 不保留结果
```

{% note info flat %}

### 集合（set）

{% endnote %}

```python
x = {1}
x = set()
x.update(x)
x.add(2)
x.discard(2)    # 注意！！！！！！！！！
```

{% note info flat %}

### 自定义可哈希对象

{% endnote %}

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __hash__(self):     # __hash__：计算哈希值（定位存储位置）
        return hash((self.name, self.age))

    def __eq__(self, other):
        return (self.name, self.age) == (other.name, other.age)
```

{% note primary flat %}

## 函数调用陷阱

{% endnote %}

```python
def proc(a, b):
    a += b      # a为list时相当于a=a.extend(b)

x, y = [1], [2]
proc(x, y)      # x改变；当写为a=a+b时不改变——因为a+b返回一个新的列表对象,只改变了a的引用

x, y = 1, 2
proc(x, y)      # x不改变；因为数字在 Python 中属于不可变对象，对象本身的内容无法被修改。
```

{% note warning flat %}
要修改全局变量，需要加 `global`：
{% endnote %}

```python
def proc():
    global a    # 要修改全局变量，需要加global
    a = 0

a = 1
```

{% note primary flat %}

## 优先队列

{% endnote %}

```python
import queue as pq
q = pq.PriorityQueue()      # 定义优先队列，默认第一元小根堆
q.put(1)
q.get()                     # 获得元素后弹出
q.qsize()
```

{% note primary flat %}

## 数学库

{% endnote %}

```python
import math
print(math.pi, math.e)
print(math.sqrt(144), math.sqrt(2))
```

{% note primary flat %}

## 离散化

{% endnote %}

```python
import bisect
R = []
tmp_R = sorted(set(R))
for i in range(len(R)):
    R[i] = bisect.bisect_left(tmp_R, R[i])
```

{% note primary flat %}

## 文件读写

{% endnote %}

```python
a = []
with open("in.txt") as f:
    N = int(f.readline())   # 读入第一行的 N
    a[len(a):] = [[int(x) for x in f.readline().split()] for i in range(N)]

with open("out.txt", "w") as f:
    f.write("1\n")
```
