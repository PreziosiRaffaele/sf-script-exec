import * as path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, type Connection } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-script-exec', 'script.exec');

export type ScriptExecResult = {
  /** The path to the script file that was executed. */
  executedScript: string;
  /** The ID of the target Salesforce org. */
  targetOrg: string;
  /** Indicates whether the script execution was successful. */
  success: boolean;
  /** A summary message. */
  message: string;
  /** Optional message returned by the script. */
  scriptMessage?: string;
};

export default class ScriptExec extends SfCommand<ScriptExecResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    targetusername: Flags.requiredOrg({
      summary: messages.getMessage('flags.targetusername.summary'),
      char: 'o',
      required: true,
    }),
    'script-file': Flags.file({
      summary: messages.getMessage('flags.script-file.summary'),
      char: 'f',
      required: true,
      exists: true,
    }),
    'api-version': Flags.orgApiVersion({
      char: 'a',
      summary: messages.getMessage('flags.api-version.summary'),
      description: messages.getMessage('flags.api-version.description'),
    }),
  };

  public async run(): Promise<ScriptExecResult> {
    const { flags } = await this.parse(ScriptExec);
    const conn = flags.targetusername.getConnection(flags['api-version']);
    const scriptFilePath = flags['script-file'];
    const absoluteScriptPath = path.resolve(scriptFilePath);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const scriptModule: { execute: (conn: Connection) => Promise<{ success: boolean; message?: string }> } =
      await import(absoluteScriptPath);

    // Ensure the script module has an execute function
    if (typeof scriptModule.execute !== 'function') {
      throw messages.createError('error.scriptMissingExecute', [scriptFilePath]);
    }

    const targetOrgIdentifier = flags.targetusername.getOrgId();

    const baseResult = {
      executedScript: scriptFilePath,
      targetOrg: targetOrgIdentifier,
    };

    try {
      // Execute the script passing the jsforce connection
      const result = await scriptModule.execute(conn);

      const successMessage = result.success
        ? `Successfully executed script '${scriptFilePath}' against org '${targetOrgIdentifier}'.`
        : `Script execution failed for '${scriptFilePath}' against org '${targetOrgIdentifier}'.`;

      // Log a human-readable message for non-JSON output
      this.log(successMessage);
      if (result.message) {
        this.log(`Script message: ${result.message}`);
      }

      // Return a structured object for JSON output
      return {
        ...baseResult,
        success: result.success,
        message: successMessage,
        ...(result.message && { scriptMessage: result.message }),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Log a human-readable error message for non-JSON output
      this.log(
        `Failed to execute script '${scriptFilePath}' against org '${targetOrgIdentifier}'. Error: ${errorMessage}`
      );
      // Return a structured object for JSON output
      return {
        ...baseResult,
        success: false,
        message: errorMessage,
      };
    }
  }
}
