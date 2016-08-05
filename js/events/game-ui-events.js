"use strict";
function onInventoryBtnClick(event,widget,ui){
	ui.GetWidgetFromName('PlayerInventory').Toggle();
	ui.GetWidgetFromName('BuildingSubPanel').Toggle();
}
function onWorkerBtnClick(event,widget,ui){
	var ents=Entities.GetEntitiesOfTypeWithProperty('Worker','m_Selected',true);
	if(widget.Name()==='MoveButton'){
		if(ents.length>0){
			GameState.Set('WorkerState',{e:ents[0],s:WorkerState.WORKER_MOVE});
		}
	}else if(widget.Name()==='BuildButton'){
		var sub=ui.GetWidgetFromName('BuildingSubPanel');
		sub.Toggle();
		
	}
}
function onBuildingBtnClick(event,widget,ui){
	var ents=Entities.GetEntitiesOfTypeWithProperty('Worker','m_Selected',true);
	if(ents.length>0){
			var placementBuildings=Entities.GetEntitiesOfTypeWithProperty('Building','m_Mode',0);
			if(placementBuildings.length>0){
				GameState.Set('WorkerState',{e:null,s:WorkerState.WORKER_NONE});
				var i,iC=placementBuildings.length;
				for(i=0;i<iC;i++){
					Entities.RemoveEntity(placementBuildings[i]);
				}
			}else{
				GameState.Set('WorkerState',{e:null,s:WorkerState.WORKER_BUILD});
				var currentWorld=Game.CurrentScene().GetSystemByName('World').s;
				var animSrc=widget.GetCustomData('animsrc');
				var bd=widget.GetCustomData('buildingdata');
				var bt=widget.GetCustomData('buildingtype');
				var type=bt===undefined?'Building':bt;
				Entities.NewEntity(type,{px:0,py:0,animsrc:animSrc,world:currentWorld,buildingdata:bd});
			}
		}
}
function removeInitMessage(event,widget,ui){
	ui.RemoveWidget(widget);
}