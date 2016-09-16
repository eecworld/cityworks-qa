/**
 * @module eecQaPlugin/sr
 * @description
 * Service request-specific functionality for the QA plugin
 */

/**
 * @function getControl
 * @description
 * A helper function for returning a jQuery reference to a control.  Uses the Cityworks JavaScript utility library cw
 * to get the control's ID from the LayoutManager.
 *
 * @param {String} controlId The ID of the control (per XML specification)
 * @returns {*|jQuery|HTMLElement} a jQuery reference to the control on the page
 *
 * @example
 * //Returns the service request's ID
 * var id = eecQaPlugin.getControl('cboRequestId').val();
 */
eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.SRGeneral.Controls.get(controlId))
};

/**
 * @function getUserName
 * @description
 * A helper function to scrape the full name (Last, First) of the currently logged in user from the Cityworks page.
 * Two methods are tried to help protect against upgrade breakage:
 *   Method 1: Parses the user's name out of the "onClick" handler of the "Cancel Service Request" checkbox.  SUPER
 *     hacky!  Could very well break on upgrade.
 *   Method 2: Pulls the user's name from the upper-right application ("hamburger") menu.  Pretty sensible (and more
 *     likely upgrade-proof, but it has to cross iframes and isn't available when the user has the work order open in a
 *     separate tab.
 *
 * @returns {String} The current user's full name (Last, First)
 */
eecQaPlugin.getUserName = function() {

  function method1() {
    //Method 1: Parse the cancel check click handler (the only place in the WO page where the user's name is written
    var cancelFunctionText = eecQaPlugin.getControl('chkCancel').prop('onclick').toString().split(',');
    var nameText = cancelFunctionText[3] + ', ' + cancelFunctionText[4];
    return nameText.substring(1, nameText.length-1);
  }

  function method2() {
    //Method 2: Get from the application menu (not possible when WO is open in a separate tab)
    return $('.user-menu .details .name', top.document).text();  //Selector is run in parent frame
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

/**
 * @function addComments
 * @description
 * A helper function for adding comments to the currently open service request.  Note that the added comments will not
 * show in the service request's comment stream until the page is refreshed (e.g. by saving).  Also note that this
 * calls the Cityworks API, so the current (or authenticated) user's name and the current date and time will be
 * automatically added by the API to whatever is passed by this function.
 *
 * Currently used for stamping override details when the user chooses to mark a request "COMPLETE" even though all the
 * tests have not yet passed.
 *
 * @param {String} comments The comments to be added
 * @param {Function} callback A callback function to be run when the comments have successfully been added
 *
 * @example
 * //This adds a comment to the service request and notifies the user in an annoying alert box once it's succeeded
 * eecQaPlugin.addComments('Notified USA', function() {
 *   alert('Comments were added.  Save the service request to see the updated comments');
 * });
 */
eecQaPlugin.addComments = function(comments, callback) {
  eecQaPlugin.callApi('ServiceRequest', 'AddComments', {'RequestId': eecQaPlugin.recordId, 'Comments': comments}, callback);
};

/**
 * @var {Object} tests
 * @description
 * A dictionary specifying the tests to be run against each service request and the method for determining their status.
 *
 * Each test should be registered as a property of the main eecQaPlugin.tests object and should itself be an object with
 * at least a description property and an update method.
 *
 * See the example for how to add a new test
 *
 * @example
 * eecQaPlugin.tests = {          //This is the existing main tests object (dictionary)
 *   ...                          //Existing tests are defined here
 *   },                           //This is the end of last test.  Remember to ADD A COMMA!
 *                                //-----BEGINNING OF YOUR NEW TEST-----
 *   testName: {                  //Replace "testName" with a "Computer-friendly" name/ID of the test (e.g. tasks)
 *     description: 'Test Name',  //Replace "Test Name" with a "Human-friendly" name of the test (e.g. 'Tasks
 *     update: function() {       //Add an update method to specify how your test should be run.
 *       ...                      //A test usually either calls a Cityworks API with eecQaPlugin.callApi or uses jQuery
 *       ...                      //to scrape the request screen for information.  But a test can technically run any
 *       ...                      //code in its body.
 *       eecQaPlugin.setTestResults('testName', status, complete, total);
 *       //Once the test has determined the results, it needs to call the setTestResults function to report the results
 *       //and update the user interface.  Note that you might need to run this function from a callback function if the
 *       //test is run asynchronously (as is the case with all tests that use the eecQaPlugin.callApi function).
 *     }                          //-----END OF YOUR NEW TEST-----
 *   }
 * };
 */
eecQaPlugin.tests = {
  /**
   * @var {Object} tests.inspections
   * @description
   * Tests whether all related inspections have been closed.  If there are no related inspections, is set to "NA"
   */
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
  /**
   * @var {Object} tests.requiredFields
   * @description
   * Tests whether all required fields (standard and custom) have been filled out.  Scrapes the screen for CSS classes
   * to determine which fields are required.
   */
  requiredFields: {
    description: 'Required Fields Filled In',
    update: function() {
      //TODO: Doesn't recognize required fields on other pages (i.e. arrived on site)
      var fieldEls = $('[class*=Required]').next().find('input[type=text], select')
      var status = '';
      var complete = 0;
      var total = fieldEls.length;
      fieldEls.each(function() {
        var content = $(this).val();
        if (content != '' && content != 'MM/DD/YYYY') { complete++; }
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
  /**
   * @var {Object} tests.labor
   * @description Tests whether any labor has been added to the service request
   */
  labor: {
    description: 'Labor Hours Entered',
    update: function() {
      eecQaPlugin.callApi('LaborCost', 'RequestCostsByRequest', {RequestIds: [eecQaPlugin.recordId]}, function(data) {
        var status = '';
        var hours = 0;
        if (data.length > 0) {
          status = 'pass';
          for (var i=0; i<data.length; i++) {
            hours += data[i].Hours;
          }
        } else {
          status = 'fail';
        }
        hours = Math.round(hours * 10) / 10;
        eecQaPlugin.setTestResults('labor', status, hours);
      });
    }
  }
};

//Initialize some settings by reading the service request screen
eecQaPlugin.recordId = eecQaPlugin.getControl('cboRequestId').val();  //Makes the request ID available to all tests
eecQaPlugin.applyToAll = eecQaPlugin.getControl('chkApplyToAll').prop('checked');
eecQaPlugin.statusCtl = eecQaPlugin.getControl('cboStatus');
