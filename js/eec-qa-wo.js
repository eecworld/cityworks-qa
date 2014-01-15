eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.WOGeneral.Controls.get(controlId));
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
          status = 'pass';
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
      var inspIdEls = eecQaPlugin.getControl('grdInspections').find('.rgRow td:eq(1) a, .rgAltRow td:eq(1) a');
      var inspIds = [];
      inspIdEls.each(function() {
        inspIds.push(Number($(this).text()));
      });
      if (inspIds.length == 0) {
        eecQaPlugin.setTestResults('inspections', 'pass', 0, 0);
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
        status = 'pass';
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
