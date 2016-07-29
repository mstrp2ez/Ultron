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
	/* Renderable.call(this); */
	this.m_Col=p_Col;
	this.m_Row=p_Row;
	this.m_AtlasHeight=p_TileProperties.atlasHeight;
	this.m_Size=p_TileProperties.size;
	this.m_FillColor='#c9c';
	this.m_Atlas=p_Atlas;
	this.m_Index=new HashIndex(0,0);
	this.m_Debug=false;
	this.m_Entity=null;
	this.m_Origin=p_Origin;
	
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
	this.HashIndex=function(){
		return xThis.m_Index;
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
	this.WorldCoords=function(){
		var offset=Camera.Offset();
		xp=xThis.m_Col*xThis.m_Size+p_Origin.m_fX+offset.m_fX;
		yp=xThis.m_Row*xThis.m_Size+p_Origin.m_fY+offset.m_fY;
		return new Vec2d(xp,yp);
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
/* Tile.prototype=Object.create(Renderable.prototype);
Tile.prototype.constructor=Tile; */
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
		if(xThis.m_Tiles[p_Col+'x'+p_Row]===undefined){return false;}
		return xThis.m_Tiles[p_Col+'x'+p_Row];
	}
	this.TileAtPos=function(p_Pos){
		var offset=Camera.Offset();
		p_Pos.SubV(offset);
		var ox=xThis.m_Origin.m_fX;
		var oy=xThis.m_Origin.m_fY;
		
		var x=p_Pos.m_fX-ox;
		var y=p_Pos.m_fY-oy;
		var size=xThis.m_TileProperties.size;
		var col=Math.floor(x/size);
		var row=Math.floor(y/size);
		
		return xThis.TileAt(col,row);
	}
	this.SetNeighbors=function(p_Neighbors){
		xThis.m_Neighbors=p_Neighbors;
	}
	this.GetNeighbors=function(p_Tile){
		var hash=new HashIndex(p_Tile.m_Col,p_Tile.m_Row);
		return [xThis.TileAt(hash.X()-1,hash.Y()),
				xThis.TileAt(hash.X()+1,hash.Y()),
				xThis.TileAt(hash.X(),hash.Y()-1),
				xThis.TileAt(hash.X(),hash.Y()+1)];
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
		var atlasMax=15;
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
					u=u>atlasMax?atlasMax:u;
					ti0.Set(u,ti0.Y());
					otherTM.m_Tiles[tileNeigbour.Hash()/* .ToKey() */]=tileNeigbour;
					
					u=ti1.X()+tileConv[thisDir];
					u=u>atlasMax?atlasMax:u;
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
	this.GetBorderTileOnTileAxis=function(p_Tile,p_Direction){
		var border=xThis.GetBorderTiles(p_Direction);
		var i,iC=border.length;
		
		for(i=0;i<iC;i++){
			if(p_Direction=='RIGHT'||p_Direction=='LEFT'){
				if(border[i].m_Row==p_Tile.m_Row){
					return border[i];
				}
			}else{
				if(border[i].m_Col==p_Tile.m_Col){
					return border[i];
				}
			}
		}
		return false;
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
var Route=function(){
	var xThis=this;
	this.Solve=function(p_Pos,p_End,p_Chunk){
		var tileM=p_Chunk.Tilemanager();
		var moveCost=14;
		var startTile=tileM.TileAtPos(p_Pos);
		var endTile=tileM.TileAtPos(p_End);
		var endNode={t:endTile,f:0,p:false};
		var startNode={t:startTile,f:0,p:false};
		var open=[startNode];
		var closed=[];
		var found=false;
		var calcG=function(p_Node){
			if(p_Node.p){
				var c=moveCost+calcG(p_Node.p);
				return c;
			}
			return moveCost;
		}
		var calcF=function(p_Node){
			var dx=Math.abs(p_Node.t.m_Col-endTile.m_Col);
			var dy=Math.abs(p_Node.t.m_Row-endTile.m_Row);
			var f=(dx+dy)+calcG(p_Node);
			return f;
		}
		var containsNode=function(p_Arr,p_Node){
			var i,iC=p_Arr.length;
			for(i=0;i<iC;i++){
				if(p_Arr[i].t==p_Node.t){
					return p_Arr[i];
				}
			}
			return false;
		}
		
		startNode.f=calcF(startNode);
		while(open.length){
			var current=open.pop();
			if(containsNode(closed,current)){
				continue;
			}
			closed.push(current);
			if(current.t===endTile){found=true;break;}
			
			var nb=tileM.GetNeighbors(current.t);
			var i,iC=nb.length;
			for(i=0;i<iC;i++){
				if(nb[i]){
					var newNode={t:nb[i],f:0,p:current};
					newNode.f=calcF(newNode);
					var existing=containsNode(open,newNode);
					
					if(existing===false){
						open.push(newNode);
					}else{
						var og=calcG(existing);
						var ng=calcG(newNode);
						if(ng<og){
							existing.p=current.p;
							existing.f=calcF(existing);
						}
					}
				}
			}
			
			open.sort(function(a,b){
				return b.f-a.f;
			});
		}
		var ret=[];
		if(found){
			var c=closed.pop();
			while(c){
				ret.push(c);
				c=c.p;
			}
		}
		return ret;
	}
	
	this.CalculateRoute=function(p_Entity,p_End){
		if(p_Entity===undefined||p_End===undefined){return [];}
		var startChunk=p_Entity.World().ChunkAt(p_Entity.Pos());
		var endChunk=p_Entity.World().ChunkAt(p_End);
		var chunks=[];
		if(startChunk!==endChunk){
			var idx0=startChunk.ChunkIndex();
			var idx1=endChunk.ChunkIndex();
			var dx=Math.abs(idx0.X()-idx1.X());
			var dy=Math.abs(idx0.Y()-idx1.Y());
			
			var func=(idx0.X()<idx1.X())?'Right':'Left';
			var i,iC=dx;
			var idx=idx0.Copy();
			var world=p_Entity.World();
			for(i=0;i<=iC;i++){
				chunks.push(world.GetChunk(idx));
				idx[func]();
			}
			func=(idx0.Y()<idx1.Y())?'Down':'Up';
			idx.Set(idx1.X(),idx.Y());
			iC=dy;
			for(i=0;i<=iC;i++){
				var c=world.GetChunk(idx);
				if(chunks.indexOf(c)==-1){
					chunks.push(world.GetChunk(idx));
				}
				idx[func]();
			}
		}else{
			chunks.push(startChunk);
		}
		
		if(chunks.length>1){
			var i=0;
			var ret=[];
			while(chunks[i]){
				var currentChunk=chunks[i];
				var nextChunk=false;
				if(chunks[i+1]!==undefined){
					nextChunk=chunks[i+1];
					var currentChunkIndex=currentChunk.ChunkIndex();
					var nextChunkIndex=nextChunk.ChunkIndex();
					var dx=nextChunkIndex.X()-currentChunkIndex.X();
					var dy=nextChunkIndex.Y()-currentChunkIndex.Y();
					
					var tm=currentChunk.Tilemanager();
					var ntm=nextChunk.Tilemanager();
					var currentTile=false;
					if(ret.length>0){
						var ct=currentTile=ret[0].t;
						currentTile=tm.TileAtPos(ct.WorldCoords());
					}else{
						currentTile=tm.TileAtPos(p_Entity.m_Pos);
					}
					
					var borderTile=false;
					var nextBorderTile=false;
					if(dx!=0){
						if(dx>0){
							borderTile=tm.GetBorderTileOnTileAxis(currentTile,'RIGHT');
							nextBorderTile=ntm.GetBorderTileOnTileAxis(currentTile,'LEFT');
						}else{
							borderTile=tm.GetBorderTileOnTileAxis(currentTile,'LEFT');
							nextBorderTile=ntm.GetBorderTileOnTileAxis(currentTile,'RIGHT');
						}
					}else if(dy!=0){
						if(dy>0){
							borderTile=tm.GetBorderTileOnTileAxis(currentTile,'DOWN');
							nextBorderTile=ntm.GetBorderTileOnTileAxis(currentTile,'UP');
						}else{
							borderTile=tm.GetBorderTileOnTileAxis(currentTile,'UP');
							nextBorderTile=ntm.GetBorderTileOnTileAxis(currentTile,'DOWN');
						}
					}
					var temp=false;
					if(ret.length<=0){
						temp=xThis.Solve(p_Entity.Pos(),borderTile.WorldCoords(),currentChunk);
					}else{
						temp=xThis.Solve(ret[0].t.WorldCoords(),borderTile.WorldCoords(),currentChunk);
					}
					temp.unshift({t:nextBorderTile});
					ret=temp.concat(ret);
				}else{
					ret=(xThis.Solve(ret[0].t.WorldCoords(),p_End,currentChunk)).concat(ret);
				}
				i++;
			}
			return ret;
		}else{
			return xThis.Solve(p_Entity.Pos(),p_End,chunks[0]);
		}
	}
}

var Chunk=function(p_ChunkProperties,p_ChunkIdx,p_World){
	Renderable.call(this,0);
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
		
		//contains if the entire viewport fits within chunk
		var points=[
			new Vec2d(o.m_fX,o.m_fY),
			new Vec2d(o.m_fX+dim.m_fX,o.m_fY),
			new Vec2d(o.m_fX+dim.m_fX,o.m_fY+dim.m_fY),
			new Vec2d(o.m_fX,o.m_fY+dim.m_fY),
		]
		var i,iC=points.length;
		var within=true;
		for(i=0;i<iC;i++){
			if(!xThis.ContainsPoint(points[i])){within=false;break;}
		}
		if(within){
			return true;
		}else{
		//contained
			if((wc.m_fX+o.m_fX>=0&&wc.m_fX+o.m_fX<=dim.m_fX)||(wc.m_fX+size+o.m_fX>=0&&wc.m_fX+size+o.m_fX<=dim.m_fX)){
				if((wc.m_fY+o.m_fY>=0&&wc.m_fY+o.m_fY<=dim.m_fY)||(wc.m_fY+size+o.m_fY>=0&&wc.m_fY+size+o.m_fY<=dim.m_fY)){
					return true;
				}
			}
		}
		return false;
	}
	this.ContainsPoint=function(p_Point){
		var wc=xThis.WorldCoordinates();
		var size=xThis.ChunkSize();
		var o=Camera.Offset();
		/* var dim=Camera.Dimensions(); */
		wc.AddV(o);
		
		var px=p_Point.m_fX;
		var x0=wc.m_fX;
		var x1=wc.m_fX+size;
		var py=p_Point.m_fY;
		var y0=wc.m_fY;
		var y1=wc.m_fY+size;
		if(x0-px<=0&&x1-px>=0){
			if(y0-py<=0&&y1-py>=0){
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
Chunk.prototype=Object.create(Renderable.prototype);
Chunk.prototype.constructor=Chunk;

var World=function(){
	this.m_Scene=null;
	this.m_Ctx=null;
	this.m_Chunks=[];
	this.m_ViewportChunks=[];
	this.m_LastUpdate=0;
	this.m_SpawnChunk=null;
	this.m_ChunkProperties={size:64,tile:{size:16}};
	this.m_Entities=[];
	
	var xThis=this;
	this.Init=function(p_Manifest,p_Ctx,p_Scene){
		xThis.m_Ctx=p_Ctx;
		xThis.m_Scene=p_Scene;
		xThis.m_ChunkProperties=p_Manifest.hasOwnProperty('chunkproperties')?p_Manifest.chunkproperties:xThis.m_ChunkProperties;
		
		$.getJSON('assets/forestbiome.json',function(p_Data){ //temporary
			xThis.m_ChunkProperties.biome=p_Data;
			var atlasCache=new Image();
			atlasCache.onload=function(){
				
				xThis.m_ChunkProperties.biome.atlas=atlasCache;
				xThis.NewChunk(new HashIndex(0,0));
				
				Entities.NewEntity('Worker',{px:100,py:100,anim:'assets/workeranim.json',world:xThis});
				
				document.dispatchEvent(new CustomEvent('worldInitEnd',{'detail':{world:this}}));
			}
			atlasCache.src=xThis.m_ChunkProperties.atlas[0];
		}); 
		
	}
	
	//use index as key, guarantees no chunk key is ever the same, could be costly to iterate chunks though
	this.NewChunk=function(p_ChunkIndex,p_Shallow){
		var chunk=xThis.m_Chunks[p_ChunkIndex.ToKey()];
		if(chunk===undefined){
			var newChunk=new Chunk(xThis.m_ChunkProperties,p_ChunkIndex,xThis);
			
			newChunk.Init(xThis.m_ChunkProperties.biome.atlas);
			if(xThis.m_SpawnChunk===null){xThis.m_SpawnChunk=newChunk;}
			xThis.m_Chunks[p_ChunkIndex.ToKey()]=newChunk;
			
			/* xThis.m_Chunks.sort(function(a,b){
				return a.ChunkIndex().Y()-b.ChunkIndex().Y();
			}); */
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
		
		var currentChunk=null;
		var canvas=xThis.m_Ctx.canvas;
		var midPoint=new Vec2d(canvas.width/2,canvas.height/2);
		for(var idx in xThis.m_Chunks){
			var chunk=xThis.m_Chunks[idx];
			if(chunk.InViewport()){
				if(chunk.ContainsPoint(midPoint)){
					xThis.m_CurrentChunk=chunk;
				}
				xThis.NewChunk(chunk.m_ChunkIndex);
				if(chunk.Update){
					chunk.Update(p_Delta);
				}
				xThis.m_ViewportChunks.push(chunk);
			}
		}
		Entities.Update(p_Delta);
	}
	this.Render=function(p_Ctx){

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
