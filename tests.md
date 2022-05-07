```python

class A:
    def __init__(self, name):
        self.__name = name

    def greeting(self):
        print(self.__name)

class B(A):
    def __init__(self):
        pass
    
b = B()
b.greeting()
```
Output: AttributeError: 'B' object has no attribute '_A__name'
tag: #class

---

```python

class A:
    def __init__(self, name):
        __name = name

    def greeting(self):
        print(__name)

a = A("Anton")
a.greeting()
```
Output: AttributeError: name '_A__name' is not defined
tag: #class

---

```python

class A(ABC):
    @abstractmethod
    def printer(self):
        print("Hello")

class B(A):
    def __init__(self):
        pass

a = A()
a.printer()

b= B()
b.printer()
```
Output: Can't instantiate abstract class A with abstract methods printer
tag: #class

---

```python


class Soda:
    def __init__(self, ingredient):
        if isinstance(ingredient, str):
            self.ingredient = ingredient
        else:
            self.ingredient = None

    def show_my_drink(self):
        if self.ingredient:
            print(f'Soda and {self.ingredient}')
        else:
            print('Regular soda')

drink1 = Soda()
drink2 = Soda('raspberry')
drink3 = Soda(5)
drink1.show_my_drink()
drink2.show_my_drink()
drink3.show_my_drink()
```

Output:Regular soda
       Soda and raspberry
       Regular soda
tag: #class

---

```python

class Vehicle:
    def __init__(self, speed):
        if speed > 240:
            raise Exception('Not Allowed');
        self.speed = speed;
    def __del__(self):
        print('Release resources')

car = Vehicle(350);

del car
```
Output:Release resources
       Exception: Not Allowed  
tag: #class


---

```python

class Marks:
    def __init__(self, a, b):
        self.a =a
        self.b =b

    @staticmethod
    def Math_num():
        return self.a + self.b

a = Marks(5, 6)
print(a.Math_num())
```
Output: NameError: name 'self' is not defined 
tag: #class

---

```python

class A:
    @classmethod
    def classmethod():
        print('Class method called')

a=A()
a.classmethod()
```
Output: TypeError: classmethod() takes 0 positional arguments but 1 was given 
tag: #class

---

```python

class B:
    def __printer(self):
       print("Hello")

b = B()
b.__printer()
```
Output: AttributeError: 'B' object has no attribute '__printer'
tag: #class

---

```python

class A(object):
   def __init__(self):
   	print("1")
class B(A):
   def __init__(self):
   	print("2")
   	super().__init__()

b = B()
```
Output: 2 1
tag: #class

---

```python

class Point:
   def __init__( self, x=0, y=0):
      self.x = x
      self.y = y
   def __del__(self):
      class_name = self.__class__.__name__
      print (class_name, "destroyed")

class Pixel(Point):
    def __init__( self):
        super().__init__()

a = Point()
b = Pixel()
```
Output Point destroyed  Pixel destroyed
tag: #class

---
