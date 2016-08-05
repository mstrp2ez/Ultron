

var Animation=function(p_Src){
	this.m_Ctx=document.getElementById('canvas').getContext('2d');
	this.m_currentFrame=0;
	this.m_currentAnim=0;
	this.m_AnimationRates=null;
	this.m_x=0;
	this.m_y=0;
	this.m_Animations=[];
	this.m_Loaded=false;
	this.m_TimeIncrement=0;
	this.m_LastUpdate=0;
	this.m_SpriteSheet=null;
	this.m_LastFrame=0;
	this.m_Stopped=false;
	
	this.m_AnimationEventListeners=[];
	
	var xThis=this;
	this.Load=function(p_Data,p_Callback){
		xThis.m_AnimationRates=p_Data.rates;
		xThis.m_Animations=p_Data.a;
		
		xThis.m_SpriteSheet=new Image();
		xThis.m_SpriteSheet.onload=function(){
			xThis.m_Loaded=true;
			if(p_Callback!==undefined){p_Callback();}
		}
		xThis.m_SpriteSheet.src=p_Data.src;
		
	}
	this.SetPosition=function(p_Pos){
		xThis.m_x=p_Pos.m_fX;
		xThis.m_y=p_Pos.m_fY;
	}
	this.AnimationEvent=function(p_Event){
		if(xThis.m_AnimationEventListeners[p_Event]===undefined){return;}
		var i,iC=xThis.m_AnimationEventListeners[p_Event].length;
		for(i=0;i<iC;i++){
			var listener=xThis.m_AnimationEventListeners[p_Event][i];
			if(listener.onAnimationEvent===undefined){continue;}
			listener.onAnimationEvent({type:p_Event,currentFrame:xThis.m_currentFrame,currentAnimation:xThis.m_currentAnim,animation:xThis});
		}
	}
	this.RegisterAnimationEventListener=function(p_Event,p_Listener){
		if(xThis.m_AnimationEventListeners[p_Event]===undefined){
			xThis.m_AnimationEventListeners[p_Event]=[];
		}
		if(xThis.m_AnimationEventListeners[p_Event].indexOf(p_Listener)!=-1){return;}
		xThis.m_AnimationEventListeners[p_Event].push(p_Listener);
	}
	this.Animate=function(p_Delta){
		if(xThis.m_Stopped||!xThis.m_Loaded){return;}
		xThis.m_TimeIncrement+=p_Delta-xThis.m_LastUpdate;
		xThis.m_LastUpdate=p_Delta;
		
		if(xThis.m_TimeIncrement>xThis.m_AnimationRates[xThis.m_currentAnim]){
			var stopAnim=xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].s;
			if(stopAnim!==undefined){
				xThis.Stop();
				xThis.AnimationEvent('stopframe');
				return;
			}
			var nextAnim=xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].n;
			if(nextAnim!==undefined){
				xThis.SetAnimation(nextAnim);
				return;
			}
			xThis.m_currentFrame++;
			if(xThis.m_currentFrame>=xThis.m_Animations[xThis.m_currentAnim].length){
				xThis.m_currentFrame=0;
			}
			//xThis.m_LastFrame=d;
			xThis.m_TimeIncrement=0;
		}
	}
	this.Render=function(p_Ctx,p_Offset){
		if(!xThis.m_Loaded){return;}
		if(xThis.m_Animations.length<=0){return;}
		var offset=p_Offset;
		if(p_Offset===undefined){
			offset=new Vec2d(0,0);
		}
		var fw=xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].w;
		var fh=xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].h;
		p_Ctx.drawImage(xThis.m_SpriteSheet,
			xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].x,
			xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].y,
			xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].w,
			xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].h,
			xThis.m_x+offset.m_fX,
			xThis.m_y+offset.m_fY,
			fw,
			fh);
	}
	this.FrameDimensions=function(){
		if(xThis.m_Stopped||!xThis.m_Loaded){return false;}	
		return {w:xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].w,h:xThis.m_Animations[xThis.m_currentAnim][xThis.m_currentFrame].h};
	}
	this.Stop=function(){
		xThis.m_Stopped=true;
	}
	this.Start=function(){
		xThis.m_Stopped=false;
	}
	this.SetFrame=function(p_Frame){
		if(p_Frame<0){p_Frame=0;}
		if(p_Frame>=xThis.m_Animations[xThis.m_currentAnim].length){
			p_Frame=xThis.m_Animations[xThis.m_currentAnim].length;
		}
		xThis.m_currentFrame=p_Frame;
	}
	this.SetAnimation=function(p_Anim){
		if(xThis.m_currentAnim==p_Anim){return;}
		xThis.m_currentAnim=p_Anim;
		if(xThis.m_currentAnim>=xThis.m_Animations.length){
			xThis.m_currentAnim=0;
		}
		if(xThis.m_currentAnim<0){
				xThis.m_currentAnim=3;
		}
		xThis.m_currentFrame=0;
	}
	this.NextAnimation=function(){
		xThis.m_currentAnim++;
		xThis.m_currentFrame=0;
		if(xThis.m_currentAnim>=xThis.m_Animations.length){
			xThis.m_currentAnim=xThis.m_Animations.length-1;
			return true;
		}else{
			return false;
		}
	}
	//if(p_Src!==undefined&&p_Src.length>0){this.Load(p_Src);}
}