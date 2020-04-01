function ThreeasyEnvironment(canvasElem = null){
	this.prev_timestep = 0;
    this.shouldCreateCanvas = (canvasElem === null);

    //fov, aspect, near, far
	this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000000 );
	//this.camera = new THREE.OrthographicCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );

	this.camera.position.set(0, 0, 10);
	this.camera.lookAt(new THREE.Vector3(0,0,0));


	//create camera, scene, timer, renderer objects
	//craete render object


	
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);

	//renderer
	let rendererOptions = { antialias: true};

    if(!this.shouldCreateCanvas){
        rendererOptions.canvas = canvasElem;
    }

	this.renderer = new THREE.WebGLRenderer( rendererOptions );
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);


    this.onWindowResize(); //resize canvas to window size and set aspect ratio

	this.timeScale = 1;
	this.elapsedTime = 0;
	this.trueElapsedTime = 0;

    if(this.shouldCreateCanvas){
	    this.container = document.createElement( 'div' );
	    this.container.appendChild( this.renderer.domElement );
    }

	this.renderer.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
	this.renderer.domElement.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
	this.renderer.domElement.addEventListener( 'touchstart', this.onMouseDown.bind(this), false );
	this.renderer.domElement.addEventListener( 'touchend', this.onMouseUp.bind(this), false );

	window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

	window.addEventListener('load', this.onPageLoad.bind(this), false);

	this.clock = new THREE.Clock();
    if(!this.shouldCreateCanvas && canvasElem.offsetWidth){
        //If the canvasElement is already loaded, then the 'load' event has already fired. We need to trigger it ourselves.
        window.requestAnimationFrame(this.onPageLoad.bind(this));
    }
}

ThreeasyEnvironment.prototype.onPageLoad = function() {
	if(this.shouldCreateCanvas){
		document.body.appendChild( this.container );
	}

	this.start();
}
ThreeasyEnvironment.prototype.start = function(){
	this.prev_timestep = performance.now();
	this.clock.start();
	this.render(this.prev_timestep);
}

ThreeasyEnvironment.prototype.onMouseDown = function() {
	this.isMouseDown = true;
}
ThreeasyEnvironment.prototype.onMouseUp= function() {
	this.isMouseDown = false;
}
ThreeasyEnvironment.prototype.onPointerRestricted= function() {
	var pointerLockElement = this.renderer.domElement;
	if ( pointerLockElement && typeof(pointerLockElement.requestPointerLock) === 'function' ) {
		pointerLockElement.requestPointerLock();
	}
}
ThreeasyEnvironment.prototype.onPointerUnrestricted= function() {
	var currentPointerLockElement = document.pointerLockElement;
	var expectedPointerLockElement = this.renderer.domElement;
	if ( currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof(document.exitPointerLock) === 'function' ) {
		document.exitPointerLock();
	}
}
ThreeasyEnvironment.prototype.evenify = function(x){
	if(x % 2 == 1){
		return x+1;
	}
	return x;
}
ThreeasyEnvironment.prototype.onWindowResize= function() {

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    if(!this.shouldCreateCanvas){ // a canvas was provided externally

        width = this.renderer.domElement.clientWidth;
        height = this.renderer.domElement.clientHeight;
    }

	this.camera.aspect = width / height;
    //this.camera.setFocalLength(30); //if I use this, the camera will keep a constant width instead of constant height
	this.aspect = this.camera.aspect;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize( this.evenify(width), this.evenify(height),this.shouldCreateCanvas );
}
ThreeasyEnvironment.prototype.listeners = {"update": [],"render":[]}; //update event listeners
ThreeasyEnvironment.prototype.render = function(timestep){
    var realtimeDelta = this.clock.getDelta();
	var delta = realtimeDelta*this.timeScale;
	this.elapsedTime += delta;
    this.trueElapsedTime += realtimeDelta;
	//get timestep
	for(var i=0;i<this.listeners["update"].length;i++){
		this.listeners["update"][i]({"t":this.elapsedTime,"delta":delta,'realtimeDelta':realtimeDelta});
	}

	this.renderer.render( this.scene, this.camera );

	for(var i=0;i<this.listeners["render"].length;i++){
		this.listeners["render"][i]();
	}

	this.prev_timestep = timestep;
	window.requestAnimationFrame(this.render.bind(this));
}
ThreeasyEnvironment.prototype.on = function(event_name, func){
	//Registers an event listener.
	//each listener will be called with an object consisting of:
	//	{t: <current time in s>, "delta": <delta, in ms>}
	// an update event fires before a render. a render event fires post-render.
	if(event_name == "update"){ 
		this.listeners["update"].push(func);
	}else if(event_name == "render"){ 
		this.listeners["render"].push(func);
	}else{
		console.error("Invalid event name!")
	}
}
ThreeasyEnvironment.prototype.removeEventListener = function(event_name, func){
	//Unregisters an event listener, undoing an Threeasy_setup.on() event listener.
	//the naming scheme might not be the best here.
	if(event_name == "update"){ 
		let index = this.listeners["update"].indexOf(func);
		this.listeners["update"].splice(index,1);
	} else if(event_name == "render"){ 
		let index = this.listeners["render"].indexOf(func);
		this.listeners["render"].splice(index,1);
	}else{
		console.error("Nonexistent event name!")
	}
}
ThreeasyEnvironment.prototype.off = ThreeasyEnvironment.prototype.removeEventListener; //alias to match ThreeasyEnvironment.on

function setupThree(canvasElem = null){
     let threeEnvironment = new ThreeasyEnvironment(canvasElem);
    return threeEnvironment;
}
