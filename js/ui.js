var BaseWidget=function(p_Name,p_Properties){
	Renderable.call(this,2);
	this.m_Name=p_Name;
	this.m_Properties=p_Properties;
	this.m_Children=[];
	this.m_Parent=0;
	this.m_x=0;
	this.m_y=0;
	this.m_w=0;
	this.m_h=0;
	this.m_bgcolor="#ff0000";
	this.m_imgsrc="";
	this.m_Img=0;
	this.m_ImgLoaded=true;
	this.m_EventHandlers=[];
	this.m_Text=0;
	this.m_TextColor="#ffffff";
	this.m_Font="12px Arial";
	this.m_TextShadow=0;
	this.m_TextShadowX=0;
	this.m_TextShadowY=0;
	this.m_Visible=true;
	this.m_CustomData=0;
	this.m_Type="BaseWidget";
	
	var xThis=this;
	
	this.ParsePositionTokens=function(p_P,p_Val,p_Context){
		var cnvs=p_Context.canvas;
		var _parent=xThis.m_Parent;
		var posKey=p_P.pos;
		var dimKey=p_P.dim;
		var canvasKey=p_P.dim=='m_h'?'height':'width';
		if(p_Val=="bottom"||p_Val=="right"){
			if(_parent){
				xThis[posKey]=_parent[posKey]+_parent[dimKey]-xThis[dimKey];
			}else{
				xThis[posKey]=cnvs[canvasKey]-xThis[dimKey];
			}
		}else if(p_Val=="top"||p_Val=="left"){
			if(_parent){
				xThis[posKey]=_parent[posKey];
			}else{
				xThis[posKey]=0;
			}
		}else if(p_Val=="center"){
			if(_parent){
				xThis[posKey]=_parent[posKey]+(_parent[dimKey]/2)-xThis[dimKey]/2;
			}else{
				xThis[posKey]=(cnvs[canvasKey]/2)-xThis[dimKey]/2;
			}
		}else{
			var pP=_parent;
			if(pP){
				xThis[posKey]+=pP[posKey];
			}
		}
	}
	this.HasEventListener=function(p_Event){
		if(xThis.m_EventHandlers[p_Event]!==undefined){return true;}
		var i,iC=xThis.m_Children.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Children[i].HasEventListener(p_Event)){return true;}
		}
		return false;
	}
	this.Toggle=function(){
		xThis.m_Visible=!xThis.m_Visible;
	}
	this.Type=function(){
		return xThis.m_Type;
	}
	this.SetCustomData=function(p_Data){
		xThis.m_CustomData=p_Data;
	}
	this.RegisterEventListener=function(p_event,p_handler){
		xThis.m_EventHandlers[p_event]=p_handler;
	}
	this.Unload=function(){
		
	}
	this.AddChild=function(p_Child){
		xThis.m_Children.push(p_Child);
	}
	this.Recalculate=function(p_ctx){
		xThis.ParseProperties(p_ctx);
		var i,iC=xThis.m_Children.length;
		for(i=0;i<iC;i++){
			xThis.m_Children[i].Recalculate(p_ctx);
		}
	}
	this.onImageLoad=function(){
		xThis.m_ImgLoaded=true;
	}
}
BaseWidget.prototype=Object.create(Renderable.prototype);
BaseWidget.prototype.constructor=BaseWidget;

BaseWidget.prototype.MouseHitTest=function(e){
		var x=e.offsetX;
		var y=e.offsetY;
		var widget=null;
		if(this.m_Visible){
			if(x>=this.m_x&&x<=this.m_x+this.m_w){
				if(y>=this.m_y&&y<=this.m_y+this.m_h){
					var i,iC=this.m_Children.length;
					for(i=iC;i--;){
						widget=this.m_Children[i].MouseHitTest(e);
					}
					if(widget==null){
						widget=this;
					}
				}
			}
		}
		return widget;
	}
