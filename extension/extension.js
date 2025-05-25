const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const { promptUserCredentials } = require('./userCredentials');

const sessionData = {
  language: '',
  project: '',
  startTime: null,
  startDate: '',
};

async function activate(context) {
  const savedCredentials = context.globalState.get('userCredentials');
  if (!savedCredentials) {
    await promptUserCredentials(context);
  }

  // To avoid async problems with the initial session setup
  setTimeout(() => {
    initializeSession();
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
    startSession(context).catch(err => console.error("Error starting initial session:", err));
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
            sessionData.startTime = null;
            sessionData.startDate = '';
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
        sessionData.startTime = Date.now();
        sessionData.startDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Europe/Warsaw'
        });
        
        // Start new session
        await startSession(context);
      }
    }),
  );
}

function getProjectName(rootPath) {
  return rootPath.split('\\').pop();
}

async function startSession(context) {
  try {
    console.log("Starting session with data:", JSON.stringify(sessionData));
    
    if (!sessionData.language || !sessionData.project) {
      console.warn("Session data is incomplete. Language or project is not set.");
      return;
    }
    
    const payload = {
      language: sessionData.language,
      project: sessionData.project,
      userId: context.globalState.get('userCredentials').token,
      startTime: sessionData.startTime,
      startDate: sessionData.startDate
    };

    const response = await fetch('http://127.0.0.1:8080/startSession', {
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
      endTime: Date.now(),
      endDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Warsaw'
      }),
    };

    const response = await fetch('http://127.0.0.1:8080/endSession', {
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

module.exports = {
  activate,
};
