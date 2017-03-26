### Model mod
Showing bmax/stl model on keepwork.com.

### Supported input format 
 - Load bmax file from remote file
```xml
```@model/main
<model type="bmax" url="https://raw.githubusercontent.com/tatfook/wikicraft/wxa_dev/www/wiki/js/mod/model/assets/test_bmax.zip"/>
```
```
 - Load stl file from remote file
```xml
```@model/main
<model type="stl" url="https://github.com/tatfook/wikicraft/raw/wxa_dev/www/wiki/js/mod/model/assets/test_stl.zip"/>
```
```
 - Load bmax file from local text
```xml
```@model/main
<model type="bmax">
{{2,0,-8,10,3568,},{3,0,-8,10,4095,},{4,0,-8,10,4095,},{5,0,-8,10,4095,},{6,0,-8,10,4095,},{7,0,-8,10,4095,},{8,0,-8,10,3568,},{2,0,-7,10,4095,},{8,0,-7,10,4095,},{2,0,-6,10,4095,},{8,0,-6,10,4095,},{2,0,-5,10,4095,},{8,0,-5,10,4095,},{2,0,-4,10,4095,},{8,0,-4,10,4095,},{2,0,-3,10,4095,},{8,0,-3,10,4095,},{2,0,-2,10,3568,},{3,0,-2,10,4095,},{4,0,-2,10,4095,},{5,0,-2,10,4095,},{6,0,-2,10,4095,},{7,0,-2,10,4095,},{8,0,-2,10,3568,},{5,1,-8,10,4095,},{2,1,-5,10,4095,},{8,1,-5,10,4095,},{5,1,-2,10,4095,},{5,2,-8,10,4095,},{5,2,-7,10,4095,},{5,2,-6,10,1920,},{2,2,-5,10,4095,},{3,2,-5,10,4095,},{4,2,-5,10,1920,},{5,2,-5,10,4095,},{6,2,-5,10,1920,},{7,2,-5,10,4095,},{8,2,-5,10,4095,},{5,2,-4,10,1920,},{5,2,-3,10,4095,},{5,2,-2,10,4095,},}
</model>
```
```
 - Load stl file from local text
