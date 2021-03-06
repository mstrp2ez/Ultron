var Game=function(p_Ctx){
	this.m_CurrentScene=false;
	this.m_Scenes=[];
	this.m_Ctx=p_Ctx;
	
	var xThis=this;
	$.getJSON('assets/game.json',function(data){
		$.each(data,function(key,val){
			var no=new Scene();
			
			xThis.m_Scenes.push({scene:no,properties:val});
			if(xThis.m_Scenes.length<=1){
				xThis.m_CurrentScene=no;
				if(no.Init!==undefined){
					no.Init(val,xThis.m_Ctx,xThis);
				}
			}
		});
	});
	this.CurrentScene=function(){
		return xThis.m_CurrentScene;
	}
	this.ChangeScene=function(p_SceneID){
		var id=p_SceneID<0||p_SceneID>=xThis.m_Scenes.length?0:p_SceneID;
		var newSceneObj=xThis.m_Scenes[id];
		xThis.m_CurrentScene.Unload();
		Renderer.Clear();
		newSceneObj.scene.Init(newSceneObj.properties,xThis.m_Ctx,xThis);
		xThis.m_CurrentScene=newSceneObj.scene;
	}
	this.Run=function(p_Delta){
		var canvas=xThis.m_Ctx.canvas;
		xThis.m_Ctx.fillStyle='#000';
		xThis.m_Ctx.fillRect(0,0,canvas.width,canvas.height);
		
	 	var cs=xThis.m_CurrentScene;
		if(cs){
			cs.Update(p_Delta);
			cs.Render(xThis.m_Ctx);
		} 

		window.requestAnimationFrame(xThis.Run);
	}
	
	this.Run();
}

this.GameState=function(){
	this.m_State=[];
	
	var xThis=this;
	this.Get=function(p_State){
		if(xThis.m_State[p_State]===undefined){return false;}
		return xThis.m_State[p_State];
	}
	this.Set=function(p_State,p_Val){
		xThis.m_State[p_State]=p_Val;
	}
	this.Is=function(p_State){
		return (this.Get(p_State)!==false);
	}
}
window.GameState=new GameState();