const three         = require('three')
const reindex       = require('mesh-reindex')
const unindex       = require('unindex-mesh')
const loadSvg       = require('load-svg')
const parsePath     = require('extract-svg-path').parse
const svgMesh       = require('svg-mesh-3d')
const triangleCentroid = require('triangle-centroid')
const randomVec3    = require('gl-vec3').random
const createGeom    = require('three-simplicial-complex')(THREE)
const orbitControls = require('three-orbit-controls')(THREE)
import animate from './Animate.js'

const vertShader = require('./shaders/vertex.glsl')
const fragShader = require('./shaders/fragment.glsl')

const NEAR = 0.1;
const FAR = 2000;
const timeline_length = 256;

export default class App {
    constructor() {
        this.wave = {}
        this.primary = {}
        this.animation = {}
        this._bind('_render', '_handleResize', '_animate', '_loadSVG')
        this._setup3D()
        this._createScene()
 
        window.anim = this._animate
        window.loadSVG = this._loadSVG
        window.addEventListener('resize', this._handleResize)
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
        renderer.setClearColor(0xe0e0e0);

        this._scene = new THREE.Scene();
        const camera = this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, NEAR, FAR);
        camera.position.y = 4;
        camera.position.z = 32;
        let vp = document.getElementById("viewport")
        const controls = new orbitControls(camera, vp)

        // DOM setup
        document.getElementById("frame").appendChild(renderer.domElement)
        let keyframes = document.getElementById("keyframes")
        for (let i=0; i<timeline_length; i++) {
            let id = "frame-"+i
            let div = document.createElement("div")
            div.setAttribute("id", id);
            keyframes.appendChild(div)
        }
        this.animation.scrubber = document.getElementById("scrubber")
        this.animation.scrubber.value = 0
        this.animation.play = true
        this.animation.events = []
        this.fps = document.getElementById("fps");
        this.keyframe_panel = document.getElementById("keyframe-panel");

    }

    _createScene() {
        const scene = this._scene
        var grid = new THREE.GridHelper(1000, 5, 0x333333, 0x333333)

        this.animation.frame = 0
        this.prev_frame = -1
        //scene.add(grid);

        //var geometry = new THREE.BoxGeometry(200, 200, 200);
        let dim = 16
        this.wave.dimensions = [dim, dim] // dimensions x, y
        var geometry = new THREE.PlaneGeometry( this.wave.dimensions[0]*4, this.wave.dimensions[1]*4, this.wave.dimensions[0] , this.wave.dimensions[1] )
        geometry.dynamic = true
        geometry.__dirtyVertices = true
        var material = new THREE.MeshBasicMaterial({
            color: 0xff1111,
            wireframeLinewidth: 2,
            wireframe: true,
            side: THREE.DoubleSide
        })
        var material2 = new THREE.ShaderMaterial({
            wireframeLinewidth: 1,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            wireframe: false,
            visible: true,
            transparent: true,
            //attributes: attributes,
            side: THREE.DoubleSide,
            uniforms: {
                color: { value: new THREE.Color( 0xff2200 )},
                opacity: { type: 'f', value: 1 },
                scale: { type: 'f', value: 1 },
                animate: { type: 'f', value: 1 }
            }
        })
        this.primary.material = material2;
        this.animation.events[100] = new animate(this.primary.material, 0)
        document.getElementById("frame-100").classList.toggle('active');
        // waves mesh
        var mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.x = Math.PI / 2
        mesh.rotation.z += 1
        this.mesh = mesh
        scene.add(mesh)
        ////////
        this._loadSVG(true)
    }
    
    _render(timestamp) {
        this.fps.textContent = Math.floor(timestamp);
        let animation_event = this.animation.events[this.animation.frame]

        if(this.animation.play) {
            this.animation.frame = (parseInt(this.animation.scrubber.value) + 1) % 256
            this.animation.scrubber.value = this.animation.frame
            if(this.animation.frame == 0){
                this.primary.material.uniforms.animate = { type: 'f', value: 1 }
                this.primary.material.uniforms.scale = { type: 'f', value: 1 }
            }
            if(animation_event){
                animation_event.run()
            }
        } else {
            this.animation.frame = parseInt(this.animation.scrubber.value)

            if(animation_event){
                if(this.prev_frame == this.animation.frame){

                } else {
                    this.prev_frame = this.animation.frame
                    this.keyframe_panel.innerHTML = "animation number: " + animation_event.animation + "<br> duration: "+ animation_event.duration + "s"
                }
            }
        }
        //animate.run(this.primary.material, this.animation.frame)

        let wave = function(x, y, offset) {
            return 0.5 * ( 0.4 * Math.sin((y / 16) + offset) + Math.sin((x / 2.3) + (-0.4 * offset))
                + Math.sin((x / 4) + offset) + Math.sin((y / 2.8) + offset))
        }

        const scene = this._scene
        const camera = this._camera
        const renderer = this._renderer
        const dimensions = this.wave.dimensions
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

    _animate(seq) { 
        switch(seq) {
            // case 0: animate.implode(this.primary.material); break;
            // case 1: animate.explode(this.primary.material); break;
            case 2: this.animation.play = !this.animation.play; break;
            default: console.log("reqired param")
        }
    }
    // load svg 
    _loadSVG(init = false) {
        var self = this
        this.svg_loaded = false
        if(init){
            // load default SVG asychronously 
            loadSvg('lyninx.svg', function (err, svg) {
                if (err) throw err
                load(svg)
            })
        } else {
            let input = document.getElementById("svg-input");
            var fReader = new FileReader();
            fReader.readAsDataURL(input.files[0]);
            fReader.onloadend = function(event){
                console.log("loaded")
                
                let svg = atob(event.target.result.split(",")[1]);
                // TODO: check if input is a valid SVG
                document.getElementById("svg-preview").innerHTML = svg
                clearSVG()
                load(svg)

            }        
        }
        // load svg into scene
        function load(svg){
            let svgPath = parsePath(svg)
            let complex = svgMesh(svgPath, { delaunay: false, scale: 20, randomization: 0 })
            complex = reindex(unindex(complex.positions, complex.cells))
            let svg_geometry = new createGeom(complex)
            let buffer_geometry = new THREE.BufferGeometry().fromGeometry(svg_geometry)
            let attributes = getAnimationAttributes(complex.positions, complex.cells)
            buffer_geometry.addAttribute('direction', attributes.direction)
            buffer_geometry.addAttribute('centroid', attributes.centroid)          
            svg_geometry.dispose()
            let mesh = new THREE.Mesh(buffer_geometry, self.primary.material)
            mesh.scale.set( 16, 16, 16 )
            mesh.name = "primary"
            self.svg_loaded = true
            mesh.position.y += 6
            self._scene.add(mesh)
            console.log()
        }
        function clearSVG(){
            self._scene.remove(self._scene.children[1])
        }
    }
}

