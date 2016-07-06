var ImageCache=function(){
	this.m_Cache=[];
	this
	
	var xThis=this;
	this.LoadImage=function(p_Src,p_Callback){
		if(xThis.m_Cache[p_Src]===undefined){
			var newImage=new Image();
			newImage.onload=function(){
				p_Callback(xThis.m_Cache[p_Src]);
			}
			newImage.src=p_Src;
			xThis.m_Cache[p_Src]=newImage;
		}else{
			p_Callback(xThis.m_Cache[p_Src]);
		}
	}
	this.LoadImages=function(p_Arr,p_Callback){
		(function(p_A,p_C){
			var numLoaded=0;
			var ret=[];
			for(var idx in p_Arr){
				xThis.LoadImage(p_Arr[idx],function(p_Img){
					numLoaded++;
					ret.push(p_Img);
					if(numLoaded>=p_Arr.length){
						p_Callback(ret);
					}
				});
			}
		})(p_Arr,p_Callback);
	}
}
window.ImageCache=new ImageCache();