import * as vscode from 'vscode';

export function getProjectName(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return '';

    const folder = folders[0];
    const segments = folder.uri.path.split('/');

    return segments[segments.length - 1];
}

export function getFileName(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return '';
    }

    const fullPath = editor.document.fileName;
    return fullPath.split(/[/\\]/).pop() || '';
}

export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