BaseWidget.prototype.IsVisible=function(){
	if(this.m_Visible){
		if(this.m_Parent!==0){
			return this.m_Parent.IsVisible();
		}else{
			return true;
		}
	}
	return false;
}
BaseWidget.prototype.Render=function(p_ctx,p_shallow){
	if(!this.m_ImgLoaded){return;}
	if(!this.IsVisible()){return;}
	if(this.m_Img){
		p_ctx.drawImage(this.m_Img,this.m_x,this.m_y);
	}else if(this.m_bgcolor){
		p_ctx.fillStyle=this.m_bgcolor;
		p_ctx.fillRect(this.m_x,this.m_y,this.m_w,this.m_h);
	}
	if(p_shallow===undefined){
		var i,iC=this.m_Children.length;
		for(i=0;i<iC;i++){
			this.m_Children[i].Render(p_ctx);
		}
	}
	if(this.m_Text){
		p_ctx.fillStyle=this.m_TextColor;
		p_ctx.font=this.m_Font;
		p_ctx.textBaseline="top";
		if(this.m_TextShadow){
			p_ctx.shadowColor=this.m_TextShadow;
			p_ctx.shadowOffsetX=this.m_TextShadowX;
			p_ctx.shadowOffsetY=this.m_TextShadowY;
		}
		p_ctx.fillText(this.m_Text,this.m_x,this.m_y);
		p_ctx.shadowColor='#000000';
		p_ctx.shadowOffsetX=0;
		p_ctx.shadowOffsetY=0;
	}
	if(p_shallow===undefined){
		var i,iC=this.m_Children.length;
		for(i=0;i<iC;i++){
			this.m_Children[i].Render(p_ctx);
		}
	}
}
BaseWidget.prototype.ParseProperties=function(p_context){
	var p=this.m_Properties;
	this.m_x=(p.hasOwnProperty("x"))?p.x:0;
	this.m_y=(p.hasOwnProperty("y"))?p.y:0;
	this.m_w=(p.hasOwnProperty("w"))?p.w:0;
	this.m_h=(p.hasOwnProperty("h"))?p.h:0;
	
	if(p_context!==undefined){
		var cnvs=p_context.canvas;
		var _parent=this.m_Parent;
		
		if(typeof this.m_w === 'string'){
			var idx=this.m_w.indexOf('%');
			if(idx===-1){
				this.m_w=0;
			}else{
				var n=parseInt(this.m_w);
				if(_parent){
					this.m_w=_parent.m_w*(n/100);
				}else{
					this.m_w=cnvs.width*(n/100);
				}
			}
		}
		if(typeof this.m_h === 'string'){
			var idx=this.m_h.indexOf('%');
			if(idx===-1){
				this.m_h=0;
			}else{
				var n=parseInt(this.m_h);
				if(_parent){
					this.m_h=_parent.m_h*(n/100);
				}else{
					this.m_h=cnvs.height*(n/100);
				}
			}
		}
		
		if(typeof this.m_x === 'string'){
			this.ParsePositionTokens({pos:'m_x',dim:'m_w'},this.m_x,p_context);
		}else{
			if(_parent){
				this.m_x+=_parent.m_x;
			}
		}
		if(typeof this.m_y === 'string'){
			this.ParsePositionTokens({pos:'m_y',dim:'m_h'},this.m_y,p_context);
		}else{
			if(_parent){
				this.m_y+=_parent.m_y;
			}
		}
		
	}

	this.m_Visible=(p.hasOwnProperty("visible"))?p.visible:true;
	
	this.m_bgcolor=(p.hasOwnProperty("bgcolor"))?p.bgcolor:0;
	this.m_imgsrc=(p.hasOwnProperty("imgsrc"))?p.imgsrc:"";
	if(this.m_imgsrc!=""){
		if(!this.m_Img){
			this.m_ImgLoaded=false;
			this.m_Img=new Image();
			this.m_Img.onload=this.onImageLoad;
			this.m_Img.src=this.m_imgsrc;
		}
	}
	
	this.m_Text=(p.hasOwnProperty("text"))?p.text:0;
	this.m_TextColor=(p.hasOwnProperty("textcolor"))?p.textcolor:"#ffffff";
	this.m_Font=(p.hasOwnProperty("font"))?p.font:'12px Arial';
	this.m_TextShadow=(p.hasOwnProperty("textshadow"))?p.textshadow:"#000000";
	this.m_TextShadowX=(p.hasOwnProperty("textshadowx"))?p.textshadowx:0;
	this.m_TextShadowY=(p.hasOwnProperty("textshadowy"))?p.textshadowy:0;
}


window.BaseWidget=BaseWidget;

