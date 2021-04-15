const vscode = require('vscode');
module.exports = {
	executeTransSteps: function (
	) {
		executeTransSteps();
	}
};
function executeTransSteps()
{
    const translateSteps = getTransStepsJSON();

}
function getTransStepsJSON() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;    
    const translateSteps = JSON.parse((CurrDoc.getText()));
	return (translateSteps);
}
