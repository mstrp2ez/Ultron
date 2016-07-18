function onInventoryBtnClick(event,widget,ui){
	ui.GetWidgetFromName('PlayerInventory').Toggle();
}
function onWorkerBtnClick(event,widget,ui){
	if(widget.Name()==='MoveButton'){
		var ents=Entities.GetEntitiesOfTypeWithProperty('Worker','m_Selected',true);
		if(ents.length>0){
			GameState.Set('WorkerState',{e:ents[0],s:ents[0].WorkerState.WORKER_MOVE});
		}
	}
}
function removeInitMessage(event,widget,ui){
	ui.RemoveWidget(widget);
}