```xml
```@model/main
<model type="stl">
solid ParaEngine
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -3.500000 1.000000
  vertex -2.500000 -2.500000 1.000000
  vertex -3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -3.500000 1.000000
  vertex -2.500000 -3.500000 1.000000
  vertex -2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -3.500000 0.000000
  vertex -2.500000 -3.500000 1.000000
  vertex -3.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -3.500000 0.000000
  vertex -2.500000 -3.500000 0.000000
  vertex -2.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -2.500000 0.000000
  vertex -2.500000 -3.500000 0.000000
  vertex -3.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -2.500000 0.000000
  vertex -2.500000 -2.500000 0.000000
  vertex -2.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 -2.500000 0.000000
  vertex -3.500000 -3.500000 1.000000
  vertex -3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 -2.500000 0.000000
  vertex -3.500000 -3.500000 0.000000
  vertex -3.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 -3.500000 1.000000
  vertex -1.500000 -2.500000 1.000000
  vertex -2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 -3.500000 1.000000
  vertex -1.500000 -3.500000 1.000000
  vertex -1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 -3.500000 0.000000
  vertex -1.500000 -3.500000 1.000000
  vertex -2.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 -3.500000 0.000000
  vertex -1.500000 -3.500000 0.000000
  vertex -1.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 -2.500000 0.000000
  vertex -1.500000 -3.500000 0.000000
  vertex -2.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 -2.500000 0.000000
  vertex -1.500000 -2.500000 0.000000
  vertex -1.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 -2.500000 0.000000
  vertex -2.500000 -2.500000 1.000000
  vertex -1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 -2.500000 0.000000
  vertex -2.500000 -2.500000 0.000000
  vertex -2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 -3.500000 1.000000
  vertex -0.500000 -2.500000 1.000000
  vertex -1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 -3.500000 1.000000
  vertex -0.500000 -3.500000 1.000000
  vertex -0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 -3.500000 0.000000
  vertex -0.500000 -3.500000 1.000000
  vertex -1.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 -3.500000 0.000000
  vertex -0.500000 -3.500000 0.000000
  vertex -0.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 -2.500000 0.000000
  vertex -0.500000 -3.500000 0.000000
  vertex -1.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 -2.500000 0.000000
  vertex -0.500000 -2.500000 0.000000
  vertex -0.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 -2.500000 0.000000
  vertex -1.500000 -2.500000 1.000000
  vertex -0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 -2.500000 0.000000
  vertex -1.500000 -2.500000 0.000000
  vertex -1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 0.000000
  vertex 0.500000 -3.500000 1.000000
  vertex -0.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 0.000000
  vertex 0.500000 -3.500000 0.000000
  vertex 0.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -2.500000 0.000000
  vertex 0.500000 -3.500000 0.000000
  vertex -0.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -2.500000 0.000000
  vertex 0.500000 -2.500000 0.000000
  vertex 0.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 0.000000
  vertex -0.500000 -2.500000 1.000000
  vertex 0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 0.000000
  vertex -0.500000 -2.500000 0.000000
  vertex -0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 -3.500000 1.000000
  vertex 1.500000 -2.500000 1.000000
  vertex 0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 -3.500000 1.000000
  vertex 1.500000 -3.500000 1.000000
  vertex 1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 0.000000
  vertex 1.500000 -3.500000 1.000000
  vertex 0.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 0.000000
  vertex 1.500000 -3.500000 0.000000
  vertex 1.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 -2.500000 0.000000
  vertex 1.500000 -3.500000 0.000000
  vertex 0.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 -2.500000 0.000000
  vertex 1.500000 -2.500000 0.000000
  vertex 1.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 -2.500000 0.000000
  vertex 0.500000 -2.500000 1.000000
  vertex 1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 -2.500000 0.000000
  vertex 0.500000 -2.500000 0.000000
  vertex 0.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 -3.500000 1.000000
  vertex 2.500000 -2.500000 1.000000
  vertex 1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 -3.500000 1.000000
  vertex 2.500000 -3.500000 1.000000
  vertex 2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 -3.500000 0.000000
  vertex 2.500000 -3.500000 1.000000
  vertex 1.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 -3.500000 0.000000
  vertex 2.500000 -3.500000 0.000000
  vertex 2.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 -2.500000 0.000000
  vertex 2.500000 -3.500000 0.000000
  vertex 1.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 -2.500000 0.000000
  vertex 2.500000 -2.500000 0.000000
  vertex 2.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 -2.500000 0.000000
  vertex 1.500000 -2.500000 1.000000
  vertex 2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 -2.500000 0.000000
  vertex 1.500000 -2.500000 0.000000
  vertex 1.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -3.500000 1.000000
  vertex 3.500000 -2.500000 1.000000
  vertex 2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -3.500000 1.000000
  vertex 3.500000 -3.500000 1.000000
  vertex 3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -3.500000 0.000000
  vertex 3.500000 -3.500000 1.000000
  vertex 2.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -3.500000 0.000000
  vertex 3.500000 -3.500000 0.000000
  vertex 3.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -2.500000 0.000000
  vertex 3.500000 -3.500000 0.000000
  vertex 2.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -2.500000 0.000000
  vertex 3.500000 -2.500000 0.000000
  vertex 3.500000 -3.500000 0.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -3.500000 0.000000
  vertex 3.500000 -2.500000 1.000000
  vertex 3.500000 -3.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -3.500000 0.000000
  vertex 3.500000 -2.500000 0.000000
  vertex 3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -0.500000 3.000000
  vertex -2.500000 0.500000 3.000000
  vertex -3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -0.500000 3.000000
  vertex -2.500000 -0.500000 3.000000
  vertex -2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -0.500000 2.000000
  vertex -2.500000 -0.500000 3.000000
  vertex -3.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -0.500000 2.000000
  vertex -2.500000 -0.500000 2.000000
  vertex -2.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 0.500000 2.000000
  vertex -3.500000 -0.500000 3.000000
  vertex -3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 0.500000 2.000000
  vertex -3.500000 -0.500000 2.000000
  vertex -3.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 2.000000
  vertex -3.500000 0.500000 3.000000
  vertex -2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 2.000000
  vertex -3.500000 0.500000 2.000000
  vertex -3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 -0.500000 3.000000
  vertex 1.500000 0.500000 3.000000
  vertex 0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 -0.500000 3.000000
  vertex 1.500000 -0.500000 3.000000
  vertex 1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 -0.500000 2.000000
  vertex 1.500000 -0.500000 3.000000
  vertex 0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 -0.500000 2.000000
  vertex 1.500000 -0.500000 2.000000
  vertex 1.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 0.500000 2.000000
  vertex 1.500000 -0.500000 2.000000
  vertex 0.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 0.500000 2.000000
  vertex 1.500000 0.500000 2.000000
  vertex 1.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 0.500000 2.000000
  vertex 0.500000 0.500000 3.000000
  vertex 1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 0.500000 2.000000
  vertex 0.500000 0.500000 2.000000
  vertex 0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -0.500000 1.000000
  vertex -2.500000 -0.500000 2.000000
  vertex -3.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -3.500000 -0.500000 1.000000
  vertex -2.500000 -0.500000 1.000000
  vertex -2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 0.500000 1.000000
  vertex -3.500000 -0.500000 2.000000
  vertex -3.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 0.500000 1.000000
  vertex -3.500000 -0.500000 1.000000
  vertex -3.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 1.000000
  vertex -2.500000 0.500000 2.000000
  vertex -2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 1.000000
  vertex -2.500000 0.500000 1.000000
  vertex -2.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 1.000000
  vertex -3.500000 0.500000 2.000000
  vertex -2.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 1.000000
  vertex -3.500000 0.500000 1.000000
  vertex -3.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 2.500000 1.000000
  vertex 1.500000 3.500000 1.000000
  vertex 0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 0.500000 2.500000 1.000000
  vertex 1.500000 2.500000 1.000000
  vertex 1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 0.000000
  vertex 1.500000 2.500000 1.000000
  vertex 0.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 0.000000
  vertex 1.500000 2.500000 0.000000
  vertex 1.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 3.500000 0.000000
  vertex 1.500000 2.500000 0.000000
  vertex 0.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 0.500000 3.500000 0.000000
  vertex 1.500000 3.500000 0.000000
  vertex 1.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 3.500000 0.000000
  vertex 0.500000 3.500000 1.000000
  vertex 1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 1.500000 3.500000 0.000000
  vertex 0.500000 3.500000 0.000000
  vertex 0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 -0.500000 3.000000
  vertex -1.500000 0.500000 3.000000
  vertex -2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 -0.500000 3.000000
  vertex -1.500000 -0.500000 3.000000
  vertex -1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 2.000000
  vertex -1.500000 -0.500000 3.000000
  vertex -2.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 2.000000
  vertex -1.500000 -0.500000 2.000000
  vertex -1.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 0.500000 2.000000
  vertex -1.500000 -0.500000 2.000000
  vertex -2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 0.500000 2.000000
  vertex -1.500000 0.500000 2.000000
  vertex -1.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 0.500000 2.000000
  vertex -2.500000 0.500000 3.000000
  vertex -1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 0.500000 2.000000
  vertex -2.500000 0.500000 2.000000
  vertex -2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 -0.500000 3.000000
  vertex 2.500000 0.500000 3.000000
  vertex 1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 -0.500000 3.000000
  vertex 2.500000 -0.500000 3.000000
  vertex 2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 -0.500000 2.000000
  vertex 2.500000 -0.500000 3.000000
  vertex 1.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 -0.500000 2.000000
  vertex 2.500000 -0.500000 2.000000
  vertex 2.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 0.500000 2.000000
  vertex 2.500000 -0.500000 2.000000
  vertex 1.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 0.500000 2.000000
  vertex 2.500000 0.500000 2.000000
  vertex 2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 0.500000 2.000000
  vertex 1.500000 0.500000 3.000000
  vertex 2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 0.500000 2.000000
  vertex 1.500000 0.500000 2.000000
  vertex 1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -0.500000 1.000000
  vertex 3.500000 -0.500000 2.000000
  vertex 2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -0.500000 1.000000
  vertex 3.500000 -0.500000 1.000000
  vertex 3.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 0.500000 1.000000
  vertex 2.500000 -0.500000 2.000000
  vertex 2.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 0.500000 1.000000
  vertex 2.500000 -0.500000 1.000000
  vertex 2.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 1.000000
  vertex 3.500000 0.500000 2.000000
  vertex 3.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 1.000000
  vertex 3.500000 0.500000 1.000000
  vertex 3.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 1.000000
  vertex 2.500000 0.500000 2.000000
  vertex 3.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 1.000000
  vertex 2.500000 0.500000 1.000000
  vertex 2.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 0.500000 0.000000
  vertex -2.500000 -0.500000 0.000000
  vertex -3.500000 -0.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 0.500000 0.000000
  vertex -2.500000 0.500000 0.000000
  vertex -2.500000 -0.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 0.500000 0.000000
  vertex -3.500000 -0.500000 1.000000
  vertex -3.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 0.500000 0.000000
  vertex -3.500000 -0.500000 0.000000
  vertex -3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 0.000000
  vertex -2.500000 0.500000 1.000000
  vertex -2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 -0.500000 0.000000
  vertex -2.500000 0.500000 0.000000
  vertex -2.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 0.500000 0.000000
  vertex 3.500000 -0.500000 0.000000
  vertex 2.500000 -0.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 0.500000 0.000000
  vertex 3.500000 0.500000 0.000000
  vertex 3.500000 -0.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 0.500000 0.000000
  vertex 2.500000 -0.500000 1.000000
  vertex 2.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 0.500000 0.000000
  vertex 2.500000 -0.500000 0.000000
  vertex 2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 0.000000
  vertex 3.500000 0.500000 1.000000
  vertex 3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 0.000000
  vertex 3.500000 0.500000 0.000000
  vertex 3.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -1.500000 1.000000
  vertex -2.500000 -0.500000 1.000000
  vertex -3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -1.500000 1.000000
  vertex -2.500000 -1.500000 1.000000
  vertex -2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -0.500000 0.000000
  vertex -2.500000 -1.500000 0.000000
  vertex -3.500000 -1.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -0.500000 0.000000
  vertex -2.500000 -0.500000 0.000000
  vertex -2.500000 -1.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 -0.500000 0.000000
  vertex -3.500000 -1.500000 1.000000
  vertex -3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 -0.500000 0.000000
  vertex -3.500000 -1.500000 0.000000
  vertex -3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 -1.500000 0.000000
  vertex -2.500000 -0.500000 1.000000
  vertex -2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 -1.500000 0.000000
  vertex -2.500000 -0.500000 0.000000
  vertex -2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 -0.500000 3.000000
  vertex -0.500000 0.500000 3.000000
  vertex -1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 -0.500000 3.000000
  vertex -0.500000 -0.500000 3.000000
  vertex -0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 -0.500000 2.000000
  vertex -0.500000 -0.500000 3.000000
  vertex -1.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 -0.500000 2.000000
  vertex -0.500000 -0.500000 2.000000
  vertex -0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 0.500000 2.000000
  vertex -0.500000 -0.500000 2.000000
  vertex -1.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 0.500000 2.000000
  vertex -0.500000 0.500000 2.000000
  vertex -0.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 0.500000 2.000000
  vertex -1.500000 0.500000 3.000000
  vertex -0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 0.500000 2.000000
  vertex -1.500000 0.500000 2.000000
  vertex -1.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -1.500000 1.000000
  vertex 3.500000 -0.500000 1.000000
  vertex 2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -1.500000 1.000000
  vertex 3.500000 -1.500000 1.000000
  vertex 3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -0.500000 0.000000
  vertex 3.500000 -1.500000 0.000000
  vertex 2.500000 -1.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -0.500000 0.000000
  vertex 3.500000 -0.500000 0.000000
  vertex 3.500000 -1.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 -0.500000 0.000000
  vertex 2.500000 -1.500000 1.000000
  vertex 2.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 -0.500000 0.000000
  vertex 2.500000 -1.500000 0.000000
  vertex 2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -1.500000 0.000000
  vertex 3.500000 -0.500000 1.000000
  vertex 3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -1.500000 0.000000
  vertex 3.500000 -0.500000 0.000000
  vertex 3.500000 -0.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -0.500000 3.000000
  vertex 3.500000 0.500000 3.000000
  vertex 2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -0.500000 3.000000
  vertex 3.500000 -0.500000 3.000000
  vertex 3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -0.500000 2.000000
  vertex 3.500000 -0.500000 3.000000
  vertex 2.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 2.500000 -0.500000 2.000000
  vertex 3.500000 -0.500000 2.000000
  vertex 3.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 2.000000
  vertex 3.500000 0.500000 3.000000
  vertex 3.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -0.500000 2.000000
  vertex 3.500000 0.500000 2.000000
  vertex 3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 2.000000
  vertex 2.500000 0.500000 3.000000
  vertex 3.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 2.000000
  vertex 2.500000 0.500000 2.000000
  vertex 2.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 2.500000 3.000000
  vertex 0.500000 3.500000 3.000000
  vertex -0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 2.500000 3.000000
  vertex 0.500000 2.500000 3.000000
  vertex 0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 3.500000 2.000000
  vertex -0.500000 2.500000 3.000000
  vertex -0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 3.500000 2.000000
  vertex -0.500000 2.500000 2.000000
  vertex -0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 2.000000
  vertex 0.500000 3.500000 3.000000
  vertex 0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 2.000000
  vertex 0.500000 3.500000 2.000000
  vertex 0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 2.000000
  vertex -0.500000 3.500000 3.000000
  vertex 0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 2.000000
  vertex -0.500000 3.500000 2.000000
  vertex -0.500000 3.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 1.500000 3.000000
  vertex 0.500000 2.500000 3.000000
  vertex -0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 1.500000 3.000000
  vertex 0.500000 1.500000 3.000000
  vertex 0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 2.500000 2.000000
  vertex 0.500000 1.500000 2.000000
  vertex -0.500000 1.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 2.500000 2.000000
  vertex 0.500000 2.500000 2.000000
  vertex 0.500000 1.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 2.500000 2.000000
  vertex -0.500000 1.500000 3.000000
  vertex -0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 2.500000 2.000000
  vertex -0.500000 1.500000 2.000000
  vertex -0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 1.500000 2.000000
  vertex 0.500000 2.500000 3.000000
  vertex 0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 1.500000 2.000000
  vertex 0.500000 2.500000 2.000000
  vertex 0.500000 2.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -2.500000 1.000000
  vertex -2.500000 -1.500000 1.000000
  vertex -3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 -2.500000 1.000000
  vertex -2.500000 -2.500000 1.000000
  vertex -2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -1.500000 0.000000
  vertex -2.500000 -2.500000 0.000000
  vertex -3.500000 -2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 -1.500000 0.000000
  vertex -2.500000 -1.500000 0.000000
  vertex -2.500000 -2.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 -1.500000 0.000000
  vertex -3.500000 -2.500000 1.000000
  vertex -3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 -1.500000 0.000000
  vertex -3.500000 -2.500000 0.000000
  vertex -3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 -2.500000 0.000000
  vertex -2.500000 -1.500000 1.000000
  vertex -2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 -2.500000 0.000000
  vertex -2.500000 -1.500000 0.000000
  vertex -2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 2.500000 0.000000
  vertex 0.500000 2.500000 1.000000
  vertex -0.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 2.500000 0.000000
  vertex 0.500000 2.500000 0.000000
  vertex 0.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 3.500000 0.000000
  vertex 0.500000 2.500000 0.000000
  vertex -0.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 3.500000 0.000000
  vertex 0.500000 3.500000 0.000000
  vertex 0.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 0.000000
  vertex -0.500000 3.500000 1.000000
  vertex 0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 0.000000
  vertex -0.500000 3.500000 0.000000
  vertex -0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 2.500000 1.000000
  vertex -0.500000 3.500000 1.000000
  vertex -1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -1.500000 2.500000 1.000000
  vertex -0.500000 2.500000 1.000000
  vertex -0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 2.500000 0.000000
  vertex -0.500000 2.500000 1.000000
  vertex -1.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -1.500000 2.500000 0.000000
  vertex -0.500000 2.500000 0.000000
  vertex -0.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 3.500000 0.000000
  vertex -0.500000 2.500000 0.000000
  vertex -1.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -1.500000 3.500000 0.000000
  vertex -0.500000 3.500000 0.000000
  vertex -0.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 3.500000 0.000000
  vertex -1.500000 3.500000 1.000000
  vertex -0.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -0.500000 3.500000 0.000000
  vertex -1.500000 3.500000 0.000000
  vertex -1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 1.000000
  vertex 0.500000 -3.500000 2.000000
  vertex -0.500000 -3.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 1.000000
  vertex 0.500000 -3.500000 1.000000
  vertex 0.500000 -3.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 -2.500000 1.000000
  vertex -0.500000 -3.500000 2.000000
  vertex -0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 -2.500000 1.000000
  vertex -0.500000 -3.500000 1.000000
  vertex -0.500000 -3.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 1.000000
  vertex 0.500000 -2.500000 2.000000
  vertex 0.500000 -3.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 1.000000
  vertex 0.500000 -2.500000 1.000000
  vertex 0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 1.000000
  vertex -0.500000 -2.500000 2.000000
  vertex 0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 1.000000
  vertex -0.500000 -2.500000 1.000000
  vertex -0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 0.500000 1.000000
  vertex -2.500000 1.500000 1.000000
  vertex -3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 0.500000 1.000000
  vertex -2.500000 0.500000 1.000000
  vertex -2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 1.500000 0.000000
  vertex -2.500000 0.500000 0.000000
  vertex -3.500000 0.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 1.500000 0.000000
  vertex -2.500000 1.500000 0.000000
  vertex -2.500000 0.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 1.500000 0.000000
  vertex -3.500000 0.500000 1.000000
  vertex -3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 1.500000 0.000000
  vertex -3.500000 0.500000 0.000000
  vertex -3.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 0.000000
  vertex -2.500000 1.500000 1.000000
  vertex -2.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 0.500000 0.000000
  vertex -2.500000 1.500000 0.000000
  vertex -2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -2.500000 3.000000
  vertex 0.500000 -1.500000 3.000000
  vertex -0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -2.500000 3.000000
  vertex 0.500000 -2.500000 3.000000
  vertex 0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -1.500000 2.000000
  vertex 0.500000 -2.500000 2.000000
  vertex -0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -1.500000 2.000000
  vertex 0.500000 -1.500000 2.000000
  vertex 0.500000 -2.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 -1.500000 2.000000
  vertex -0.500000 -2.500000 3.000000
  vertex -0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 -1.500000 2.000000
  vertex -0.500000 -2.500000 2.000000
  vertex -0.500000 -2.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 2.000000
  vertex 0.500000 -1.500000 3.000000
  vertex 0.500000 -2.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 -2.500000 2.000000
  vertex 0.500000 -1.500000 2.000000
  vertex 0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -0.500000 3.000000
  vertex 0.500000 0.500000 3.000000
  vertex -0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -0.500000 3.000000
  vertex 0.500000 -0.500000 3.000000
  vertex 0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 0.500000 2.000000
  vertex 0.500000 -0.500000 2.000000
  vertex -0.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 0.500000 2.000000
  vertex 0.500000 0.500000 2.000000
  vertex 0.500000 -0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 0.500000 3.000000
  vertex 0.500000 1.500000 3.000000
  vertex -0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 0.500000 3.000000
  vertex 0.500000 0.500000 3.000000
  vertex 0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 1.500000 2.000000
  vertex 0.500000 0.500000 2.000000
  vertex -0.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 1.500000 2.000000
  vertex 0.500000 1.500000 2.000000
  vertex 0.500000 0.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 1.500000 2.000000
  vertex -0.500000 0.500000 3.000000
  vertex -0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 1.500000 2.000000
  vertex -0.500000 0.500000 2.000000
  vertex -0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 0.500000 2.000000
  vertex 0.500000 1.500000 3.000000
  vertex 0.500000 0.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 0.500000 2.000000
  vertex 0.500000 1.500000 2.000000
  vertex 0.500000 1.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 2.500000 1.000000
  vertex 0.500000 2.500000 2.000000
  vertex -0.500000 2.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 2.500000 1.000000
  vertex 0.500000 2.500000 1.000000
  vertex 0.500000 2.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 3.500000 1.000000
  vertex -0.500000 2.500000 2.000000
  vertex -0.500000 3.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 3.500000 1.000000
  vertex -0.500000 2.500000 1.000000
  vertex -0.500000 2.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 1.000000
  vertex 0.500000 3.500000 2.000000
  vertex 0.500000 2.500000 2.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 2.500000 1.000000
  vertex 0.500000 3.500000 1.000000
  vertex 0.500000 3.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 1.000000
  vertex -0.500000 3.500000 2.000000
  vertex 0.500000 3.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 0.500000 3.500000 1.000000
  vertex -0.500000 3.500000 1.000000
  vertex -0.500000 3.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 1.500000 1.000000
  vertex 3.500000 2.500000 1.000000
  vertex 2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 1.500000 1.000000
  vertex 3.500000 1.500000 1.000000
  vertex 3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 2.500000 0.000000
  vertex 3.500000 1.500000 0.000000
  vertex 2.500000 1.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 2.500000 0.000000
  vertex 3.500000 2.500000 0.000000
  vertex 3.500000 1.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 2.500000 0.000000
  vertex 2.500000 1.500000 1.000000
  vertex 2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 2.500000 0.000000
  vertex 2.500000 1.500000 0.000000
  vertex 2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 1.500000 0.000000
  vertex 3.500000 2.500000 1.000000
  vertex 3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 1.500000 0.000000
  vertex 3.500000 2.500000 0.000000
  vertex 3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 1.500000 1.000000
  vertex -2.500000 2.500000 1.000000
  vertex -3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 1.500000 1.000000
  vertex -2.500000 1.500000 1.000000
  vertex -2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 2.500000 0.000000
  vertex -2.500000 1.500000 0.000000
  vertex -3.500000 1.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 2.500000 0.000000
  vertex -2.500000 2.500000 0.000000
  vertex -2.500000 1.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 2.500000 0.000000
  vertex -3.500000 1.500000 1.000000
  vertex -3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 2.500000 0.000000
  vertex -3.500000 1.500000 0.000000
  vertex -3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex -2.500000 1.500000 0.000000
  vertex -2.500000 2.500000 1.000000
  vertex -2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex -2.500000 1.500000 0.000000
  vertex -2.500000 2.500000 0.000000
  vertex -2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 2.500000 1.000000
  vertex -1.500000 3.500000 1.000000
  vertex -2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -2.500000 2.500000 1.000000
  vertex -1.500000 2.500000 1.000000
  vertex -1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 2.500000 0.000000
  vertex -1.500000 2.500000 1.000000
  vertex -2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -2.500000 2.500000 0.000000
  vertex -1.500000 2.500000 0.000000
  vertex -1.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 3.500000 0.000000
  vertex -1.500000 2.500000 0.000000
  vertex -2.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -2.500000 3.500000 0.000000
  vertex -1.500000 3.500000 0.000000
  vertex -1.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 3.500000 0.000000
  vertex -2.500000 3.500000 1.000000
  vertex -1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -1.500000 3.500000 0.000000
  vertex -2.500000 3.500000 0.000000
  vertex -2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 2.500000 1.000000
  vertex -2.500000 3.500000 1.000000
  vertex -3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -3.500000 2.500000 1.000000
  vertex -2.500000 2.500000 1.000000
  vertex -2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 3.500000 0.000000
  vertex -2.500000 2.500000 0.000000
  vertex -3.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -3.500000 3.500000 0.000000
  vertex -2.500000 3.500000 0.000000
  vertex -2.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -3.500000 3.500000 0.000000
  vertex -3.500000 2.500000 1.000000
  vertex -3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -3.500000 3.500000 0.000000
  vertex -3.500000 2.500000 0.000000
  vertex -3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 3.500000 0.000000
  vertex -3.500000 3.500000 1.000000
  vertex -2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex -2.500000 3.500000 0.000000
  vertex -3.500000 3.500000 0.000000
  vertex -3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 2.500000 1.000000
  vertex 3.500000 3.500000 1.000000
  vertex 2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 2.500000 1.000000
  vertex 3.500000 2.500000 1.000000
  vertex 3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 3.500000 0.000000
  vertex 3.500000 2.500000 0.000000
  vertex 2.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 3.500000 0.000000
  vertex 3.500000 3.500000 0.000000
  vertex 3.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 2.500000 0.000000
  vertex 3.500000 3.500000 1.000000
  vertex 3.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 2.500000 0.000000
  vertex 3.500000 3.500000 0.000000
  vertex 3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 3.500000 0.000000
  vertex 2.500000 3.500000 1.000000
  vertex 3.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 3.500000 3.500000 0.000000
  vertex 2.500000 3.500000 0.000000
  vertex 2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 0.500000 1.000000
  vertex 3.500000 1.500000 1.000000
  vertex 2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 0.500000 1.000000
  vertex 3.500000 0.500000 1.000000
  vertex 3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 1.500000 0.000000
  vertex 3.500000 0.500000 0.000000
  vertex 2.500000 0.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 1.500000 0.000000
  vertex 3.500000 1.500000 0.000000
  vertex 3.500000 0.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 1.500000 0.000000
  vertex 2.500000 0.500000 1.000000
  vertex 2.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 1.500000 0.000000
  vertex 2.500000 0.500000 0.000000
  vertex 2.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 0.000000
  vertex 3.500000 1.500000 1.000000
  vertex 3.500000 0.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 0.500000 0.000000
  vertex 3.500000 1.500000 0.000000
  vertex 3.500000 1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -1.500000 3.000000
  vertex 0.500000 -0.500000 3.000000
  vertex -0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -1.500000 3.000000
  vertex 0.500000 -1.500000 3.000000
  vertex 0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -0.500000 2.000000
  vertex 0.500000 -1.500000 2.000000
  vertex -0.500000 -1.500000 2.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex -0.500000 -0.500000 2.000000
  vertex 0.500000 -0.500000 2.000000
  vertex 0.500000 -1.500000 2.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 -0.500000 2.000000
  vertex -0.500000 -1.500000 3.000000
  vertex -0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 -0.500000 2.000000
  vertex -0.500000 -1.500000 2.000000
  vertex -0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 -1.500000 2.000000
  vertex 0.500000 -0.500000 3.000000
  vertex 0.500000 -1.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 -1.500000 2.000000
  vertex 0.500000 -0.500000 2.000000
  vertex 0.500000 -0.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -2.500000 1.000000
  vertex 3.500000 -1.500000 1.000000
  vertex 2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 2.500000 -2.500000 1.000000
  vertex 3.500000 -2.500000 1.000000
  vertex 3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -1.500000 0.000000
  vertex 3.500000 -2.500000 0.000000
  vertex 2.500000 -2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 2.500000 -1.500000 0.000000
  vertex 3.500000 -1.500000 0.000000
  vertex 3.500000 -2.500000 0.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex 2.500000 -1.500000 0.000000
  vertex 2.500000 -2.500000 1.000000
  vertex 2.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex 2.500000 -1.500000 0.000000
  vertex 2.500000 -2.500000 0.000000
  vertex 2.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 3.500000 -2.500000 0.000000
  vertex 3.500000 -1.500000 1.000000
  vertex 3.500000 -2.500000 1.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 3.500000 -2.500000 0.000000
  vertex 3.500000 -1.500000 0.000000
  vertex 3.500000 -1.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 2.500000 1.000000
  vertex 2.500000 3.500000 1.000000
  vertex 1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex 1.500000 2.500000 1.000000
  vertex 2.500000 2.500000 1.000000
  vertex 2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 2.500000 0.000000
  vertex 2.500000 2.500000 1.000000
  vertex 1.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex 1.500000 2.500000 0.000000
  vertex 2.500000 2.500000 0.000000
  vertex 2.500000 2.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 3.500000 0.000000
  vertex 2.500000 2.500000 0.000000
  vertex 1.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 -1.000000
  outer loop
  vertex 1.500000 3.500000 0.000000
  vertex 2.500000 3.500000 0.000000
  vertex 2.500000 2.500000 0.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 3.500000 0.000000
  vertex 1.500000 3.500000 1.000000
  vertex 2.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 1.000000 0.000000
  outer loop
  vertex 2.500000 3.500000 0.000000
  vertex 1.500000 3.500000 0.000000
  vertex 1.500000 3.500000 1.000000
  endloop
 endfacet
 facet normal 0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -3.500000 3.000000
  vertex 0.500000 -2.500000 3.000000
  vertex -0.500000 -2.500000 3.000000
  endloop
 endfacet
 facet normal -0.000000 0.000000 1.000000
  outer loop
  vertex -0.500000 -3.500000 3.000000
  vertex 0.500000 -3.500000 3.000000
  vertex 0.500000 -2.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 2.000000
  vertex 0.500000 -3.500000 3.000000
  vertex -0.500000 -3.500000 3.000000
  endloop
 endfacet
 facet normal 0.000000 -1.000000 0.000000
  outer loop
  vertex -0.500000 -3.500000 2.000000
  vertex 0.500000 -3.500000 2.000000
  vertex 0.500000 -3.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 0.000000 0.000000
  outer loop
  vertex -0.500000 -2.500000 2.000000
  vertex -0.500000 -3.500000 3.000000
  vertex -0.500000 -2.500000 3.000000
  endloop
 endfacet
 facet normal -1.000000 -0.000000 -0.000000
  outer loop
  vertex -0.500000 -2.500000 2.000000
  vertex -0.500000 -3.500000 2.000000
  vertex -0.500000 -3.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 0.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 2.000000
  vertex 0.500000 -2.500000 3.000000
  vertex 0.500000 -3.500000 3.000000
  endloop
 endfacet
 facet normal 1.000000 -0.000000 0.000000
  outer loop
  vertex 0.500000 -3.500000 2.000000
  vertex 0.500000 -2.500000 2.000000
  vertex 0.500000 -2.500000 3.000000
  endloop
 endfacet
