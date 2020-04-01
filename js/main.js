let three, objects=[], cubeMesh=null,scene=null;


Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';

function setup() {
    
	three = setupThree(document.getElementById("canvas"));
	three.camera.position.z = 4;
	three.scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

    //lighting
	three.scene.add( new THREE.AmbientLight( 0xaaaaaa ) );

	var light = new THREE.DirectionalLight( 0xffddcc, 0.5 );
	light.position.set( 1, 0.75, 0.5 );
	three.scene.add( light );

	var light = new THREE.DirectionalLight( 0xccccff, 0.5 );
	light.position.set( - 1, 0.75, - 0.5 );
	three.scene.add( light );

    setup3DEnvironment();
    setupListeners();

    console.log("===DEBUG: rolling instantly");
    rollCube();

    three.on("update", update);
}

function update(){
    three.scene.simulate();
}


function setup3DEnvironment(){


	var floorTexture = new THREE.ImageUtils.loadTexture( 'grid.png' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    var floorMesh = new Physijs.PlaneMesh(floorGeometry, floorMaterial, 0);
    three.scene.add(floorMesh);


    /*
    //assemble images for faces of cube
	var materialArray = [];
    let imagePrefix = "box", imageSuffix=".png";
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix )}));
	var cubeRenderMaterial = new THREE.MeshFaceMaterial( materialArray );
    */
    var cubeRenderMaterial = new THREE.MeshBasicMaterial({color: 0x654321});

    var friction = 0.8; // high friction
    var restitution = 0.3; // low restitution

    var cubeMaterial = Physijs.createMaterial(
        cubeRenderMaterial,
        friction,
        restitution
    );


    cubeMesh = new Physijs.BoxMesh( new THREE.CubeGeometry(1,1,1), cubeMaterial );
    three.scene.add( cubeMesh );
}

function rollCube(){
    // Change the object's position
    cubeMesh.position.set( 0, 0, 0 );
    cubeMesh.__dirtyPosition = true;

    // Change the object's rotation
    cubeMesh.rotation.set(0, 90, 180);
    cubeMesh.__dirtyRotation = true;
}



function setupListeners(){
    //when roll button is clicked, rollCube();
    //when redo button is clicked


}

window.addEventListener("load",function(){
    setup();
});

