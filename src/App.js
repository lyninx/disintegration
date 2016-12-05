const NEAR = 0.1;
const FAR = 2000;
import three from 'three'
const loadSvg = require('load-svg')
const parsePath = require('extract-svg-path').parse
const svgMesh = require('svg-mesh-3d')
const createGeom = require('three-simplicial-complex')(THREE)

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
        camera.position.y = 4;
        camera.position.z = 32;
    }

    _createScene() {
        const scene = this._scene;
        var grid = new THREE.GridHelper(1000, 5, 0x333333, 0x333333);
        //scene.add(grid);

        //var geometry = new THREE.BoxGeometry(200, 200, 200);
        let dim = 16
        this.wave.dimensions = [dim, dim] // dimensions x, y
        var geometry = new THREE.PlaneGeometry( this.wave.dimensions[0]*4, this.wave.dimensions[1]*4, this.wave.dimensions[0] , this.wave.dimensions[1] )
        geometry.dynamic = true
        geometry.__dirtyVertices = true
        var material = new THREE.MeshBasicMaterial({
            color: 0x44ffdd,
            wireframeLinewidth: 2,
            wireframe: true,
            side: THREE.DoubleSide
        })
        var material2 = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframeLinewidth: 1,
            wireframe: false,
            visible: true,
            side: THREE.DoubleSide
        })

        var mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = Math.PI / 2
        mesh.rotation.z += 1
        this.mesh = mesh
        scene.add(mesh)

        this.svg_loaded = false
        var self = this
        loadSvg('lyninx.svg', function (err, svg) {
          if (err) throw err

          var svgPath = parsePath(svg)
          var complex = svgMesh(svgPath, {
            delaunay: false,
            scale: 20
          })
          let geometry = new createGeom(complex)
          let mesh = new THREE.Mesh(geometry, material2)
          mesh.scale.set( 16, 16, 16 )
          self.mesh2 = mesh
          self.svg_loaded = true
          mesh.position.y += 6
          scene.add(mesh)
        })
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

        if(this.svg_loaded){
            this.mesh2.rotation.y += -0.001
        }
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
