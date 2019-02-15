({
    
    getInputData : function(component, event, helper) {
        component.set("v.isLoading",true);
		let action = component.get("c.getInputWrapper");
        action.setCallback(this,function(response){
            component.set("v.isLoading",false);
            let state=response.getState();
            if(state == "SUCCESS"){
                component.set("v.userInputWrapper",JSON.parse(response.getReturnValue()));
            }
        });
        $A.enqueueAction(action);
    },
    
	searchRecords : function(component, event, helper) {
        component.set("v.disable",true);
        component.set("v.next",true);
        component.set("v.previous",true);
        component.set("v.startIndex",0);
        component.set("v.recordsCount",50);
        component.set("v.selectLabel","");
        component.set("v.sortField","");
        let sDate = component.get("v.userInputWrapper.startDate");
        let eDate = component.get("v.userInputWrapper.endDate");
        
		let object = component.get("v.userInputWrapper.sObjectName");
        if(object == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": 'Please select any object to fetch deleted records!'
            });
            toastEvent.fire();
        }
        else if(eDate < sDate){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": 'End Date should be greater than Start Date!'
            });
            toastEvent.fire();
        }
        else{
            component.set("v.isLoading",true);
            helper.fetchFieldNames(component, event);
            let action = component.get("c.getDeletedRecords");
            action.setParams({
                userInput : JSON.stringify(component.get("v.userInputWrapper")),
                sortField : 'Name',
                isAsc : true
                
            });
            action.setCallback(this,function(response){
                let state=response.getState();
                component.set("v.isLoading",false);
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
                else{
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "message": 'Please enter valid input to perform search!'
                    });
                    toastEvent.fire();
                }
            });
			$A.enqueueAction(action);            
        }
	},
    
    undeleteAll : function(component, event, helper) {
        component.set("v.isLoading",true);
        let action = component.get("c.undeleteRecords");
        action.setParams({
            recordsToBeDeleted : JSON.stringify(component.get("v.deletedRecords")),
            selectAll : true
        });
        action.setCallback(this,function(response){
            let state=response.getState();
            component.set("v.isLoading",false);
            if(state == "SUCCESS"){
                let result=response.getReturnValue();
                if(result == 'Done!'){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title" : "Success!",
                        "message": 'Records restored from Recycle Bin!'
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
                else if(result == 'Batch!'){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title" : "Success!",
                        "message": 'Batch initiated. Records will be restored in some time!'
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
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title" : "Error!",
                        "message": result
                    });
                    toastEvent.fire();
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    undelete : function(component, event, helper) {
        let checkSelectAll = component.get("v.selectAllRecords");
        if(checkSelectAll == true){
            component.set("v.isLoading",true);
            let action = component.get("c.undeleteRecords");
            action.setParams({
                recordsToBeDeleted : JSON.stringify(component.get("v.tempRecords")),
                selectAll : checkSelectAll
            });
            action.setCallback(this,function(response){
                component.set("v.isLoading",false);
                let state=response.getState();
                if(state == "SUCCESS"){
                    let result=response.getReturnValue();
                    if(result == 'Done!'){
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "title" : "Success!",
                            "message": 'Records restored from Recycle Bin!'
                        });
                        toastEvent.fire();
                        let countSelected = component.get("v.recordsCount");
                        let start = parseInt(component.get("v.startIndex"));
                        start = start - countSelected;
                        if(start < 0){
                            start = 0;
                        }
                        component.set("v.startIndex",start);
                        component.set("v.selectAllRecords",false);
                        helper.searchDRecords(component,event);
                    }
                    else{
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "title" : "Error!",
                            "message": result
                        });
                        toastEvent.fire();
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else{            
            let countSelected = component.get("v.recordsCount");
            let dRecords = component.get("v.tempRecords");
            let check = 0;
            for(let i=0; i<dRecords.length; i++){
                if(dRecords[i].selected == true){
                    check = check + 1;
                }
            }
            if(check == 0){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "message": 'Please select at least one record to perform undelete!'
                });
                toastEvent.fire();
            }
            else{
                component.set("v.isLoading",true);
                let action = component.get("c.undeleteRecords");
                action.setParams({
                    recordsToBeDeleted : JSON.stringify(component.get("v.tempRecords")),
                    selectAll : checkSelectAll
                });
                action.setCallback(this,function(response){
                    component.set("v.isLoading",false);
                    let state=response.getState();
                    if(state == "SUCCESS"){
                        let result=response.getReturnValue();
                        if(result == 'Done!'){
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title" : "Success!",
                                "message": 'Records restored from Recycle Bin!'
                            });
                            toastEvent.fire();
                            if(check == countSelected){
                                let start = parseInt(component.get("v.startIndex"));
                                start = start - countSelected;
                                if(start < 0){
                                    start = 0;
                                }
                                component.set("v.startIndex",start);
                            }
                            helper.searchDRecords(component,event);
                        }
                        else{
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title" : "Error!",
                                "message": result
                            });
                            toastEvent.fire();
                        }
                    }
                });
                $A.enqueueAction(action);
            }
        }
    },
    
    changeCount : function(component,event,helper) {
        component.set("v.selectAllRecords",false);
        component.set("v.isLoading",true);
        let dRecords = component.get("v.deletedRecords");
        let tRecords = component.get("v.tempRecords");
        let start = parseInt(component.get("v.startIndex"));
        if(start < 0){
            start = 0;
        }
        let countSelected = parseInt(component.get("v.recordsCount"));
        let tempArray = dRecords.slice(start,(start + countSelected ));
        component.set("v.tempRecords",tempArray);
        if((dRecords.length - (start + countSelected) ) > 0){
            component.set("v.next",false);
        }
        else{
            component.set("v.next",true);
        }
        if((start - 1) <= 0){
            component.set("v.previous",true);
        }
        else{
            component.set("v.previous",false);
        }
        let end = parseInt(start) + tempArray.length;
        start = start + 1;
        let labelString = start.toString() +"-" + end.toString() + " of " + dRecords.length.toString();
        component.set("v.selectLabel",labelString);
        component.set("v.isLoading",false);
    },
    
    checkAllBox : function(component,event,helper) {
        let checkMaster = component.find("checkAll");
        let dependent = component.find("myCheckboxes");
        let value = checkMaster.get("v.value");
        for(let i = 0; i < dependent.length; i++){
            dependent[i].set("v.value",value);
        }
    },
    
    displayNext : function(component,event,helper) {
        component.set("v.selectAllRecords",false);
        component.set("v.isLoading",true);
        let dRecords = component.get("v.deletedRecords");
        let countSelected = parseInt(component.get("v.recordsCount"));
        let start = parseInt(component.get("v.startIndex"));
        start = start + countSelected;
        let tempArray = dRecords.slice(start,(start + countSelected));
        component.set("v.tempRecords",tempArray);
        if((dRecords.length - (start + countSelected) ) > 0){
            component.set("v.next",false);
        }
        else{
            component.set("v.next",true);
        }
        component.set("v.startIndex",start);
        let end = parseInt(start) + tempArray.length;
        start = start + 1;
        component.set("v.previous",false);
        let labelString = start.toString() + "-" + end.toString() + " of " + dRecords.length.toString();
        component.set("v.selectLabel",labelString);
        component.set("v.isLoading",false);
    },
    
    displayPrevious : function(component,event,helper) {
        component.set("v.selectAllRecords",false);
        component.set("v.isLoading",true);
        let dRecords = component.get("v.deletedRecords");
        let countSelected = parseInt(component.get("v.recordsCount"));
        let start = parseInt(component.get("v.startIndex"));
        start = start - countSelected;
        if(start < 0){
            start = 0;
        }
        let tempArray = dRecords.slice(start,(start + countSelected));
        component.set("v.tempRecords",tempArray);
        if((dRecords.length - (start + countSelected) ) > 0){
            component.set("v.next",false);
        }
        else{
            component.set("v.next",true);
        }
        component.set("v.startIndex",start);
        let end = parseInt(start) + tempArray.length;
        start = start + 1;
        if((start - 1) <= 0){
            component.set("v.previous",true);
        }
        else{
            component.set("v.previous",false);
        }
        let labelString = start.toString() + "-" + end.toString() + " of " + dRecords.length.toString();
        component.set("v.selectLabel",labelString);
        component.set("v.isLoading",false);
    },
    
    sortByName : function(component,event,helper) {
        let sortAsc = component.get("v.sortAsc");
        let sortField = "Name";
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
    },
    
    sortByUser : function(component,event,helper) {
        
        let sortAsc = component.get("v.sortAsc");
        let sortField = "Deleted By";
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
    },
    
    sortByDate : function(component,event,helper) {
        
        let sortAsc = component.get("v.sortAsc");
        let sortField = "Deleted Date";
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
    },
    
    clearInput : function(component,event,helper) {
        $A.get('e.force:refreshView').fire();
    }
    
})