var GridWidget=function(p_Name,p_Properties){
	BaseWidget.call(this,p_Name,p_Properties);
	this.m_Type="GridWidget";
	this.m_GridSize=16;
	this.m_Grid=[];
	
	var xThis=this;
	this.ParseProperties=function(p_context){
		BaseWidget.prototype.ParseProperties.call(this,p_context);
		var p=xThis.m_Properties;
		xThis.m_GridSize=p.gridsize===undefined?xThis.m_GridSize:p.gridsize;
		var numCols=Math.floor(xThis.m_w/xThis.m_GridSize);
		var numRows=Math.floor(xThis.m_h/xThis.m_GridSize);
		var col=0,row=0;
		var size=xThis.m_GridSize;
		var i,iC=numCols*numRows;
		for(i=0;i<iC;i++){
			var newCell=new GridCell(new Vec2d(xThis.m_x+(col*size),xThis.m_y+(row*size)),size);
			newCell.m_Parent=xThis;
			xThis.m_Children.push(newCell);
			
			row=((i+1)%(numCols)==0&&i!=0)?row+1:row;
			col=((i+1)%(numCols)==0&&i!=0)?0:col+1;
		}
	}
	this.Render=function(p_Ctx){
		BaseWidget.prototype.Render.call(this,p_Ctx);
	}
	this.AddItem=function(p_Item){
		var i,iC=xThis.m_Children.length;
		for(i=0;i<iC;i++){
			var child=xThis.m_Children[i];
			if(child.HasItem!==undefined){
				if(child.HasItem()&&!child.HasMaxStack()&&child.Item().ID()==p_Item.ID()){
					child.AddItem(p_Item);
					return;
				}else if(!child.HasItem()){
					child.AddItem(p_Item);
					return;
				}else{
					continue;
				}
			}
		}
	}
}
GridWidget.prototype=Object.create(BaseWidget.prototype);
GridWidget.prototype.constructor=GridWidget;

window.GridWidget=GridWidget;

var GridCell=function(p_Pos,p_Size){
	BaseWidget.call(this,'GridCell',{});
	this.m_Pos=p_Pos;
	this.m_Size=p_Size;
	this.m_x=this.m_Pos.m_fX;
	this.m_y=this.m_Pos.m_fY;
	this.m_h=p_Size;
	this.m_w=p_Size;
	this.m_Item=null;
	this.m_Quantity=0;
	this.m_MaxStackSize=64;
	this.m_Selected=false;
	
	
	
	var xThis=this;
	this.HasItem=function(){
		return xThis.m_Item!==null;
	}
	this.Item=function(){
		return xThis.m_Item;
	}
	this.onClick=function(p_Event){
		xThis.Toggle();
	}
	this.HasMaxStack=function(){
		return xThis.m_Quantity>=xThis.m_MaxStackSize;
	}
	this.AddItem=function(p_Item){
		if(!xThis.HasItem()){
			xThis.m_Item=p_Item;
			xThis.m_Item.SetUIParent(xThis);
		}
		if(xThis.m_Quantity<xThis.m_MaxStackSize){
			xThis.m_Quantity++;
		}
		//xThis.m_Item.SetRenderMode(Item.RENDER_UI);
	}
	this.RemoveItem=function(p_Quantity){
		if(p_Quantity>xThis.m_Quantity){p_Quantity=xThis.m_Quantity;}
		xThis.m_Quantity-=p_Quantity;
		if(xThis.m_Quantity<=0){
			xThis.m_Item=null;
		}
	}
	this.ToggleSelection=function(){
		xThis.m_Selected=!xThis.m_Selected;
	}
	this.Select=function(p_Select){
		xThis.m_Selected=(p_Select)?true:false;
	}
	this.Render=function(p_Ctx){
		if(!xThis.IsVisible()){return;}
		p_Ctx.fillStyle=xThis.m_Selected?'#a90':'#333';
		p_Ctx.strokeStyle='#ccc';
		p_Ctx.lineWidth=2;
		
		p_Ctx.beginPath();
		var x=xThis.m_Pos.m_fX;
		var y=xThis.m_Pos.m_fY;
		var s=xThis.m_Size;
		p_Ctx.moveTo(x,y);
		p_Ctx.lineTo(x+s,y);
		p_Ctx.lineTo(x+s,y+s);
		p_Ctx.lineTo(x,y+s);
		p_Ctx.closePath();
		p_Ctx.fill();
		
		if(xThis.HasItem()){
			xThis.m_Item.Render(p_Ctx);
			p_Ctx.fillStyle='#fff';
			p_Ctx.font='12px Arial';
			p_Ctx.fillText(''+xThis.m_Quantity,x+s-16,y+s-12)
		}
		
		p_Ctx.stroke();
	}
	this.RegisterEventListener('click',this.onClick);
}
GridCell.prototype=Object.create(GridWidget.prototype);
GridCell.prototype.constructor=GridCell;


