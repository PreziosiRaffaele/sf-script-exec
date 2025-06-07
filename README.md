# sf-script-exec

A Salesforce CLI plugin to execute data cleaning and maintenance scripts on Salesforce orgs.

## Install

```bash
sf plugins install sf-script-exec
```

## Usage

This plugin allows you to execute custom scripts against Salesforce orgs for data cleaning and maintenance activities. Scripts must export an `execute` function that receives a jsforce connection object.

### Script Format

Your script file should follow this format:

```javascript
export async function execute(conn) {
  // Your script logic here
  // conn is a jsforce connection object

  return {
    success: true,
    message: 'Optional success message',
  };
}
```

### Example Script

```javascript
export async function execute(conn) {
  try {
    // Query some records
    const result = await conn.query('SELECT Id, Name FROM Account LIMIT 10');

    // Process the records
    console.log(`Found ${result.totalSize} accounts`);

    return {
      success: true,
      message: `Processed ${result.totalSize} accounts successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
```

## Commands

- [`sf script exec`](#sf-script-exec)

### `sf script exec`

Execute a script against a Salesforce org.

```
USAGE
  $ sf script exec -o <targetusername> -f <script-file> [--json] [-a <api-version>]

FLAGS
  -o, --targetusername=<value>  (required) Salesforce username for the target org
  -f, --script-file=<value>     (required) Path to the script file to execute
  -a, --api-version=<value>     API version for the Salesforce connection

GLOBAL FLAGS
  --json  Format output as json

DESCRIPTION
  Execute a script against a Salesforce org for data cleaning and maintenance activities.

EXAMPLES
  Execute a script against an org:

    $ sf script exec -o myorg@example.com -f ./scripts/cleanup.js

  Execute with specific API version:

    $ sf script exec -o myorg@example.com -f ./scripts/cleanup.js -a 58.0
```
