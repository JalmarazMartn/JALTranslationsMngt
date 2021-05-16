//Sacar los mensajes.
//Cargar también el 
//
const vscode = require('vscode');
const carriage = '\r\n';
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
const HorTab = '\t';
module.exports = {
	executeTransSteps: async function (
	) {
		await executeTransSteps();
	}
};
async function executeTransSteps() {
	const translateSteps = getTransStepsJSON();
	OutputChannel.clear();
	OutputChannel.show();
	const translation = require('./translations.js');
	if (!translateSteps.OriginalXlfFile[0].SkipStep) {
		CheckFileExists(translateSteps.OriginalXlfFile[1].Path);
		OutputChannel.appendLine('Building translation object...');
		await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile[1].Path);
		OutputChannel.appendLine(translateSteps.OriginalXlfFile[1].Path + ' file processed.');		
	};
	if (!translateSteps.PreviousTranslationsFiles[0].SkipStep) {
		const previousTrans = translateSteps.PreviousTranslationsFiles[1].Files;
		for (let index = 0; index < previousTrans.length; index++) {
			CheckFileExists(previousTrans[index].Path);
			OutputChannel.appendLine('Loading prev trans ' + previousTrans[index].Path);
			await translation.ProcessXlfFilePreviousTrans(previousTrans[index].Path);
			OutputChannel.appendLine(previousTrans[index].Path + ' file processed.');
		}		
	}
	if (!translateSteps.RemainigTranslationsFile[0].SkipStep) {
		OutputChannel.appendLine('Creating remaining translations file');		
		await SavePreviousFinalTrans(translateSteps.FinalXlfFile[1].Path);		
		await CreateRemainingTransFile(translateSteps.RemainigTranslationsFile[1].Path);
		OutputChannel.appendLine(translateSteps.RemainigTranslationsFile[1].Path + ' file created.');
	}
	if (!translateSteps.FinalXlfFile[0].SkipStep) {
		OutputChannel.appendLine('Writting final trans file');
		CreateFinalTranlationFile(translateSteps.OriginalXlfFile[1].Path, translateSteps.FinalXlfFile[1].Path);
		OutputChannel.appendLine(translateSteps.FinalXlfFile[1].Path + ' end translation file created.');		
	}	
}
function getTransStepsJSON() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	const translateSteps = JSON.parse((CurrDoc.getText()));
	return (translateSteps);
}
async function CreateRemainingTransFile(RemTransFileName = '') {
	var JSONTrans = [];
	await UpdateTranslationsFromRemTransFile(RemTransFileName);
	const translation = require('./translations.js');
	JSONTrans = translation.ReadJSONTransFile(JSONTrans);
	var LineText = '';
	const RemTransFileURI = vscode.Uri.file(RemTransFileName);
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if (element.source) {
			if ((element.target == '') || (element.target == element.source)) {
				//LineText = LineText + '"' + element.source + '"' + sep + '"' + element.source + '"' + carriage;
				LineText = LineText + element.source + HorTab + element.source +carriage;
			}
		}
	}
	await vscode.workspace.fs.writeFile(RemTransFileURI, Buffer.from(LineText));	
}
async function UpdateTranslationsFromRemTransFile(RemTransFilePath = '') {	
	const translations = require('./translations.js')
	let JSONTrans = [];
	JSONTrans = translations.ReadJSONTransFile(JSONTrans);
    var fs = require('fs');
	if (!await fs.existsSync(RemTransFilePath)) {		
		return;
	};
	const content = fs.readFileSync(RemTransFilePath,{encoding:'utf8', flag:'r'});
	const Lines = content.split(carriage);
	for (let index = 0; index < Lines.length; index++) {
		//const TransMatch = Lines[index].match(/"(.*)";"(.*)"/);
		const TransMatch = Lines[index].split(HorTab);		
		if (TransMatch[1])
		{
			const SourceText = TransMatch[0];
			const TargetText = TransMatch[1];		
			if (TargetText !== SourceText) {
				var JSONSource = JSONTrans.find(Obj => Obj.source == SourceText);
				JSONSource.target = TargetText;
			}
		}
	}
	translations.SaveJSONTransfile(JSONTrans);
}
async function CreateFinalTranlationFile(OriginalXlfPath = '', FinalXlfPath = '') {
	const translations = require('./translations.js');
	const LineText = translations.GetFullFinalXlfText(await vscode.workspace.openTextDocument(OriginalXlfPath));
	await vscode.workspace.fs.writeFile(vscode.Uri.file(FinalXlfPath), Buffer.from(LineText));
}
async function CheckFileExists(FilePath = '') {
	const fs = require('fs');
	if (!await fs.existsSync(FilePath)) {		
		vscode.window.showErrorMessage(FilePath + ' does not exists');
	}
}
async function SavePreviousFinalTrans(FilePath='')
{
	const translation = require('./translations.js');
	const fs = require('fs');
	if (!await fs.existsSync(FilePath)) {		
		return;
	}
	await translation.ProcessXlfFilePreviousTrans(FilePath);
}