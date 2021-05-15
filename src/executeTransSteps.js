//Sacar los mensajes.
//Cargar el csv antes borrarlo.
//
const vscode = require('vscode');
const sep = ';';
const carriage = '\r\n';
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
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
		await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile[1].Path);
		OutputChannel.appendLine(translateSteps.OriginalXlfFile[1].Path + ' file processed.');		
	};
	if (!translateSteps.PreviousTranslationsFiles[0].SkipStep) {
		const previousTrans = translateSteps.PreviousTranslationsFiles[1].Files;
		for (let index = 0; index < previousTrans.length; index++) {
			CheckFileExists(previousTrans[index].Path);
			await translation.ProcessXlfFilePreviousTrans(previousTrans[index].Path);
			OutputChannel.appendLine(previousTrans[index].Path + ' file processed.');
		}
	}
	if (!translateSteps.RemainigTranslationsCSV[0].SkipStep) {
		CreateCSVFile(translateSteps.RemainigTranslationsCSV[1].Path);
		OutputChannel.appendLine(translateSteps.RemainigTranslationsCSV[1].Path + ' CSV created.');
	}
	if (!translateSteps.FinalXlfFile[0].SkipStep) {
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
async function CreateCSVFile(CsvfileName = '') {
	var JSONTrans = [];
	await UpdateTranslationsFromCSVFile(CsvfileName);
	const translation = require('./translations.js');
	JSONTrans = translation.ReadJSONTransFile(JSONTrans);
	var LineText = '';
	const CsvFileURI = vscode.Uri.file(CsvfileName);
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if (element.source) {
			if ((element.target == '') || (element.target == element.source)) {
				LineText = LineText + '"' + element.source + '"' + sep + '"' + element.source + '"' + carriage;
			}
		}
	}
	await vscode.workspace.fs.writeFile(CsvFileURI, Buffer.from(LineText));	
}
async function UpdateTranslationsFromCSVFile(CsvFilePath = '') {
	const translations = require('./translations.js')
	let JSONTrans = [];
	JSONTrans = translations.ReadJSONTransFile(JSONTrans);
	var fs = require('fs'),
		readline = require('readline');

	var rd = readline.createInterface({
		input: fs.createReadStream(CsvFilePath)
	});
	rd.on('line', function (line) {
		const TransMatch = line.match(/"(.*)";"(.*)"/);
		if (!TransMatch) {
			return;
		}
		const SourceText = TransMatch[1];
		const TargetText = TransMatch[2];
		if (TargetText !== SourceText) {
			var JSONSource = JSONTrans.find(Obj => Obj.source == SourceText);
			JSONSource.target = TargetText;
		}
	});
	rd.on('close', function () {
		translations.SaveJSONTransfile(JSONTrans);
	}
	);
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