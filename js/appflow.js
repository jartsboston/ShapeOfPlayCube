let state = "splash";



function rollAgain(){
    rollCube(10);
}

function handleClick(){
    if(state == "splash"){
        rollCube(10);
        state = "waitingForLand";
        document.getElementById("splashpage").style.opacity = 0;
    }

}
function onCollision(){
    if(state == "waitingForLand"){
        //compute collision

        /*
        //if cubeIsLanded(){
             side = detectSideClosestToCamera();
             sideName = sideToName[side];
             showText(sideName);
        }

        */
    }
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
    //when roll button is clicked, rollCube();
    //when redo button is clicked
    document.body.addEventListener("click",() =>handleClick());

}
