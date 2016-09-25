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

namespace PETools.World
{
	public class EntitySampleTemplate : IBindableObject
	{
	   	public EntitySampleTemplate() {}
	public EntitySampleTemplate(string _uid,string _worldfilter,string _codefile,string _template_file,string _name1,double _name2) {
	
this._uid = _uid;
this._worldfilter = _worldfilter;
this._codefile = _codefile;
this._template_file = _template_file;
this._name1 = _name1;
this._name2 = _name2;
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
				}			private string _name1;
				
				[Description("enter name1")]
				
				
				public string name1
				{
					get { return _name1; }
					set
					{
						_name1 = value;
						OnPropertyChanged(new PropertyChangedEventArgs("name1"));
					}
				}			private double _name2;
				
				[Description("enter name2")]
				
				
				public double name2
				{
					get { return _name2; }
					set
					{
						_name2 = value;
						OnPropertyChanged(new PropertyChangedEventArgs("name2"));
					}
				}
	   	public override void UpdateValue(IBindableObject _obj)
			{
				EntitySampleTemplate obj = _obj as EntitySampleTemplate;
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
		
		if(this._name1 != obj.name1)
		{
			this._name1 = obj.name1;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("name1"));
		}
		
		if(this._name2 != obj.name2)
		{
			this._name2 = obj.name2;
			OnPropertyQuietChanged(new PropertyChangedEventArgs("name2"));
		}
		
			}
	
	}
}
		