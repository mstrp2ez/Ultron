var HashIndex=function(p_X,p_Y){
	this.m_ChunkIdxX=p_X;
	this.m_ChunkIdxY=p_Y;
	
	var xThis=this;
	this.X=function(){return xThis.m_ChunkIdxX;}
	this.Y=function(){return xThis.m_ChunkIdxY;}
	
	this.Set=function(p_X,p_Y){
		xThis.m_ChunkIdxX=p_X;
		xThis.m_ChunkIdxY=p_Y;
	}
	this.Translate=function(p_Dir){
		var conv={'UP':xThis.Up,'RIGHT':xThis.Right,'DOWN':xThis.Down,'LEFT':xThis.Left};
		if(conv[p_Dir]!==undefined){conv[p_Dir]();}
		return xThis;
	}
	this.Right=function(){
		xThis.m_ChunkIdxX+=1;
		return xThis;
	}
	this.Left=function(){
		xThis.m_ChunkIdxX-=1;
		return xThis;
	}
	this.Up=function(){
		xThis.m_ChunkIdxY-=1;
		return xThis;
	}
	this.Down=function(){
		xThis.m_ChunkIdxY+=1;
		return xThis;
	}
	this.Copy=function(){
		return new HashIndex(xThis.m_ChunkIdxX,xThis.m_ChunkIdxY);
	}
	this.ToKey=function(){
		return xThis.m_ChunkIdxX+'x'+xThis.m_ChunkIdxY;
	}
}