var UI=function(){
	this.m_Widgets=[];
	this.m_Root=0;
	this.m_Scene=null;
	var xThis=this;

	this.OnClick=function(event){
		var i, iC=xThis.m_Widgets.length;
		for(i=0;i<iC;i++){
			var widget=xThis.m_Widgets[i];
			if(widget&&widget.HasEventListener('click')!==undefined){
				if(widget.MouseHitTest(event)){
					if(window[widget.m_EventHandlers['click']]){
						window[widget.m_EventHandlers['click']](event,widget,xThis);
					}
				}
			}
		}
		/* event.preventDefault(); */
		return false;
	}
	Mouse.RegisterEventListener('click',this.OnClick);
	
	this.OnKeyPress=function(event){
		var i, iC=xThis.m_Widgets.length;
		for(i=0;i<iC;i++){
			var widget=xThis.m_Widgets[i];
			if(widget&&widget.m_EventHandlers['keypress']!==undefined){
				if(widget.m_Visible){
					if(window[widget.m_EventHandlers['keypress']]){
						window[widget.m_EventHandlers['keypress']](event,widget,xThis);
					}
				}
			}
		}
	}
	Keyboard.RegisterEventListener('keypress',this.OnKeyPress);
	
	this.MouseHitTest=function(e){
		var root=xThis.m_Root.MouseHitTest(e);
		if(root==xThis.m_Root){
			return false;
		}
		return root;
	}
	this.Init=function(p_Data,p_Context,p_Scene){
		xThis.m_Scene=p_Scene;
		var canvas=p_Context.canvas;
		var root=new BaseWidget("root", {x:0,y:0,w:canvas.width,h:canvas.height});
		root.ParseProperties();
		xThis.m_Root=root;
		var json=p_Data;
		
		if(json.elements===undefined){
			return;
		}
		var o;
		for(o in json.elements){
			var p={};
			var obj=json.elements[o];
			var type=(obj.type===undefined)?"BaseWidget":obj.type;
			if(obj.hasOwnProperty('p')){
				p=obj.p;
			}
			var nw=null;
			nw=new window[type](o,p);//BaseWidget(o,p);
			nw.ParseProperties(p_Context);
			xThis.m_Root.m_Children.push(nw);
			if(obj.hasOwnProperty('events')){
				var inner;
				for(inner in obj.events){
					nw.RegisterEventListener(inner, obj.events[inner]);
				}
			}
			if(obj.hasOwnProperty('cw')){
				xThis.ParseChildren(obj.cw,nw,p_Context);
			}
			
			xThis.m_Widgets.push(nw);
		}
		if(json.hasOwnProperty('meta')){
			if(json.meta.hasOwnProperty('behaviourasset')){
				var src=json.meta.behaviourasset;
				var domel=document.createElement('script');
				document.body.appendChild(domel);
				domel.onload=function(){
					var i,iC=xThis.m_Widgets.length;
					for(i=0;i<iC;i++){
						if(xThis.m_Widgets[i].m_EventHandlers["postload"]!==undefined){
							window[xThis.m_Widgets[i].m_EventHandlers["postload"]]({},xThis.m_Widgets[i],xThis);
						}
					}
				}
				domel.src=src;
			}
		}
	}
	this.Recalculate=function(p_ctx){
		xThis.m_Root.Recalculate(p_ctx);
	}
	this.ParseChildren=function(p_Children,p_Parent,p_context){
		var o;
		for(o in p_Children){
			var p={};
			var obj=p_Children[o];
			if(obj.hasOwnProperty('p')){
				p=obj.p;
			}
			var type=(obj.type===undefined)?"BaseWidget":obj.type;
			var nw=new window[type](o,p);
			//nw=new BaseWidget(o,p);
			if(obj.hasOwnProperty('events')){
				var inner;
				for(inner in obj.events){
					nw.RegisterEventListener(inner, obj.events[inner]);
				}
			}
			
			nw.m_Parent=p_Parent;
			nw.ParseProperties(p_context);
			p_Parent.m_Children.push(nw);
			if(obj.hasOwnProperty('cw')){
				xThis.ParseChildren(obj.cw,nw,p_context);
			}
			xThis.m_Widgets.push(nw);
		}
	}
	this.Render=function(p_ctx){
		if(!xThis.m_Root){return;}
		xThis.m_Root.Render(p_ctx);
	}
	this.GetWidgetFromName=function(p_name){
		var i, iC=xThis.m_Widgets.length;
		for(i=0;i<iC;i++){
			if(xThis.m_Widgets[i].m_Name==p_name){
				return xThis.m_Widgets[i];
			}
		}
		return null;
	}
	this.Unload=function(){
		var i, iC=xThis.m_Widgets.length;
		for(i=0;i<iC;i++){
			xThis.m_Widgets[i].Unload();
		}
		xThis.m_Widgets.length=0;
		Mouse.UnRegisterEventListener('click',xThis.OnClick);
		Keyboard.UnRegisterEventListener('click',xThis.OnKeyPress);
	}
}
