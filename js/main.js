$(document).ready(function(){
	var canvas=document.getElementById('canvas');
	var ctx=canvas.getContext('2d');
	
	
	var game=new Game(ctx);
	window.Game=game;
});