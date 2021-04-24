const vscode = require('vscode');
const sep = ';';
const carriage = '\r\n';
//"(.*)";"(.*)"
module.exports = {
	executeTransSteps: async function (
	) {
		await executeTransSteps1();
	}
};
async function executeTransSteps1()
{
    const translateSteps = getTransStepsJSON();
	const translation = require('./translations.js');
	ChechFileExists(translateSteps.OriginalXlfFile);
	await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile);
	const previousTrans = translateSteps.PreviousTranslationsFiles;
	for (let index = 0; index < previousTrans.length; index++)
	{
		ChechFileExists(previousTrans[index].Path);
		await translation.ProcessXlfFilePreviousTrans(previousTrans[index].Path);
	}
	CreateCSVFile(translateSteps.RemainigTranslationsCSV);
}
function getTransStepsJSON() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;    
    const translateSteps = JSON.parse((CurrDoc.getText()));
	return (translateSteps);
}
async function CreateCSVFile(CsvfileName=''){
	var JSONTrans = [];
	UpdateTranslationFromCSVFile()
	const translation = require('./translations.js');	
	JSONTrans = translation.ReadJSONTransFile(JSONTrans);
	var LineText = '';	
	const CsvFileURI = vscode.Uri.file(CsvfileName);
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if (element.source)
		{
		if ((element.target == '') ||(element.target == element.source)) {			
			LineText = LineText + '"' + element.source + '"' + sep + '"' + element.source +'"' + carriage;		
		}
	}
	}
	await vscode.workspace.fs.writeFile(CsvFileURI,Buffer.from(LineText));
	vscode.window.showInformationMessage('CSV file created in ' + CsvfileName);
}
async function UpdateTranslationFromCSVFile()
{

}
async function CreateFinalTranlationFile()
{
	
}
async function ChechFileExists(FilePath = '')
{
	const fs = require('fs');
	if (!await fs.existsSync(FilePath))
	{
		vscode.window.showErrorMessage(FilePath + ' does not exists');
	}
}