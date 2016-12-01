const NEAR = 0.1;
const FAR = 2000;

export default class App {
    constructor() {
        this._bind('_render', '_handleResize');
        this.wave = {};
        this._setup3D();
        this._createScene();
        //window.addEventListener('resize', '_handleResize');
    }

    start() {
        requestAnimationFrame(this._render);
    }

    _bind(...methods) {
        methods.forEach((method) => this[method] = this[method].bind(this));
    }

    _setup3D() {
        const renderer = this._renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        this._scene = new THREE.Scene();
        const camera = this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, NEAR, FAR);
        camera.position.y = 2;
        camera.position.z = 16;
    }

    _createScene() {
        const scene = this._scene;
        var grid = new THREE.GridHelper(1000, 5, 0x333333, 0x333333);
        //scene.add(grid);

        //var geometry = new THREE.BoxGeometry(200, 200, 200);
        this.wave.dimensions = [32, 32] // dimensions x, y
        var geometry = new THREE.PlaneGeometry( 128, 128, this.wave.dimensions[0] , this.wave.dimensions[1] )
        geometry.dynamic = true
        geometry.__dirtyVertices = true
        var material = new THREE.MeshBasicMaterial({
            color: 0x44ffdd,
            wireframeLinewidth: 2,
            wireframe: true
        })

        var mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = Math.PI / 2
        mesh.rotation.z += 1
        this.mesh = mesh
        scene.add(mesh)
    }
    
    _render(timestamp) {
        var wave = function(x, y, offset) {
            return 0.5 * ( 0.4 * Math.sin((y / 16) + offset) + Math.sin((x / 2.3) + (-0.4 * offset))
                + Math.sin((x / 4) + offset) + Math.sin((y / 2.8) + offset))
        }

        const scene = this._scene
        const camera = this._camera
        const renderer = this._renderer
        var dimensions = this.wave.dimensions
        //console.log(timestamp)
        //this.mesh.geometry.__dirtyVertices = true;
        this.mesh.geometry.dynamic = true;
        this.mesh.geometry.vertices.forEach((elem, index) => {
            //elem.z += (Math.random() - 0.5) * 0.1;
            //console.log(index / 10)
            let offset = timestamp / 1000
            elem.xi = Math.floor(index / (dimensions[1] + 1))
            elem.yi = Math.floor(index % (dimensions[0] + 1))
            //elem.z = ( Math.sin( ( elem.ix + 0 ) * 0.3 ) * 50 ) + ( Math.sin( ( elem.iy + 0 ) * 0.5 ) * 50 )
            // Math.sin((elem.xi / 4) + offset) + Math.sin((elem.yi / 4) + offset)
            elem.z = wave(elem.xi, elem.yi, offset)
        })

        
        this.mesh.rotation.x += 0.0001
        this.mesh.rotation.z += 0.001
        this.mesh.geometry.verticesNeedUpdate = true
        renderer.render(scene, camera)

        requestAnimationFrame(this._render);
    }

    _handleResize(event) {
        const renderer = this._renderer;
        const camera = this._camera;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
