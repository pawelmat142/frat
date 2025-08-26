---
mode: 'agent'

tools: ['terminalLastCommand ' ]

description: 'Example description'
---
Jesteś ekspertem od programowania. Zrób bardzo dobre review danej klasy ${file}.

<!-- //
mode 	The chat mode to use when running the prompt: ask, edit, or agent (default).

tools 	The list of tools that can be used in agent mode. Array of tool names,
 for example terminalLastCommand or githubRepo. The tool name is shown when you
  type # in the chat input field.
If a given tool is not available, it is ignored when running the prompt.

description 	A short description of the prompt.


Within a prompt file, you can reference variables by using the ${variableName} syntax. You can reference the following variables:

    Workspace variables - ${workspaceFolder}, ${workspaceFolderBasename}
    Selection variables - ${selection}, ${selectedText}
    File context variables - ${file}, ${fileBasename}, ${fileDirname}, ${fileBasenameNoExtension}
    Input variables - ${input:variableName}, ${input:variableName:placeholder} (pass values to the prompt from the chat input field -->