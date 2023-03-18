//mobile detection
var isiPhoneOS = false;
isiPhone = navigator.userAgent.indexOf("iPhone") != -1;
isiPod = navigator.userAgent.indexOf("iPod") != -1;
isiPad = navigator.userAgent.indexOf("iPad") != -1;
isiPhoneOS = isiPhone || isiPod || isiPad;
if(isiPhoneOS){	$('body').addClass('iOS'); }
//gameplay vars
var podiumPosition = 1;
var assembledGroup = new Array();
var selectedMembers = new Array();
var selectedGroup;
var passedGroups = new Array();
var grpLength;
var clickDisabled = 0;
var playAudio = 1;
/* scrolling movement */
var scrollDisabled = 0;
var scrollLeftDisabled = 0;
var scrollRightDisabled = 0;
var swipeAmount;
switch($(document).innerWidth()){ //set swipe amount based on screen size
	case 768:
		swipeAmount = 180;
	break;
	case 320:
		swipeAmount = 120;
	break;
	default:
		swipeAmount = 740;
	break;
}
//                .---. .---. 
//               :     : o   :
//           _..-:   o :     :-.._
//       .-''  '  `---' `---' "   ``-.    
//     .'   "   '  "  .    "  . '  "  `.  
//    :   '.---.,,.,...,.,.,.,..---.  ' ;
//    `. " `.                     .' " .'
//     `.  '`.                   .' ' .'
//      `.    `-._           _.-' "  .'  .----.
//        `. "    '"--...--"'  . ' .'  .'  o   `.
//        .'`-._'    " .     " _.-'`. :       o  :
//      .'      ```--.....--'''    ' `:_ o       :
//    .'    "     '         "     "   ; `.;";";";'
//   ;         '       "       '     . ; .' ; ; ;
//  ;     '         '       '   "    .'      .-'
//  '  "     "   '      "           "    _.-'
var gameProgress = readCookie('supergroups');
if(!gameProgress){
	createCookie('supergroups','');
}
$(document).ready(function(){
	$('#gameContainer').disableSelection();
	$('#groupPodium ul').disableSelection();
	$('#groupPodium ul li').disableSelection();
	$('#intro').disableSelection();
	$('#tip').disableSelection();
	$('#right').disableSelection();
	$('#wrong').disableSelection();
	$('#introtrigger').leanModal({overlay:'0.25'});
	setTimeout("$('#introtrigger').trigger('click')",650);
	$('#intro a.start').click(function(event){
		$('#lean_overlay').trigger('click')
	});
	$('#tiptrigger').leanModal({closeButton:".tip_close",overlay:'0.25',callback:resetStage});
	$('#wrongtrigger').leanModal({overlay:'0.25'});
	$('#gameContainer p#score').text('0/'+grp.length);
	var screenWidth = $(document).innerWidth();
	if( screenWidth>768 ){
		doPagers();
	}
	(gameProgress) ? resumeGame(gameProgress) : null;
	//audio - select
	$('#aSelect').jPlayer({
        ready: function(event) {
            $(this).jPlayer('setMedia', {
                mp3: 'audio/select.mp3',
                wav: 'audio/select.wav'
            });
        },
        swfPath: 'javascripts/',
        supplied: 'mp3, wav'
    });
	//audio - right
	$('#aRight').jPlayer({
        ready: function(event) {
            $(this).jPlayer('setMedia', {
                mp3: 'audio/right.mp3',
				wav: 'audio/right.wav'
            });
        },
        swfPath: 'javascripts/',
        supplied: 'mp3, wav'
    });
	//audio - wrong
	$('#aWrong').jPlayer({
        ready: function(event) {
            $(this).jPlayer('setMedia', {
                mp3: 'audio/wrong.mp3',
				wav: 'audio/wrong.wav'
            });
        },
        swfPath: 'javascripts/',
        supplied: 'mp3, wav'
    });
});

//audio toggle
$('#audiotoggle').click(function(event){
	if(playAudio==1){
		$(this).addClass('disabled');
		playAudio=0;
		$("#aGameplay").jPlayer("stop");
	}else{
		$(this).removeClass('disabled');
		playAudio=1;
		playSound('#aGameplay');
	}
	
});

//player was selected
$('#playStrip ul li a').click(function(event){
	var member = event.target.parentElement;
	(clickDisabled==0 && !$(member).hasClass('solved')) ? selectMember(member) : null;
});

