import * as vscode from 'vscode';
import * as fetch from 'isomorphic-fetch';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function promptUserCredentials(context: vscode.ExtensionContext): Promise<void> {
    const choice = await vscode.window.showQuickPick(
        ['Login', 'Register'],
        { placeHolder: 'Choose an option', ignoreFocusOut: true }
    );
    if (!choice) return;

    const email = await promptEmail();
    if (!email) return;

    const password = await promptPassword('Enter your password', 'Password');
    if (!password) return;

    if (choice === 'Register') {
        const confirmPassword = await promptPassword('Confirm password', 'Confirm password');
        if (confirmPassword !== password) {
            vscode.window.showErrorMessage('Passwords do not match.');
            return;
        }
        await register(email, password, context);
    } else {
        await login(email, password, context);
    }
}

async function promptEmail(): Promise<string | undefined> {
    const email = await vscode.window.showInputBox({
        prompt: 'Enter your email',
        placeHolder: 'Email address',
        ignoreFocusOut: true,
    });
    if (!email) return undefined;
    if (!emailRegex.test(email)) {
        vscode.window.showErrorMessage('Invalid email format.');
        return undefined;
    }
    return email;
}

async function promptPassword(prompt: string, placeHolder: string): Promise<string | undefined> {
    const password = await vscode.window.showInputBox({
        prompt: prompt,
        placeHolder: placeHolder,
        password: true,
        ignoreFocusOut: true,
    });
    return password;
}

async function login(email: string, password: string, context: vscode.ExtensionContext): Promise<void> {
    const token = await authenticate('login', email, password);
    if (token) {
        await context.globalState.update('WebSessionToken', token);
        vscode.window.showInformationMessage('Login successful.');
    }
}

async function register(email: string, password: string, context: vscode.ExtensionContext): Promise<void> {
    const token = await authenticate('register', email, password);
    if (token) {
        await context.globalState.update('WebSessionToken', token);
        vscode.window.showInformationMessage('Account registered.');
    }
}

async function authenticate(endpoint: 'login' | 'register', email: string, password: string): Promise<string | null> {
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
        const response = await request.json() as { token?: string };
        if (!response.token) {
            vscode.window.showErrorMessage(`${endpoint === 'login' ? 'Login' : 'Registration'} failed. Please check your credentials.`);
            return null;
        }
        return response.token;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to ${endpoint}`);
        console.error(`${endpoint} error:`, error);
        return null;
    }
}
