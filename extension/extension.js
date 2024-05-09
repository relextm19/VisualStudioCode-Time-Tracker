const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    

    let languageName = vscode.window.activeTextEditor.document.languageId;
    let langTime = await getStartingLanguageTime(languageName);
    let start = new Date();
    let updated = false;

    let interval = setInterval(async () => {
        let time = calculateTime(start);
        langTime += time;
        
        if (langTime && languageName) {
            await fetch ('http://localhost:5000/updateTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'name': languageName, 'time': langTime })
            });
        }
        ({ languageName, updated } = updateLanguageName(languageName));
        if (updated) {
            langTime = await getStartingLanguageTime(languageName);
            updated = false;
        }
        start = new Date();
    }, 3000);

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

function calculateTime(start) {
    let end = new Date();
    let timeDiff = Math.round((end.getTime() - start.getTime()) / 1000);
    
    return timeDiff;
}

function updateLanguageName(oldLanguageName){
    let updated = false;
    if (vscode.window.activeTextEditor) {
        let languageName = vscode.window.activeTextEditor.document.languageId;
        if (languageName !== oldLanguageName && languageName !== 'plaintext') {
            updated = true;
        }
        return { languageName, updated };
    }
    return { languageName: null, updated };
}
function deactivate() {}

module.exports = {
    activate,
    deactivate
};