var Tile=function(p_Col,p_Row,p_TileProperties,p_Origin,p_Atlas){
	this.m_Col=p_Col;
	this.m_Row=p_Row;
	this.m_AtlasHeight=p_TileProperties.atlasHeight;
	this.m_Size=p_TileProperties.size;
	this.m_FillColor='#c9c';
	this.m_Atlas=p_Atlas;
	this.m_Index=new HashIndex(0,0);
	this.m_Debug=false;
	this.m_Entity=null;
	
	var xThis=this;
	this.FillColor=function(p_FillColor){
		xThis.m_FillColor=p_FillColor;
	}
	this.SetEntity=function(p_Entity){
		xThis.m_Entity=p_Entity;
	}
	this.HasEntity=function(){
		return xThis.m_Entity!==null;
	}
	this.Entity=function(){
		return xThis.m_Entity;
	}
	this.Hash=function(){
		return xThis.m_Col+'x'+xThis.m_Row;
	}
	this.TileIndex=function(){
		return xThis.m_Index;
	}
	this.SetTileIndex=function(p_Index){
		var size=xThis.m_Size;
		var indexY=(typeof p_Index.y === 'string' && p_Index.y=='random')?Math.floor(Math.random()*xThis.m_AtlasHeight/size):p_Index.y;
		xThis.m_Index.Set(p_Index.x,indexY);
	}
	this.Render=function(p_Ctx,p_InPlace){
		var size=xThis.m_Size;
		var offset=Camera.Offset();
		var x,y;
		if(p_InPlace!==undefined){
			x=xThis.m_Col*size;
			y=xThis.m_Row*size;
		}else{
			x=xThis.m_Col*size+p_Origin.m_fX+offset.m_fX;
			y=xThis.m_Row*size+p_Origin.m_fY+offset.m_fY;
		}
		if(xThis.m_Atlas===undefined||xThis.m_Debug){
			p_Ctx.fillStyle=xThis.m_FillColor;
			p_Ctx.fillRect(x,y,size,size);
		}else{
			
			p_Ctx.drawImage(xThis.m_Atlas,
				xThis.m_Index.X()*size,
				xThis.m_Index.Y()*size,
				size,size,
				x,
				y,
				size,size);
		}
	}
	this.SetDebug=function(p_Debug){
		xThis.m_Debug=p_Debug;
	}
	this.InViewport=function(){
		var offset=Camera.Offset();
		var dim=Camera.Dimensions();
		var size=xThis.m_Size;
		var x=(xThis.m_Col*xThis.m_Size)+p_Origin.m_fX+offset.m_fX;
		var y=(xThis.m_Row*xThis.m_Size)+p_Origin.m_fY+offset.m_fY;
		if((x>=0&&x<=dim.m_fX)||x+size>=0&&x+size<=dim.m_fX){
			if((y>=0&&y<=dim.m_fY)||y+size>=0&&y+size<=dim.m_fY){
				return true;
			}
		}
		return false;
	}
}
var TileManager=function(p_Origin,p_Size,p_TileProperties,p_Atlas,p_Chunk){
	this.m_Tiles=[];
	this.m_Origin=p_Origin;
	/* this.m_AtlasSrc=p_Atlas; */
	this.m_Atlas=p_Atlas;
	this.m_Size=p_Size;
	this.m_Chunk=p_Chunk;
	this.m_TileProperties=p_TileProperties;
	this.m_Loaded=false;
	this.m_Snapshot=null;

	var xThis=this;
	
	this.onAtlasLoad=function(){
		xThis.m_Loaded=true;
	}
	
	this.NewTile=function(p_Col,p_Row){
		var nt=new Tile(p_Col,p_Row,xThis.m_TileProperties,xThis.m_Origin,xThis.m_Atlas);
		xThis.m_Tiles[nt.Hash()/* .ToKey() */]=nt;
		return nt;
	}
	this.AddTile=function(p_Tile){
		xThis.m_Tiles[p_Tile.Hash()/* .ToKey() */]=p_Tile;
	}
	this.TileAt=function(p_Col,p_Row){
		//var hash=new HashIndex(p_Col,p_Row);
		return xThis.m_Tiles[p_Col+'x'+p_Row];
	}
	this.TileAtPos=function(p_Pos){
		var x=p_Pos.m_fX;
		var y=p_Pos.m_fY;
		var size=xThis.m_TileProperties.size;
		var col=Math.floor(x/size);
		var row=Math.floor(y/size);
		
		return xThis.TileAt(col,row);
	}
	this.SetNeighbors=function(p_Neighbors){
		xThis.m_Neighbors=p_Neighbors;
	}
	this.Fill=function(){
		var col=0,row=0;
		var mW=xThis.m_Size;
		var mH=xThis.m_Size;
		var tS=xThis.m_TileProperties.size;
		var i,iC=((mW/tS)*(mH/tS));
		for(i=0;i<iC;i++){
			xThis.NewTile(col,row);
			row=((i+1)%((mW/tS))==0&&i!=0)?row+1:row;
			col=((i+1)%((mH/tS))==0&&i!=0)?0:col+1;
		}
	}
	this.ParentChunk=function(){
		return xThis.m_Chunk;
	}
	this.CacheTilemap=function(p_Ctx){
		var canvas=document.createElement('canvas');
		canvas.width=xThis.m_Size;
		canvas.height=xThis.m_Size;
		var ctx=canvas.getContext('2d');
		
		xThis.Render(ctx,true);
		var offset=Camera.Offset();
		xThis.m_Snapshot=ctx.getImageData(0,0,xThis.m_Size,xThis.m_Size);
		//canvas.parentNode.removeChild(canvas);
	}
	this.IsCached=function(){
		return xThis.m_Snapshot!==null;
	}
	this.FillPerlinNoise=function(p_ChunkIndex){
		var col=0,row=0;
		var mW=xThis.m_Size;
		var mH=xThis.m_Size;
		var tS=xThis.m_TileProperties.size;
		var tiledW=mW/tS;
		var tiledH=mH/tS;
		var perlin=new PerlinNoise();
		var i,iC=(tiledW*tiledH);
		var bitmap=[];
		var seed=0.8;
		for(i=0;i<iC;i++){
			var a=(col+(p_ChunkIndex.X()*tiledW))/tiledW;
			var b=(row+(p_ChunkIndex.Y()*tiledH))/tiledH;
			var noise=perlin.noise(a,b,seed)*255;
			var shade=Math.floor(noise);
			shade=(shade<70)?0:255;
			bitmap.push(shade);
			row=((i+1)%(tiledW)==0&&i!=0)?row+1:row;
			col=((i+1)%(tiledH)==0&&i!=0)?0:col+1;
		}
		row=0;
		col=0;
		var UP=-(mW/tS);
		var DOWN=mW/tS;
		var LEFT=-1;
		var RIGHT=1;
		var rowLen=(mW/tS);

		for(i=0;i<iC;i++){
			var shade=bitmap[i];
			var atlasIndex=0;
			var currentRow=Math.floor(i/rowLen);
			
			if(shade<=0){
				if(i+UP>=0&&bitmap[i+UP]<=0){
					atlasIndex+=1;
				}
				if(i+RIGHT<=(currentRow+1)*rowLen&&bitmap[i+RIGHT]<=0){
					atlasIndex+=2;
				}
				if(i+DOWN<=iC&&bitmap[i+DOWN]<=0){
					atlasIndex+=4;
				}
				if(i+LEFT>=currentRow*rowLen&&bitmap[i+LEFT]<=0){
					atlasIndex+=8;
				}
			}
			
			var nt=xThis.NewTile(col,row);
			if(atlasIndex==0){
				nt.SetTileIndex({x:atlasIndex,y:'random'});
			}else{
				nt.SetTileIndex({x:atlasIndex,y:0});
			}
			
			nt.FillColor('rgb('+shade+','+shade+','+shade+')');
			row=((i+1)%((mW/tS))==0&&i!=0)?row+1:row;
			col=((i+1)%((mH/tS))==0&&i!=0)?0:col+1;
		}
	}
	this.ReCalculate=function(){
		var neighbourBorders=[];
		var keys=['UP','RIGHT','DOWN','LEFT'];  //first get neighbour chunks
		var world=xThis.ParentChunk().World();
		var parentIndex=xThis.ParentChunk().ChunkIndex().Copy();
		for(var idx in keys){
			var key=keys[idx];
			var parentIndex=xThis.ParentChunk().ChunkIndex().Copy();
			var chunk=world.GetChunk(parentIndex.Translate(key));
			neighbourBorders[key]=chunk;
		}
		var conv={'UP':'DOWN','RIGHT':'LEFT','DOWN':'UP','LEFT':'RIGHT'}; //then get the border tiles of both this chunk and the neighbours
		var tileConv={'UP':1,'RIGHT':2,'DOWN':4,'LEFT':8};
		for(var thisDir in conv){
			var neighbourDir=conv[thisDir];
			if(neighbourBorders[thisDir]!==undefined){
				var otherTM=neighbourBorders[thisDir].Tilemanager();
				var neighbourBorder=otherTM.GetBorderTiles(neighbourDir);
				var thisBorder=xThis.GetBorderTiles(thisDir);
				var i,iC=neighbourBorder.length;
				for(i=0;i<iC;i++){
					var tileNeigbour=neighbourBorder[i];
					var thisTile=thisBorder[i];
					if(tileNeigbour===undefined||thisTile===undefined){continue;}
					
					var ti0=tileNeigbour.TileIndex();
					var ti1=thisTile.TileIndex();
					if(ti0.X()===0||ti1.X()===0){continue;}
					var u=ti0.X()+tileConv[neighbourDir];
					u=u>15?15:u;
					ti0.Set(u,ti0.Y());
					otherTM.m_Tiles[tileNeigbour.Hash()/* .ToKey() */]=tileNeigbour;
					
					u=ti1.X()+tileConv[thisDir];
					u=u>15?15:u;
					ti1.Set(u,ti1.Y());
					xThis.m_Tiles[thisTile.Hash()/* .ToKey() */]=thisTile;
				}
			}
		}
	}
	this.GetBorderTiles=function(p_Direction){
		var col=0,row=0;
		var tiles=[];
		var i,iC;
		var mW=xThis.m_Size;
		var mH=xThis.m_Size;
		var tS=xThis.m_TileProperties.size;
		var tiledW=mW/tS;
		var tiledH=mH/tS;
		
		if(p_Direction=='LEFT'){
			iC=tiledH;
			var index=new HashIndex(0,0);
			for(i=0;i<iC;i++){
				tiles.push(xThis.m_Tiles[index.ToKey()]);
				index.Down();
			}
		}
		if(p_Direction=='RIGHT'){
			iC=tiledH;
			var index=new HashIndex(tiledW-1,0);
			for(i=0;i<iC;i++){
				tiles.push(xThis.m_Tiles[index.ToKey()]);
				index.Down();
			}
		}
		if(p_Direction=='UP'){
			iC=tiledW;
			var index=new HashIndex(0,0);
			for(i=0;i<iC;i++){
				tiles.push(xThis.m_Tiles[index.ToKey()]);
				index.Right();
			}
		}
		if(p_Direction=='DOWN'){
			iC=tiledW;
			var index=new HashIndex(0,tiledH-1);
			for(i=0;i<iC;i++){
				tiles.push(xThis.m_Tiles[index.ToKey()]);
				index.Right();
			}
		}
		return tiles;
	}
	this.Render=function(p_Ctx,p_InPlace){
		var numRender=0;
		var offset=Camera.Offset();
		if(xThis.m_Snapshot!==null){
			p_Ctx.putImageData(xThis.m_Snapshot,xThis.m_Origin.m_fX+offset.m_fX,xThis.m_Origin.m_fY+offset.m_fY);
		}else{
			for(var idx in xThis.m_Tiles){
				var tile=xThis.m_Tiles[idx];
				/* if(tile.InViewport()){ */
					tile.Render(p_Ctx,p_InPlace);
					numRender++;
				/* } */
			}
		}
		return numRender;
	}
}

