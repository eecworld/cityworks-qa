/**
 * @module eecQaPlugin
 * @description
 * Adds a "Quality Assurance" pane to Cityworks to run common checks at data entry time against the data entered in
 * work orders and service requests.
 */
var eecQaPlugin = {};

/**
 * @function callApi
 *
 * @description
 * A helper function for making calls to the Cityworks API.  Handles authentication (if necessary) and errors.
 *
 * On success, the 'Value' attribute of the API response is passed as the argument to the callback function as a
 *   JavaScript object.
 * On failure, the error message from the API response is displayed on screen as an alert, and the callback function is
 *   called without any arguments.
 * On an "unauthorized" error response from the Cityworks API (response code 2).  This is not anticipated to ever occur
 *   as this function handles authentication before making any calls.
 *
 * @param {String} service The Cityworks API service to call (e.g. 'WorkOrder')
 * @param {String} method The Cityworks API method to call (e.g. 'ById')
 * @param {Object} parameters A dictionary of the parameters to pass to the Cityworks API (e.g. {'WorkOrderId': '1'}
 * @param {Function} callback A callback function where the results of the API call should be passed
 *
 * @example
 * // Displays the status of Work Order # 1
 * eecQaPlugin.callApi('WorkOrder', 'ById', {'WorkOrderId': '1'}, function(data) { alert(data.Status); });
 */
eecQaPlugin.callApi = function(service, method, parameters, callback) {
  var url = eecQaPlugin.application + '/services/AMS/' + service + '/' + method;
  var data = { data: JSON.stringify(parameters) };
  if (!(service == 'Authentication' && method == 'Authenticate') && eecQaPlugin.credentials) {
    data.token = eecQaPlugin.token['Token'];
  }
  $.get(url, data, function(response) {
    if (response['Status'] == 0) {
      if (typeof callback === 'function') { callback(response['Value']); }
    } else if (response['Status'] == 1) {
      alert('Error calling Cityworks API.  ' + response['Message']);
      if (typeof callback === 'function') { callback(); }
    } else if (response['Status'] == 2) {
      //TODO: Re-Authenticate?  Throw unauthorized error?  Does this happen when they just don't have permissions too?
    }
  });
};

/**
 * @function getStatusLabel
 * @description
 * A helper function to return the proper status symbol for the view based on the test results.  Intended as a private
 * member of this module.
 *
 * @param {Object} test A test object as defined in the WO/SR modules
 * @returns {String} A string representing the result of the test ("x/y", "NA", checked box, unchecked box)
 */
eecQaPlugin.getStatusLabel = function(test) {
  var label;
  if (test.total > 0) {
    label = test.complete + ' / ' + test.total;
  } else {
    if (test.status == 'pass') {
      label = '\u2611';  //ballot box with check
    } else if (test.status == 'na') {
      label = 'NA';
    } else {
      label = '\u2610';  //blank ballot box
    }
  }
  return label;
};

/**
 * @function updateTestView
 * @description
 * A helper function to update the view for the given test with the current results.  Intended as a private member of
 * this module.
 *
 * @param {String} testName Name of the test for which to update the view
 *
 * @example
 * // Updates the view with the current results of the "Labor Entered" test
 * eecQaPlugin.updateTestView('labor');
 */
eecQaPlugin.updateTestView = function(testName) {
  var test = eecQaPlugin.tests[testName];
  var statusView = $(eecQaPlugin.selector + ' #eec-qa-test-' + testName + ' label.eec-qa-status');
  statusView.text(eecQaPlugin.getStatusLabel(test));
  if (test.status == 'pass') {
    statusView
      .addClass('eec-qa-status-pass')
      .removeClass('eec-qa-status-fail')
      .removeClass('eec-qa-status-na')
    ;
  } else if (test.status == 'na') {
    statusView
      .addClass('eec-qa-status-na')
      .removeClass('eec-qa-status-pass')
      .removeClass('eec-qa-status-fail')
  } else {
    statusView
      .addClass('eec-qa-status-fail')
      .removeClass('eec-qa-status-pass')
      .removeClass('eec-qa-status-na')
    ;
  }
};

/**
 * @function setTestResults
 * @description
 * A helper function to set the results and then update the view for the given test.  This function should be called at
 * the end of each test's update() method.
 *
 * @param {String} testName The name of the test for which to update the results
 * @param {String} status The current status of the test ('pass', 'fail', 'na')
 * @param {Number} complete The number of test objects that are complete (if applicable)
 * @param {Number} total The number of total test objects (if applicable)
 *
 * @example
 * // Sets the results of the "Related Inspections Completed" test to "3/5" (not complete)
 * eecQaPlugin.setTestResults('inspections', 'fail', 3, 5);
 */
