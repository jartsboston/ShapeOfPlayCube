let state = "splash";



function rollAgain(){
    rollCube(10);
}

function handleClick(){
    if(state == "splash" || state == "results"){
        rollCube(10);
        state = "waitingForLand";
        document.getElementById("splashpage").style.opacity = 0;
        document.getElementById("splashpage").style.pointerEvents = "none";
    }
    hideAllResultTexts();

}

let timeout = 0;
function detectIfCubeIsRolled(){
    if(state == "waitingForLand"){
        if(cubePhysicsBody.position.y < 0.6 && cubePhysicsBody.velocity.almostZero(0.1) && cubePhysicsBody.angularVelocity.almostZero(0.1)){
            //cube has landed, but wait a little longer to show results for flair
            //clearTimeout(timeout);
            timeout = window.setTimeout(analyzeRollAndShowText, 500);
        }
    }
}

let cameraDirection = new THREE.Vector3(0,0,1);

function computeSideFacingCamera(){

    let vec = cubeMesh.worldToLocal(new THREE.Vector3(0,0,4));
    let absX = Math.abs(vec.x), absY= Math.abs(vec.y),absZ = Math.abs(vec.z);

    let result = "reroll";
    if(absX > absY && absX > absZ){
        maxDirection = vec.x;
        if(vec.x > 0){
            result = "who";
            /*
            //if they're too close to a corner, reroll
            if(absY+1 > absX || absZ+1 > absX){
                rerollToOrient(0, Math.PI/2,0);
            }*/
        }else{
            result = "what";
        }

    }
    if(absY > absX && absY > absZ){
        maxDirection = vec.y;
        if(vec.y > 0){
            result = "when";
        }else{
            result = "where";
        }
    }
    if(absZ > absY && absZ > absX){
        maxDirection = vec.z;
        if(vec.z > 0){
            result = "reroll";
        }else{
            result =  "why";
        }
    }
    return result;
}


function analyzeRollAndShowText(){
    if(state != "waitingForLand")return;
    let sideName = computeSideFacingCamera();

    state = 'results';
    showText(sideName);
}

function hideAllResultTexts(){
    for(let adverb of ['who','what','why','when','where','reroll']){
        document.getElementById(adverb).style.opacity = 0;
        document.getElementById(adverb).style.pointerEvents = "none";
    }
}

function showText(sideName){
        document.getElementById(sideName).style.opacity = 1;
        document.getElementById(sideName).style.pointerEvents = "all";
}


function setupListeners(){
    document.body.addEventListener("click",() =>handleClick());
    document.body.addEventListener("touchstart",() =>handleClick());

}
