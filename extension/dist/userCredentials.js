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
exports.promptUserCredentials = void 0;
const vscode = __importStar(require("vscode"));
const fetch = __importStar(require("isomorphic-fetch"));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function promptUserCredentials(context) {
    const choice = await vscode.window.showQuickPick(['Login', 'Register'], { placeHolder: 'Choose an option', ignoreFocusOut: true });
    if (!choice)
        return;
    const email = await promptEmail();
    if (!email)
        return;
    const password = await promptPassword('Enter your password', 'Password');
    if (!password)
        return;
    if (choice === 'Register') {
        const confirmPassword = await promptPassword('Confirm password', 'Confirm password');
        if (confirmPassword !== password) {
            vscode.window.showErrorMessage('Passwords do not match.');
            return;
        }
        await register(email, password, context);
    }
    else {
        await login(email, password, context);
    }
}
exports.promptUserCredentials = promptUserCredentials;
async function promptEmail() {
    const email = await vscode.window.showInputBox({
        prompt: 'Enter your email',
        placeHolder: 'Email address',
        ignoreFocusOut: true,
    });
    if (!email)
        return undefined;
    if (!emailRegex.test(email)) {
        vscode.window.showErrorMessage('Invalid email format.');
        return undefined;
    }
    return email;
}
async function promptPassword(prompt, placeHolder) {
    const password = await vscode.window.showInputBox({
        prompt: prompt,
        placeHolder: placeHolder,
        password: true,
        ignoreFocusOut: true,
    });
    return password;
}
async function login(email, password, context) {
    const token = await authenticate('login', email, password);
    if (token) {
        await context.globalState.update('WebSessionToken', token);
        vscode.window.showInformationMessage('Login successful.');
    }
}
async function register(email, password, context) {
    const token = await authenticate('register', email, password);
    if (token) {
        await context.globalState.update('WebSessionToken', token);
        vscode.window.showInformationMessage('Account registered.');
    }
}
async function authenticate(endpoint, email, password) {
    const payload = { email, password };
    try {
        const request = await fetch.default(`http://127.0.0.1:42069/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!request.ok) {
            vscode.window.showErrorMessage(endpoint === 'login' ? 'Invalid email or password' : 'Something went wrong. Please try again.');
            return null;
        }
        const response = await request.json();
        if (!response.token) {
            vscode.window.showErrorMessage(`${endpoint === 'login' ? 'Login' : 'Registration'} failed. Please check your credentials.`);
            return null;
        }
        return response.token;
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to ${endpoint}`);
        console.error(`${endpoint} error:`, error);
        return null;
    }
}
