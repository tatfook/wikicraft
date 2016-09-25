---++ IPC Binding and IDE
| Author(s)| LiXizhi |
| Date | 2010/6/1 |

---+++ Code Principle
The reason to create the IPC data-binding framework is to make it possible to easily edit objects from an external IDE evironment. 

The IDE should know as little as possible( better nothing) about the data structure on the NPL side. Instead, everything is driven from the IDE side.
The IDE just maintains a list of entity and weak references of instances, all other stuffs are done on the NPL side. 
If however, some custom UI needs to be shown before the user can create an entity, we can use MCML/NPL to display it on the NPL side. 

An entity can be created from an existing NPL code file or it can be codeless by using XML entity template file. 
Codeless entity template is the advised way to create new editable entity for your game data type. 

---+++ Creating Codeless Entity Template
Most entity template file can be created without writing any code. One only needs to write the entity template XML file 
and specify how to serialize the entity. If game code uses the same format as the default entity serialization format, then one do not even need to write any serialization code either. 

One important concept is that codeless entity template only works with file, and does not interact with any real game specific objects or code. 
so it is completely independent of the actual game runtime. The game needs to load from the same data source according to game runtime logics.

For example, we can use codeless entity template to create and edit all the NPC and creatures in a game world, 
however, the IDE only thinks that they are manipulating the underlying files instead of game objects. 
This allows us to edit many aspects of game data without loading the real game environment. Yet, we do load the same 3D game scene
while editing entity only to help us locating the right position more easily.
Some advanced entity editor may load part of the game code or all of them to edit and view the final results 
in real time without switching runtime code enviroment.

In the entity template file, we specify all editable properties of an entity, all available methods that can 
be invoked by the IDE, the editor used for modifying the object, and how the final entity is serialized to file. 

The editor may refer to some specific UI control in the IDE, or it can be 3D editor helpers that can be directly 
manipulated in the 3D scene. In the later case, we use some helper 3D models to represent property of an 
entity instance in the 3D scene. 

---+++ Creating Entity From Code
This is advanced, please see TestBindableObject.lua. The basic idea is that we use text comment to decorate NPL code to 
get type information needed by the entity template. 


---+++ Entity Template File Format
The entity template file specifis all the properties and methods that the IDE can use to 
create/load/save/modify an entity datasource.  Moreover, it also specifies how data is serialized to datasource. 

The following shows sample file 
"script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml"
<verbatim>
<!--script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml-->
<pe:mcml>
  <script type="text/npl" src="">
  </script>
  <pe:entity_template name="SamplePlaceable" namespace="PETools.EntityTemplates.Buildin" display_name="SamplePlaceable" 
             worldfilter="" singleton="false"
             classfile="script/ide/IPCBinding/EntityBase.lua" 
             classname="PETools.EntityTemplates.Samples.SamplePlaceable"
             baseclass="IPCBinding.EntityBase"
             codefile="[worldpath]/entity/samples/SamplePlaceable_[worldname]_[uid].xml"
             codefile_xpath ="/pe:mcml/pe:samples/SamplePlaceable"
             serializer="IPCBinding.EntityHelperSerializer"
             func_create="create_new_instance"
             func_createfrom=""
             func_remove=""
             func_delete=""
             func_save=""
             func_select=""
             func_deselect=""
             >
    <functions>
      <function name="create_new_instance">
        <![CDATA[
        return function(template, params, callback)
          local entity_class = template.class;
          if (entity_class) then
            local instance = entity_class:new();
            -- instance.uid = ParaGlobal.GenerateUniqueID();
            instance.uid = "1234567_testing_only";
            local x,y,z = ParaScene.GetPlayer():GetPosition();
            instance.position = {x=x, y=y, z=z}
            instance.radius = 2;
            instance.facing = 0;
            instance.mesh_obj = "character/common/tag/tag.x";
            instance.color = {255,0,0};
			instance.MyStringList = "value1"
            commonlib.log("new entity instance created: uid %s", instance.uid);
            if(callback) then
              callback(instance);
            end
          end
        end
        ]]>
       </function>
    </functions>
    <!-- this is only used for description purposes, real properties are extracted from classfile -->
    <properties>
      <!-- we can specify an editor style to use for displaying and modifying the property. 
      the most commonly used style is editor and editor-center. where editor can be point/circle. and the editor-center can be a vector3 property name on the instance. 
      --> 
      <property name="position" type="table" desc=""
                category="entity positions"
                converter ="PETools.World.TypeConverter.NumberArrayListConverter"
                style="editor:point;editor-model-center:[position];editor-model-headontext:[uid];editor-model-mesh:[mesh_obj];editor-model-facing:[facing];editor-model-scaling:[radius]"  
                get_func='return function(self) return self.position end' 
                set_func='return function(self, value) self.position=value end'/>
      <property name="radius" type="number" desc=""
                style="editor:circle;editor-model-center:[position];" />
      <property name="facing" type="number" desc=""
                style="editor:facing;editor-model-center:[position];"/>
      <property name="mesh_obj" type="string" desc=""
                category="mesh_obj"
                editor="System.Windows.Forms.Design.FileNameEditor" 
                converter =""
                style="editor:static-mesh-file;editor-file-filter:*.x;editor-file-initialdir;model/" 
                get_func='return function(self) return self.mesh_obj end' 
                set_func='return function(self, value) self.mesh_obj = value end'/>
      <property name="color" type="table" desc=""
                converter ="PETools.World.TypeConverter.NumberArrayListConverter"
                />
	  <!--A drop down list box will be displayed with predefined values-->
      <property name="MyStringList" type="string" desc="Drop down string enumeration sample"
                editor_attribute='[StringList("value1,value2,value3", AllowCustomEdit=false)]'
                converter ="PETools.World.TypeConverter.StringListConverter"
                />
    </properties>
  </pe:entity_template>
