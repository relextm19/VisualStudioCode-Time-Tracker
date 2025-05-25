const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const { promptUserCredentials } = require('./userCredentials');

const sessionData = {
  language: '',
  project: '',
  startTime: null,
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

function initializeSession() {
  const activeEditor = vscode.window.activeTextEditor;
  console.log("Active editor on init:", activeEditor ? activeEditor.document.fileName : "No active editor");
  
  if (activeEditor) {
    sessionData.language = activeEditor.document.languageId;
    sessionData.project = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
    sessionData.startTime = Date.now();
    console.log("Initial session data:", JSON.stringify(sessionData));
    startSession().catch(err => console.error("Error starting initial session:", err));
  }
}

function registerEventHandlers(context) {
  context.subscriptions.push(
    // Detect when the active editor changes
    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) {
        // Editor was closed or focus moved away from editors
        if (sessionData.language !== '') {
          await endSession();
          sessionData.language = '';
          sessionData.project = '';
        }
        return;
      }

      const newLanguage = editor.document.languageId;
      const newProject = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
      console.log('Old Language:', sessionData.language, 'New Language:', newLanguage);
      console.log('Old Project:', sessionData.project, 'New Project:', newProject);
      console.log(sessionData)
      if (newLanguage !== sessionData.language || newProject !== sessionData.project) {
        // Language or project changed
        if (sessionData.language !== '') {
          await endSession();
        }
        sessionData.language = newLanguage;
        sessionData.project = newProject;
        sessionData.startTime = Date.now();
        await startSession();
      }
    }),
  );
}

function getProjectName(rootPath) {
  return rootPath.split('\\').pop();
}

// Checks if the language or project has changed.
function getUpdatedSessionData() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return { newLanguage: '', newProject: '', updated: false };
  }
  const newLanguage = activeEditor.document.languageId;
  const newProject = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
  const updated = newLanguage !== sessionData.language || newProject !== sessionData.project;
  return { newLanguage, newProject, updated };
}

async function startSession() {
  const payload = {
    language: sessionData.language,
    project: sessionData.project,
    startTime: sessionData.startTime,
    startDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Warsaw'
    }),
  };

  await fetch('http://127.0.0.1:8080/startSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function endSession() {
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

  await fetch('http://127.0.0.1:8080/endSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function deactivate() {
  if (sessionData.language !== '') {
    await endSession();
  }
}

module.exports = {
  activate,
  deactivate,
};
