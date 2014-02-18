# Outstanding Todo Items

 - Make tests that pass because of 0 items (e.g. no custom inspections needed) look more like "N/A" than "Passed"
 - Prevent status change to COMPLETE
 - Allow users to sign-off on manual override of individual checks before status change?
    - (like a button next to each test that a user could click and it would store their stamp and make the test pass).
        - Would required storing data (but then any override stamping is going to require that anyway)
        - Use universal custom fields? (I think we can send JUST these values via API)
    - OR add to comments
        - Super easy API!  (WorkOrder, AddComments, {'WorkOrderID': '...', 'Comments': 'Signed by ... on ...'})
 - Counts of large items are inaccurate sometimes.  [See Here](https://bitbucket.org/watchstevedrum/sacdou-cityworks-qa-plugin/commits/41bf85e0500e8084d7b061449c033a1af7ad6cb9#Ljs/eec-qa.jsT60)
