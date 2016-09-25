---+ UI widgets in NPL
| Author(s): | LiXizhi		 |
| Date:      | 2015/4/23	 |

---++ Introduction
In the past, all user interface are comprised of C++ ParaUI Object. This makes creating and modifying UI objects difficult and slow. This leads to the new UI widget system which is implemented completely in a NPL script. It is fast to create objects, easier to modify and extend, capable of drawing anything. 

The only performance issue is the actual drawing function, however, the number of draw calls is rather limited per frame, plus recently we have added Self Painted UI object feature, which allows us to cache any UI object in a render target texture and only update when and where necessary. 

---++ Architecture
System.Windows.Window is the interface between the old ParaUI system and the new widget UI system. The Window should be created into a native ParaUI object, however everything inside the window is managed and drawn completely in NPL. Low level mouse, key events are redirected by the Window class from ParaUI system to widget system. 

System.Windows.UIElement is the base class for all widgets that can receive mouse or key input from the user. One can subclass it to create its own widget class. 

System.Windows.Controls.XXX are commonly used classes that are derived from UIElement, such as button, label, editbox, etc. 

System.Windows.Shapes.XXX are more light weighted UI elements, which help you to draw persistent shapes on widgets. Simply create and add them as child of UIElemnt to have them automatically draw.

For more advanced widget, you can override the paintEvent function of UIElement, and use the PaintContext(painter) to draw directly on to the device. 

System.Core.ToolBase is the common base class to all class objects in widget system, it provides basic event dispatching features. 

System.Windows.mcml.XXX is the widget based implementation to the MCML. Mcml is a HTML like language to create user interface. Please note, there are two mcml implementations, one is widget based, the other is ParaUI object based. Widgeted based implementation is relatively new but aims to replace the old ParaUI based version in the long run. Their interface are made as compatible as possible to help translate old UI to the new platform (without changing a single line).

System.Windows.Application is a global singleton class for the main posted event loop. 

---++ Render & Resize Event
Whenever there is a resize or geometry change, we will mark the widget as PendingSizeChange. 
In the prepareRender of next draw call, we will send sizeEvent recusively for all dirty widgets in the window.

Render and PrepareRender function is always called on the root window, which is responsible for sending sizeEvent and paintEvent for all of its child widgets. Individual widgets only needs to care about itself when handling sizeEvent and paintEvent.  

