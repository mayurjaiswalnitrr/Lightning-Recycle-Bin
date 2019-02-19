({
	fetchFieldNames : function(component,event) {
        let object = component.get("v.userInputWrapper.sObjectName");
		let action=component.get("c.getFieldNames");
        action.setParams({
            objName : object
        });
        action.setCallback(this,function(response){
            let state=response.getState();
            if(state == "SUCCESS"){
                component.set("v.fieldNames",JSON.parse(response.getReturnValue()));
            }
        });
        $A.enqueueAction(action);
	},
    
    searchDRecords : function(component, event) {
        component.set("v.selectAllRecords",false);
		let object = component.get("v.userInputWrapper.sObjectName");
        if(object == null){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": 'Please select any object to fetch deleted records!'
            });
            toastEvent.fire();
        }
        else{
            let action = component.get("c.getDeletedRecords");
            action.setParams({
                userInput : JSON.stringify(component.get("v.userInputWrapper")),
                sortField : 'Name',
                isAsc : true
            });
            action.setCallback(this,function(response){
                let state=response.getState();
                if(state == "SUCCESS"){
                    let dRecords = JSON.parse(response.getReturnValue());
                    if(dRecords.length == 0){
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "message": 'No records found in Recycle Bin!'
                        });
                        toastEvent.fire();
                        component.set("v.deletedRecords",[]);
                        component.set("v.tempRecords",[]);
                        component.set("v.disable",true);
                        component.set("v.next",true);
                        component.set("v.previous",true);
                        component.set("v.startIndex",0);
                        component.set("v.recordsCount",50);
                        component.set("v.selectLabel","");
                    }
                    else{
                        component.set("v.deletedRecords",JSON.parse(response.getReturnValue()));
                        let countSelected = parseInt(component.get("v.recordsCount"));
                        let start = parseInt(component.get("v.startIndex"));
                        let tempArray = dRecords.slice(start,(start  + countSelected));
                        console.log(tempArray.length);
                        component.set("v.tempRecords",tempArray);
                        if((dRecords.length - (start + countSelected) ) > 0){
                            component.set("v.next",false);
                        }
                        else{
                            component.set("v.next",true);
                        }
                        component.set("v.startIndex",start);
                        let end = start + tempArray.length;
                        if((start - 1) <= 0){
                            component.set("v.previous",true);
                        }
                        else{
                            component.set("v.previous",false);
                        }
                        start = start + 1;
                        let labelString = start.toString() + "-" + end.toString() + " of " + dRecords.length.toString();
                        component.set("v.selectLabel",labelString);
                        component.set("v.disable",false);
                    }
                }
            });
			$A.enqueueAction(action);            
        }
	},
    
    sortColumn : function(component, event, field) {
        console.log(field);
        let sortAsc = component.get("v.sortAsc");
        let sortField = field;
        sortAsc = !sortAsc;
        component.set("v.isLoading",true);
        let object = component.get("v.userInputWrapper.sObjectName");
        let action = component.get("c.getDeletedRecords");
        action.setParams({
            userInput : JSON.stringify(component.get("v.userInputWrapper")),
            sortField : sortField,
            isAsc : sortAsc
        });
        action.setCallback(this,function(response){
            let state=response.getState();
            component.set("v.isLoading",false);
            if(state == "SUCCESS"){
                let dRecords = JSON.parse(response.getReturnValue());
                component.set("v.sortAsc", sortAsc);
                component.set("v.sortField",sortField);
                component.set("v.deletedRecords",JSON.parse(response.getReturnValue()));
                let countSelected = parseInt(component.get("v.recordsCount"));
                let start = parseInt(component.get("v.startIndex"));
                let tempArray = dRecords.slice(start,(start  + countSelected));
                component.set("v.tempRecords",tempArray);
                if((dRecords.length - (start + countSelected) ) > 0){
                    component.set("v.next",false);
                }
                else{
                    component.set("v.next",true);
                }
                component.set("v.startIndex",start);
                let end = start + tempArray.length;
                if((start - 1) <= 0){
                    component.set("v.previous",true);
                }
                else{
                    component.set("v.previous",false);
                }
                start = start + 1;
                let labelString = start.toString() + "-" + end.toString() + " of " + dRecords.length.toString();
                component.set("v.selectLabel",labelString);
                component.set("v.disable",false);
            }
            else{
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "message": 'Some error occured, please try again later!'
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    } 
})
