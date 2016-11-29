const NEAR = 0.1;
const FAR = 4000;

export default class App {
    constructor() {
        this._bind('_render', '_handleResize');
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
        scene.add(grid);

        //var geometry = new THREE.BoxGeometry(200, 200, 200);
        var geometry = new THREE.PlaneGeometry( 20, 20, 7 , 7 );
        geometry.dynamic = true;
        geometry.__dirtyVertices = true;
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z += 1;
        this.mesh = mesh
        scene.add(mesh);
    }
    
    _render(timestamp) {
        var wave = function(time) {
            return ((Math.sin(time) + Math.sin(2.2*time+5.52) + Math.sin(2.9*time+0.93) + Math.sin(4.6*time + 8.94)) / 4)
        }
        const scene = this._scene;
        const camera = this._camera;
        const renderer = this._renderer;
        //console.log(timestamp)
        //this.mesh.geometry.__dirtyVertices = true;
        this.mesh.geometry.dynamic = true;
        this.mesh.geometry.vertices.forEach((elem, index) => {
            //elem.z += (Math.random() - 0.5) * 0.1;
            //console.log(index / 10)
            let tick = timestamp / 100
            if(Math.floor(tick) == index){
                if(elem.touched){
                    // elem.z = Math.sin(elem.touched) 
                    // elem.touched = timestamp
                } else {
                    elem.z = wave(tick)
                    elem.touched = timestamp
                }
            }
        })

        
        this.mesh.rotation.x += 0.0001;
        this.mesh.rotation.z += 0.001;
        this.mesh.geometry.verticesNeedUpdate = true;
        renderer.render(scene, camera);

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