var Chunk=function(p_ChunkProperties,p_ChunkIdx,p_World){
	this.m_TileManager=null;
	this.m_Entities=[];
	this.m_ChunkProperties=p_ChunkProperties;
	this.m_ChunkIndex=p_ChunkIdx;
	this.m_NatureSimulator=null;
	this.m_World=p_World;
	
	var xThis=this;
	this.Init=function(p_Atlas){
		var coords=xThis.WorldCoordinates();
		var size=xThis.m_ChunkProperties.size;
		var spawnChunk=(xThis.m_ChunkIndex.X()==0&&xThis.m_ChunkIndex.Y()==0);

		xThis.m_TileManager=new TileManager(xThis.WorldCoordinates(),xThis.m_ChunkProperties.size,xThis.m_ChunkProperties.tile,p_Atlas,xThis);
		xThis.m_TileManager.FillPerlinNoise(xThis.m_ChunkIndex);
		xThis.m_TileManager.ReCalculate();
		
		xThis.m_NatureSimulator=new NatureSimulator(xThis,xThis.m_ChunkProperties.biome,xThis.m_TileManager);
		xThis.m_NatureSimulator.Init({x:coords.m_fX,y:coords.m_fY,w:size,h:size},xThis.m_ChunkProperties.tile.size,spawnChunk,function(p_Plants){
			xThis.m_Entities=xThis.m_Entities.concat(p_Plants);
		});
	}
	this.World=function(){
		return xThis.m_World;
	}
	this.ChunkIndex=function(){
		return xThis.m_ChunkIndex;
	}
	this.Tilemanager=function(){
		return xThis.m_TileManager;
	}
	this.WorldCoordinates=function(){
		return new Vec2d(xThis.m_ChunkIndex.X()*xThis.m_ChunkProperties.size,xThis.m_ChunkIndex.Y()*xThis.m_ChunkProperties.size);
	}
	this.ChunkSize=function(){
		return xThis.m_ChunkProperties.size;
	}
	this.ChunkTileSize=function(){
		return xThis.m_ChunkProperties.size/xThis.m_ChunkProperties.tile.size;
	}
	this.InViewport=function(){
		var wc=xThis.WorldCoordinates();
		var size=xThis.ChunkSize();
		var o=Camera.Offset();
		var dim=Camera.Dimensions();
		if((wc.m_fX+o.m_fX>0&&wc.m_fX+o.m_fX<dim.m_fX)||(wc.m_fX+size+o.m_fX>0&&wc.m_fX+size+o.m_fX<dim.m_fX)){
			if((wc.m_fY+o.m_fY>0&&wc.m_fY+o.m_fY<dim.m_fY)||(wc.m_fY+size+o.m_fY>0&&wc.m_fY+size+o.m_fY<dim.m_fY)){
				return true;
			}
		}
		return false;
	}
	this.ContainsPoint=function(p_Point){
		var wc=xThis.WorldCoordinates();
		var size=xThis.ChunkSize();
		var o=Camera.Offset();
		var dim=Camera.Dimensions();
		wc.AddV(o);
		
		var px=p_Point.m_fX;
		var x0=wc.m_fX;
		var x1=wc.m_fX+size;
		var py=p_Point.m_fY;
		var y0=wc.m_fY;
		var y1=wc.m_fY+size;
		if(x0-px<0&&x1-px>=0){
			if(y0-py<0&&y1-py>=0){
				return true;
			}
		}
		return false;
	}
	this.PostRender=function(p_Ctx){
		var i,iC=xThis.m_Entities.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Entities[i].Render){
				xThis.m_Entities[i].Render(p_Ctx);
			}
		}
	}
	this.Render=function(p_Ctx){
		var rendered=0;
		if(xThis.m_TileManager){
			var wc=xThis.WorldCoordinates();
			var size=xThis.ChunkSize();
			var o=Camera.Offset();
			var dim=Camera.Dimensions();
		
			rendered=xThis.m_TileManager.Render(p_Ctx);
			
			var debug=xThis.m_ChunkProperties.hasOwnProperty('debug')?xThis.m_ChunkProperties['debug']:false;
			if(debug===true){
				var c=xThis.WorldCoordinates();
				var no=new Vec2d(c.m_fX+o.m_fX,c.m_fY+o.m_fY);
				var d=xThis.m_ChunkProperties.size;
				
				p_Ctx.font='16px Arial';
				p_Ctx.fillStyle='#000';
				p_Ctx.shadowColor='#fff';
				p_Ctx.shadowOffsetX=1;
				p_Ctx.shadowOffsetY=1;
				p_Ctx.fillText(xThis.m_ChunkIndex.ToKey(),no.m_fX+10,no.m_fY+10);
				p_Ctx.shadowColor='#000';
				p_Ctx.shadowOffsetX=0;
				p_Ctx.shadowOffsetY=0;
				
				p_Ctx.strokeStyle='#f00';
				p_Ctx.lineWidth=1;
				p_Ctx.beginPath();
				p_Ctx.moveTo(no.m_fX,no.m_fY);
				p_Ctx.lineTo(no.m_fX+d,no.m_fY);
				p_Ctx.lineTo(no.m_fX+d,no.m_fY+d);
				p_Ctx.lineTo(no.m_fX,no.m_fY+d);
				p_Ctx.closePath();
				p_Ctx.stroke();
			}
		}
		return rendered;
	}
	this.Update=function(p_Delta){
		if(!xThis.m_TileManager.IsCached()){
			xThis.m_TileManager.CacheTilemap(xThis.m_World.m_Ctx);
		}
		var i,iC=xThis.m_Entities.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Entities[i].Update){
				xThis.m_Entities[i].Update(p_Delta);
			}
		}
	}
}
var World=function(){
	this.m_Scene=null;
	this.m_Ctx=null;
	this.m_Chunks=[];
	this.m_ViewportChunks=[];
	this.m_TOD=0;
	this.m_LastUpdate=0;
	this.m_SpawnChunk=null;
	this.m_ChunkProperties={size:64,tile:{size:16}};
	this.m_Player=null;
	this.m_TODMask=null;
	this.m_MaskCanvas=document.getElementById('mask');
	
	
	var xThis=this;
	this.Init=function(p_Manifest,p_Ctx,p_Scene){
		xThis.m_Ctx=p_Ctx;
		xThis.m_Scene=p_Scene;
		xThis.m_Player=new Player();
		xThis.m_ChunkProperties=p_Manifest.hasOwnProperty('chunkproperties')?p_Manifest.chunkproperties:xThis.m_ChunkProperties;
		
		$.getJSON('assets/forestbiome.json',function(p_Data){ //temporary
			xThis.m_ChunkProperties.biome=p_Data;
			var atlasCache=new Image();
			atlasCache.onload=function(){
				xThis.m_ChunkProperties.biome.atlas=atlasCache;
				xThis.NewChunk(new HashIndex(0,0));
				xThis.m_Player.Init(new Vec2d(100,100),'assets/player.json',xThis.m_Scene,xThis.m_SpawnChunk);
				var ui=xThis.m_Scene.GetSystemByName('UI').s;
				xThis.m_Player.SetInventoryUI(ui.GetWidgetFromName('InventoryGrid'));
			}
			atlasCache.src=xThis.m_ChunkProperties.atlas[0];
		});
		
		xThis.CreateTODMask();
		
	}
	this.OnMouseDown=function(p_Event){
		
	}
	this.CreateTODMask=function(){
		xThis.m_TODMask=xThis.m_Ctx.createImageData(xThis.m_Ctx.canvas.width,xThis.m_Ctx.canvas.height);
		var mask=xThis.m_TODMask;
		
		var canvasW=xThis.m_Ctx.canvas.width;
		var canvasH=xThis.m_Ctx.canvas.height;
		var midPoint=new Vec2d(canvasW/2,canvasH/2);
		var i,iC=mask.width*mask.height*4;
		var d=mask.data;
		for(i=0;i<iC;i+=4){
			var x0=((i/4)+1)%canvasW;
			var y0=Math.floor((i/4)/canvasW);
			var lightness=255;
			var dist=Math.sqrt((midPoint.m_fX-x0)*(midPoint.m_fX-x0)+(midPoint.m_fY-y0)*(midPoint.m_fY-y0));

			d[i]=0;
			d[i+1]=0;
			d[i+2]=0;
			d[i+3]=dist*2;
		}
		var maskCanvas=xThis.m_MaskCanvas;
		var maskCtx=maskCanvas.getContext('2d');
		maskCtx.putImageData(xThis.m_TODMask,0,0);
	}
	//use index as key, guarantees no chunk key is ever the same, could be costly to iterate chunks though
	this.NewChunk=function(p_ChunkIndex,p_Shallow){
		var chunk=xThis.m_Chunks[p_ChunkIndex.ToKey()];
		if(chunk===undefined){
			var newChunk=new Chunk(xThis.m_ChunkProperties,p_ChunkIndex,xThis);
			
			
			newChunk.Init(xThis.m_ChunkProperties.biome.atlas);
			if(xThis.m_SpawnChunk===null){xThis.m_SpawnChunk=newChunk;}
			xThis.m_Chunks[p_ChunkIndex.ToKey()]=newChunk;
			
			xThis.m_Chunks.sort(function(a,b){
				return a.ChunkIndex().Y()-b.ChunkIndex().Y();
			});
		}
		
		if(p_Shallow===undefined){ //Check neighbors
			xThis.NewChunk(p_ChunkIndex.Copy().Left(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Right(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Up(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Down(),true);
			
			xThis.NewChunk(p_ChunkIndex.Copy().Left().Up(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Right().Up(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Left().Down(),true);
			xThis.NewChunk(p_ChunkIndex.Copy().Right().Down(),true);
		}
	}
	this.ChunkAt=function(p_Pos){
		var i,iC=xThis.m_ViewportChunks.length;
		for(i=0;i<iC;i++){
			var chunk=xThis.m_ViewportChunks[i];
			if(chunk.InViewport()){
				if(chunk.ContainsPoint(p_Pos)){
					return chunk;
				}
			}
		}
	}
	this.GetChunk=function(p_ChunkIndex){
		return xThis.m_Chunks[p_ChunkIndex.ToKey()];
	}
	this.Update=function(p_Delta){
		xThis.m_ViewportChunks.length=0;
		
		xThis.m_Player.Update(p_Delta);
		xThis.m_TOD+=0.01*((p_Delta-xThis.m_LastUpdate)/1000);
		xThis.m_LastUpdate=p_Delta;
		if(xThis.m_TOD>=1){
			xThis.m_TOD=0;
		}
		var currentChunk=null;
		var canvas=xThis.m_Ctx.canvas;
		var midPoint=new Vec2d(canvas.width/2,canvas.height/2);
		for(var idx in xThis.m_Chunks){
			var chunk=xThis.m_Chunks[idx];
			if(chunk.InViewport()){
				if(chunk.ContainsPoint(midPoint)){
					xThis.m_CurrentChunk=chunk;
					xThis.m_Player.SetCurrentChunk(chunk);
				}
				xThis.NewChunk(chunk.m_ChunkIndex);
				if(chunk.Update){
					chunk.Update(p_Delta);
				}
				xThis.m_ViewportChunks.push(chunk);
			}
		}
	}
	this.Render=function(p_Ctx){
		var tilesRendered=0;
		var tod=360*xThis.m_TOD;
		tod=Math.cos(tod*(Math.PI/180));
		tod=tod>0.8?0.8:tod;
		tod=tod<0?0:tod;
		var toRender=[];
		for(var idx in xThis.m_Chunks){
			if(xThis.m_Chunks[idx].InViewport()){
				toRender.push(xThis.m_Chunks[idx]);
			}
		}
		
		
		var i,iC=toRender.length;
		for(i=0;i<iC;i++){
			if(toRender[i].Render){
				tilesRendered+=toRender[i].Render(p_Ctx);
			}
		}
		
		xThis.m_Player.Render(p_Ctx);
	
		for(i=0;i<iC;i++){
			if(toRender[i].PostRender){
				toRender[i].PostRender(p_Ctx);
			}
		}

		
		p_Ctx.globalAlpha=tod;
			p_Ctx.drawImage(xThis.m_MaskCanvas,0,0);
		p_Ctx.globalAlpha=1;
		
		//console.log(tilesRendered);
		
	}
	this.Unload=function(){
		for(var idx in xThis.m_Chunks){
			if(xThis.m_Chunks[idx].Unload){
				xThis.m_Chunks[idx].Unload();
			}
		}
		xThis.m_Chunks.length=0;
	}
}