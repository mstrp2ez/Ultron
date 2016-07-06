var Bitmapfont=function(){
	this.m_stringLookup="0123456789:;(=)?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}\"";
	this.m_bitmap=new Image();
	this.m_loaded=false;
	
	var xThis=this;
	this.load=function(p_sName,p_callback){
		xThis.m_bitmap.onload=function(){
			xThis.m_loaded=true;
			if(p_callback){
				p_callback();
			}
		}
		xThis.m_bitmap.src=p_sName;
	}
}