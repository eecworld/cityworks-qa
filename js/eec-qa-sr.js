eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.SRGeneral.Controls.get(controlId))
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
  eecQaPlugin.callApi('ServiceRequest', 'AddComments', {'RequestId': eecQaPlugin.recordId, 'Comments': comments}, callback);
};

eecQaPlugin.tests = {  //TODO: Dynamically specify which tests in init params so they can be assigned per user group through XML?
  inspections: {
    description: 'Inspections Complete',
    update: function() {
      var inspIdEls = eecQaPlugin.getControl('grdInspections').find('.rgRow td a, .rgAltRow td a');
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
eecQaPlugin.statusCtl = eecQaPlugin.getControl('cboStatus');
