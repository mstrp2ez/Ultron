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
		return constr;
	}
	this.AddEntity=function(p_Entity){
		if(!p_Entity){return;}
		if(xThis.m_Entities.indexOf(p_Entity)!=-1){return;}
		
		xThis.m_Entities.push(p_Entity);
	}
	this.RemoveEntity=function(p_Entity){
		var idx=xThis.m_Entities.indexOf(p_Entity);
		if(idx==-1){return;}
		
		var rem=xThis.m_Entities.splice(idx,1);
		var i,iC=rem.length;
		for(i=0;i<iC;i++){
			if(rem[i].Unload!==undefined){
				rem[i].Unload();
			}
		}
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
Entity.prototype.Unload=function(){
	
}
/* var Plant=function(p_PlantProperty,p_Atlas,p_Col,p_Row,p_ChunkArea,p_TileSize){
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
Plant.prototype.constructor=Plant;  */

var Plant=function(p_Pos,p_World){
	Entity.call(this,p_Pos,p_World,1);
	this.m_Animation=new Animation();
	this.m_Animation.SetPosition(p_Pos);
	this.m_Ready=false;
	this.m_Type='Plant';
	this.m_Hits=0;
	this.m_MaxHits=3;
	
	var xThis=this;
	this.Init=function(p_AnimSrc){
		$.getJSON(p_AnimSrc,{},function(p_JSON){
			xThis.m_Animation.Load(p_JSON,function(){
				var currentChunk=xThis.World().ChunkAt(xThis.Pos());
				
				var dim=xThis.m_Animation.FrameDimensions();
				var p=xThis.Pos().Copy();
				p.m_fX+=dim.w;
				p.m_fY+=dim.h;
				var tiles=currentChunk.Tilemanager().TilesInArea(xThis.Pos().Copy(),p);
				var i,iC=tiles.length;
				for(i=0;i<iC;i++){
					tiles[i].m_Walkable=false;
				}
				
				xThis.m_Ready=true;
			});
		});
	}
	this.Update=function(p_Time){
		if(!xThis.m_Ready){return;}
		
		xThis.m_Animation.Animate(p_Time);
	}
	this.Render=function(p_Ctx){
		if(!xThis.m_Ready){return;}
		
		xThis.m_Animation.Render(p_Ctx);
	}
}
Plant.prototype=Object.create(Entity.prototype);
Plant.prototype.constructor=Plant;

var PlantParser=function(){
	this.Parse=function(p_Data){
		var p=new Vec2d(p_Data.px,p_Data.py);
		var animSrc=p_Data.anim;
		var world=p_Data.world;
		
		var w=new Plant(p,world);
		w.Init(animSrc);
	}
}

var WorkerState={
	WORKER_NONE:0,
	WORKER_MOVE:1,
	WORKER_BUILD:2
}

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
	this.m_MaxBuildRange=150;
	
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
		if(xThis.m_Path.length>0){
			xThis.m_Animation.SetAnimation(1);
		}else{
			xThis.m_Animation.SetAnimation(0);
		}
		xThis.m_Animation.SetPosition(xThis.m_Pos);
	}
	this.BuildRange=function(){
		return xThis.m_MaxBuildRange;
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
		if(!state||state.s===WorkerState.WORKER_NONE){
			xThis.m_Selected=false;
			if(control){
				control.HideChildren();
			}
		}else{
			if(state&&state.e===xThis){
				if(state.s===WorkerState.WORKER_MOVE){
					GameState.Set('WorkerState',{s:WorkerState.WORKER_NONE,e:this});
					xThis.MoveTo(new Vec2d(mx,my));
				}
			}
		}
	}
	this.MoveTo=function(p_Point){
		var route=new Route();
		xThis.m_Path=route.CalculateRoute(xThis,p_Point);
		if(xThis.m_Path.length){
			xThis.m_LerpPath=new TilePathLerp(xThis.m_Path,xThis);
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

var Building = function(p_Pos,p_World){
	Entity.call(this,p_Pos,p_World,1);
	
	this.m_Type='Building';
	this.RENDER_PLACEMENT=0;
	this.RENDER_WORLD=1;
	this.m_Animation=new Animation();
	this.m_Ready=false;
	this.m_Mode=this.RENDER_PLACEMENT;
	this.m_UIMode=false;
	this.m_StageBuildTime=2000;
	this.m_StageLastUpdate=0;
	this.m_BuildingComplete=false;
	
	this.m_BuildingData={
		caption:'Building',
		mainIco:'assets/ui/cottageico.png',
		resourceIco:'assets/ui/workerico.png',
		description:'Description'
	};
	
	var xThis=this;
	this.MouseHitUIToggle=function(p_MouseEvent){
		var temp=Camera.ScreenSpaceToWorldSpace(p_MouseEvent.offsetX,p_MouseEvent.offsetY);
		var mp=new Vec2d(temp.x,temp.y);
		var ui=xThis.World().m_Scene.GetSystemByName('UI').s;
		var panel=ui.GetWidgetFromName('BuildingUIPanel');
		var vT=xThis.m_Pos.Copy();
		vT.AddV(Camera.Offset());
		var dim=xThis.m_Animation.FrameDimensions();
		var hit=false;
		
		if(mp.m_fX>=vT.m_fX&&mp.m_fX<=vT.m_fX+dim.w){
			if(mp.m_fY>=vT.m_fY&&mp.m_fY<=vT.m_fY+dim.h){
				xThis.PopulateUI(panel);
				panel.Toggle();
				xThis.m_UIMode=true;
				hit=true;
			}
		}
		if(!hit&&xThis.m_UIMode){
			panel.Hide();
			xThis.m_UIMode=false;
		}
		return hit;
	}
	this.PlaceBuilding=function(p_Event){
		var temp=Camera.ScreenSpaceToWorldSpace(p_Event.offsetX,p_Event.offsetY);
		var mp=new Vec2d(temp.x,temp.y);
		
		GameState.Set('WorkerState',{e:null,s:WorkerState.WORKER_NONE});
		var ents=Entities.GetEntitiesOfTypeWithProperty('Worker','m_Selected',true);
		if(ents.length<=0){return;}
		var worker=ents[0];
		var distance=worker.Pos().Distance2(mp);
		if(distance>worker.BuildRange()){
			worker.MoveTo(mp);
			Entities.RemoveEntity(xThis);
			xThis.Unload();
			return;
		}
		
		var currentChunk=xThis.World().ChunkAt(mp);
		if(!currentChunk){return;}
		var tileSize=currentChunk.ChunkProperties().tile.size;
		var x=xThis.m_Animation.m_x-(xThis.m_Animation.m_x%tileSize);
		var y=xThis.m_Animation.m_y-(xThis.m_Animation.m_y%tileSize);
		var dim=xThis.m_Animation.FrameDimensions();
		
		var tm=currentChunk.Tilemanager();
		var tiles=tm.TilesInArea(new Vec2d(x,y),new Vec2d(x+dim.w,y+dim.h));
		var i,iC=tiles.length;
		for(i=0;i<iC;i++){
			tiles[i].m_Walkable=false;
		}
		
		xThis.m_Pos.Set(x,y);
		xThis.m_Mode=xThis.RENDER_WORLD;
		xThis.m_StageLastUpdate=new Date().getTime();
		document.removeEventListener('mousemove',xThis.onMouseMove);
		if(xThis.onBuildingPlaced){
			xThis.onBuildingPlaced();
		}
	}
	this.onClick=function(p_Event){
		
		if(xThis.m_Mode===xThis.RENDER_PLACEMENT){
			xThis.PlaceBuilding(p_Event);
		}else{
			return !xThis.MouseHitUIToggle(p_Event);;
		}
		return true;
	}
	
	this.onMouseMove=function(p_Event){
		if(!xThis.m_Ready){return;}
		
		var mx=p_Event.offsetX;
		var my=p_Event.offsetY;
		var wc=Camera.ScreenSpaceToWorldSpace(mx,my);
		var dim=xThis.m_Animation.FrameDimensions();
		xThis.m_Animation.SetPosition(new Vec2d(wc.x-(dim.w/2),wc.y-(dim.h/2)));
	}
	this.Unload=function(){
		document.removeEventListener('mousemove',xThis.onMouseMove);
		Renderer.RemoveRenderable(xThis);
		Mouse.UnRegisterEventListener('click',xThis.onClick);
	}
	this.ParseBuildingData=function(p_Src,p_Callback){
		$.getJSON(p_Src,{},function(p_JSON){
			xThis.m_BuildingData.caption=p_JSON.caption===undefined?xThis.m_BuildingData.caption:p_JSON.caption;
			xThis.m_BuildingData.mainIco=p_JSON.mainIco===undefined?xThis.m_BuildingData.mainIco:p_JSON.mainIco;
			xThis.m_BuildingData.resourceIco=p_JSON.resourceIco===undefined?xThis.m_BuildingData.resourceIco:p_JSON.resourceIco;
			xThis.m_BuildingData.description=p_JSON.description===undefined?xThis.m_BuildingData.description:p_JSON.description
			
			xThis.PopulateUI(Game.CurrentScene().GetSystemByName('UI').s.GetWidgetFromName('BuildingUIPanel'));
			
			if(p_Callback!==undefined){
				p_Callback();
			}
		});
	}
}
Building.prototype=Object.create(Entity.prototype);
Building.prototype.constructor=Building;

Building.prototype.PopulateUI=function(p_Panel){
	var caption=p_Panel.GetChildWidgetByName('BuildingNameCaption');
	var mainIco=p_Panel.GetChildWidgetByName('BuildingIcon');
	var description=p_Panel.GetChildWidgetByName('BuildingDescription');
	
	caption.m_Text=this.m_BuildingData.caption;
	mainIco.ReloadImg(this.m_BuildingData.mainIco);
	description.m_Text=this.m_BuildingData.description;
	
}

Building.prototype.Render=function(p_Ctx){
		if(!this.m_Ready){return;}
		
		if(this.m_Mode==this.RENDER_PLACEMENT){
			p_Ctx.globalAlpha=0.3;
				this.m_Animation.Render(p_Ctx);
			p_Ctx.globalAlpha=1;
		}else if(this.m_Mode==this.RENDER_WORLD){
			var offset=Camera.Offset();
			var x=this.m_Pos.m_fX+offset.m_fX;
			var y=this.m_Pos.m_fY+offset.m_fY;
			
			this.m_Animation.SetPosition(new Vec2d(x,y));
			this.m_Animation.Render(p_Ctx);
		}
	}

Building.prototype.Update=function(p_Time){
	if(!this.m_Ready){return;}
	if(this.m_Mode!==this.RENDER_WORLD){return;}
	
	var t=new Date().getTime();
	if(!this.m_BuildingComplete&&t-this.m_StageLastUpdate>this.m_StageBuildTime){
		this.m_BuildingComplete=this.m_Animation.NextAnimation();
		if(this.m_BuildingComplete&&this.onBuildingComplete){
			this.onBuildingComplete();
		}
		this.m_StageLastUpdate=t;
	}
	
	this.m_Animation.Animate(p_Time);
}
Building.prototype.ParseBuildingData=function(p_Src,p_Callback){
	var xThis=this;
	$.getJSON(p_Src,{},function(p_JSON){
		xThis.m_BuildingData.caption=p_JSON.caption===undefined?xThis.m_BuildingData.caption:p_JSON.caption;
		xThis.m_BuildingData.mainIco=p_JSON.mainIco===undefined?xThis.m_BuildingData.mainIco:p_JSON.mainIco;
		xThis.m_BuildingData.resourceIco=p_JSON.resourceIco===undefined?xThis.m_BuildingData.resourceIco:p_JSON.resourceIco;
		xThis.m_BuildingData.description=p_JSON.description===undefined?xThis.m_BuildingData.description:p_JSON.description;
		
		xThis.PopulateUI(Game.CurrentScene().GetSystemByName('UI').s.GetWidgetFromName('BuildingUIPanel'));
		
		if(p_Callback!==undefined){
			p_Callback();
		}
	});
}

Building.prototype.Init=function(p_AnimSrc,p_Data){
	var xThis=this;
	$.getJSON(p_AnimSrc,{},function(p_AnimData){
		xThis.m_Animation.Load(p_AnimData,function(){
			xThis.ParseBuildingData(p_Data,function(){
				xThis.m_Ready=true;
				document.addEventListener('mousemove',xThis.onMouseMove);
				Mouse.RegisterEventListener('click',xThis.onClick);
			});
		});
	});
}


var BuildingParser=function(){
	this.Parse=function(p_Data){
		var p=new Vec2d(p_Data.px,p_Data.py);
		var src=p_Data.animsrc;
		var world=p_Data.world;
		var data=p_Data.buildingdata;
		var no=new Building(p,world);
		if(no&&no.Init){
			no.Init(src,data);
		}
	}
}

var Farm=function(p_Pos,p_World){
	Building.call(this,p_Pos,p_World);
	this.m_FarmStage=0;
	this.m_MaxFarmStage=3;
	this.m_LastStageUpdate=0;
	this.m_WeatAnimation=new Animation();
	this.m_CropComplete=false;
	this.m_CropGrowTime=1000;
	this.m_LastCropUpdate=0;
	
	this.m_BuildingData={
		caption:'Building',
		mainIco:'assets/ui/cottageico.png',
		resourceIco:'assets/ui/workerico.png',
		description:'Description',
		cropanimsrc:false,
		croppos:new Vec2d(0,0)
	};
	var xThis=this;
	this.Init=function(p_AnimSrc,p_Data,p_CropAnimSrc){
		$.getJSON(p_AnimSrc,{},function(p_AnimData){
			xThis.m_Animation.Load(p_AnimData,function(){
				
				xThis.ParseBuildingData(p_Data,function(){
					xThis.m_Ready=true;
					document.addEventListener('mousemove',xThis.onMouseMove);
					Mouse.RegisterEventListener('click',xThis.onClick);
				});
			});
		});
	}
	this.ParseBuildingData=function(p_Src,p_Callback){
		$.getJSON(p_Src,{},function(p_JSON){
			xThis.m_BuildingData.caption=p_JSON.caption===undefined?xThis.m_BuildingData.caption:p_JSON.caption;
			xThis.m_BuildingData.mainIco=p_JSON.mainIco===undefined?xThis.m_BuildingData.mainIco:p_JSON.mainIco;
			xThis.m_BuildingData.resourceIco=p_JSON.resourceIco===undefined?xThis.m_BuildingData.resourceIco:p_JSON.resourceIco;
			xThis.m_BuildingData.description=p_JSON.description===undefined?xThis.m_BuildingData.description:p_JSON.description;
			xThis.m_BuildingData.cropanimsrc=p_JSON.cropanimsrc===undefined?xThis.m_BuildingData.cropanimsrc:p_JSON.cropanimsrc;
			xThis.m_BuildingData.croppos=new Vec2d(p_JSON.croppos[0],p_JSON.croppos[1]);
			
			
			
			xThis.PopulateUI(Game.CurrentScene().GetSystemByName('UI').s.GetWidgetFromName('BuildingUIPanel'));
			
			if(p_Callback!==undefined){
				p_Callback();
			}
		});
	}
	this.PopulateUI=function(p_Widget){
		Building.prototype.PopulateUI.call(this,p_Widget);
		
		var asset2=p_Widget.GetChildWidgetByName('BuildingAsset2Icon');
		
	}
	this.Update=function(p_Time){
		Building.prototype.Update.call(xThis,p_Time);
		if(!xThis.m_BuildingComplete){return;}
		xThis.m_WeatAnimation.Animate(p_Time);
		
		var t=new Date().getTime();
		if(!xThis.m_CropComplete&&t-xThis.m_LastCropUpdate>xThis.m_CropGrowTime){
			xThis.m_CropComplete=xThis.m_WeatAnimation.NextAnimation();
			xThis.m_LastCropUpdate=t;
		}
		
	}
	this.Render=function(p_Ctx){
		Building.prototype.Render.call(xThis,p_Ctx);
		
		xThis.m_WeatAnimation.Render(p_Ctx,Camera.Offset());
	}
	this.onBuildingPlaced=function(){
		if(xThis.m_BuildingData.cropanimsrc!==false){
			$.getJSON(xThis.m_BuildingData.cropanimsrc,{},function(animData){
				xThis.m_WeatAnimation.Load(animData);
				xThis.m_WeatAnimation.SetPosition(xThis.m_BuildingData.croppos.AddV(xThis.m_Pos));
			});
		}
	}
	this.onBuildingComplete=function(){
		
	}
}
Farm.prototype=Object.create(Building.prototype);
Farm.prototype.constructor=Farm;

var FarmParser=function(){
	this.Parse=function(p_Data){
		var p=new Vec2d(p_Data.px,p_Data.py);
		var src=p_Data.animsrc;
		var world=p_Data.world;
		var data=p_Data.buildingdata;
		var no=new Farm(p,world);
		if(no&&no.Init){
			no.Init(src,data);
		}
	}
}
