/**
Title: ThreeJsView
Author(s): leio
Date: 2017/3/25
Desc:
 */

THREE.ThreeJsView = function (parent) {
    var self = this;
    var container;
    var camera, scene, renderer;
    var orbit_controls, transformControl;

    container = document.createElement("div");
    container.style["position"] = "relative";
    container.style["width"] = "100%";
    container.style["height"] = "100%";

    parent.appendChild(container)

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    camera.position.set(10, 15, 10);
    camera.lookAt(new THREE.Vector3());
    camera.up.set(0, 1, 0);
    scene.add(camera);

    // light
    var ambientLight = new THREE.AmbientLight(0x444444);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.x = 17;
    directionalLight.position.y = 30;
    directionalLight.position.z = 9;
    directionalLight.name = 'directionalLight';
    scene.add(directionalLight);

    var helper = new THREE.GridHelper(30, 30);
    helper.material.opacity = 1;
    helper.material.transparent = true;
    scene.add(helper);


    //var axisMonitor_dom = document.createElement("div");
    //axisMonitor_dom.style["id"] = "axis_container";
    //axisMonitor_dom.style["position"] = "absolute";
    //axisMonitor_dom.style["width"] = "100px";
    //axisMonitor_dom.style["height"] = "100px";
    //axisMonitor_dom.style["margin"] = "20px";
    //axisMonitor_dom.style["padding"] = "0px";
    //axisMonitor_dom.style["left"] = "0px";
    //axisMonitor_dom.style["bottom"] = "0px";
    //axisMonitor_dom.style["z-index"] = "100";
    //parent.appendChild(axisMonitor_dom);

    //var axisMonitor = new THREE.AxisMonitor(axisMonitor_dom, config.pathPrefix);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.renderReverseSided = false;
    container.appendChild(renderer.domElement);

    // Controls
    orbit_controls = new THREE.OrbitControls(camera, renderer.domElement);
    orbit_controls.damping = 0.2;
    orbit_controls.mouseButtons.ORBIT = THREE.MOUSE.RIGHT;
    orbit_controls.mouseButtons.PAN = THREE.MOUSE.LEFT;
    orbit_controls.keys.LEFT = 65;
    orbit_controls.keys.RIGHT = 68;
    orbit_controls.keys.UP = 32;
    orbit_controls.keys.BOTTOM = 88;
    orbit_controls.keys.FOREWARD = 87;
    orbit_controls.keys.BACKWARD = 83;
    orbit_controls.addEventListener('change', render);
    orbit_controls.noZoom = true;

    function onWindowResize() {
        var w = container.offsetWidth;
        var h = container.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);

    }
    function animate() {
        requestAnimationFrame(animate);
        //axisMonitor.update(orbit_controls);
        render();
        orbit_controls.update();
        transformControl.update();
    }
    this.scene = scene;
    this.camera = camera;

    function render() {
        renderer.render(self.scene, self.camera);
    }
    transformControl = new THREE.TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);

    scene.add(transformControl);

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
    animate();

    this.meshes = [];
}
THREE.ThreeJsView.prototype = {
    update: function () {
        window.dispatchEvent(new Event('resize'));
    },
    removeObject: function (object) {
        if (object.parent === null) return;
        object.parent.remove(object);
    },
    clearMeshes: function () {
        for (var i = 0; i < this.meshes.length; i++) {
            this.removeObject(this.meshes[i]);
        }
        this.meshes.splice(0, this.meshes.length);
    },
    addMesh(mesh) {
        if (!mesh) {
            return;
        }
        this.scene.add(mesh);
        this.meshes.push(mesh);
    }
    
}