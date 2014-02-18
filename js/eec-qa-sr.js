eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.SRGeneral.Controls.get(controlId))
};

eecQaPlugin.tests = {  //TODO: Dynamically specify which tests in init params so they can be assigned per user group through XML?
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
  labor: {
    description: 'Labor Entered',
    update: function() {
      eecQaPlugin.callApi('LaborCost', 'RequestCostsByRequest', {RequestIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        if (data.length > 0) {  //TODO: More sophisticated check?
          status = 'pass';
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('labor', status);
      });
    }
  }
};

eecQaPlugin.recordId = eecQaPlugin.getControl('cboRequestId').val();
eecQaPlugin.applyToAll = eecQaPlugin.getControl('chkApplyToAll').prop('checked');
eecQaPlugin.getStatus = eecQaPlugin.getControl('cboStatus').val();
