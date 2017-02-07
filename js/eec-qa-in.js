/**
 * @module eecQaPlugin/in
 * @description
 * Inspection-specific functionality for the QA plugin
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
 * //Returns the inspection's ID
 * var id = eecQaPlugin.getControl('cboInspectionId').val();
 */
eecQaPlugin.getControl = function(controlId) {
  return $('#' + cw.LayoutManagers.GenInspectionEdit.Controls.get(controlId));
};

/**
 * @function getUserName
 * @description
 * A helper function to scrape the full name (Last, First) of the currently logged in user from the Cityworks page.
 * Pulls the user's name from the upper-right application ("hamburger") menu
 *
 * @returns {String} The current user's full name (Last, First)
 */
eecQaPlugin.getUserName = function() {

  function method2() {
    //Method 2: Get from the application menu (not possible when WO is open in a separate tab)
    return $('.user-menu .details .name', top.document).text();  //Selector is run in parent frame
  }
  return method2();

};

/**
 * @function addComments
 * @description
 * A helper function for adding comments to the currently open inspection.  Tries to emulate the behavior in the work
 * orders and service requests but using the Observations field.  Without the same WO/SR commenting system, there's no
 * real way to stop the user from then deleting this comment.
 *
 * Currently used for stamping override details when the user chooses to mark a work order "COMPLETE" even though all
 * the tests have not yet passed.
 *
 * @param {String} comments The comments to be added
 * @param {Function} callback A callback function to be run when the comments have successfully been added
 *
 * @example
 * //This adds a comment to the work order and notifies the user in an annoying alert box once it's succeeded
 * eecQaPlugin.addComments('Notified USA', function() {
 *   alert('Comments were added.  Save the inspection to see the updated comments');
 * });
 */
eecQaPlugin.addComments = function(comments, callback) {
  var observations = eecQaPlugin.getControl('txtObservationSum');
  // Mimics the username and datestamp of WO and SR comments
  var currentObservations = observations.val();
  observations.val((currentObservations ? currentObservations + '\n\n' : '') +
    'By ' + eecQaPlugin.getUserName() + ': ' + (new Date()).toLocaleDateString() + '\n' + comments);
  // TODO: Save?
  callback && callback();
};

/**
 * @var {Object} tests
 * @description
 * A dictionary specifying the tests to be run against each work order and the method for determining their status.
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
 *       ...                      //to scrape the work order screen for information.  But a test can technically run any
 *       ...                      //code in its body.
 *       eecQaPlugin.setTestResults('testName', status, complete, total);
 *       //Once the test has determined the results, it needs to call the setTestResults function to report the results
 *       //and update the user interface.  Note that you might need to run this function from a callback function if the
 *       //test is run asynchronously (as is the case with all tests that use the eecQaPlugin.callApi function).
 *     }                          //-----END OF YOUR NEW TEST-----
 *   }
 * }
 */
eecQaPlugin.tests = {
  /**
   * @var {Object} tests.requiredFields
   * @description
   * Tests whether all required fields (standard and custom) have been filled out.  Scrapes the screen for CSS classes
   * to determine which fields are required.
   */
  requiredFields: {
    description: 'Required Fields Filled In',
    update: function() {
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
   * @var {Object} tests.asset
   * @description Tests whether the inspection is associated to an asset
   */
  asset: {
    description: 'Asset Attached',
    update: function() {  // TODO: Look locally instead of from API?
      eecQaPlugin.callApi('Inspection', 'ById', {InspectionId: eecQaPlugin.recordId}, function(data) {
        var status = '';
        var complete = 0;
        if (data.EntityType && data.EntityUid) {
          status = 'pass';
          complete = 1;
        } else {
          status = 'fail';
        }
        eecQaPlugin.setTestResults('asset', status, complete);
      });
    }
  }
};

//Initialize some settings by reading the inspection screen
eecQaPlugin.recordId = eecQaPlugin.getControl('cboInspectionId').val();  //Makes the inspection ID available to all tests
eecQaPlugin.applyToAll = eecQaPlugin.getControl('chkApplyToAll').prop('checked');
eecQaPlugin.statusCtl = eecQaPlugin.getControl('cboStatus');
