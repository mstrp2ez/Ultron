var Renderable=function(p_Layer){
	this.m_Layer=(p_Layer===undefined)?0:p_Layer;
	
	var xThis=this;	
	document.dispatchEvent(new CustomEvent('onAddRenderable',{'detail':this}));
}
Renderable.prototype.RenderLayer=function(){
	return this.m_Layer;
}
Renderable.SetRenderLayer=function(p_Layer){
	xThis.m_Layer=p_Layer;
}

var Renderer=function(){
	this.BACKGROUND_LAYER=0;
	this.FOREGROUND_LAYER=1;
	this.SCREEN_LAYER=2;
	this.m_RenderLayers=[[],[],[]];
	
	var xThis=this;
	this.AddRenderable=function(p_Event){
		var o=p_Event.detail;
		if(xThis.m_RenderLayers[o.RenderLayer()]){
			xThis.m_RenderLayers[o.RenderLayer()].push(o);
		}
	}
	this.RemoveRenderable=function(p_Event){
		var o=p_Event.detail;
		if(xThis.m_RenderLayers[o.RenderLayer()]){
			var layer=this.m_RenderLayers[o.RenderLayer()];
			layer.splice(layer.indexOf(o),1);
		}
	}
	this.SetRenderLayer=function(p_Event){
		var o=p_Event.detail.o;
		var rl=o.RenderLayer();
		var nl=p_Event.detail.l;
		if(rl<0||rl>=xThis.m_RenderLayers.length){return;}
		if(nl<0||nl>=xThis.m_RenderLayers.length){return;}
		var oldLayer=xThis.m_RenderLayers[rl];
		var newLayer=xThis.m_RenderLayers[nl];
		
		oldLayer.splice(oldLayer.indexOf(o),1);
		newLayer.push(o);
	}
	this.Render=function(p_Ctx){
		var i,iC=xThis.m_RenderLayers.length;
		for(i=0;i<iC;i++){
			var j,jC=xThis.m_RenderLayers[i].length;
			for(j=0;j<jC;j++){
				var o=xThis.m_RenderLayers[i][j];
				if(o.InViewport&&!o.InViewport()){continue;}
				if(o.Render){o.Render(p_Ctx);}
			}
		}
	}
	document.addEventListener('onAddRenderable',this.AddRenderable);
	document.addEventListener('onRemoveRenderable',this.RemoveRenderable);
	document.addEventListener('onSetRenderLayer',this.SetRenderLayer);
}