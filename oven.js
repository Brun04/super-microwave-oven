window.onload = init;

const localModels  = 'models/';
const loader = new THREE.GLTFLoader();
var scene, camera, renderer, plateau, dish, indoor, dishOnPlateau, model;

class Model{
    constructor(metadata){
        this.path = localModels+metadata.name+'/scene.gltf';
        this.subset = metadata.subset;
        this.name = metadata.name;
        this.scale = metadata.scale;
    }
}

function init(){
    fetch('models.json').then(r => r.json())
    .then(r => {
        // Get the dish model metadata
        let folder = window.location.search.split('fold=')[1];
        const metadata = r.models.filter(model => model.name == folder)[0];
        if(metadata != undefined){ model = new Model(metadata); }
        
        // Initialize the Three.js objects
        createScene();
        loadOven();
        createPlateau();
        render();
    })
}

function createScene(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 15, 0, 5 );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xdddddd);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5 );
    indoor = new THREE.Group();
    scene.add( light );
}

function loadOven(){
    // Load a glTF resource
    loader.load(localModels+'oven__microwave/scene.gltf', (gltf) => {
        let mixer = new THREE.AnimationMixer( gltf.scene );
        let action = mixer.clipAction( gltf.animations[0] );
        action.play()
        scene.add(gltf.scene);
        gltf.scene.traverse( (child) => {
            if(child.name === "inner_oven_6"){ 
                child.add(dishOnPlateau); 
            }
        });
    });
}

class Plateau{
    constructor(){
        this.mesh = new THREE.Object3D();
	    this.mesh.name = "plateau";

        const diskGeom = new THREE.CylinderGeometry( 0.8, 0.8, 0.05, 64 );
        let diskMat = new THREE.MeshPhongMaterial();
        diskMat.color.setRGB(0.25, 0.25, 0.25);
        diskMat.opacity = .5;
        diskMat.transparent = true;

        this.disk = new THREE.Mesh( diskGeom, diskMat );
        this.disk.name = "disk";
        this.disk.rotateY(Math.PI/2);
        this.disk.translateOnAxis(new THREE.Vector3(0, 1, 0), -0.5);
        this.mesh.add(this.disk);

        const geomPiv = new THREE.BoxGeometry( .1, .1, .1 );
        const matPiv = new THREE.MeshBasicMaterial( {color: 0x000000} );
        this.pivot = new THREE.Mesh( geomPiv, matPiv );
        this.pivot.translateOnAxis(new THREE.Vector3(0, 1, 0), -0.6);
        this.mesh.add( this.pivot );
    }
}

class Dish{
    constructor(){
        this.mesh = new THREE.Object3D();
	    this.mesh.name = model.name;
        loader.load(model.path, (gltf) => {
            if(model.subset.length > 0){
                gltf.scene.traverse( (child) => {
                    if(child.name === model.subset){
                        child.scale.x = model.scale;
                        child.scale.y = model.scale;
                        child.scale.z = model.scale;
                        child.position.x = .25;
                        child.position.y = -.55;
                        child.position.z = .5;
                        this.mesh.add(child); 
                    }
                });
            }else{
                this.mesh.add(gltf.scene);
            }
            
        });
    }
}

function createPlateau(){
    plateau = new Plateau();
    indoor.add(plateau.mesh);
    if(model != undefined){createDish();}
    dishOnPlateau = new THREE.Group();
    dishOnPlateau.position.x = 0.5;
    dishOnPlateau.add( indoor );
}

function createDish(path){
    dish = new Dish(path);
    indoor.add(dish.mesh);
    
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    if(indoor != undefined){ indoor.rotation.y += Math.PI/192; }
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}
