const vscode = require('vscode');
//const executeTransSteps = require('./executeTransSteps.js');
const translation = require('./translations.js');
const sourceOption = 'Source';
const targetOption = 'Target';
const bothOption = 'Both';
const HorTab = '\t';
const carriage = '\r\n';
module.exports = {
    getAllTranslationsCSVFile: async function ()
         {
            await getAllTranslationsCSVFile();
        }    
}
async function getAllTranslationsCSVFile()
{
    //const translateSteps = await executeTransSteps.getTransStepsJSON();    
    //await translation.ProcessXlfFirstFile(translateSteps.OriginalXlfFile[1].Path);
    const translationFileOption = await chooseTranslationFileOption();
    if (translationFileOption == '')
    {
        vscode.window.showErrorMessage('Select a translation file option.');
        return;
    }
    getCSVTranlationsFile(translationFileOption);
}
async function chooseTranslationFileOption()
{
const fileOptions = [targetOption,sourceOption,bothOption];
let selection = '';
await vscode.window.showQuickPick(fileOptions).then(async (value) => {
    if (value) {
        selection =value;
    }
});
return selection;
}
async function getCSVTranlationsFile(translationFileOption='')
{
    let JSONTrans = [];
    JSONTrans = translation.ReadJSONTransFile(JSONTrans);
	var LineText = '';
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if (element.source) {
			LineText = LineText + getLineTextFromElement(element,translationFileOption);
		}		
	}
    vscode.workspace.fs.writeFile(await getCSVFinalFile(), Buffer.from(LineText));
}
function getLineTextFromElement(element,translationFileOption='')
{
    let LineText = '';
    switch (translationFileOption) {        
        case sourceOption:
            LineText = element.source;                    
            break;
        case targetOption:
            LineText = element.target;                    
            break;
        case bothOption:
            LineText = LineText + element.source + HorTab + element.target;
            break;
        }
        if (LineText == '')
        {
            return LineText;
        }
        return LineText + carriage;
}
async function getCSVFinalFile()
{
    const NewTitle = 'Select csv destination file';
	const options = {
		canSelectMany: false,
		openLabel: 'Save',
		title: NewTitle,
		filters: {
			'csv': ['csv'],
		}
	};
	let fileUri = await vscode.window.showSaveDialog(options);    
    return fileUri;
}