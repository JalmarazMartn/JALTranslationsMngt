// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposableBeginTrans = vscode.commands.registerCommand('JAMALUtilities.BeginTrans', function () {
		const translation = require('./src/translations.js');		
		translation.InitTranslation();
	});
	context.subscriptions.push(disposableBeginTrans);	
	let LoadPreviousTrans = vscode.commands.registerCommand('JAMALUtilities.LoadPreviousTrans', function () {
		const translation = require('./src/translations.js');		
		translation.LoadPreviousTRanslation();
	});
	context.subscriptions.push(LoadPreviousTrans);

	let disposableEditTrans = vscode.commands.registerCommand('JAMALUtilities.EditTrans', function () {
		const translation = require('./src/translations.js');		
		translation.EditTranslation();
	});
	context.subscriptions.push(disposableEditTrans);	

	let disposableSaveTrans = vscode.commands.registerCommand('JAMALUtilities.SaveTrans', function () {
		const translation = require('./src/translations.js');		
		translation.SaveTranslation();
	});
	context.subscriptions.push(disposableSaveTrans);	
}
// @ts-ignore
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	// @ts-ignore
	activate,
	deactivate
}
