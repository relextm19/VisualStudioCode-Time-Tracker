const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const { promptUserCredentials } = require('./userCredentials');

const sessionData = {
  language: '',
  project: '',
};

async function activate(context) {
  // if (!context.globalState.get('WebSessionToken')) {
  //   await promptUserCredentials(context);
  // }
  await promptUserCredentials(context);
  global.WebSessionToken = context.globalState.get('WebSessionToken');

  // To avoid async problems with the initial session setup
  setTimeout(() => {
    initializeSession(context);
  }, 1000);

  registerEventHandlers(context);
}

function initializeSession(context) {
  const activeEditor = vscode.window.activeTextEditor;
  
  if (activeEditor) {
    sessionData.language = activeEditor.document.languageId;
    sessionData.project = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
    sessionData.startTime = Date.now();
    console.log("Initial session data:", JSON.stringify(sessionData));
    startSession().catch(err => console.error("Error starting initial session:", err));
  }
}

function registerEventHandlers(context) {
  let editorFocusLostTimeout = null;

  context.subscriptions.push(
    // Detect when the active editor changes
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      // Clear any existing timeout to avoid multiple timeouts running
      if (editorFocusLostTimeout) {
        clearTimeout(editorFocusLostTimeout);
        editorFocusLostTimeout = null;
      }

      if (!editor) {
        // Don't end session immediately - wait to see if it's just a file switch
        editorFocusLostTimeout = setTimeout(async () => {
          // After timeout, check if there's still no active editor
          if (!vscode.window.activeTextEditor && sessionData.language !== '') {
            await endSession();
            sessionData.language = '';
            sessionData.project = '';
          } 
        }, 100);
        return;
      }

      // We have a valid editor, proceed with normal processing
      const newLanguage = editor.document.languageId;
      const newProject = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
      
      if (newLanguage !== sessionData.language || newProject !== sessionData.project) {
        // Language or project changed
        if (sessionData.language !== '' && sessionData.project !== '') {
          console.log('Ending session due to language/project change');
          await endSession();
        }
        
        // Update session data
        sessionData.language = newLanguage;
        sessionData.project = newProject;        
        // Start new session
        await startSession();
      }
    }),
  );
}

function getProjectName(rootPath) {
  return rootPath.split('\\').pop();
}

async function startSession() {
  try {
    console.log("Starting session with data:", JSON.stringify(sessionData));
    
    if (!sessionData.language || !sessionData.project) {
      console.warn("Session data is incomplete. Language or project is not set.");
      return;
    }
    
    const payload = {
      language: sessionData.language,
      project: sessionData.project,
      WebSessionToken: global.WebSessionToken,
    };

    const response = await fetch('http://127.0.0.1:8080/api/startSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error starting session:", error);
    return false;
  }
}

async function endSession() {
  try {
    if (!sessionData.language || !sessionData.project) {
      console.warn("Session data is incomplete. Language or project is not set.");
      return;
    }
    
    const payload = {
      language: sessionData.language,
      project: sessionData.project,
      WebSessionToken: global.WebSessionToken,
    };

    const response = await fetch('http://127.0.0.1:8080/api/endSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

function deactivate(context) {
  if (sessionData.language !== '' && sessionData.project !== '') {
    endSession().catch(err => console.error("Error ending session on deactivate:", err));
    context.subscriptions.forEach(subscription => subscription.dispose());
  }
}

module.exports = {
  activate,
  deactivate
};
