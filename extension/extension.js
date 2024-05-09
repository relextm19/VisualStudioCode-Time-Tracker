const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */

let serverOnline = true;
let start;

async function activate(context) {
    let languageName = vscode.window.activeTextEditor.document.languageId;
    let langTime = await getStartingLanguageTime(languageName);
    start = new Date();
    let updated = false;

    let interval = setInterval(async () => {
        if(serverOnline){
            let end = new Date();
            let time = calculateTime(start, end);
            langTime += time;
            if (langTime && languageName) {
                try{
                    await fetch ('http://localhost:5000/updateTime', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 'name': languageName, 'time': langTime })
                    });
                } catch (error) {
                    serverOnline = false;
                    checkServerStatus();
                }
            }
            ({ languageName, updated } = updateLanguageName(languageName));
            if (updated) {
                langTime = await getStartingLanguageTime(languageName);
                updated = false;
            }
            start = new Date();
        }
    }, 1000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(interval);
        }
    });
}

async function getStartingLanguageTime(languageName){
    const response = await fetch('http://localhost:5000/getTime', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': languageName })
    });
    const data = await response.json();
    if (data[200]) {
        return Number(data[200]);
    } else if (data[201]) {
        return 0;
    }
}

function calculateTime(start, end) {
    let timeDiff = Math.round((end.getTime() - start.getTime()) / 1000);
    
    return timeDiff;
}

function updateLanguageName(oldLanguageName){
    let updated = false;
    if (vscode.window.activeTextEditor) {
        let languageName = vscode.window.activeTextEditor.document.languageId;
        if (languageName !== oldLanguageName) {
            updated = true;
        }
        return { languageName, updated };
    }
    return { languageName: null, updated };
}

async function checkServerStatus() {
    try {
        await fetch('http://localhost:5000/updateTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'name': 'test', 'time': 0 })
        });
        start = new Date();
        serverOnline = true;
        return start;
    } catch (error) {
        console.log('Server is offline');
        setTimeout(checkServerStatus, 3000); 
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};