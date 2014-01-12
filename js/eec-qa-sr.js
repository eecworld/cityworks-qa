eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.SRGeneral.Controls.get(controlId))
};

eecQaPlugin.tests = {  //TODO: Dynamically specify which tests in init params so they can be assigned per user group through XML?
  inspections: {
    description: 'Inspections Complete',
    update: function() {
      //TODO: Write.  It doesn't look like there's going to be an easy way to get "Related Inspections" through the API.
      //We'll probably have to write our own API to retrieve the relationships.  But getting the status can use the
      //official one.
      //OR... we can rely on the service request form to list the related inspections for us (and even their statuses too!)
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
        if (content != '') { complete++; }
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
