/**
 * Created by steve on 12/20/13.
 */

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