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
  const choice = await vscode.window.showQuickPick(
    ['Login', 'Register'],
    {placeHolder: 'Choose an option',  ignoreFocusOut: true}
  );
  if(!choice) return;
  let email, password;
  while(true){
    email = await promptEmail();
    if (email === '') { 
      vscode.window.showErrorMessage('Invalid email format. Please try again.');
      continue;
    } else if (email === undefined) {
      return;
    } 

    password = await promptPassword();
    if (password === '') { //pasword empty could be a mistake so we try again
      vscode.window.showErrorMessage('Password is required.');
      continue;
    }
    if (password === undefined) {
      return;
    }
    if(choice === 'Register'){
      if(await promptPassword('Confirm password') !== password){
        vscode.window.showErrorMessage('Passwords do not match. Please try again.');
        continue;
      }
      await register(email, password, context);
      return;
    }else{
      login(email, password, context);
      return;
    }
  }
}



async function promptEmail() {
  const email = await vscode.window.showInputBox({
    prompt: 'Enter your email',
    placeHolder: 'Email address',
    ignoreFocusOut: true,
  });
  // If the user cancelled, email will be undefined.
  if (email === undefined) return undefined;
  
  return emailRegex.test(email) ? email : null;
}

async function promptPassword(prompt, placeHolder) {
  const password = await vscode.window.showInputBox({
    prompt: prompt || 'Enter your password',
    placeHolder: placeHolder || 'Password',
    password: true,
    ignoreFocusOut: true,
  });
  
  return password;
}

async function login(email, password, context) {
  const payload = { email, password };
  try {
    const request = await fetch('http://127.0.0.1:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if(!request.ok){
      vscode.window.showErrorMessage('Invalid email or password');
      return false;
    }
    const response = await request.json();
    console.log(response)
    // If the response does not contain a token login failed.
    if (!response.WebSessionToken) {
      vscode.window.showErrorMessage('Login failed. Please check your credentials.');
      return false;
    }
    // Save credentials for future runs.
    await context.globalState.update('WebSessionToken', response.WebSessionToken);
    vscode.window.showInformationMessage('Login successful.');
    return true;
  } catch (error) {
    vscode.window.showErrorMessage('Failed to login');
    console.error('Login error:', error);
    return false;
  }
}
async function register(email, password, context) {
  const payload = { email, password };
  try {
    const request = await fetch('http://127.0.0.1:8080/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if(!request.ok){
      vscode.window.showErrorMessage('Something went wrong. Please try again.'); 
      return false;
    }
    const response = await request.json();
    // If the response does not contain a token registration failed.
    if (!response.WebSessionToken) {
      vscode.window.showErrorMessage('Registration failed. Please check your credentials.');
      return false;
    }
    // Save credentials for future runs.
    await context.globalState.update('user_id', response.WebSessionToken);
    vscode.window.showInformationMessage('Account registered.');
    return true;
  } catch (error) {
    vscode.window.showErrorMessage('Failed to register account');
    return false;
  }
}


module.exports = { promptUserCredentials };
