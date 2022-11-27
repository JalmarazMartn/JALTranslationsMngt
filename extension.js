// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposableBeginTrans = vscode.commands.registerCommand('JAMALTranslation.BeginTrans', function () {
		const translation = require('./src/translations.js');		
		translation.InitTranslation();
	});
	context.subscriptions.push(disposableBeginTrans);	
	let LoadPreviousTrans = vscode.commands.registerCommand('JAMALTranslation.LoadPreviousTrans', function () {
		const translation = require('./src/translations.js');		
		translation.LoadPreviousTRanslation();
	});
	context.subscriptions.push(LoadPreviousTrans);

	let disposableEditTrans = vscode.commands.registerCommand('JAMALTranslation.EditTrans', function () {
		const translation = require('./src/translations.js');		
		translation.EditTranslation();
	});
	context.subscriptions.push(disposableEditTrans);	

	let disposableSaveTrans = vscode.commands.registerCommand('JAMALTranslation.SaveTrans', function () {
		const translation = require('./src/translations.js');		
		translation.SaveTranslation();
	});
	context.subscriptions.push(disposableSaveTrans);	


	let disposableProcessTransStep1 = vscode.commands.registerCommand('JAMALTranslation.ProcessTransStep1', function () {
		const executeTransSteps = require('./src/executeTransSteps.js');		
		executeTransSteps.executeTransSteps();
	});
	context.subscriptions.push(disposableProcessTransStep1);

	let disposableShowHtmlView = vscode.commands.registerCommand('JAMALTranslation.ShowHtmlView', function () {
		const HtmlView = require('./src/HTMLView.js');
		HtmlView.EditHtmlTranslation(context);
	});
	context.subscriptions.push(disposableShowHtmlView);

	let createAllTranslationsCSV = vscode.commands.registerCommand('JAMALTranslation.createAllTranslationsCSV', function () {
		const getAllTranslationsFile = require('./src/getAllTranslationsFile.js');
		getAllTranslationsFile.getAllTranslationsCSVFile();
	});
	context.subscriptions.push(createAllTranslationsCSV);
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
