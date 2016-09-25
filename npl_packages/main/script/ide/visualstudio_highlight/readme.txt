title: Visual Studio 2003,2005,2008 and LUA syntax Coloring
author: LiXizhi
data: 2008.9.30
file: script/ide/visualstudio_highlight/readme.txt


Visual Studio is a great editor! But when editing other file formats I miss the coloring.

When working with LUA/NPL files, it¡¯s great to be able to make a solution to organize lua sources, and having code open in tabs, but when they all look black and white, I find it requires more focus on my part when coding.

Here is the step to add NPL syntax coloring. 

- copy usertype.dat to E:\Program Files\Microsoft Visual Studio 8\Common7\IDE, where the devenv.exe resides. 
- run the approprite reg file to register lua file. 
- Plus. it works with visual assist X well 

References:
http://msdn.microsoft.com/en-us/library/zy61y8b8(VS.71).aspx
http://blog.cumps.be/visual-studio-2008-and-php-coloring/
