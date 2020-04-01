let three, objects=[], cubeMesh=null,scene=null;

function setup() {
    
	three = setupThree(document.getElementById("canvas"));
	three.camera.position.z = 4;
	three.camera.position.y = 1;

    //lighting
	three.scene.add( new THREE.AmbientLight( 0x777777 ) );

    light = new THREE.DirectionalLight( 0xffffff, 1.75 );
    var d = 20;
    light.position.set( d, d, d );
    light.castShadow = true;
	three.scene.add( light );

    setup3DEnvironment();
    initPhysics();
    setupListeners();

    console.log("===DEBUG: rolling instantly");
    rollCube();

    three.on("update", update);
}

function update(time){
    updatePhysics(time.delta);
}


function setup3DEnvironment(){


	var floorTexture = new THREE.ImageUtils.loadTexture( 'grid.png' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial, 0);
    three.scene.add(floorMesh);


    /*
    //assemble images for faces of cube
	var materialArray = [];
    let imagePrefix = "box", imageSuffix=".png";
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix )}));
	var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
    */
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x654321});

    cubeMesh = new THREE.Mesh( new THREE.CubeGeometry(1,1,1), cubeMaterial );
    three.scene.add( cubeMesh );
}

let cubePhysicsBody = null;
let physicsWorld = null;
function initPhysics(gravity=10){
    // from http://schteppe.github.io/cannon.js/examples/threejs_mousepick.html
    // Setup our world
    physicsWorld = new CANNON.World();
    physicsWorld.quatNormalizeSkip = 0;
    physicsWorld.quatNormalizeFast = false;

    physicsWorld.gravity.set(0,-gravity,0);
    physicsWorld.broadphase = new CANNON.NaiveBroadphase();

    // Create boxes
    var mass = 5, radius = 1.3;
    boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    
    cubePhysicsBody = new CANNON.Body({ mass: mass });
    cubePhysicsBody.addShape(boxShape);
    cubePhysicsBody.position.set(0,3,0);
    physicsWorld.add(cubePhysicsBody);

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    physicsWorld.add(groundBody);
}


function updatePhysics(dt){
    physicsWorld.step(dt);
    cubeMesh.position.copy(cubePhysicsBody.position);
    cubeMesh.quaternion.copy(cubePhysicsBody.quaternion);
}

function rollCube(){
    // Change the object's position
    //cubePhysicsBody 
}



function setupListeners(){
    //when roll button is clicked, rollCube();
    //when redo button is clicked


}

window.addEventListener("load",function(){
    setup();
});

