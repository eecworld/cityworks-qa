var buildQaPlugin = function() {

  var qaTests = {
    tasks: {
      status: true,
      complete: 2,
      total: 4,
      description: 'Tasks Complete'
    },
    inspections: {

    },
    customFields: {

    },
    requiredFields: {

    },
    labor: {

    },
    equipment: {

    },
    materials: {

    }
  };

  for (var test in qaTests) {
    if (qaTests.hasOwnProperty(test)) {
      $('#eec-qa-tests')
        .append($('<div class="row" />')
          .append($('<label class="field label" />')
            .text(qaTests[test].complete + '/' + qaTests[test].total)
          )
          .append($('<div class="field" />')
            .text(qaTests[test].description)
          )
        )
      ;
    }
  }

};

buildQaPlugin();