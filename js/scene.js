var Scene=function(){
	this.name='Default';
	this.m_Systems=[];
	this.m_Game=null;
	this.m_Ctx=false;
	
	var xThis=this;
	this.Init=function(p_Manifest,p_Context,p_Game){
		if(p_Manifest==undefined){return;}
		xThis.m_Game=p_Game;
		xThis.m_Ctx=p_Context;
		
		//Parse the manifest and spawn systems based on it
		$.each(p_Manifest,function(key,val){
			if(window[key]!==undefined){
				
				var ns=new window[key]();
				if(ns.Init!==undefined){
					ns.Init(val,xThis.m_Ctx,xThis);
				}
				xThis.AddSystem(key,ns);
			}else if(key=='properties'){
				xThis.ParseProperties(val);
			}
		});
		
	}
	this.GetSystemByName=function(p_Name){
		var iC=xThis.m_Systems.length;
		for(var i=0;i<iC;i++){
			if(xThis.m_Systems[i]==undefined){continue;}
			if(xThis.m_Systems[i].n==p_Name){return xThis.m_Systems[i];}
		}
	}
	this.Update=function(p_Delta){
		var iC=xThis.m_Systems.length;
		for(var i=0;i<iC;i++){
			if(xThis.m_Systems[i]==undefined){continue;}
			var o=xThis.m_Systems[i].s;
			if(o.Update!==undefined){o.Update(p_Delta);}
		}
	}
	this.Render=function(p_Ctx){
		var iC=xThis.m_Systems.length;
		for(var i=0;i<iC;i++){
			if(xThis.m_Systems[i]==undefined){continue;}
			var o=xThis.m_Systems[i].s;
			if(o.Render!==undefined){o.Render(p_Ctx);}
		}
	}
	this.ParseProperties=function(p_Properties){
		$.each(p_Properties,function(key,val){
			if(xThis[key]!==undefined){
				xThis[key]=val;
			}
		})
	}
	this.Unload=function(){
		var iC=xThis.m_Systems.length;
		for(var i=0;i<iC;i++){
			if(xThis.m_Systems[i]&&xThis.m_Systems[i].s.Unload!==undefined){
				xThis.m_Systems[i].s.Unload();
			}
		}
		xThis.m_Systems.length=0;
	}
	this.AddSystem=function(p_Name,p_System){
		var iC=xThis.m_Systems.length;
		for(var i=0;i<iC;i++){
			if(xThis.m_Systems[i]==undefined){continue;}
			var o=xThis.m_Systems[i];
			if(o==undefined){
				xThis.m_Systems.splice(i,1);
				--i;
				continue;
			}
			if(o.n===p_Name||o.s===p_System){
				console.log('Atempted to add system ('+o.n+') to scene '+xThis.m_Name+' but it already exists');
				return;
			}
		}
		xThis.m_Systems.push({n:p_Name,s:p_System});
	}
}