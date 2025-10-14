const vscode = require('vscode');
const fetch = require('isomorphic-fetch');
const { promptUserCredentials } = require('./userCredentials');

const sessionData = {
    language: '',
    project: '',
    active: false
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
        sessionData.project = getProjectName();
        return startSession(context);
    }
}

let editorChangeTimeout;
function registerEventHandlers(context) {
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            clearTimeout(editorChangeTimeout)
            //set timeout to avoid firing multiple times during one tab change
            editorChangeTimeout = setTimeout(async () => {
                if (!editor) {
                    if (sessionData.active) {
                        console.log('Ending session because editor was closed, session active: ', sessionData.active);
                        await endSession(context);
                        sessionData.language = '';
                        sessionData.project = '';
                    }
                    return;
                }

                // Editor is open get language/project
                const newLanguage = editor.document.languageId;
                const newProject = getProjectName();

                // If language or project changed, start previous session
                if (newLanguage !== sessionData.language || newProject !== sessionData.project) {
                    if (sessionData.active) {
                        console.log("Endind session due to languae/project change, session active: ", sessionData.active)
                        await endSession(context)
                    }
                    sessionData.language = newLanguage;
                    sessionData.project = newProject;
                    if (!sessionData.active) {
                        await startSession(context);
                    }
                }
            }, 150)
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
        sessionData.active = true;
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
        sessionData.active = false;
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
