var Plant=function(p_PlantProperty,p_Atlas,p_Col,p_Row,p_ChunkArea,p_TileSize){
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
		}
	}
}
var Item=function(){
	this.m_ItemProperties={};
	this.m_Atlas=null;
	this.RENDER_WORLD=0;
	this.RENDER_UI=1;
	this.RENDER_DRAG=2;
	this.m_RenderMode=this.RENDER_UI;
	this.m_UIElement=null;
	this.m_ScreenPos=new Vec2d(0,0);
	this.m_Drag=false;
	
	var xThis=this;
	this.Init=function(p_ItemProperty,p_Atlas){
		xThis.m_ItemProperties=p_ItemProperty;
		xThis.m_Atlas=p_Atlas;
	}
	this.ID=function(){
		return xThis.m_ItemProperties.id;
	}
	this.SetUIParent=function(p_UIElement){
		xThis.m_UIElement=p_UIElement;
	}
	this.SetRenderMode=function(p_RenderMode){
		xThis.m_RenderMode=p_RenderMode;
	}
	this.StartDrag=function(p_Event){
		xThis.m_Drag=true;
		xThis.m_RenderMode=xThis.RENDER_DRAG;
		Mouse.RegisterEventListener('mousemove',xThis.OnMouseMove);
	}
	this.StopDrag=function(p_Event){
		xThis.m_Drag=false;
		Mouse.UnRegisterEventListener('mousemove',xThis.OnMouseMove);
		
		return false;
	}
	this.OnMouseMove=function(p_Event){
		xThis.m_ScreenPos.m_fX=p_Event.layerX;
		xThis.m_ScreenPos.m_fY=p_Event.layerY;
	}
	this.Render=function(p_Ctx){
		if(xThis.m_Atlas===null){return;}
		var size=64;
		var frameSize=32;
		var index=(xThis.m_ItemProperties.id*size);
		var row=Math.floor(index/xThis.m_Atlas.width);
		var col=index%xThis.m_Atlas.width;
		
		var renderMode=xThis.m_RenderMode;
		if(renderMode==xThis.RENDER_UI){
			if(xThis.m_UIElement===null){return;}
			var x=xThis.m_UIElement.m_Pos.m_fX;
			var y=xThis.m_UIElement.m_Pos.m_fY;
			p_Ctx.drawImage(xThis.m_Atlas,
				col,row,
				frameSize,frameSize,
				x,y,
				frameSize,frameSize);
		}else if(renderMode==xThis.RENDER_WORLD){
			var offset=Camera.Offset();
			var x=xThis.m_ScreenPos.m_fX+offset.m_fX;
			var y=xThis.m_ScreenPos.m_fY+offset.m_fY;
			p_Ctx.drawImage(xThis.m_Atlas,
				col+frameSize,row,
				frameSize,frameSize,
				x,y,
				frameSize,frameSize);
		}else if(renderMode==xThis.RENDER_DRAG){
			var x=xThis.m_ScreenPos.m_fX;
			var y=xThis.m_ScreenPos.m_fY;
			
			p_Ctx.drawImage(xThis.m_Atlas,
				col,row,
				frameSize,frameSize,
				x,y,
				frameSize,frameSize);
			//p_Ctx.globalCompositeOperation='destination-over';
		}
	}
	this.Update=function(p_Delta){
		
	}
	this.OnMouseDown=function(p_Event){
		/* if(xThis.m_RenderMode!==xThis.RENDER_UI){return;}
		if(xThis.m_Drag){
			xThis.StopDrag();
			return false;
		}
		var x=xThis.m_UIElement.m_Pos.m_fX;
		var y=xThis.m_UIElement.m_Pos.m_fY;
		xThis.m_ScreenPos.Set(x,y);
		var frameSize=32;
	
		var mx=p_Event.layerX;
		var my=p_Event.layerY;
		if(mx-x>=0&&mx-(x+frameSize)<=0){
			if(my-y>=0&&my-(y+frameSize)<=0){
				xThis.StartDrag();
			}
		} */
	}
}
var ItemManager=function(){
	this.m_ItemsProperties=[];
	this.m_Items=[];
	this.m_Atlas=new Image();
	this.m_Loaded=false;
	
	$.getJSON('assets/items.json',function(data){
		var items=data.items;
		for(var index in items){
			var item=xThis.m_ItemsProperties[items[index].id];
			if(item!==undefined){
				console.log('Item id conflict, existing: '+item.name+' new: '+data[index].name+'. Keeping existing item');
				
			}else{
				xThis.m_ItemsProperties[items[index].id]=items[index];
			}
		}
		xThis.m_Atlas.onload=function(){
			xThis.m_Loaded=true;
			Mouse.RegisterEventListener('mousedown',xThis.OnMouseDown);
		}
		xThis.m_Atlas.src=data.asset;
	});
	
	var xThis=this;
	this.OnMouseDown=function(e){
		var norevalidate=true;
		var i,iC=xThis.m_Items.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Items[i].OnMouseDown){
				norevalidate=(xThis.m_Items[i].OnMouseDown(e))?norevalidate:false;
			}
		}
		return norevalidate;
	}
	this.SpawnItem=function(p_ItemID){
		if(!xThis.m_Loaded){return null;}
		if(xThis.m_ItemsProperties[p_ItemID]===undefined){
			console.log('Attempted to spawn item: '+p_ItemID+' no such item id.');
			return null;
		}
		
		var item=new Item();
		item.Init(xThis.m_ItemsProperties[p_ItemID],xThis.m_Atlas);
		xThis.m_Items.push(item);
		return item;
	}
}
window.ItemManager=new ItemManager();