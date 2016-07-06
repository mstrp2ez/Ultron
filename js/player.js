var Player=function(){
	this.m_Animation=new Animation();
	this.m_Pos=new Vec2d(0,0);
	this.m_CurrentChunk=null;
	this.m_LastPass=null;
	this.m_Inventory=[];
	this.m_PlayerProperties={};
	this.m_InventoryUI=null;
	this.m_Scene=null;
	
	var xThis=this;
	this.Init=function(p_SpawnPoint,p_PlayerPropertySrc,p_Scene,p_Chunk){
		xThis.m_Scene=p_Scene;
		$.getJSON(p_PlayerPropertySrc,function(data){
			xThis.m_PlayerProperties=data;
			var animSrc=data.animationSrc;
			$.getJSON(animSrc,function(animationData){
				xThis.m_Animation.Load(animationData,function(){
					Mouse.RegisterEventListener('mousedown',xThis.OnMouseDown);
					Keyboard.RegisterEventListener('keypress',xThis.OnKeyPress);
				});
			});
		});
		var offset=Camera.Offset();
		var dim=Camera.Dimensions();
		xThis.m_Pos=new Vec2d(offset.m_fX+dim.m_fX/2,offset.m_fY+dim.m_fY/2);
		xThis.SetCurrentChunk(p_Chunk);
	}
	this.OnKeyPress=function(p_Event){
		//console.log(p_Event);
		if(p_Event.which===105){
			if(xThis.m_Scene!==null){
				var ui=xThis.m_Scene.GetSystemByName('UI').s;
				var inventoryPane=ui.GetWidgetFromName('PlayerInventory');
				inventoryPane.Toggle();
			}
		}
	}
	this.OnMouseDown=function(p_Event){
		var ui=xThis.m_Scene.GetSystemByName('UI').s;
		if(ui.MouseHitTest(p_Event)){return;}
		var t=new Vec2d(p_Event.layerX,p_Event.layerY);
		var chunk=xThis.m_CurrentChunk;
		var targetChunk=chunk.m_World.ChunkAt(t);
		var offset=Camera.Offset();
		var currentCol,currentRow;
		var targetCol,targetRow;
		var current=xThis.GetCurrentTile();
		var target;
		currentCol=current.m_Col;
		currentRow=current.m_Row;
		
		if(chunk!==targetChunk){
			var wc=targetChunk.WorldCoordinates().Copy().AddV(offset);
			var targetTM=targetChunk.Tilemanager();
			target=targetTM.TileAtPos(t.SubV(wc));
			targetCol=(targetChunk.ChunkIndex().X()-chunk.ChunkIndex().X())*chunk.ChunkTileSize()+target.m_Col;
			targetRow=(targetChunk.ChunkIndex().Y()-chunk.ChunkIndex().Y())*chunk.ChunkTileSize()+target.m_Row;
		}else{
			var tm=chunk.Tilemanager();
			if(!tm){return;}
			
			var wc=chunk.WorldCoordinates().Copy().AddV(offset);
			
			target=tm.TileAtPos(t.SubV(wc));
			targetCol=target.m_Col;
			targetRow=target.m_Row;
			
		}
		if(Math.abs(targetCol-currentCol)<=2){
			if(Math.abs(targetRow-currentRow)<=2){
				if(target.HasEntity()){
					target.Entity().Interact(xThis);
				}
			}
		}
		xThis.m_Animation.SetAnimation(2);
	}
	this.SetInventoryUI=function(p_InventoryUIElement){
		xThis.m_InventoryUI=p_InventoryUIElement;
	}
	this.Render=function(p_Ctx){
		xThis.m_Animation.Render(p_Ctx);
		//xThis.m_UI.Render(p_Ctx);
	}
	this.SetCurrentChunk=function(p_Chunk){
		xThis.m_CurrentChunk=p_Chunk;
	}
	this.GetCurrentTile=function(p_Offset){
		var offset=p_Offset;
		if(offset===undefined){
			offset=Camera.Offset().Copy();
		}
		var dim=Camera.Dimensions();
		var chunk=xThis.m_CurrentChunk;
		var frameDim=xThis.m_Animation.FrameDimensions();
		
		if(!chunk){return;}
		var wc=chunk.WorldCoordinates().Copy().AddV(offset);
		var local=xThis.m_Pos.Copy().SubV(wc);
		local.m_fY+=frameDim.h/2;
		
		return chunk.Tilemanager().TileAtPos(local);
	}
	this.Update=function(p_Delta){
		var moved=false;
		var offset=Camera.Offset().Copy();
		var dim=Camera.Dimensions();
		var walkSpeed=xThis.m_PlayerProperties.walkspeed;
		
		if(Keyboard.Pressed(37)){
			offset.m_fX+=walkSpeed;
			moved=true;
		}
		if(Keyboard.Pressed(38)){
			offset.m_fY+=walkSpeed;
			moved=true;
		}
		if(Keyboard.Pressed(39)){
			offset.m_fX-=walkSpeed;
			moved=true;
		}
		if(Keyboard.Pressed(40)){
			offset.m_fY-=walkSpeed;
			moved=true;
		}
		
		var tile=xThis.GetCurrentTile(offset);
		var valid=true;
		if(tile===undefined){ //this happens when crossing chunk borders
			xThis.m_LastPass=offset;
		}else{
			if(tile.HasEntity()){
				var entity=tile.Entity();
				if(entity.IsCollidable()){
					if(xThis.m_LastPass!==false){
						offset=xThis.m_LastPass.Copy();
					}else{
						valid=false;
					}
				}
			}
			xThis.m_LastPass=false;			
		}
		if(!valid){return;}
		
		Camera.SetOffset(offset)
		if(moved){
			xThis.m_Animation.SetAnimation(0);
		}else{
			if(xThis.m_Animation.m_currentAnim==0){
				xThis.m_Animation.SetAnimation(1);
			}
		}
		
		
		xThis.m_Animation.Animate(p_Delta);
		xThis.m_Animation.SetPosition(xThis.m_Pos);
	}
	/* this.DropItem=function(p_Item){
		
	} */
	this.AddInventoryItem=function(p_Item){
		if(xThis.m_InventoryUI){
			xThis.m_InventoryUI.AddItem(p_Item);
		}
		
	}
}