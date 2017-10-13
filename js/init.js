$('.column:first').prepend($('<div class="container" style="width:482px;"><div class="row titleBar" onclick="cw.lm.panel.toggleFromTitle(this);"><img class="toggleButton" src="../Assets/img/layout/s.gif">Quality Assurance</div><div class="row"><div id="eec-qa-tests"></div></div></div>'));

var applicationName = window.location.pathname.split('/');
applicationName = applicationName.splice(0, applicationName.length-2).join('/');

var qaParams = {
  application: applicationName,
  selector: "#eec-qa-tests",
  applyToAllMessage: eecQaPlugin.options.applyToAllMessage,
  statuses: eecQaPlugin.options.statuses,
  tests: eecQaPlugin.options.tests
};

setTimeout(function() {
    eecQaPlugin.init(qaParams);
}, 0);

// Safety run in case there's a race condition with custom required fields being loaded late.
setTimeout(function() {
    eecQaPlugin.update();
}, 5000);
