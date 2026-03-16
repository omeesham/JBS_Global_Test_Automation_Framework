# DRY RUN — Roll Call Mode

This is a pipeline connectivity test. Do NOT perform any real work.

Your job:
1. Confirm you received this prompt
2. Report your agent name and stage
3. Return a JSON response in this exact format:

{"dryRun":true,"stage":"<stage-id>","status":"PRESENT_AND_READY","message":"Roll call received. Passing to next stage.","receivedContext":{"feature":"<echo feature>","module":"<echo module>","intent":"<echo intent>"}}

Do NOT:
- Open any browser
- Create any files
- Run any tests
- Modify any code

Just respond with the JSON above and exit.
