let three, objects=[], cubeMesh=null,scene=null;

const gravity = -15;
function setup() {
    
	three = setupThree(document.getElementById("canvas"));
	three.camera.position.z = 3;
	three.camera.position.y = 1;

    //lighting
	three.scene.add( new THREE.AmbientLight( 0xcccccc ) );

    light = new THREE.DirectionalLight( 0xffffee, 0.4 );
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
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 50;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
	three.scene.add( light );

    let light2 = new THREE.SpotLight( 0xffffff, 0.5 );
    var d2 = 20;
    light2.position.set( -d2, d2, d2 );
	light2.target.position.set( 0, 0, 0 );
	three.scene.add( light2 );

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
	var floorMaterial = new THREE.MeshPhongMaterial( {color: 0xb5b5b5, shininess: 0.1, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    floorMesh.receiveShadow = true;
    three.scene.add(floorMesh);


    
    //assemble images for faces of cube
	var materialArray = [];
    let imagePrefix = "img/box", imageSuffix=".png";
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture( imagePrefix + (i+1) + imageSuffix )}));
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
    cubePhysicsBody.position.set(0,0.60003,0);
    physicsWorld.add(cubePhysicsBody);
    cubePhysicsBody.velocity.setZero();
    cubePhysicsBody.angularVelocity.setZero();
    cubePhysicsBody.linearDamping = 0.1;

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


    var frontOfCameraBody = new CANNON.Body({ mass: 0 });
    frontOfCameraBody.addShape(groundShape);
    frontOfCameraBody.position.set(0,0,three.camera.position.z-0.5);
    frontOfCameraBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI);
    physicsWorld.add(frontOfCameraBody);
}


let leftoverTime = 0;
function updatePhysics(dt){
    if(dt >= 1)dt = 1;

    cubeMesh.position.copy(cubePhysicsBody.position);
    cubeMesh.quaternion.copy(cubePhysicsBody.quaternion);


    if(cubePhysicsBody.position.y < -2){
        cubePhysicsBody.position.y = 0.6; //don't clip through floor
    }

    //floatier jumps - half gravity at peak of jump
    if(cubePhysicsBody.position.y > 1.5){
        physicsWorld.gravity.set(0,gravity/2,0);

        if(cubePhysicsBody.position.y > 5 || Math.abs(cubePhysicsBody.position.x) > 6 || Math.abs(cubePhysicsBody.position.z) > 6){
            //if box flies too far, reset it
            cubePhysicsBody.position.set(0,0.6,0);
            cubePhysicsBody.velocity.set(0,0.0,0); 
            cubePhysicsBody.quaternion.set(0,0,0,1);
        }

    }else{
        physicsWorld.gravity.set(0,gravity,0);
        cubePhysicsBody.angularDamping = 0.5;
    }

    if(cubePhysicsBody.velocity.y > 0.1){
        cubePhysicsBody.angularDamping = 0.01;
    }


    dt += leftoverTime;
    while(dt > 1/60){
        physicsWorld.step(1/60);
        dt -= 1/60;
    }
    leftoverTime = dt;

    detectIfCubeIsRolled();
}

function bigRandomNumber(size){
    //roll a random number, but more weighted towards bigger numbers
    let randomNumber = Math.random()*size - size/2;
    randomNumber += Math.sign(randomNumber)* size/2;
    return randomNumber;
}
function smolRandomNumber(size){
    return bigRandomNumber(size/2);
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

    let angularVelocity = [smolRandomNumber(rotationSpeed),
        smolRandomNumber(rotationSpeed),
        smolRandomNumber(rotationSpeed)];
    angularVelocity[Math.floor(Math.random()*2.99)] = bigRandomNumber(rotationSpeed); //make one axis faster

    cubePhysicsBody.angularVelocity.set(...angularVelocity);
}

window.addEventListener("load",function(){
    setup();
});

