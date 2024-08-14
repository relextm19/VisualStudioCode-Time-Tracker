const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */

let language;


async function activate(context) {
    language = {
        name: vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.languageId : "",
        startingTime: Date.now(),
    };
    await startSession(language.name);
    const interval = setInterval(async () => {
        if (vscode.window.activeTextEditor) {        
            let { newLanguageName, isUpdated } = updateLanguageName(language.name);
            if (isUpdated) {
                await endSession(language.name);
                language.name = newLanguageName;
                language.startingTime = Date.now();
                await startSession(language.name);
            }
        } else{
            if(language.name !== ""){
                await endSession(language.name);
                language.name = "";
            }
        }
    }, 2000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(interval);
        }
    });
}

async function startSession(newLanguageName) {
    let data = { 
        'name' : newLanguageName,
        'startTime' : language.startingTime,
        'startDate': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long',   day: 'numeric', timeZone: 'Europe/Warsaw' }),
    }
    await fetch('http://127.0.0.1:5000/startSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

async function endSession(languageName) {
    let data = {
        'name': languageName,
        'endTime': Date.now(),
        'endDate': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long',   day: 'numeric', timeZone: 'Europe/Warsaw' }),
    }
    await fetch('http://127.0.0.1:5000/endSession', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    if (language.name !== "") {
        await endSession(language.name);
    }
}

module.exports = {
    activate,
    deactivate
};