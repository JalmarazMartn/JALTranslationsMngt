const vscode = require('vscode');
module.exports = {
	executeTransSteps: async function (
	) {
		await executeTransSteps();
	}
};
async function executeTransSteps()
{
    const translateSteps = getTransStepsJSON();
	const translation = require('./translations.js');
	await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile);
	const previousTrans = translateSteps.PreviousTranslationsFiles;
	for (let index = 0; index < previousTrans.length; index++)
	{
		await translation.ProcessXlfFilePreviousTrans(previousTrans[index].Path);
	}
}
function getTransStepsJSON() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;    
    const translateSteps = JSON.parse((CurrDoc.getText()));
	return (translateSteps);
}
