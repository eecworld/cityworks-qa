buildQaPlugin = function() {

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
          .append(qaTests[i].complete + '/' + qaTests[i].total)
        )
        .append($('<div class="field" />')
          .append($(qaTests[i]).description)
        )
      )
    ;
  }

};

$(window).load(buildQaPlugin());