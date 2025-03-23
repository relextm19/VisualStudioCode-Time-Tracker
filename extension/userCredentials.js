const vscode = require('vscode');
const fetch = require('isomorphic-fetch');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Prompts the user for email and password, sends the data to the backend,
 * and stores the credentials in the extension's global state.
 *
 * @param {vscode.ExtensionContext} context
 */

async function promptUserCredentials(context) {
  let email = await promptEmail();
  while (email === null) {
    vscode.window.showErrorMessage('Provide a correct email addres.');
    email = await promptEmail();
  }
  // User cancelled the input
  if (!email) {
    return;
  }
  
  const password = await vscode.window.showInputBox({
    prompt: 'Enter your password',
    placeHolder: 'Password',
    password: true,
    ignoreFocusOut: true,
  });
  
  if (!password) {
    return;
  }
  
  const payload = { email, password };
  
  try {
    await fetch('http://127.0.0.1:8080/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Save credentials for future runs.
    await context.globalState.update('userCredentials', { email, password });
    vscode.window.showInformationMessage('Registration successful.');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to register credentials.');
    console.error('Registration error:', error);
  }
}

async function promptEmail() {
  const email = await vscode.window.showInputBox({
    prompt: 'Enter your email',
    placeHolder: 'Email address',
    ignoreFocusOut: true,
  });
  // If the user cancelled, email will be undefined.
  if (email === undefined) return email;
  
  return emailRegex.test(email) ? email : null;
}

async function checkEmailUsed(email){
  try{
    const response = await fetch('http://127.0.0.1:8080/checkUserExists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
}

module.exports = { promptUserCredentials };
