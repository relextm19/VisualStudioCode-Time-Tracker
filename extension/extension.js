const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */

let data;


async function activate(context) {
    data = {
        languageName: vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.languageId : "",
        projectName: vscode.workspace.rootPath ? vscode.workspace.rootPath.split('\\').pop() : "",
        startingTime: Date.now(),
    };
    await startSession();
    const interval = setInterval(async () => {
        if (vscode.window.activeTextEditor) {        
            let { newLanguageName, newProjectName, updated } = updateData();
            if (updated) {
                await endSession();
                data.languageName = newLanguageName;
                data.projectName = newProjectName;
                data.startingTime = Date.now();
                await startSession();
            }
        } else{
            if(data.languageName !== ""){
                await endSession();
                data.languageName = "";
            }
        }
    }, 2000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(interval);
        }
    });
}

async function startSession() {
    console.log("start session");
    let payload = { 
        'language' : data.languageName,
        'project' : data.projectName,
        'startTime' : data.startingTime,
        'startDate': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long',   day: 'numeric', timeZone: 'Europe/Warsaw' }),
    }
    await fetch('http://127.0.0.1:5000/startSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

async function endSession() {
    let payload = {
        'language': data.languageName,
        'project': data.projectName,
        'endTime': Date.now(),
        'endDate': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long',   day: 'numeric', timeZone: 'Europe/Warsaw' }),
    }
    await fetch('http://127.0.0.1:5000/endSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

function updateData() {
    let updated = false;
    let newLanguageName, newProjectName;

    if (vscode.window.activeTextEditor) {
        newLanguageName = vscode.window.activeTextEditor.document.languageId;
        newProjectName = vscode.workspace.rootPath.split('\\').pop();
        if(newLanguageName !== data.languageName) console.log("lang updated");
        if(newProjectName !== data.projectName){
            console.log(newProjectName, data.projectName);
        }
        if (newLanguageName !== data.languageName || newProjectName !== data.projectName) {
            updated = true;
        }
    }
    return { newLanguageName, newProjectName, updated };
}


async function deactivate() {
    if (data.languageName !== "") {
        await endSession();
    }
}

module.exports = {
    activate,
    deactivate
};