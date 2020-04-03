let three, objects=[], cubeMesh=null,scene=null;

const gravity = -15;
function setup() {
    
	three = setupThree(document.getElementById("canvas"));
	three.camera.position.z = 3;
	three.camera.position.y = 1;

    //lighting
	three.scene.add( new THREE.AmbientLight( 0x999999 ) );

    light = new THREE.DirectionalLight( 0xffffff, 1.75 );
    var d = 20;
    light.position.set( d, d, d );
	light.target.position.set( 0, 0, 0 );
 
    three.renderer.shadowMapEnabled = true;
    light.castShadow = true;
    var d = 5;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d+5;
    light.shadowCameraBottom = -d;
    light.shadowCameraNear = 1;
    light.shadowCameraFar = 50;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
	three.scene.add( light );

    setup3DEnvironment();
    initPhysics();
    setupListeners();

    //console.log("===DEBUG: rolling instantly");
    //rollCube();

    three.clock.getDelta(); //reset clock 
    three.on("update", update);
}

function update(time){
    updatePhysics(time.delta);
}

let floorMesh = null;
function setup3DEnvironment(){


	var floorTexture = new THREE.ImageUtils.loadTexture( 'grid.png' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshPhongMaterial( {color: 0x959595, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    floorMesh.receiveShadow = true;
    three.scene.add(floorMesh);


    
    //assemble images for faces of cube
	var materialArray = [];
    let imagePrefix = "img/box", imageSuffix=".png";
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture( imagePrefix + (i) + imageSuffix )}));
	var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
    //var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x654321});

    cubeMesh = new THREE.Mesh( new THREE.CubeGeometry(1,1,1), cubeMaterial );
    cubeMesh.castShadow = true;
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
    var mass = 5;
    boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
    cubePhysicsBody = new CANNON.Body({ mass: mass });
    cubePhysicsBody.addShape(boxShape);
    cubePhysicsBody.position.set(0,0.50003,0);
    physicsWorld.add(cubePhysicsBody);
    cubePhysicsBody.velocity.setZero();
    cubePhysicsBody.angularVelocity.setZero();

    // Create a plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    physicsWorld.add(groundBody);

    //invisible walls
    let xWallSpacing = 3;
    var leftGroundBody = new CANNON.Body({ mass: 0 });
    leftGroundBody.addShape(groundShape);
    leftGroundBody.position.set(xWallSpacing,0,0);
    leftGroundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),-Math.PI/2);
    physicsWorld.add(leftGroundBody);

    var rightGroundBody = new CANNON.Body({ mass: 0 });
    rightGroundBody.addShape(groundShape);
    rightGroundBody.position.set(-xWallSpacing,0,0);
    rightGroundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),-3*Math.PI/2);
    physicsWorld.add(leftGroundBody);
}


function updatePhysics(dt){
    physicsWorld.step(dt);
    cubeMesh.position.copy(cubePhysicsBody.position);
    cubeMesh.quaternion.copy(cubePhysicsBody.quaternion);

    //floatier jumps - half gravity at peak of jump
    if(cubePhysicsBody.position.y > 1.5){
        physicsWorld.gravity.set(0,gravity/2,0);
    }else{
        physicsWorld.gravity.set(0,gravity,0);
    }
}

function bigRandomNumber(size){
    //roll a random number, but more weighted towards bigger numbers
    let randomNumber = Math.random()*size - size/2;
    randomNumber += Math.sign(randomNumber)* size/2;
    return randomNumber;
}

function rollCube(rotationSpeed=10){
    // Change the object's position
    //cubePhysicsBody 

    let pos = cubePhysicsBody.position.clone();
    if(pos.y < 0.55)pos.y = 0.6;
    cubePhysicsBody.position.copy(pos); 
    
    if(pos.y < 3){ //don't allow people to keep tapping forever until it goes offscreen
        cubePhysicsBody.velocity.set(0,6,0);   
    }

    //add a small force to nudge the cube back into the center

    cubePhysicsBody.velocity.x -= pos.x/2;
    cubePhysicsBody.velocity.z -= pos.z/2;

    //let rotationSpeed = 10;
    cubePhysicsBody.angularVelocity.set(bigRandomNumber(rotationSpeed),
        bigRandomNumber(rotationSpeed),
        bigRandomNumber(rotationSpeed/2));
}



function setupListeners(){
    //when roll button is clicked, rollCube();
    //when redo button is clicked
    document.body.addEventListener("click",() =>rollCube(10));

}

window.addEventListener("load",function(){
    setup();
});

