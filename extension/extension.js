const vscode = require('vscode');
require('isomorphic-fetch');

/**
 * @param {vscode.ExtensionContext} context
 */

let language;
let project;
let failedToSend = [];

async function activate(context) {
    language = {
        name: vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.languageId : "",
        startingTime: Date.now(),
    };
    project = {
        name: vscode.workspace ? vscode.workspace.name : "",
        startingTime: Date.now(),
    };
    await updateCurrentLanguage();

    setInterval( async () =>{
        if (vscode.window.activeTextEditor) {        
            let { languageName, languageUpdated } = updateLanguageName(language.name);
            if (languageUpdated) {
                await updateCurrentLanguage();

                await sendLanguageData();

                language.name = languageName;
                language.startingTime = Date.now();
            }

            let { projectName, projectUpdated } = updateProjectName(project.name);
            if (projectUpdated) {
                await sendProjectData();

                project.name = projectName;
                project.startingTime = Date.now();
            }

            await sendUnsedData(failedToSend);
        } else{

        }
    }, 2000);

    context.subscriptions.push({
        dispose: () => {
        }
    });
}

function calculateTime(start, end) {
    let timeDiff = Math.round((end - start) / 1000);
    
    return timeDiff;
}

function updateLanguageName(oldLanguageName){
    let languageUpdated = false;
    if (vscode.window.activeTextEditor) {
        let languageName = vscode.window.activeTextEditor.document.languageId;
        if (languageName !== oldLanguageName) {
            languageUpdated = true;
        }
        return { languageName, languageUpdated };
    }
    return { languageName: null, languageUpdated };
}

function updateProjectName(oldProjectName) {
    let projectUpdated = false;
    if (vscode.workspace.name) {
        let projectName = vscode.workspace.name;
        if (projectName !== oldProjectName) {
            projectUpdated = true;
        }
        return { projectName, projectUpdated};
    }
    return { projectName: null,  projectUpdated };
}

async function sendUnsedData(failedToSend) {
    failedToSend.forEach(async (data) => {
        await fetch('http://localhost:5000/updateLangTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'name': data.name, 'time': data.time })
        });
    });
}

async function sendLanguageData() {
    let time = calculateTime(language.startingTime, Date.now());
    try{
        await fetch("http://localhost:5000/updateLangTime", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: language.name, time: time }),
        });
    } catch (error) {
        failedToSend.push({ 'name': language.name, 'time': time });
    }
}

async function sendProjectData() {
    let time = calculateTime(project.startingTime, Date.now());

    try{
        await fetch("http://localhost:5000/updateProjectTime", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: project.name, time: time }),
        });
    } catch (error) {
        failedToSend.push({ 'name': project.name, 'time': time });
    }
}

async function updateCurrentLanguage(ended) {
    if (ended){
        await fetch('http://localhost:5000/updateActiveLanguage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'name': 'None' })
        });
    }
    let languageName = vscode.window.activeTextEditor.document.languageId;
    await fetch('http://localhost:5000/updateActiveLanguage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': languageName })
    });
}

async function deactivate() {
    let ended = true;
    await updateCurrentLanguage(ended);
    
    await sendLanguageData();
    await sendProjectData();
}

module.exports = {
    activate,
    deactivate
};