---++ Object Oriented Classes in NPL
| author | LiXizhi   | 
| date   | 2009.11.1 | 
---++ Overview

---+++ Efficient Simple OO Class 
if your class requires efficiency other than size, use following class implementation
NPL.load("(gl)script/ide/ObjectOriented/class.lua");

Pros:
   * efficiency for table method lookup, when the class hierachy is deep. 
   * constructors can take different kinds of input, therefore can mimic almost all C++ constructor behavior
Cons: 
   * Adding methods to base class at runtime is not supported, because methods are cached. 
   * constructors of base class should be called manually in parent constucter. 

---+++ Thin OO Class 
if your class favours smaller size over efficiency, use following class implementation
NPL.load("(gl)script/ide/oo.lua");

Pros:
   * Adding methods to base class at runtime is supported, because methods are not cached. 
   * constructors of base class is automatically called. 
Cons: 
   * less efficiency for table method lookup to base classes, if the class hierachy is deep. 

---+++ Lua Object Oriented Progamming Lib
Most classes is modified from the LOOP open source project (please see the file header for original author's readme).


---++ Callback and signals
TODO: 
Lua function callback in c++: http://forums.indiegamer.com/showthread.php?t=13257
