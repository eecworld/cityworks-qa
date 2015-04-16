$('.column:first').prepend($('<div class="container" style="width:482px;"><div class="row titleBar" onclick="cw.lm.panel.toggleFromTitle(this);"><img class="toggleButton" src="../Assets/img/layout/s.gif">Quality Assurance</div><div class="row"><div id="eec-qa-tests"></div></div></div>'));

var applicationName = window.location.pathname.split('/');
applicationName = applicationName.splice(0, applicationName.length-2).join('/');
var qaParams = {
  application: applicationName,
  selector: "#eec-qa-tests",
  applyToAllMessage: 'Disabled when "Apply to All" is checked.  Please check your data entry carefully.',
  statuses: ['COMPLETE']  //TODO: Pull these out as options
};
setTimeout(function() {eecQaPlugin.init(qaParams); }, 0);
