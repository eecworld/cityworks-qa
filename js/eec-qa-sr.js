eecQaPlugin.getControlValue = function(controlId) {
  return $('#' + cw.LayoutManagers.SRGeneral.Controls.get(controlId)).val()
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
  customFields: {
    description: 'Required Custom Fields Filled In',
    update: function() {
      //TODO: Write.  Note we'll have to write our own custom fields API because Cityworks doesn't have one (or do it totally cosmetically).
    }
  },
  requiredFields: {
    description: 'Other Required Fields Filled In',
    update: function() {
      //TODO: Write.  This should be able to be done (and may HAVE to be done) completely cosmetically without any network traffic.  But what about required fields on other pages (i.e. arrived on site)?
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

eecQaPlugin.recordId = eecQaPlugin.getControlValue('cboRequestId');