//character is highlighted and added to the podium
function selectMember(member){
	$member = $(member); //set member object variable
	($member.addClass('selected')); //'selected' glow behind player
	var memberName = $member.attr('id');
	//which group does this member belong to?
	var grpCollectionLength = grp.length;
	for(i=0;i<grpCollectionLength;i++){ //loop through the whole batch
		if($.inArray(memberName,grp[i])!=-1){
			selectedGroup = i; //this is the index of the array that this character is a part of
		}
	}
	if(selectedMembers.length==0){ //do this stuff only if a group isn't already started
		grpLength = grp[selectedGroup].length; //number of podiums to display
		//add the appropriate number of podiums
		$('#groupPodium ul').html('');
		for(i=0;i<grpLength;i++){
			$('#groupPodium ul').append('<li></li>');
		}
		var podiumSetWidth = grpLength*45; //calculate width of podium set
		$('#groupPodium ul').css('width',podiumSetWidth); //set the width of podium set for positioning measurements
	}
	podiumSetDisplay(grpLength,'show');
	//add this character to the podium row and to the logic checking stuff
	if($.inArray(memberName,selectedMembers)==-1){ //character has not already been selected, so use it
		playSound('#aSelect');
		cloneMember($member,podiumPosition,memberName);
		selectedMembers.push(memberName); //add character to selectedMembers so it cannot be selected again
		addToGroup(memberName,selectedGroup); //add character to the group array that will be checked
	}
}

function cloneMember(source,target,name){
	//clone the little guy
	var clonedSprite = source.children('a').clone();
	//adopt the little guy and place him on the right podium
	if(name=='larry'){ //if it is the Stooges, funny up their podium spots a bit
		var podiumTarget = String('#groupPodium ul li:nth-child(1)');
	}else if(name=='moe'){
		var podiumTarget = String('#groupPodium ul li:nth-child(2)');
	}else if(name=='curly'){
		var podiumTarget = String('#groupPodium ul li:nth-child(3)');
	}else{
		var podiumTarget = String('#groupPodium ul li:nth-child('+podiumPosition+')');
	}
	$(podiumTarget).html(clonedSprite);
	$(podiumTarget).css('background-position','0 0');
	//style the little guy
	clonedSprite.css('background-image',source.children('a').css('background-image'));
	clonedSprite.css('background-position',source.children('a').css('background-position'));
	clonedSprite.css('background-repeat',source.children('a').css('background-repeat'));
	clonedSprite.css('display',source.children('a').css('display'));
	clonedSprite.css('height',source.children('a').css('height'));
	clonedSprite.addClass(name);
	clonedSprite.css('margin','-13px 0 0 -10px');
	clonedSprite.css('opacity','0').fadeTo('fast',1);
	clonedSprite.css('width',source.children('a').css('width'));
}

//player is added to the group array for game functions
function addToGroup(member,group){
	assembledGroup.push(member);
	podiumPosition++;
	if(selectedMembers.length>1){checkGroup(assembledGroup,group)} //this is at least the second member of the group, so check it for validity
}

function podiumSetDisplay(count,dir){
	var delayCount = 0;
	var doneHidingCount = (325*count);
	for(i=0,j=1;i<count;i++,j++){
		switch(dir){
			case 'show':
				$('#groupPodium ul li:nth-child('+j+')').delay(delayCount).animate({'margin-top':'0','opacity':1}, 250);
			break;
			case 'hide':
				$('#groupPodium ul li:nth-child('+j+')').delay(delayCount).animate({'margin-top':'77px','opacity':1}, 500, function(){
				});
			break;
		}
		delayCount += 50;
	}
	if(dir=='hide'){
		setTimeout("podiumDoneHiding()",doneHidingCount);
	}
}

function podiumDoneHiding(){
	clickDisabled=0;
	(passedGroups.length>=grp.length)?gameComplete():null;
}

function resetStage(){
	clickDisabled=1;
	//remove the characters from the podium
	var delayCount = 0;
	for(i=grpLength,j=grpLength;i>0;i--,j--){
		$('#groupPodium ul li:nth-child('+j+') a').delay(delayCount).animate({'opacity':0}, 250);
		delayCount += 150;
	}
	//reset the podium background
	$('#groupPodium ul li').css('background-position','-44px 0');
	//removed the selected states from the character grid
	$('#playStrip ul li').removeClass('selected');
	//hide the podiums
	podiumSetDisplay(grpLength,'hide');
	//reset the game variables and arrays
	podiumPosition = 1;
	assembledGroup = [];
	selectedMembers = [];
	selectedGroup;
}

