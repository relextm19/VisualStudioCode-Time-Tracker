import * as vscode from 'vscode';
import * as fetch from 'isomorphic-fetch';
import { promptUserCredentials } from './userCredentials';
import { getProjectName, formatDate, getFileName } from './helper';

interface SessionData {
    language: string;
    project: string;
    fileName: string;
    active: boolean;
    startTime: Date | null;
}

const sessionData: SessionData = {
    language: '',
    project: '',
    fileName: '',
    active: false,
    startTime: null
};

let editorChangeTimeout: NodeJS.Timeout | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log(context.globalState.get('WebSessionToken'));
    if (!context.globalState.get('WebSessionToken')) {
        await promptUserCredentials(context);
    }

    initializeSession();
    registerEventHandlers(context);
}

function initializeSession(): void {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        startSession(
            activeEditor.document.languageId,
            getProjectName(),
            activeEditor.document.fileName
        );
    }
}

function registerEventHandlers(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editorChangeTimeout) {
                clearTimeout(editorChangeTimeout);
            }
            editorChangeTimeout = setTimeout(() => {
                handleEditorChange(context, editor);
            }, 150);
        })
    );
}

function handleEditorChange(context: vscode.ExtensionContext, editor: vscode.TextEditor | undefined): void {
    if (!editor) {
        if (sessionData.active) {
            console.log('Ending session because editor was closed, session active:', sessionData.active);
            saveSession(context);
        }
        resetSession()
        return;
    }

    const newLanguage = editor.document.languageId;
    const newProject = getProjectName();
    const newFileName = getFileName();

    if (newLanguage !== sessionData.language || newProject !== sessionData.project || newFileName !== sessionData.fileName) {
        if (sessionData.active) {
            console.log('Ending session due to language/project/file change, session active:', sessionData.active);
            saveSession(context);
            resetSession()
        }
        startSession(newLanguage, newProject, newFileName);
    }
}

function startSession(language: string, project: string, fileName: string): void {
    sessionData.language = language;
    sessionData.project = project;
    sessionData.fileName = fileName;
    sessionData.startTime = new Date();
    sessionData.active = true;
}

function saveSession(context: vscode.ExtensionContext): void {
    if (!sessionData.startTime) {
        console.warn('No active session to save.');
        resetSession();
        return;
    }

    const endTime = new Date();
    const payload = {
        startDate: formatDate(sessionData.startTime),
        startTime: Math.floor(sessionData.startTime.getTime() / 1000),
        endDate: formatDate(endTime),
        endTime: Math.floor(endTime.getTime() / 1000),
        projectName: sessionData.project,
        fileName: sessionData.fileName,
        languageName: sessionData.language,
    };

    fetch.default('http://127.0.0.1:42069/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.globalState.get('WebSessionToken')}`
        },
        body: JSON.stringify(payload),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    }).catch(error => {
        console.error('Error saving session:', error);
    });
}

function resetSession(): void {
    sessionData.language = '';
    sessionData.project = '';
    sessionData.fileName = '';
    sessionData.active = false;
    sessionData.startTime = null;
}

export function deactivate(context: vscode.ExtensionContext): void {
    if (sessionData.active) {
        saveSession(context);
    }
    context.subscriptions.forEach(subscription => subscription.dispose());
}
