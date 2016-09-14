# Wikicraft Web Site

### Install Dependencies
Run following to install all required NPL packages
```
./update_packages.bat
```

### Start Server
To start the server at [[http://localhost:8099]], run
```
./start.bat
```
Or one can start with following under linux
```
npl "script/apps/WebServer/WebServer.lua"  port="80" root="www/"
```

Web server root directory is `www/` 

### Server Log
- error log is at `./log.txt`
- access log is at `./log/access.log`
- database files are at `/Database/npl/` folder

### Link
- [[https://github.com/tatfook/wikicraft/wiki]]
