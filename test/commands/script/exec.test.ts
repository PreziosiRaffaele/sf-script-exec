import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import ScriptExec from '../../../src/commands/script/exec.js';

describe('script exec', () => {
  const $$ = new TestContext();
  let testOrg = new MockTestOrgData();

  beforeEach(() => {
    testOrg = new MockTestOrgData();
    testOrg.orgId = '00Dxx0000000000';
  });

  afterEach(() => {
    $$.restore();
  });

  it('executes script successfully', async () => {
    await $$.stubAuths(testOrg);

    const result = await ScriptExec.run([
      '--targetusername',
      'test-org',
      '--script-file',
      'test/fixtures/test-script.js',
    ]);

    expect(result.success).to.be.true;
    expect(result.scriptMessage).to.equal('Test script executed successfully');
  });
});