eecQaPlugin.setTestResults = function(testName, status, complete, total) {
  var test = eecQaPlugin.tests[testName];
  test.status = status;
  if (complete != undefined) { test.complete = complete; }
  if (total) { test.total = total; }
  eecQaPlugin.updateTestView(testName);
};

/**
 * @function update
 * @description
 * Re-runs test(s) by calling the update() method on each test and updates the view with the new results.
 * This function is called during eecQaPlugin.init(), but per the README, this function may also need to be called
 * again at a later point in the document if the document is changed after eecQaPlugin.init() is run in such a way as
 * to make the results of some tests change (e.g. by adding custom fields).
 * 
 * @param {String|Array} [tests] Name (string) or names (array of strings) of the tests to update.  If left empty, all
 *   defined tests will be updated.
 *
 * @example
 * //Updates the "Labor Entered" test
 * eecQaPlugin.update('labor');
 *
 * //Updates the labor, materials, and equipment tests
 * eecQaPlugin.update(['labor', 'materials', 'equipment']);
 *
 * //Updates all tests
 * eecQaPlugin.update();
 */
eecQaPlugin.update = function(tests) {

  if (typeof tests === 'string') { tests = [tests]; }

  var updateTestByName = function(test) {
    eecQaPlugin.tests[test].update();
  };

  if (tests == undefined || tests == null) {
    // Nothing specified.  Update all.
    for (var test in eecQaPlugin.tests) {
      if (eecQaPlugin.tests.hasOwnProperty(test)) {
        updateTestByName(test);
      }
    }
  } else {
    // Tests specified.  Update by name.
    for (var i=0; i<tests.length; i++) {
      if (eecQaPlugin.tests.hasOwnProperty(tests[i])) {
        updateTestByName(tests[i]);
      }
    }
  }
};

/**
 * @function init
 * @description
 * Main function to initialize the plugin.  Should be called as close to the end of the document as possible so that any
 * document content needed to determine the results of the tests has been loaded.  If it is impossible to load all the
 * content before calling this function, eecQaPlugin.update() may also be called at a later time to update the test
 * results with more current information.
 *
 * This function has three parts that are as easy as [A]BC! (Authenticate, Build, Control)  See the separate
 * documentation for each part below.
 *
 * @param {Object} params A parameters object in the form of the following:
 * {
 *   application: "/cityworks",  // The path to your Cityworks instance (with no trailing "/" or "Default.aspx")
 *   selector: "#eec-qa-tests",  // A selector to the DOM location where the tests should be injected.
 *   applyToAllMessage: 'Disabled when "Apply to All" is checked.  Please check your data entry carefully.',  // A message to display when the "Apply to All" checkbox is checked.
 *   statuses: ['COMP']  // An array of status codes that should not be allowed if not all QA tests have passed.
 *   credentials: {      // Exclude this section if injecting into the application (normal).  Only include if used externally
 *     LoginName: "qa",  // A proxy login for the plugin
 *     Password: "qa"    // The password for the proxy login
 *   }
 * }
 *
 * @example
 * //Initializes the QA plugin in the /cityworks application.  The view is injected into the #eec-qa-tests div. The
 * //status dropdown is prevented from being changed to 'COMP' (COMPLETE).  A message is set for when the "Apply to All"
 * //checkbox is used.
 * var qaParams = {
 *   application: "/cityworks",
 *   selector: "#eec-qa-tests",
 *   applyToAllMessage: 'Disabled when "Apply to All" is checked.  Please check your data entry carefully.',
 *   statuses: ['COMP']
 * };
 * eecQaPlugin.init(qaParams);
 */
