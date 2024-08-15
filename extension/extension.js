const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */

let data;


async function activate(context) {
    data = {
        languageName: vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.languageId : "",
        startingTime: Date.now(),
    };
    await startSession();
    const interval = setInterval(async () => {
        if (vscode.window.activeTextEditor) {        
            let { newLanguageName, isUpdated } = updateLanguageName(data.languageName);
            if (isUpdated) {
                await endSession();
                data.languageName = newLanguageName;
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
    let payload = { 
        'language' : data.languageName,
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

function updateLanguageName(oldLanguageName) {
    let languageUpdated = false;
    let newLanguageName = oldLanguageName;

    if (vscode.window.activeTextEditor) {
        newLanguageName = vscode.window.activeTextEditor.document.languageId;
        if (newLanguageName !== oldLanguageName) {
            languageUpdated = true;
        }
    }
    return { newLanguageName, isUpdated: languageUpdated };
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