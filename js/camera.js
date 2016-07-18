var Camera=function(){
	this.m_WorldOffset=new Vec2d(0,0);
	this.m_Canvas=document.getElementById('canvas');
	this.m_Dimensions=new Vec2d(this.m_Canvas.width,this.m_Canvas.height);
	
	var xThis=this;
	this.Offset=function(){
		return xThis.m_WorldOffset;
	}
	this.Dimensions=function(){
		return xThis.m_Dimensions;
	}
	this.SetOffsetXY=function(p_X,p_Y){
		p_X=p_X<0?0:p_X;
		p_Y=p_Y<0?0:p_Y;
		xThis.m_WorldOffset.Set(p_X,p_Y);
	}
	this.SetOffset=function(p_Offset){
		p_Offset.m_fX=p_Offset.m_fX<0?0:p_Offset.m_fX;
		p_Offset.m_fY=p_Offset.m_fY<0?0:p_Offset.m_fY;
		xThis.m_WorldOffset=p_Offset;
	}
	this.ScreenSpaceToWorldSpace=function(p_x,p_y){
		return {x:p_x-xThis.m_WorldOffset.m_fX,y:p_y-xThis.m_WorldOffset.m_fY};
	}
	Keyboard.RegisterEventListener('keydown',function(event){
		/* if(event.which==37){
			xThis.m_WorldOffset.m_fX+=3;
		}
		if(event.which==39){
			xThis.m_WorldOffset.m_fX-=3;
		}
		if(event.which==38){
			xThis.m_WorldOffset.m_fY+=3;
		}
		if(event.which==40){
			xThis.m_WorldOffset.m_fY-=3;
		} */
	});
}
window.Camera=new Camera();