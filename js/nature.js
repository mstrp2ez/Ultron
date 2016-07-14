

var NatureSimulator=function(p_Chunk,p_BiomeProperties,p_TileManager){
	this.m_BiomeProperties=p_BiomeProperties;
	this.m_TileManager=p_TileManager;
	this.m_Plants=[];
	this.m_PlantAtlas=new Image();
	this.m_Chunk=p_Chunk;
	this.m_SpawnChunk=false;
	/* this.m_Biome=p_Biome; */
	
	var xThis=this;
	this.Init=function(p_Area,p_TileSize,p_SpawnChunk,p_Callback){
		xThis.m_SpawnChunk=p_SpawnChunk;
		xThis.m_PlantAtlas.onload=function(){
			if(xThis.m_SpawnChunk){return;}
			var col=0,row=0;
			var chunkIndex=xThis.m_Chunk.ChunkIndex();
			var w=p_Area.w;
			var h=p_Area.h;
			var x=p_Area.x;
			var y=p_Area.y;
			var tiledW=w/p_TileSize;
			var tiledH=h/p_TileSize;
			var perlin=new PerlinNoise();
			
			var i,iC=(w/p_TileSize)*(h/p_TileSize);
			var plants=xThis.m_BiomeProperties.plants;
			for(i=0;i<iC;i++){
				var a=(col+(chunkIndex.X()*tiledW))/tiledW;
				var b=(row+(chunkIndex.Y()*tiledH))/tiledH;
				
				var shade=Math.floor(perlin.noise(a,b,0.1)*255);
				
				if(shade>120){
					var tile=xThis.m_TileManager.TileAt(col,row);
					if(tile!==undefined&&tile.m_Index.X()==0){
						tile.SetEntity(xThis.NewPlant(xThis.m_BiomeProperties.plants[Math.floor(Math.random()*4)],xThis.m_PlantAtlas,col,row,p_Area,p_TileSize));
					}
				}

				row=((i+1)%((w/p_TileSize))==0&&i!=0)?row+1:row;
				col=((i+1)%((h/p_TileSize))==0&&i!=0)?0:col+1;
			}
			if(p_Callback!==undefined){
				p_Callback(xThis.m_Plants);
			}
		} 
		xThis.m_PlantAtlas.src=xThis.m_BiomeProperties.asset;
	}
	this.NewPlant=function(p_PlantProperty,p_Atlas,p_Col,p_Row,p_ChunkArea,p_TileSize){
		var plant=new Plant(p_PlantProperty,p_Atlas,p_Col,p_Row,p_ChunkArea,p_TileSize);
		xThis.m_Plants.push(plant);
		return plant;
	}
	this.Render=function(p_Ctx){
		var i,iC=xThis.m_Plants.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Plants[i].Render){
				xThis.m_Plants[i].Render(p_Ctx);
			}
		}
	}
	
	this.Update=function(p_Delta){
		//xThis.Simulate(p_Delta);
		
		var i,iC=xThis.m_Plants.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Plants[i].Update){
				xThis.m_Plants[i].Update(p_Delta);
			}
		}
	}
}