endsolid ParaEngine
</model>
```
```
### Original format of bmax
```xml
```@model/main
<pe:blocktemplate>
	<pe:blocks>{{2,0,-8,10,3568,},{3,0,-8,10,4095,},{4,0,-8,10,4095,},{5,0,-8,10,4095,},{6,0,-8,10,4095,},{7,0,-8,10,4095,},{8,0,-8,10,3568,},{2,0,-7,10,4095,},{8,0,-7,10,4095,},{2,0,-6,10,4095,},{8,0,-6,10,4095,},{2,0,-5,10,4095,},{8,0,-5,10,4095,},{2,0,-4,10,4095,},{8,0,-4,10,4095,},{2,0,-3,10,4095,},{8,0,-3,10,4095,},{2,0,-2,10,3568,},{3,0,-2,10,4095,},{4,0,-2,10,4095,},{5,0,-2,10,4095,},{6,0,-2,10,4095,},{7,0,-2,10,4095,},{8,0,-2,10,3568,},{5,1,-8,10,4095,},{2,1,-5,10,4095,},{8,1,-5,10,4095,},{5,1,-2,10,4095,},{5,2,-8,10,4095,},{5,2,-7,10,4095,},{5,2,-6,10,1920,},{2,2,-5,10,4095,},{3,2,-5,10,4095,},{4,2,-5,10,1920,},{5,2,-5,10,4095,},{6,2,-5,10,1920,},{7,2,-5,10,4095,},{8,2,-5,10,4095,},{5,2,-4,10,1920,},{5,2,-3,10,4095,},{5,2,-2,10,4095,},}
	</pe:blocks>
</pe:blocktemplate>
```
```
### Screenshot
![block1](https://cloud.githubusercontent.com/assets/5885941/24322891/92ea4aa0-11a7-11e7-8e69-06afa33793a6.png)
![block2](https://cloud.githubusercontent.com/assets/5885941/24322893/977a20ea-11a7-11e7-88f9-c32bf8b6e652.png)