//group is checked for proper assembly
function checkGroup(userGroup,validGroup){
	var uGrp = userGroup;
	var vGrp = grp[validGroup];
	var uGrpLength = uGrp.length;
	var vGrpLength = vGrp.length;
	var uGrpPassed = 0;
	//if item of uGrp is not found in vGrp, then groupFail()
	for(i=0;i<uGrpLength;i++){ //loop through the assembled group
		if($.inArray(uGrp[i],vGrp)==-1){
			groupFail();
		}else if(uGrpLength==vGrpLength){
			uGrpPassed=1;
		}
	}
	(uGrpPassed==1) ? groupPass(validGroup) : null;
}

//group is assembled!
function groupPass(which){
	clickDisabled=1;
	//track which groups have been successfully assembled
	if($.inArray(which,passedGroups)==-1){ //add the group index only if it isn't already there
	     passedGroups.push(which);
	     updateScore();
	}
	//set content of modal
	$('#tip').html(tip[which]);
	//Twitter button biz
	/*
	$('#tip').append('<div style="margin:20px 30px 0 0;text-align:right;"><a href="http://twitter.com/share" class="twitter-share-button" data-text="How many pop culture groups do you know? Play #supergroups and find out! RT this to win a t-shirt from @minigroupnews. http://ow.ly/9Wfcn" data-count="none" data-via="">Tweet</a></div>');
	$('a[data-text]').each(function(){
	      $(this).attr('data-text', tweet[which]);
    });
    $.getScript('http://platform.twitter.com/widgets.js');
	*/
	$('#tip').append('<a class="tip_close" href="#"></a>');
	setTimeout("$('#right').css('display','block');$('#right').animate({'opacity':1}, 250)",250);
	setTimeout("$('#right p#scoresummary span').effect('pulsate', { times:12 }, 175)",300);
	setTimeout("$('#right').animate({'opacity':0}, 250, function(){$('#right').css('display','none');})",1650);
	//launch modal
	setTimeout("$('#tiptrigger').trigger('click')",1650);
	//dim the group on the stage
	var grpLength = grp[which].length;
	for(i=0;i<grpLength;i++){
		$('#playStrip ul li#'+grp[which][i]).addClass('solved');
		$('#playStrip ul li#'+grp[which][i]+' a').animate({'opacity':0.15}, 250);
	}
	playSound('#aRight');
}

//group is invalid
function groupFail(){
	setTimeout("$('#wrongtrigger').trigger('click')",325);
	setTimeout("$('#lean_overlay').trigger('click')",1000);
	resetStage();
	playSound('#aWrong');
}

function updateScore(){
	$('#gameContainer p#score').html(passedGroups.length+'<span>/</span>'+grp.length);
	$('#right p#scoresummary').html('<span>'+passedGroups.length+'<span class="slash">/</span>'+grp.length+'</span>');
	createCookie('supergroups',passedGroups);
}

function gameComplete(){
	//sunset game stage
	clickDisabled=1;
	hideScrollArrow('left');
	hideScrollArrow('right');
	eraseCookie('supergroups');
	//on ajax success:
	prizeClaim('trial'); //OR prizeClaim('tshirt');
}

function prizeClaim(prize){
	//sunset game and show new content
	$('p#score').animate({'opacity':0},1000,function(){
		$('p#score').css('visibility','hidden');
	});
	$('#audiotoggle').animate({'opacity':0},1000,function(){
		$('#audiotoggle').css('visibility','hidden');
	});
	$('#playArea').animate({'opacity':0},1000,function(){
		switch(prize){
			case 'tshirt':
				$('#gameContainer').addClass('tshirt');
				$('#playArea').html('<div></div>');
				$('#playArea div').append('<h2>Congratulations!</h2>');
				$('#playArea div').append('<h3>You won a free shirt!</h3>');
				$('#playArea div').append('<p>To claim your prize, just register or log in and provide your mailing address. Registering is free and no credit card is required. You&rsquo;ll also get a 30-day free Minigroup trial.</p>');
				$('#playArea div').append('<a href="https://minigroup.com/login" class="login">Log in</a> <span>or</span> <a href="https://minigroup.com/register" class="register">Register</a>');
			break;
			default:
				$('#gameContainer').addClass('trial');
				$('#playArea').html('<div></div>');
				$('#playArea div').append('<h2>Super, grouper!</h2>');
				$('#playArea div').append('<h3>Now make your own Super Group!</h3>');
				$('#playArea div').append('<p>The free shirts are gone, but we won&rsquo;t leave you empty-handed. Sign up for a free 30-day trial of Minigroup and find out how having a dedicated space for online collaboration can help your groups work better together.</p>');
				$('#playArea div').append('<a href="#" class="try">Try it free for 30 days<br /><span>No credit card required</span></a>');
			break;
		}
		$('#playArea').animate({'opacity':1},1000);
	});
}

