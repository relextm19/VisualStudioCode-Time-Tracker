const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const { promptUserCredentials } = require('./userCredentials');

let sessionData = {
  language: '',
  project: '',
  startTime: null,
};

async function activate(context) {
  // Prompt for credentials if not already stored.
  const savedCredentials = context.globalState.get('userCredentials');
  if (!savedCredentials) {
    await promptUserCredentials(context);
  }

  await startSession();

  // Check for changes every 2 seconds.
  const interval = setInterval(async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const { newLanguage, newProject, updated } = getUpdatedSessionData();
      if (updated) {
        await endSession();
        sessionData.language = newLanguage;
        sessionData.project = newProject;
        sessionData.startTime = Date.now();
        await startSession();
      }
    } else if (sessionData.language !== '') {
      // No active editor, so end the session.
      await endSession();
      sessionData.language = '';
    }
  }, 2000);

  context.subscriptions.push({
    dispose: () => clearInterval(interval)
  });
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
