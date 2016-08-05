var BitmapString=function(p_String,p_Pos){
	Renderable.call(this,2);
	this.m_stringLookup="abcdefghijklmnopqrstuvwxyz!?,.:";
	
	this.m_String=p_String;
	this.m_Pos=p_Pos.Copy();
	this.m_Bitmap=new Image();
	this.m_Loaded=false;
	
	var xThis=this;
	this.Load=function(p_sName,p_callback){
		xThis.m_Bitmap.onload=function(){
			xThis.m_Loaded=true;
			if(p_callback){
				p_callback();
			}
		}
		var name=(p_sName===undefined)?'default':p_sName;
		xThis.m_Bitmap.src=name;
	}
	this.Render=function(p_Ctx){
		var charW=16,charH=16;
		var x=xThis.m_Pos.m_fX;
		var y=xThis.m_Pos.m_fY;
		var i,iC=xThis.m_String.length;
		for(i=0;i<iC;i++){
			var idx=xThis.m_stringLookup.indexOf(xThis.m_String[i].toLowerCase());
			p_Ctx.drawImage(xThis.m_Bitmap,idx*charW,0,charW,charH,x+(i*charW),y,charW,charH);
		}
	}
	this.Unload=function(){
		Renderer.RemoveRenderable(xThis);
	}
}
BitmapString.prototype=Object.create(Renderable.prototype);
BitmapString.prototype.constructor=BitmapString;

var BitmapTextHelper=function(p_Src){
	this.m_Src=(p_Src===undefined)?'assets/font/default.png':p_Src;
	this.m_Strings=[];
	this.m_IDIncrementer=0;
	var xThis=this;
	this.PutText=function(p_String,p_Pos){
		var nt=new BitmapString(p_String,p_Pos);
		var id=xThis.m_IDIncrementer++;
		nt.Load(xThis.m_Src,function(){
			
		});
		xThis.m_Strings['string'+id]=nt;
		return id;
	}
	this.RemoveText=function(p_ID){
		var o=xThis.m_Strings['string'+p_ID];
		if(o&&o.Unload!=undefined){o.Unload();}
		delete xThis.m_Strings['string'+p_ID];
	}
	
}
window.BitmapTextHelper=new BitmapTextHelper();