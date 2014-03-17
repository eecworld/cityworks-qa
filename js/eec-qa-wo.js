eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.WOGeneral.Controls.get(controlId));
};

eecQaPlugin.getUserName = function() {  //TODO: Add to eec-qa-sr as well

  function method1() {
    //Method 1: Parse the cancel check click handler (the only place in the WO page where the user's name is written
    var cancelFunctionText = eecQaPlugin.getControl('chkCancel').prop('onclick').toString().split(',');
    var nameText = cancelFunctionText[3] + ', ' + cancelFunctionText[4];
    return nameText.substring(1, nameText.length-1);
  }

  function method2() {
    //Method 2: Get from the application menu (not possible when WO is open in a separate tab)
    return $('.user-menu .details .name', top.document).text();
  }

  var username;
  try {
    username = method1();
  } catch(e) {
    //Do nothing
  }
  if (username == undefined || username == null || username.length == 0) {
    username = method2();
  }
  return username;

};

eecQaPlugin.addComments = function(comments, callback) {
  eecQaPlugin.callApi('WorkOrder', 'AddComments', {'WorkOrderId': eecQaPlugin.recordId, 'Comments': comments}, callback);
};

eecQaPlugin.tests = {  //TODO: Dynamically specify which tests in init params so they can be assigned per user group through XML?
  tasks: {
    description: 'Tasks Complete',
    update: function() {
      //TODO: Is this going to run async?
      eecQaPlugin.callApi('Tasks', 'ByWorkOrder', {WorkOrderIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        var complete = 0;
        var total = data.length;
        for (var i= 0; i<total; i++) {
          var task = data[i];
          if (task['Status'] == 'COMPLETE') { complete++; }
        }
        if (complete == total) {
          if (total > 0) {
            status = 'pass';
          } else {
            status = 'na';
          }
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('tasks', status, complete, total);
      });
    }
  },
  inspections: {
    description: 'Inspections Complete',
    update: function() {
      var inspIdEls = eecQaPlugin.getControl('grdInspections').find('.rgRow td a, .rgAltRow td a');
      var inspIds = [];
      inspIdEls.each(function() {
        inspIds.push(Number($(this).text()));
      });
      if (inspIds.length == 0) {
        eecQaPlugin.setTestResults('inspections', 'na', 0, 0);
      } else {
        eecQaPlugin.callApi('Inspection', 'ByIds', {InspectionIds: inspIds}, function(data) {
          var status = '';
          var complete = 0;
          var total = data.length;
          for (var i=0; i<total; i++) {
            var insp = data[i];
            if (insp['IsClosed']) { complete++; }
          }
          if (complete == total) {
            status = 'pass';
          } else {
            status = 'fail';
          }
          eecQaPlugin.setTestResults('inspections', status, complete, total);
        });
      }
    }
  },
  requiredFields: {
    description: 'Required Fields Filled In',
    update: function() {
      //TODO: What about required fields on other pages (i.e. arrived on site)?
      var fieldEls = $('[class*=Required]').next().find('input[type=text], select')
      var status = '';
      var complete = 0;
      var total = fieldEls.length;
      fieldEls.each(function() {
        var content = $(this).val();
        if (content != '') { complete++; } //TODO: Don't include date placeholder MM/DD/YYYY
      });
      if (complete == total) {
        if (total > 0) {
          status = 'pass';
        } else {
          status = 'na';
        }
      } else {
        status = 'fail';
      }
      eecQaPlugin.setTestResults('requiredFields', status, complete, total);
    }
  },
  asset: {
    description: 'Attached to an Asset',
    update: function() {
      eecQaPlugin.callApi('WorkOrder', 'Entities', {WorkOrderIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        if (data.length == 0) {  //TODO: More sophisticated check?
          status = 'fail';
        } else if (data.length == 1) {
          if (data[0].IsBlank) {
            status = 'fail';
          } else {
            status = 'pass';
          }
        } else {
          status = 'pass';
        }
        eecQaPlugin.setTestResults('asset', status);
      });
    }
  },
  labor: {
    description: 'Labor Entered',
    update: function() {
      eecQaPlugin.callApi('LaborCost', 'WorkOrderCostsByWorkOrder', {WorkOrderIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        if (data.length > 0) {  //TODO: More sophisticated check?
          status = 'pass';
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('labor', status);
      });
    }
  },
  equipment: {
    description: 'Equipment Entered',
    update: function() {
      eecQaPlugin.callApi('EquipmentCost', 'WorkOrderCostsByWorkOrder', {WorkOrderIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        if (data.length > 0) {  //TODO: More sophisticated check?
          status = 'pass';
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('equipment', status);
      });
    }
  },
  materials: {
    description: 'Materials Entered',
    update: function() {
      eecQaPlugin.callApi('MaterialCost', 'WorkOrderCostsByWorkOrder', {WorkOrderIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        if (data.length > 0) {  //TODO: More sophisticated check?
          status = 'pass';
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('materials', status);
      });
    }
  }
};

eecQaPlugin.recordId = eecQaPlugin.getControl('cboWorkOrderId').val();
eecQaPlugin.applyToAll = eecQaPlugin.getControl('chkApplyToAll').prop('checked');
eecQaPlugin.statusCtl = eecQaPlugin.getControl('cboStatus');
