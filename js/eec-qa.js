var eecQaPlugin = {};

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

eecQaPlugin.getStatusLabel = function(test) {
  var label;
  if (test.total > 0) {
    label = test.complete + ' / ' + test.total;
  } else {
    if (test.status == 'pass') {
      label = '\u2611';  //ballot box with check
    } else {
      label = '\u2610';  //blank ballot box
    }
  }
  return label;
};

eecQaPlugin.updateTestView = function(testName) {
  var test = eecQaPlugin.tests[testName];
  var statusView = $(eecQaPlugin.selector + ' #eec-qa-test-' + testName + ' label.eec-qa-status');
  statusView.text(eecQaPlugin.getStatusLabel(test));
  if (test.status == 'pass') {
    statusView
      .addClass('eec-qa-status-pass')
      .removeClass('eec-qa-status-fail')
    ;
  } else {
    statusView
      .addClass('eec-qa-status-fail')
      .removeClass('eec-qa-status-pass')
    ;
  }
};

eecQaPlugin.setTestResults = function(testName, status, complete, total) {
  var test = eecQaPlugin.tests[testName];
  test.status = status;
  if (complete != undefined) { test.complete = complete; }
  if (total) { test.total = total; }
  eecQaPlugin.updateTestView(testName);
};

eecQaPlugin.update = function(tests) {  //TODO: Counts are not accurate for large numbers of thing?  Maybe there's an issue with loading order?

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
  //TODO: Callback?
};

eecQaPlugin.init = function(params) {

  var authenticate = function(callback) {

    var authWithServer = function(callback) {
      eecQaPlugin.callApi('Authentication', 'Authenticate', eecQaPlugin['credentials'], function(data) {
        eecQaPlugin.token = data;
        localStorage.setItem('eec-qa-token', JSON.stringify(eecQaPlugin.token));  //TODO: Use sessionStorage instead?
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

  var control = function() {
    $(eecQaPlugin.statusCtl).focus(function() {
      eecQaPlugin.previousStatus = this.value;
    }).change(function() {
      if (eecQaPlugin.statuses.indexOf(this.value) > -1) {
        var logStatusChange = function(status, fails) {  //TODO: No error handling
          var d = new Date();
          var comment = 'Marked ' + status + ' by ' + eecQaPlugin.getUserName() + ' on ' + d.toString();
          if (fails != null) {
            comment += (' with incomplete QA items: ' + fails.join(', '));
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
            logStatusChange(eecQaPlugin.statusCtl.val());
          } else {
            eecQaPlugin.statusCtl.val(eecQaPlugin.previousStatus);
          }
        } else {
          logStatusChange(eecQaPlugin.statusCtl.val(), null);
        }
      }
    });
  };

  eecQaPlugin.application = params['application'];
  eecQaPlugin.credentials = params['credentials'];
  eecQaPlugin.selector = params['selector'];
  eecQaPlugin.applyToAllMessage = params['applyToAllMessage'];
  eecQaPlugin.statuses = params['statuses'];

  //Start it up!  Easy as (A)BC...
  if (eecQaPlugin.credentials) {
    authenticate(build);
  } else {
    build();
  }
  control();

};
