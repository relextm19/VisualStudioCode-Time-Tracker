"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fetch = __importStar(require("isomorphic-fetch"));
const userCredentials_1 = require("./userCredentials");
const helper_1 = require("./helper");
const sessionData = {
    language: '',
    project: '',
    fileName: '',
    active: false,
    startTime: null
};
let editorChangeTimeout;
async function activate(context) {
    console.log(context.globalState.get('WebSessionToken'));
    if (!context.globalState.get('WebSessionToken')) {
        await (0, userCredentials_1.promptUserCredentials)(context);
    }
    initializeSession();
    registerEventHandlers(context);
}
exports.activate = activate;
function initializeSession() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        startSession(activeEditor.document.languageId, (0, helper_1.getProjectName)(), activeEditor.document.fileName);
    }
}
function registerEventHandlers(context) {
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editorChangeTimeout) {
            clearTimeout(editorChangeTimeout);
        }
        editorChangeTimeout = setTimeout(() => {
            handleEditorChange(context, editor);
        }, 150);
    }));
}
function handleEditorChange(context, editor) {
    if (!editor) {
        if (sessionData.active) {
            console.log('Ending session because editor was closed, session active:', sessionData.active);
            saveSession(context);
        }
        resetSession();
        return;
    }
    const newLanguage = editor.document.languageId;
    const newProject = (0, helper_1.getProjectName)();
    const newFileName = (0, helper_1.getFileName)();
    if (newLanguage !== sessionData.language || newProject !== sessionData.project || newFileName !== sessionData.fileName) {
        if (sessionData.active) {
            console.log('Ending session due to language/project/file change, session active:', sessionData.active);
            saveSession(context);
            resetSession();
        }
        startSession(newLanguage, newProject, newFileName);
    }
}
function startSession(language, project, fileName) {
    sessionData.language = language;
    sessionData.project = project;
    sessionData.fileName = fileName;
    sessionData.startTime = new Date();
    sessionData.active = true;
}
function saveSession(context) {
    if (!sessionData.startTime) {
        console.warn('No active session to save.');
        resetSession();
        return;
    }
    const endTime = new Date();
    const payload = {
        startDate: (0, helper_1.formatDate)(sessionData.startTime),
        startTime: Math.floor(sessionData.startTime.getTime() / 1000),
        endDate: (0, helper_1.formatDate)(endTime),
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
function resetSession() {
    sessionData.language = '';
    sessionData.project = '';
    sessionData.fileName = '';
    sessionData.active = false;
    sessionData.startTime = null;
}
function deactivate(context) {
    if (sessionData.active) {
        saveSession(context);
    }
    context.subscriptions.forEach(subscription => subscription.dispose());
}
exports.deactivate = deactivate;
