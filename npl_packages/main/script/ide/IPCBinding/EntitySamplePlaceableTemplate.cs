using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Media3D;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.ComponentModel;
using System.Xml;
using System.Xml.Serialization;
using System.Collections;
using System.Drawing.Design;

using PETools.World.TypeConverter;
using PETools.EntityTemplates.Buildin;

namespace PETools.EntityTemplates.Buildin
{
	[NPLCommand("goto", func_name="goto")]
	public class SamplePlaceable : IBindableObject
	{
	   	public SamplePlaceable() {}
	public SamplePlaceable(string _uid,string _worldfilter,string _codefile,string _template_file,XmlElement _position,double _radius,double _facing,string _mesh_obj,string _mesh_name,XmlElement _color,string _MyStringList) {
	
this._uid = _uid;
this._worldfilter = _worldfilter;
this._codefile = _codefile;
this._template_file = _template_file;
this._position = _position;
this._radius = _radius;
this._facing = _facing;
this._mesh_obj = _mesh_obj;
this._mesh_name = _mesh_name;
this._color = _color;
this._MyStringList = _MyStringList;
	}
	
	   			private string _uid;
				
				[Description("unique id")]
				
				
				public override string uid
				{
				
					get { return _uid; }
					set
					{
						_uid = value;
						OnPropertyChanged(new PropertyChangedEventArgs("uid"));
					}
				}			private string _worldfilter;
				
				[Description("if empty, it means the current world. if .*, it means global.")]
				
				
				public override string worldfilter
				{
				
					get { return _worldfilter; }
					set
					{
						_worldfilter = value;
						OnPropertyChanged(new PropertyChangedEventArgs("worldfilter"));
					}
				}			private string _codefile;
				
				[Description("code behind file")]
				
				
				
				public string codefile
				{
					get { return _codefile; }
					set
					{
						_codefile = value;
						OnPropertyChanged(new PropertyChangedEventArgs("codefile"));
					}
				}			private string _template_file;
				
				[Description("the template file used for creating the object")]
				
				
				public override string template_file
				{
				
					get { return _template_file; }
					set
					{
						_template_file = value;
						OnPropertyChanged(new PropertyChangedEventArgs("template_file"));
					}
				}			private XmlElement _position;
				[Category("entity positions")]
				
				
				
				[TypeConverter(typeof(PETools.World.TypeConverter.NumberArrayListConverter))]
				public XmlElement position
				{
					get { return _position; }
					set
					{
						_position = value;
						OnPropertyChanged(new PropertyChangedEventArgs("position"));
					}
				}			private double _radius;
				
				
				
				
				
				public double radius
				{
					get { return _radius; }
					set
					{
						_radius = value;
						OnPropertyChanged(new PropertyChangedEventArgs("radius"));
					}
				}			private double _facing;
				
				
				
				
				
				public double facing
				{
					get { return _facing; }
					set
					{
						_facing = value;
						OnPropertyChanged(new PropertyChangedEventArgs("facing"));
					}
				}			private string _mesh_obj;
				[Category("mesh_obj")]
				
				[FileSelector(InitialDirectory="model/",Filter="ParaXFile(*.x)|*.x|All files (*.*)|*.*",UseQuickSearchDialog=true)]
				[Editor(typeof(PETools.World.Controls.FileSelectorUIEditor),typeof(System.Drawing.Design.UITypeEditor))]
				
				public string mesh_obj
				{
					get { return _mesh_obj; }
					set
					{
						_mesh_obj = value;
						OnPropertyChanged(new PropertyChangedEventArgs("mesh_obj"));
					}
				}			private string _mesh_name;
				[Category("mesh_obj")]
				
				
				
				
				public string mesh_name
				{
					get { return _mesh_name; }
					set
					{
						_mesh_name = value;
						OnPropertyChanged(new PropertyChangedEventArgs("mesh_name"));
					}
				}			private XmlElement _color;
				
				
				
				
				[TypeConverter(typeof(PETools.World.TypeConverter.NumberArrayListConverter))]
				public XmlElement color
				{
					get { return _color; }
					set
					{
						_color = value;
						OnPropertyChanged(new PropertyChangedEventArgs("color"));
					}
				}			private string _MyStringList;
				
				[Description("Drop down string enumeration sample")]
				[StringList("value1,value2,value3", AllowCustomEdit=false)]
				
				[TypeConverter(typeof(PETools.World.TypeConverter.StringListConverter))]
				public string MyStringList
				{
					get { return _MyStringList; }
					set
					{
						_MyStringList = value;
						OnPropertyChanged(new PropertyChangedEventArgs("MyStringList"));
					}
				}
	   	public override void UpdateValue(IBindableObject _obj)
			{
				SamplePlaceable obj = _obj as SamplePlaceable;
				if (obj == null)
				{
					return;
				}
			
		if(this._uid != obj.uid)
		{
			this._uid = obj.uid;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("uid"));
		}
		
		if(this._worldfilter != obj.worldfilter)
		{
			this._worldfilter = obj.worldfilter;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("worldfilter"));
		}
		
		if(this._codefile != obj.codefile)
		{
			this._codefile = obj.codefile;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("codefile"));
		}
		
		if(this._template_file != obj.template_file)
		{
			this._template_file = obj.template_file;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("template_file"));
		}
		
		if(this._position != obj.position)
		{
			this._position = obj.position;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("position"));
		}
		
		if(this._radius != obj.radius)
		{
			this._radius = obj.radius;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("radius"));
		}
		
		if(this._facing != obj.facing)
		{
			this._facing = obj.facing;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("facing"));
		}
		
		if(this._mesh_obj != obj.mesh_obj)
		{
			this._mesh_obj = obj.mesh_obj;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("mesh_obj"));
		}
		
		if(this._mesh_name != obj.mesh_name)
		{
			this._mesh_name = obj.mesh_name;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("mesh_name"));
		}
		
		if(this._color != obj.color)
		{
			this._color = obj.color;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("color"));
		}
		
		if(this._MyStringList != obj.MyStringList)
		{
			this._MyStringList = obj.MyStringList;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("MyStringList"));
		}
		
			}
	
	}
}
		