</pe:mcml>
</verbatim>

pe:entity_template is an entity template, which contains many optional parts to configure. 
| | pe:entity_template attribute |
| *attribute* | *function* |
| worldfilter | if nil or "", the new instance will be created with worldfilter set to current world directory. otherwise it will be created in the given directory. \
Another common value is ".*", which usually means global object category |
| singleton | if true, it means that this is a singleton object. |
| baseclass | For codeless template, this should be "IPCBinding.EntityBase" |
| codefile | this is the where the serializer should write the data source to. It may contain [worldpath] and [uid], which will be replaced by their instance's worldfilter and uid. |
| codefile_xpath | this is the xpath to serialize the entity in the code file. By using xpath, we can serialize multiple instances of the same or different types of entities to the same file, without any namespace conflict. \
    the seriazlier will use the xpath: [codefile_xpath][@uid=uid] to locate the entity instance. Hence, both the machine serializer and a human editor and co-edit the same codefile. |
| serializer | this is the serializer to use. The serializer must implement LoadInstance and SaveInstance function() like the default XML based "IPCBinding.EntityHelperSerializer" \
    The above serializer will serialize entity instance to codefile/codefile_xpath. The datasource is shared by the real game runtime and the IPC binding framework. \
    However, if the game runtime also uses the same data source formats as one of the pre-existing entity serializer, then we do not need to provide another serializer for the IDE editing. |
| editor_attribute | this can be per instance editor attribute. One important attribute is NPLCommand, such as '[NPLCommand("goto", func_name="goto")]', which is the command to execute when right click on an intance in the PETools. This is actually what appears in the generated c# class attribute. So there can be several of them. |
| always_delete_content | if "true", when removing an item from IDE, we will always delete data from xml data source as well. Otherwise, we will only remove its reference, data in xml file is not deleted.  |

properties:property attribute
| editor | UI editor used in the shell IDE's property window |
| editor_attribute | Additional data field attribute added to the generated c# file. This can be '[StringList("value1,value2,value3", AllowCustomEdit=false)]' for string enumerations |
| converter | "PETools.World.TypeConverter.NumberTableConverter" {name=number}, "PETools.World.TypeConverter.NumberArrayListConverter" ==> {number, number, number}, "PETools.World.TypeConverter.StringListConverter" for string enumerations. |
| value_serializer | "array": array of numbers; or it can be "array_string": array of strings(not containing commar) |
| style | 3d scene editor style. see style below. in css format |
| default_value | the default value to pass to PETools if the value is nil on the NPL instance |
| skip_value | when saving instance to data source, if the instance value is same as the skip_value, we will skip it to save space. |

editor style
| *stylename* | *value* |
| editor | only 'point' is supported |
| editor-model-center | such as 0,0,0 or reference to a number array {x,y,z} or a table of {x=x, y=y,z=z}|
| editor-model-headontext | head on text (only for character asset)|
| editor-model-mesh | asset file path. it can be either character or static mesh |
| container-name | This is very tricky attribute. Multiple editor instances can share the same scene node container. where the recent selection will replace previous one. And the position is always relative to current player's location. this is mostly used for previewing model template. |
| editor-model-facing | number |
| editor-model-scaling | number |
| editor-model-scale | number, if both editor-model-scaling and editor-model-scale are provided. the multiple of the two is used, otherwise only the one provided is used. |
| editor-physicsgroup | default to 0, which is pickable. if 1, it is not pickable by the default editor. | 
| editor-model-rotation | default to nil, which is no rotation. it can be a quat table of x=0,y=0,z=0,w=1},etc | 