var Mouse=function(){
	this.m_EventListeners=[];
	this.m_InputBuffer=[];
	this.m_Lock=false;
	var xThis=this;
	
	var canvas=document.getElementById('canvas');
	if(canvas===undefined){return;}
	
	this.RegisterEventListener=function(p_Type,p_Callback){
		xThis.m_EventListeners.push({type:p_Type,callback:p_Callback});
	}
	this.UnRegisterEventListener=function(p_Type,p_Callback){
		var i,iC=xThis.m_EventListeners.length;
		for(i=0;i<iC;i++){
			if(xThis.m_EventListeners[i].type==p_Type&&xThis.m_EventListeners[i].callback==p_Callback){
				xThis.m_EventListeners.splice(i,1);
				iC=xThis.m_EventListeners.length;
				--i;
			}
		}
	}
	this.GetInputBuffer=function(p_Buffer){
		if(xThis.m_InputBuffer.length<=0){return;}
		Array.prototype.push.apply(p_Buffer,xThis.m_InputBuffer);
	}
	this.ClearBuffer=function(){
		xThis.m_InputBuffer.length=0;
	}
	document.onclick=function(event){
		var i,iC=xThis.m_EventListeners.length;
		for(i=0;i<iC;i++){
			if(xThis.m_EventListeners[i].type=='click'){
				if(xThis.m_EventListeners[i].callback(event)===false){
					event.preventDefault();
					return false;
				}
			}
		}
		
	}
	this.Lock=function(){
		xThis.m_Lock=true;
	}
	document.onmousedown=function(event){
		var i,iC=xThis.m_EventListeners.length;
		for(i=0;i<iC;i++){
			if(xThis.m_EventListeners[i].type=='mousedown'){
				xThis.m_EventListeners[i].callback(event);
			}
		}
	}
	document.onmouseup=function(event){
		var i,iC=xThis.m_EventListeners.length;
		for(i=0;i<iC;i++){
			if(xThis.m_EventListeners[i].type=='mouseup'){
				xThis.m_EventListeners[i].callback(event);
			}
		}
	}
	document.onmousemove=function(event){
		var i,iC=xThis.m_EventListeners.length;
		for(i=0;i<iC;i++){
			if(xThis.m_EventListeners[i].type=='mousemove'){
				xThis.m_EventListeners[i].callback(event);
			}
		}
		return false;
	} 
}

window.Mouse=new Mouse();