function buildQaPlugin() {

  var qaTests = [
    'tasks',
    'inspections',
    'customFields',
    'requiredFields',
    'labor',
    'equipment',
    'materials'
  ];

  for (var i=0; i<qaTests.length; i++) {
    $('#eec-qa-tests').append(qaTests[i]);
  }

}

$(document).ready(buildQaPlugin());