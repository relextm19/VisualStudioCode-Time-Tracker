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
  // for testing purposes
  await context.globalState.update('userCredentials', undefined);
  vscode.window.showInformationMessage('Stored credentials cleared.');
  let email = await promptEmail();
  while (email === null) {
    vscode.window.showErrorMessage('Provide a correct email addres.');
    email = await promptEmail();
  }
  // User cancelled the input
  if (!email) {
    return;
  }

  const emailUsed = await checkEmailUsed(email);
  if(emailUsed){
    const password = await vscode.window.showInputBox({
      prompt: 'Enter your password',
      placeHolder: 'Password',
      password: true,
      ignoreFocusOut: true,
    });
    
    if (!password) {
      return;
    }
    
    login(email, password, context);
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
    const data = await response.json();
    return data['exists'];
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
}

async function login(email, password, context) {
  const payload = { email, password };
  try {
    await fetch('http://127.0.0.1:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Save credentials for future runs.
    await context.globalState.update('userCredentials', { email, password });
    vscode.window.showInformationMessage('Login successful.');
  } catch (error) {
    vscode.window.showErrorMessage('Failed to login');
    console.error('Login error:', error);
  }
}


module.exports = { promptUserCredentials };