eecQaPlugin.init = function(params) {

  /**
   * @function init.authenticate
   * @description
   * Uses the credentials passed in the initialization parameters object to authenticate with the server and obtains a
   * token or pulls an old token from localStorage if it exists.  Only needed in configuration option 2 when credentials
   * are passed in.  Intended as a private member of init().
   *
   * @param {Function} callback A callback function to be run once the authentication process has completed.
   *
   * @example
   * //Authenticates and kicks off the build phase when done
   * authenticate(build);
   */
  var authenticate = function(callback) {

    var authWithServer = function(callback) {
      eecQaPlugin.callApi('Authentication', 'Authenticate', eecQaPlugin['credentials'], function(data) {
        eecQaPlugin.token = data;
        localStorage.setItem('eec-qa-token', JSON.stringify(eecQaPlugin.token));
        if (typeof callback === 'function') { callback(); }
      });
    };

    var tokenSave = localStorage.getItem('eec-qa-token');
    if (tokenSave == null) { //TODO: Need better error handling than this.  Basically, if anything goes not perfect,
                             // then re-auth with the server (i.e. don't assume the localStorage value isn't messed up)
      authWithServer(callback);
    } else {
      var token = JSON.parse(tokenSave);  //TODO: Check token with Authentication/Validate service
      if (token['Expires'] < new Date()) {  //TODO: Timezone check
        authWithServer(callback);
      } else {
        eecQaPlugin.token = token;
        if (typeof callback === 'function') { callback(); }
      }
    }
  };

  /**
   * @function init.build
   * @description
   * Builds the view for the QA plugin by constructing a row for each test defined in the WO/SR-specific scripts.  Also
   * renders the current results of each test.  Intended as a private member of init()
   */
  var build = function() {

    if (!eecQaPlugin.applyToAll) {
      for (var testName in eecQaPlugin.tests) {
        if (eecQaPlugin.tests.hasOwnProperty(testName)) {
          var test = eecQaPlugin.tests[testName];
          $(eecQaPlugin.selector)
            .append($('<div id="eec-qa-test-' + testName + '" class="row" />')
              .append($('<label class="field label eec-qa-status" />')
                .text(eecQaPlugin.getStatusLabel(test))
              )
              .append($('<div class="field eec-qa-description" />')
                .text(test.description)
              )
            )
          ;
        }
      }
      eecQaPlugin.update();
    } else {
      $(eecQaPlugin.selector)
        .append($('<div id="eec-qa-na-' + testName + '" class="row" />')
          .text(eecQaPlugin.applyToAllMessage)
        )
      ;
    }
  };

  /**
   * @function init.control
   * @description
   * Initializes additional scripts that need to be added to the document to support the QA plugin.  Currently, that
   * only includes adding a change handler on the "Status" drop down box that warns the user about marking the WO/SR
   * "COMPLETE" without all the tests passing and adds an override note to the comments if the user chooses to allow it.
   */
  var control = function() {
    $(eecQaPlugin.statusCtl).focus(function() {
      eecQaPlugin.previousStatus = this.value;
    }).change(function() {
      if (eecQaPlugin.statuses.indexOf(this.value) > -1) {
        var logStatusChange = function(status, fails) {  //TODO: No error handling
          var d = new Date();
          var comment = 'Marked ' + status + ' by ' + eecQaPlugin.getUserName() + ' on ' + d.toString();
          if (fails != null) {
            var failText = '';
            for (var i=0; i<fails.length; i++) {
              if (failText.length > 0) {
                failText += ', ';
              }
              failText += fails[i].description;
            }
            comment += (' with incomplete QA items: ' + failText);
          }
          eecQaPlugin.addComments(comment);
        };
        var fails = [];
        for (var test in eecQaPlugin.tests) {
          if (eecQaPlugin.tests.hasOwnProperty(test)) {
            if (eecQaPlugin.tests[test].status == 'fail') {
              fails.push(eecQaPlugin.tests[test]);
            }
          }
        }
        if (fails.length > 0) {
          var message = 'The following quality assurance tests have not been passed:\n';
          for (var i=0; i<fails.length; i++) {
            message += '\n - ' + fails[i].description + ': ';
            if (fails[i].hasOwnProperty('complete') && fails[i].hasOwnProperty('total')) {
              message += fails[i].complete + '/' + fails[i].total;
            } else {
              message += 'None';
            }
          }
          message += '\n\nIf this is intentional, click OK to sign off on this and mark this as COMPLETE anyway.';
          var response = confirm(message);
          if (response == true) {
            logStatusChange(eecQaPlugin.statusCtl.val(), fails);
          } else {
            eecQaPlugin.statusCtl.val(eecQaPlugin.previousStatus);
          }
        } else {
          logStatusChange(eecQaPlugin.statusCtl.val(), null);
        }
      }
    });
  };

  //Process initialization parameters
  eecQaPlugin.application = params['application'];
  eecQaPlugin.credentials = params['credentials'];
  eecQaPlugin.selector = params['selector'];
  eecQaPlugin.applyToAllMessage = params['applyToAllMessage'];
  eecQaPlugin.statuses = params['statuses'];

  //Start it up!  Easy as [A]BC...
  if (eecQaPlugin.credentials) {  //Only authenticate if credentials were passed.
    authenticate(build);
  } else {
    build();
  }
  control();

};
