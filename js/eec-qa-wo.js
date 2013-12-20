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

  for (var i=0; i<qaTests.length; i++) {
    $('#eec-qa-tests')
      .append($('<div class="row" />')
        .append($('<label class="field label" />')
          .text(qaTests[i].complete + '/' + qaTests[i].total)
        )
        .append($('<div class="field" />')
          .text($(qaTests[i]).description)
        )
      )
    ;
  }

};

buildQaPlugin();