let state = "splash";



function rollAgain(){
    rollCube(10);
}

function handleClick(){
    if(state == "splash" || state == "results"){
        rollCube(10);
        state = "waitingForLand";
        document.getElementById("splashpage").style.opacity = 0;
        hideAllResultTexts();
    }

}

function detectIfCubeIsRolled(){
    if(state == "waitingForLand"){
        if(cubePhysicsBody.position.y < 0.6 && cubePhysicsBody.velocity.almostZero(0.1) && cubePhysicsBody.angularVelocity.almostZero(0.1)){
            //cube has landed, but wait a little longer to show results for flair
            window.setTimeout(analyzeRollAndShowText, 500);
        }
    }
}

function analyzeRollAndShowText(){

    /*
    side = detectSideClosestToCamera();
    sideName = sideToName[side];
    showText(sideName);
    state = 'results';*/

    
    showText('why');
    state = 'results';
}

function hideAllResultTexts(){
    for(let adverb of ['who','what','why','when','where']){
        document.getElementById(adverb).style.opacity = 0;
    }
}

function showText(sideName){
        document.getElementById(sideName).style.opacity = 1;
}


function setupListeners(){
    document.body.addEventListener("click",() =>handleClick());

}
