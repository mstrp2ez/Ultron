"use strict";
var Entity=function(p_World,p_Pos,p_Layer){
	Renderable.call(this,p_Layer);
	this.m_Pos=p_Pos;
	this.m_Width=0;
	this.m_Height=0;
	this.m_World=p_World;
}
Entity.prototype=Object.create(Renderable.prototype);
Entity.prototype.constructor=Entity; 

Entity.prototype.Update=function(p_Delta){
	var chunk=this.m_World.ChunkAt(this.m_Pos);
	
}


var Plant=function(p_PlantProperty,p_Atlas,p_Col,p_Row,p_ChunkArea,p_TileSize){
	Renderable.call(this,1); 
	
	this.m_PlantProperty=p_PlantProperty;
	this.m_Collidable=p_PlantProperty.collidable;
	this.m_Col=p_Col;
	this.m_Row=p_Row;
	this.m_ChunkArea=p_ChunkArea;
	this.m_TileSize=p_TileSize;
	this.m_Atlas=p_Atlas;
	this.m_Loaded=false;
	this.m_MaxGrowth=0;
	this.m_Growth=0;
	this.m_Durability=p_PlantProperty.durability;
	
	this.m_MaxGrowth=(this.m_Atlas.width/this.m_PlantProperty.frameWidth)-1;
	this.m_Growth=Math.floor(Math.random()*this.m_MaxGrowth);
	
	var xThis=this;
	this.Render=function(p_Ctx){
		var tileSize=xThis.m_TileSize;
		var offset=Camera.Offset();
		var tileW=xThis.m_PlantProperty.frameWidth;
		var tileH=xThis.m_PlantProperty.frameHeight;
		var tallOffset=(tileH>tileSize)?tileH-tileSize:0;
		p_Ctx.drawImage(xThis.m_Atlas,
			xThis.m_Growth*tileW,
			xThis.m_PlantProperty.index,
			tileW,
			tileH,
			xThis.m_Col*tileSize+xThis.m_ChunkArea.x+offset.m_fX,
			xThis.m_Row*tileSize-tallOffset+xThis.m_ChunkArea.y+offset.m_fY,
			tileW,
			tileH);
	}
	this.Update=function(p_Delta){
		if(xThis.CanGrow()){
			var growChance=xThis.GrowthChance();
			if(growChance>=(Math.random()*100)){
				xThis.Grow();
			}
		}
	}
	this.CanGrow=function(){
		return (xThis.m_Growth<xThis.m_MaxGrowth);
	}
	this.GrowthChance=function(){
		return xThis.m_PlantProperty.growrate;
	}
	this.Grow=function(){
		xThis.m_Growth++;
		if(xThis.m_Growth>=xThis.m_MaxGrowth){
			xThis.m_Growth=xThis.m_MaxGrowth-1;
		}
	}
	this.IsCollidable=function(){
		return xThis.m_Collidable;
	}
	this.Interact=function(p_Player){
		xThis.m_Durability--;
		if(xThis.m_Durability<=0){
			xThis.m_Growth=xThis.m_MaxGrowth;
			xThis.m_Collidable=false;
			var drops=xThis.m_PlantProperty.droptable;
			var i,iC=drops.length;
			for(i=0;i<iC;i++){
				p_Player.AddInventoryItem(ItemManager.SpawnItem(drops[i]));
			}
			document.dispatchEvent(new CustomEvent('onSetRenderLayer',{'detail':{o:this,l:0}}));
		}
	}
}
Plant.prototype=Object.create(Renderable.prototype);
Plant.prototype.constructor=Plant; 

var Worker=function(p_Pos,p_World){
	Entity.call(this,p_World,p_Pos,1);
	this.m_Selected=false;
	this.m_Animation=new Animation();
	this.m_Animation.SetPosition(p_Pos);
	this.m_Ready=false;
	
	var xThis=this;
	this.Init=function(p_AnimSrc){
		$.getJSON(p_AnimSrc,{},function(p_JSON){
			xThis.m_Animation.Load(p_JSON,function(){
				xThis.m_Ready=true;
				var dim=xThis.m_Animation.FrameDimensions();
				xThis.m_Width=dim.w;
				xThis.m_Height=dim.h;
			});
		});
	}
	this.Update=function(p_Delta){
		Entity.prototype.Update.call(this,p_Delta);
		xThis.m_Animation.Animate(p_Delta);
	}
	this.Render=function(p_Ctx){
		xThis.m_Animation.Render(p_Ctx);
		
		if(xThis.m_Selected){
			var x=xThis.m_Pos.m_fX;
			var y=xThis.m_Pos.m_fY;
			var w=xThis.m_Width;
			var h=xThis.m_Height;
			
			p_Ctx.strokeStyle='#000';
			p_Ctx.lineWidth=1;
			
			p_Ctx.beginPath();
			p_Ctx.moveTo(x,y);
			p_Ctx.lineTo(x+w,y);
			p_Ctx.lineTo(x+w,y+h);
			p_Ctx.lineTo(x,y+h);
			p_Ctx.closePath();
			p_Ctx.stroke();
		}
	}
	this.onClick=function(p_Event){
		if(!xThis.m_Ready){return true;}
		var mx=p_Event.offsetX;
		var my=p_Event.offsetY;
		var x=xThis.m_Pos.m_fX;
		var y=xThis.m_Pos.m_fY;
		var w=xThis.m_Width;
		var h=xThis.m_Height;
		
		if(mx>=x&&mx<=x+w){
			if(my>=y&&my<=y+h){
				xThis.m_Selected=!xThis.m_Selected;
				return false;
			}
		}
	}
	Mouse.RegisterEventListener('click',this.onClick);
}
Worker.prototype=Object.create(Entity.prototype);
Worker.prototype.constructor=Worker;