function getAnimationAttributes (positions, cells) {
  const directions = new Float32Array(cells.length * 9)
  const centroids = new Float32Array(cells.length * 9)
  for (let i=0, i9=0; i<cells.length; i++, i9+=9) {
    const [ f0, f1, f2 ] = cells[i]
    const triangle = [ positions[f0], positions[f1], positions[f2] ]
    const center = triangleCentroid(triangle)
    centroids[i9] = center[0]
    centroids[i9+1] = center[1]
    centroids[i9+2] = center[2]

    centroids[i9+3] = center[0]
    centroids[i9+4] = center[1]
    centroids[i9+5] = center[2]

    centroids[i9+6] = center[0]
    centroids[i9+7] = center[1]
    centroids[i9+8] = center[2]
    
    const random = randomVec3([], Math.random())
    //const anim = new THREE.Vector3().fromArray(random)
    directions[i9] = random[0]
    directions[i9+1] = random[1]
    directions[i9+2] = random[2]

    directions[i9+3] = random[0]
    directions[i9+4] = random[1]
    directions[i9+5] = random[2]

    directions[i9+6] = random[0]
    directions[i9+7] = random[1]
    directions[i9+8] = random[2]
  }
  console.log(centroids)
  return {
    direction: new THREE.BufferAttribute( directions, 3 ),
    centroid: new THREE.BufferAttribute( centroids, 3 )
    // direction: { type: 'v3', value: directions },
    // centroid: { type: 'v3', value: centroids }
  }
}
