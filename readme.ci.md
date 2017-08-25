# keepwork CI procedure

Building keepwork ci flow is a interesting long way.


## graph

         +-------------------------+
         |                         |
    +--->|  push hook from github  |
    |    |                         |
    |    +-----------+-------------+
    |                |
    |                | trigger
    |                v
    |    +-----------------------------+
    |    |                             |    master branch
    |    |  jenkins pull latest code   +------------------+
    |    |                             |                  |
    |    +-----------+-----------------+                  |
    |                |                                    |
    |                | dev branch                         |
    |                |                                    |
    |                v                                    |
    |    +------------------------------------+           |
    |    |                                    |           |
    |    |  build dev image with branch code  |           |
    |    |  restart container with new image  |           |
    |    |                                    |           |
    |    +-----------+------------------------+           |
    |                | dev.keepwork.com                   |
    |                | tested and works fine              |
    |                | merge to master branch             |
    +----------------+                                    |
                                                          |
                                                          |
        +----------------------------------------+        |
        |                                        |        |
        |     compress code                      |        |
        |     build test image                   |<-------+
        |     restart test server with image     |
        |     push this image to registry        |
        |                                        |
        +-------------+--------------------------+
                      | test.keepwork.com
                      | tested by tester
                      | ensure it's a reliable image
                      | deploy image to production
                      v
        +------------------------------------------+
        |                                          |
        |    jenkins slave in online machine       |
        |    pull tested image from registry       |
        |    restart online server with new image  |
        |                                          |
        +------------------------------------------+

## files calling stack

**dev**

- build-image.sh dev
  - Dockerfile(run docker build)
- restart-server.sh dev


**test**

- build-image.sh test
  - Dockerfile.dist(run node image, compress code)
    - build-dist.sh
  - Dockerfile(build final image)
- restart-server.sh test
- push-image.sh

**prod**

nothing

## docker map

    dev&test server (dev.keepwork.com & test.keepwork.com)

                    +-----------------+
                    |  jenkins master |<----------------------+
              +---->|   8080, 50000   |---------------------+ |
              |     +--------+--------+ build&push image    | |
              |              |                              | |
              |              +------------------+--------+  | |
              |                 deploy image    |        |  | |
    +------+  |                                 v        |  | |
    | user +--+                          +-------------+ |  | |
    +------+  |                          |  dev-server | |  | |
              |                          |    8900     | |  | |
              |                          +-------------+ |  | |
              |     +---------+               ^          |  | |
              |     |  nginx  |  docker link  |      +---+  | |
              +---->|   80    +---------------+      |      | |
                    +---------+   proxy       v      v      | |
                                         +---------------+  | |
                                         |  test-server  |  | |
                                         |    8099       |  | |
                                         +---------------+  | |
                                                            | |
                                                            | |
                   +----------+                             | |
                   | registry |<----------------------------+ |
                   |  5000    |-----------------------------+ |
                   +----------+                             | |
                                                            | |
                                                            | |
    ========================================================| |==========
                                                            | |
    prod server (keepwork.com)                              | |
                                                            | |
                  +------------------------+   pull image   | |
                  |                        |<---------------+ |
                  | jenkins slave          |                  |
                  | no port exposed        +------------------+
                  |                        | connect jenkins
                  +------------------+-----+
                                     |
    +------+                         +---------------+
    | user +--+                        deploy image  |
    +------+  |                                      v
              |   +-------+                   +-------------+
              |   | nginx |  container link   | prod-server |
              +-->|  80   +------------------>|   8088      |
                  +-------+    proxy          +-------------+


## container startup

dev-server, test-server and prod-server started by jenkins

registry, two nginx and two jenkins container are started by script in repo
[KeepMonitor](https://github.com/tatfook/KeepMonitor)

## TODO

- more detailed doc procedure about how to start these servers and make them work
    with each other
