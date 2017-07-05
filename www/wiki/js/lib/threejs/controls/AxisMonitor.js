
THREE.AxisMonitor = function (container, pathPrefix, w, h, radius) {


    w = w ? w : 100;
    h = h ? h : 100;
    radius = radius ? radius : 20;

    // renderer
    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0xffffff, 0); // second param is opacity, 0 => transparent
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);


    var group = new THREE.Object3D();
    // scene
    var scene = new THREE.Scene();

    var x = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0xff0000, 1, 1);
    group.add(x);

   


    var y = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0x00ff00, 1, 1);
    group.add(y);

    var z = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 5, 0x0000ff, 1, 1);
    group.add(z);

    scene.add(group);
    // camera
    var camera = new THREE.PerspectiveCamera(50, w / h, 1, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.group = group;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.pathPrefix = pathPrefix;
    this.loadFont();
    this.pos = new THREE.Vector3();
    this.zero_point = new THREE.Vector3();
    this.spherical = new THREE.Spherical();
    this.radius = radius;
};

THREE.AxisMonitor.prototype.constructor = THREE.AxisMonitor;
THREE.AxisMonitor.prototype.update = function (monitor_controls) {
    if (!monitor_controls) {
        return;
    }

    this.spherical.phi = monitor_controls.getPolarAngle();
    this.spherical.theta = monitor_controls.getAzimuthalAngle();
    this.spherical.radius = this.radius;

    this.pos.setFromSpherical(this.spherical);
    this.camera.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.camera.lookAt(this.zero_point);
    this.renderer.render(this.scene, this.camera);
}
THREE.AxisMonitor.prototype.loadFont = function () {
    var loader = new THREE.FontLoader();
    var self = this;
    var url = this.pathPrefix + "js/lib/threejs/fonts/helvetiker_regular.typeface.json";
    loader.load(url, function (response) {
        self.font = response;
        self.createText();
    });
}
THREE.AxisMonitor.prototype.createText = function () {
    if (!this.font) {
        return
    }
    var x_text = new THREE.Mesh(new THREE.TextGeometry('x', {
        size: 2,
        height: 0.1,
        font: this.font,
        style: "normal"

    }), new THREE.MeshBasicMaterial({ color: new THREE.Color(255,0,0) }));
    x_text.position.copy(new THREE.Vector3(6, -0.5, 0));
    this.group.add(x_text);

    var y_text = new THREE.Mesh(new THREE.TextGeometry('y', {
        size: 2,
        height: 0.1,
        font: this.font,
        style: "normal"

    }), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 255, 0) }));
    y_text.position.copy(new THREE.Vector3(-0.5, 6, 0));
    this.group.add(y_text);

    var z_text = new THREE.Mesh(new THREE.TextGeometry('z', {
        size: 2,
        height: 0.1,
        font: this.font,
        style: "normal"

    }), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 255) }));
    z_text.position.copy(new THREE.Vector3(-0.5, -0.5, 6));
    this.group.add(z_text);
}