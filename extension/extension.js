const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const path = require('path')
const { promptUserCredentials } = require('./userCredentials');

const sessionData = {
    language: '',
    project: '',
};

async function activate(context) {
    console.log(context.globalState.get('WebSessionToken'))
    if (!context.globalState.get('WebSessionToken')) {
        await promptUserCredentials(context);
    }

    await initializeSession(context);

    registerEventHandlers(context);
}

function initializeSession(context) {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        sessionData.language = activeEditor.document.languageId;
        sessionData.project = vscode.workspace.rootPath ? getProjectName(vscode.workspace.rootPath) : '';
        sessionData.startTime = Date.now();
        return startSession(context);
    }
}

function registerEventHandlers(context) {
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            // If editor is closed or no editor is active
            if (!editor) {
                if (sessionData.language !== '' && sessionData.project !== '') {
                    console.log('Ending session because editor was closed');
                    await endSession(context);
                    sessionData.language = '';
                    sessionData.project = '';
                }
                return;
            }

            // Editor is open get language/project
            const newLanguage = editor.document.languageId;
            const newProject = getProjectName();

            // If language or project changed, end previous session
            if (newLanguage !== sessionData.language || newProject !== sessionData.project) {
                if (sessionData.language !== '' && sessionData.project !== '') {
                    console.log('Ending session due to language/project change');
                    await endSession(context);
                }

                sessionData.language = newLanguage;
                sessionData.project = newProject;

                console.log('Starting new session');
                await startSession(context);
            }
        })
    );
}

function getProjectName() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return ''; // no workspace open

    const folder = folders[0];
    const segments = folder.uri.path.split('/');

    return segments[segments.length - 1];
}

async function startSession(context) {
    try {
        if (!sessionData.language || !sessionData.project) {
            console.warn("Session data is incomplete. Language or project is not set.");
            return;
        }

        const payload = {
            language: sessionData.language,
            project: sessionData.project,
        };
        console.log(context.globalState.get('WebSessionToken'))
        const response = await fetch('http://127.0.0.1:8080/api/startSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.globalState.get('WebSessionToken')}`
            },
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

async function endSession(context) {
    try {
        if (!sessionData.language || !sessionData.project) {
            console.warn("Session data is incomplete. Language or project is not set.");
            return;
        }

        const payload = {
            language: sessionData.language,
            project: sessionData.project,
        };

        const response = await fetch('http://127.0.0.1:8080/api/endSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.globalState.get('WebSessionToken')}`
            },
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
        endSession(context);
    }
    context.subscriptions.forEach(subscription => subscription.dispose());
}

module.exports = {
    activate,
    deactivate
};
