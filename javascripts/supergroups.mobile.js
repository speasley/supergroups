var swipeDisabled;
var swipeAmountConstrain;
switch($(document).innerWidth()){ //set swipe amount based on screen size
	case 768:
		swipeAmountConstrain = -1740;
	break;
	case 320:
		swipeAmountConstrain = -2160;
	break;
	default:
		swipeAmountConstrain = -2160;
	break;
}

function handleSwipe(elem,func){

	var swipeDir;
	var startX, startY;
	var deltaX;
	var yThreshhold=80;
	var xThreshhold=50;
	 
	 function trackTouchMove(e){
		if(e.changedTouches.length != 1){
			stopTouch();
		}
		else{
			deltaX = e.touches[0].pageX - startX;
			var deltaY = e.touches[0].pageY - startY;
			if(swipeDir == null){
				swipeDir = deltaX;
				//e.preventDefault();
			}
			else if(Math.abs(deltaY ) > yThreshhold){
				stopTouch();
			}
			//e.preventDefault();
		}
	}
	
	 function handleTouchEnd(e){
		stopTouch();
		if (Math.abs(deltaX) > xThreshhold){
			func(elem, deltaX > 0 ? 'right' : 'left' );
		}
	 }
	 
	function handleTouchStart(e){
		if (e.touches.length == 1)	{
			deltaX = 0;
			startX = e.touches[0].pageX;
			startY = e.touches[0].pageY;
			elem.addEventListener('touchmove', trackTouchMove, false);
			elem.addEventListener('touchend', handleTouchEnd, false);
			//e.preventDefault();
		}
	}

	function stopTouch(){
		elem.removeEventListener('touchmove', trackTouchMove);
		elem.removeEventListener('touchend', handleTouchEnd);
	}

	elem.addEventListener("touchstart", handleTouchStart, false);
}

function swipe(elem,direction){
	if(swipeDisabled==1){
		//do nothing. animation is probably in progress.
	}else{
		swipeDisabled=1;
		var curMargin = $("#playStrip").css('marginLeft');
		curMargin = parseInt( curMargin.slice(0,-2) ) //returns the margin as an integer
		if(direction=='left'){
			if(curMargin<=swipeAmountConstrain){ //constrain the strip
				swipeAmountStr = "-=0px";
			}else{
				swipeAmountStr = "-="+swipeAmount+'px';
			}
		}
		if(direction=='right'){ //constrain the strip
			if(curMargin>=0){
				swipeAmountStr = "+=0px";
			}else{
				swipeAmountStr = "+="+swipeAmount+'px';
			}
		}
		$("#playStrip").animate({marginLeft:swipeAmountStr},250,function(){swipeDisabled=0}); //move the strip
	}
}

window.onload = function(){
	handleSwipe(document.body,swipe);
}