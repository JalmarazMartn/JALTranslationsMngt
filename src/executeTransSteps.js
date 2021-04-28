//no mensajes, 
const vscode = require('vscode');
const sep = ';';
const carriage = '\r\n';
module.exports = {
	executeTransSteps: async function (
	) {
		await executeTransSteps();
	}
};
async function executeTransSteps() {
	const translateSteps = getTransStepsJSON();
	const translation = require('./translations.js');
	if (!translateSteps.OriginalXlfFile[0].SkipStep) {
		CheckFileExists(translateSteps.OriginalXlfFile[1].Path);
		await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile[1].Path);
	};
	if (!translateSteps.PreviousTranslationsFiles[0].SkipStep) {
		const previousTrans = translateSteps.PreviousTranslationsFiles[1].Files;
		console.log(translateSteps);
		for (let index = 0; index < previousTrans.length; index++) {
			CheckFileExists(previousTrans[index].Path);
			await translation.ProcessXlfFilePreviousTrans(previousTrans[index].Path);
		}
	}
	if (!translateSteps.RemainigTranslationsCSV[0].SkipStep) {
		CreateCSVFile(translateSteps.RemainigTranslationsCSV.Path);
	}
	if (!translateSteps.FinalXlfFile[0].SkipStep) {
		CreateFinalTranlationFile(translateSteps.OriginalXlfFile.Path, translateSteps.FinalXlfFile.Path);
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
	vscode.window.showInformationMessage('CSV file created in ' + CsvfileName);
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