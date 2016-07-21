"use strict";
var Entities=function(){
	this.m_Entities=[];
	
	var xThis=this;
	this.NewEntity=function(p_Type,p_Properties){
		var constr=window[p_Type+'Parser'];
		if(constr!==undefined){
			constr=new constr();
			constr.Parse(p_Properties);
		}
	}
	this.AddEntity=function(p_Entity){
		if(!p_Entity){return;}
		if(xThis.m_Entities.indexOf(p_Entity)!=-1){return;}
		
		xThis.m_Entities.push(p_Entity);
	}
	this.RemoveEntity=function(p_Entity){
		var idx=xThis.m_Entities.indexOf(p_Entity);
		if(idx==-1){return;}
		
		xThis.m_Entities.splice(idx,1);
	}
	this.GetEntitiesOfType=function(p_Type){
		var ret=[];
		var i,iC=xThis.m_Entities.length;
		for(i=0;i<iC;i++){
			var e=xThis.m_Entities[i];
			if(e&&e.Type()==p_Type){
				ret.push(e);
			}
		}
		return ret;
	}
	this.GetEntitiesOfTypeWithProperty=function(p_Type,p_Key,p_Val){
		var ret=[];
		var i,iC=xThis.m_Entities.length;
		for(i=0;i<iC;i++){
			var e=xThis.m_Entities[i];
			if(e&&e.Type()==p_Type&&e[p_Key]!==undefined&&e[p_Key]===p_Val){
				ret.push(e);
			}
		}
		return ret;
	}
	this.Update=function(p_Delta){
		var i,iC=xThis.m_Entities.length;
		for(i=0;i<iC;i++){
			var e=xThis.m_Entities[i];
			if(e.Update){e.Update(p_Delta);}
		}
	}
	this.onEntityEvent=function(){
		
	}
	document.addEventListener('onEntityEvent',this.onEntityEvent);
}
window.Entities=new Entities();

var Entity=function(p_Pos,p_World,p_Layer){
	Renderable.call(this,p_Layer);
	this.m_Pos=p_Pos;
	this.m_World=p_World;
	this.m_Width=0;
	this.m_Height=0;
	this.m_Type="Default";
	
	Entities.AddEntity(this);
}
Entity.prototype=Object.create(Renderable.prototype);
Entity.prototype.constructor=Entity; 

Entity.prototype.Pos=function(){
	return this.m_Pos;
}
Entity.prototype.World=function(){
	return this.m_World;
}
Entity.prototype.Type=function(){
	return this.m_Type;
}
Entity.prototype.Update=function(p_Delta){
	
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
	Entity.call(this,p_Pos,p_World,1);
	this.m_Selected=false;
	/* this.m_World=p_World; */
	this.m_Animation=new Animation();
	this.m_Animation.SetPosition(p_Pos);
	this.m_Ready=false;
	this.m_Type='Worker';
	this.m_UIControl=false;
	this.m_MoveSpeed=0.5;
	this.m_Path=[];
	this.m_LerpPath=false;
	
	this.WorkerState={
		WORKER_NONE:0,
		WORKER_MOVE:1,
		WORKER_BUILD:2
	}
	
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
	this.MoveSpeed=function(){
		return xThis.m_MoveSpeed;
	}
	this.Update=function(p_Delta){
		Entity.prototype.Update.call(this,p_Delta);
		xThis.m_Animation.Animate(p_Delta);
		
		if(xThis.m_LerpPath){
			xThis.m_LerpPath.Update(p_Delta);
		}
		xThis.m_Animation.SetPosition(xThis.m_Pos);
	}
	this.Render=function(p_Ctx){
		var offset=Camera.Offset();
		xThis.m_Animation.Render(p_Ctx,offset);
		
		if(xThis.m_Selected){
			var x=xThis.m_Pos.m_fX+offset.m_fX;
			var y=xThis.m_Pos.m_fY+offset.m_fY;
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
		var cameraOffset=Camera.Offset();
		var mx=p_Event.offsetX;
		var my=p_Event.offsetY;
		var x=xThis.m_Pos.m_fX+cameraOffset.m_fX;
		var y=xThis.m_Pos.m_fY+cameraOffset.m_fY;
		var w=xThis.m_Width;
		var h=xThis.m_Height;
		var ui=Game.CurrentScene().GetSystemByName('UI').s;
		var control=ui.GetWidgetFromName('ControlPanel');
		
		if(mx>=x&&mx<=x+w){
			if(my>=y&&my<=y+h){
				xThis.m_Selected=!xThis.m_Selected;
				if(xThis.m_Selected){
					if(control){
						control.HideChildren();
						var el=control.GetChildWidgetByName(xThis.m_Type+'UIElement');
						if(el){
							el.Toggle();
						}
					}
				}
				return false;
			}
		}
		//Entity was not clicked at
		var state=GameState.Get('WorkerState');
		if(!state||state.s===xThis.WorkerState.WORKER_NONE){
			xThis.m_Selected=false;
			if(control){
				control.HideChildren();
			}
		}else{
			if(state&&state.e===xThis){
				if(state.s===xThis.WorkerState.WORKER_MOVE){
					GameState.Set('WorkerState',{s:xThis.WorkerState.WORKER_NONE,e:this});
					var route=new Route();
					var worldCoord=Camera.ScreenSpaceToWorldSpace(mx,my);
					xThis.m_Path=route.CalculateRoute(xThis,new Vec2d(worldCoord.x,worldCoord.y));
					if(xThis.m_Path.length){
						xThis.m_LerpPath=new TilePathLerp(xThis.m_Path,xThis);
					}
				}
			}
		}
	}
	Mouse.RegisterEventListener('click',this.onClick);
}
Worker.prototype=Object.create(Entity.prototype);
Worker.prototype.constructor=Worker;

var WorkerParser=function(){
	this.Parse=function(p_Data){
		var p=new Vec2d(p_Data.px,p_Data.py);
		var animSrc=p_Data.anim;
		var world=p_Data.world;
		
		var w=new Worker(p,world);
		w.Init(animSrc);
	}
}