//pagers for larger displays
function doPagers(){
	if(!isiPhoneOS){
		$('#groupPodium').append('<div id="gameNavL"></div>');
		$('#groupPodium').append('<div id="gameNavR"></div>');
		$('#gameNavL').click(function(){ (scrollDisabled==0&&scrollLeftDisabled==0) ? moveStrip('left') : null; });
		$('#gameNavR').click(function(){ (scrollDisabled==0&&scrollRightDisabled==0) ? moveStrip('right') : null; });
	}
}

function moveStrip(direction){
	scrollDisabled=1;
	var curMargin = $("#playStrip").css('marginLeft');
	curMargin = parseInt( curMargin.slice(0,-2) ) //returns the margin as an integer
	if(curMargin==0||curMargin==undefined){
		showScrollArrow('left');
	}
	if(direction=='left'){ //constrain the strip
		if(curMargin>=0){
			swipeAmountStr = "+=0px";
		}else{
			swipeAmountStr = "+="+swipeAmount+'px';
			scrollLeftDisabled=0;
		}
	}
	if(direction=='right'){
		if(curMargin<=-2160){ //constrain the strip
			swipeAmountStr = "-=0px";
		}else{
			swipeAmountStr = "-="+swipeAmount+'px';
			scrollRightDisabled=0;
		}
	}
	$("#playStrip").animate({marginLeft:swipeAmountStr},250,function(){scrollComplete();}); //move the strip
}

function showScrollArrow(which){
	if(!isiPhoneOS){
		switch(which){
			case 'left':
				$("#gameNavL").animate({'opacity':'1'},100);
				$('#gameNavL').css('cursor','pointer');
			break;
			case 'right':
				$("#gameNavR").animate({'opacity':'1'},100);
				$('#gameNavR').css('cursor','pointer');
			break;
			default:
				//nothing
			break;
		}
	}
}

function hideScrollArrow(which){
	if(!isiPhoneOS){
		switch(which){
			case 'left':
				$("#gameNavL").animate({'opacity':'0'},100);
				$('#gameNavL').css('cursor','default');
			break;
			case 'right':
				$("#gameNavR").animate({'opacity':'0'},100);
				$('#gameNavR').css('cursor','default');
			break;
			default:
				//nothing
			break;
		}
	}
}

function scrollComplete(){
	//adjust the margin
	var curMargin = $("#playStrip").css('marginLeft');
	curMargin = parseInt( curMargin.slice(0,-2) ) //returns the margin as an integer
	var screenW = 1010;
	var stripW = parseInt( $('#playStrip ul').css('width').slice(0,-2) );
	var maxMargin = screenW - stripW + 40;
	maxMarginStr = maxMargin+'px';
	if(curMargin<=maxMargin){ //right side of strip has been reached
		$("#playStrip").animate({marginLeft:maxMarginStr},100); //correct the strip
		curMargin=maxMargin;
		hideScrollArrow('right');
		scrollRightDisabled=1;
		showScrollArrow('left');
		scrollLeftDisabled=0;
	}else{
		showScrollArrow('right');
		scrollRightDisabled=0;
	}
	if(curMargin>=0){ //left side of strip has been reached
		$("#playStrip").animate({marginLeft:'0px'},100); //correct the strip
		curMargin=0;
		hideScrollArrow('left');
		scrollLeftDisabled=1;
		showScrollArrow('right');
		scrollRightDisabled=0;
	}else{
		showScrollArrow('left');
		scrollLeftDisabled=0;
	}
	scrollDisabled=0;
	if($("#playStrip").css('margin-left')=='0px'){
		$("#gameNavL").animate({'opacity':'0'},100);
	}
}

function resumeGame(cookiedata){	
	$('#intro h2').html('Welcome back!');
	$('#intro p.copy').html('We saved your progress from your last visit. Keep making groups until you complete all 50.');
	$('#intro a.start').text('Continue');
	passedGroups = cookiedata.split(',');
	var grpLength = passedGroups.length;
	$('#gameContainer p#score').text(grpLength+'/'+grp.length);
	//dim the previously completed groups on the stage
	for(i=0;i<grpLength;i++){
		var subGrpLength = grp[passedGroups[i]].length;
		for(j=0;j<subGrpLength;j++){
			$('#playStrip ul li#'+grp[passedGroups[i]][j]).addClass('solved');
			$('#playStrip ul li#'+grp[passedGroups[i]][j]+' a').animate({'opacity':0.15}, 250);
		}
	}
}

function playSound(which){
	if(!isiPhoneOS){
		$sound = which;
		if(playAudio==1){
			$($sound).jPlayer('play');
		}
	}
}