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
  customFields: {
    description: 'Required Custom Fields Filled In',
    update: function() {
      //TODO: Write.  Note we'll have to write our own custom fields API because Cityworks doesn't have one (or do it totally cosmetically).
    }
  },
  requiredFields: {
    description: 'Other Required Fields Filled In',
    update: function() {
      //TODO: Write.  This should be able to be done completely cosmetically without any network traffic.  But what about required fields on other pages (i.e. arrived on site)?
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
