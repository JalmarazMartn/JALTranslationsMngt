const vscode = require('vscode');
const TargetLabel = 'Target==>';
const RexRemoveLabels = /\s*(<target.*?>|<source>)(\s*.*)(<\/target>|<\/source>)/gm;
const RexLanguageLine = /(source-language=".*"\s*target-language=")([a-z\-]*)(")/gmi;
const carriage = '\r\n';
let Exclusions = [];
var unitTrans = [];
//
module.exports = {
	InitTranslation: function (
	) {
		CreateTranslationJSON();
	},
	LoadPreviousTRanslation() {
		LoadPreviousTranslation();
	},
	EditTranslation: function () { BeginEditTranslation() },
	SaveTranslation: function () { SaveTranslationToJsonAndCreateTranslationXlf() },
	ReadJSONTransFile: function (JSONTrans) { return ReadJSONTransFile(JSONTrans) },
	SaveJSONTransfile: function (JSONTrans) { SaveJSONTransfile(JSONTrans) },
	WriteNewXlfFile: function (NewTitle = '',) { WriteNewXlfFile(NewTitle) },
	ProcessXlfFirstFile: async function (filePath = '') {
		var JSONTrans = [];
		await ProcessXlfFilePreviousTrans(filePath, JSONTrans, WriteJSONTrans);
	},
	ProcessXlfFilePreviousTrans: async function (filePath = '') {
		var JSONTrans = [];
		JSONTrans = ReadJSONTransFile(JSONTrans);
		ProcessXlfFilePreviousTrans(filePath, JSONTrans, WriteJSONPeviousTrans)
	},
	GetFullFinalXlfText: function (XlfOriginalDoc) {
		return GetFullFinalXlfText(XlfOriginalDoc);
	},
	NewFileFolderExists: function (newFile = '') {
		return NewFileFolderExists(newFile);
	},
	SetExclusions: function (translateSteps) {
		SetExclusions(translateSteps);
	}
}
async function CreateTranslationJSON() {

	var JSONTrans = [];
	DeleteJSONTransFile();
	await AskAndProcessXlfFile('Select xlf file auto generated ENG', JSONTrans);
};
async function LoadPreviousTranslation() {

	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);
	AskAndProcessXlfFilePreviousTrans('Select xlf file previous translation', JSONTrans);
};

async function AskAndProcessXlfFile(newtitle, JSONTrans) {
	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: newtitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
	SetEngFileName(JSONTrans, fileUri[0].fsPath);
	//await ProcessXlfFile(fileUri[0].fsPath,JSONTrans);
	await ProcessXlfFilePreviousTrans(fileUri[0].fsPath, JSONTrans, WriteJSONTrans);
}
async function AskAndProcessXlfFilePreviousTrans(newtitle, JSONTrans) {
	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: newtitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
	ProcessXlfFilePreviousTrans(fileUri[0].fsPath, JSONTrans, WriteJSONPeviousTrans)
}
async function ProcessXlfFilePreviousTrans(FilePath = '', JSONTrans, FunctionProcLine) {
	//vscode.window.showInformationMessage('Processing file:' + FilePath,{modal:false},'Got it');		
	try {
		var fs = require('fs');
		const content = fs.readFileSync(FilePath, { encoding: 'utf8', flag: 'r' });
		const Lines = content.split('\r\n');
		let CountLines = 0;
		var LastSourceText = '';

		for (let index = 0; index < Lines.length; index++) {
			CountLines = CountLines + 1;
			LastSourceText = FunctionProcLine(Lines[index], JSONTrans, LastSourceText);

		}
		DeleteJSONTransFile();
		SaveJSONTransfile(JSONTrans);
	}
	catch (err) {
		vscode.window.showErrorMessage('Error in ProcessXlfFilePreviousTrans:' + err.message);
	}
}
async function ProcessXlfFilePreviousTransAsync(FilePath = '', JSONTrans, FunctionProcLine) {
	try {
		var fs = require('fs'),
			readline = require('readline');

		var rd = readline.createInterface({
			input: fs.createReadStream(FilePath)
		});
		let CountLines = 0;
		var LastSourceText = '';

		rd.on('line', function (line) {
			CountLines = CountLines + 1;
			LastSourceText = FunctionProcLine(line, JSONTrans, LastSourceText);
		});
		rd.on('close', function () {
			DeleteJSONTransFile();
			SaveJSONTransfile(JSONTrans);
			//vscode.window.showInformationMessage('File ended. File lines: ' + CountLines.toString());
		}
		);
	}
	catch (err) {
		vscode.window.showErrorMessage('Error in Process Xlf Previous original File:' + err.message);
	}
}
function WriteJSONPeviousTrans(linetext, JSONTrans, LastSourceText) {
	try {
		if (linetext.match('<source>')) {
			var ReplacedLineText = linetext.replace(RexRemoveLabels, GetTranslationText);
			return (ReplacedLineText);
		}
		if (linetext.match('<target')) {
			var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
			const NewTargetText = linetext.replace(RexRemoveLabels, GetTranslationText);
			const SubstituteTranslation = (JSONSource) && (NewTargetText != '') && (NewTargetText != LastSourceText);
			if (SubstituteTranslation) {
				JSONSource.target = NewTargetText;
			}
		}
		return (LastSourceText);
	}
	catch (err) {
		vscode.window.showErrorMessage('Error in processing previous translation files:' + err.message);
	}
}
function WriteJSONTrans(linetext, JSONTrans, LastSourceText) {
	unitTrans.push(linetext);
	if (linetext.match('<source>')) {
		var ReplacedLineText = linetext.replace(RexRemoveLabels, GetTranslationText);
		if (!JSONTrans.find(JSONTrans => JSONTrans.source == ReplacedLineText)) {
			JSONTrans.push(
				{
					"source": ReplacedLineText,
					"target": '',
					"ExcludeTransFromCSV": ''
				});
		}
		return (linetext.replace(RexRemoveLabels, GetTranslationText));
	}

	if (linetext.match('<target>')) {
		var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
		JSONSource.target = linetext.replace(RexRemoveLabels, GetTranslationText);
	}	
	processUnitTransExclusion(JSONTrans, linetext, LastSourceText);
	return (LastSourceText);
}
// @ts-ignore
function GetTranslationText(fullMatch = '', startLabel = '', content = '', endLabel = '') {
	return (content);
}
async function BeginEditTranslation() {
	let CurrDoc = await vscode.workspace.openTextDocument();
	vscode.window.showTextDocument(CurrDoc, { preview: false });

	var JSONTrans = [];
	const WSEdit = new vscode.WorkspaceEdit;
	JSONTrans = ReadJSONTransFile(JSONTrans);
	let lastLine = 0;
	for (var i = 0; i < JSONTrans.length; i++) {
		var element = JSONTrans[i];
		if (element.source) {
			if ((element.target == '') || (element.target == element.source)) {
				lastLine = await WriteElementToEdit(element, WSEdit, CurrDoc, lastLine);
			}
		}
	}
	await vscode.workspace.applyEdit(WSEdit);
}
async function WriteElementToEdit(element, WSEdit, CurrDoc, lastLine) {
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), element.source);

	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	await WSEdit.insert(CurrDoc.uri, new vscode.Position(lastLine, 0), TargetLabel + element.source);
	await vscode.commands.executeCommand('editor.action.insertLineAfter');
	lastLine = lastLine + 1;
	return (lastLine);
}
function ReadJSONTransFile(JSONTrans) {
	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		var oldJSON = fs.readFileSync(JSONFileURI.fsPath, "utf-8");
		JSONTrans = JSON.parse(oldJSON);
	}
	return (JSONTrans);
}
function DeleteJSONTransFile() {

	const fs = require('fs');
	const JSONFileURI = GetFullPathFileJSONS();
	if (fs.existsSync(JSONFileURI.fsPath)) {
		fs.unlinkSync(JSONFileURI.fsPath);
	}
}
function GetFullPathFileJSONS() {
	var returnedName = 'JSONTranslation.json';
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		returnedName = ExtConf.get('JSONTranslationFilename');
	}
	return (vscode.Uri.file(vscode.workspace.workspaceFolders[0].uri.path + '/.vscode/' + returnedName));
}
function SaveJSONTransfile(JSONTrans) {
	const fs = require('fs');
	DeleteJSONTransFile();
	const JSONFileURI = GetFullPathFileJSONS();
	fs.writeFileSync(JSONFileURI.fsPath, JSON.stringify(JSONTrans));
}
async function SaveTranslationToJsonAndCreateTranslationXlf() {
	await SaveTranslationToJson();
	await ClearCurrentDocument();
	await WriteNewXlfFile('Select xlf file');
}
function SaveTranslationToJson() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	let LastSourceText = '';
	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);
	for (var i = 0; i < CurrDoc.lineCount; i++) {
		const linetext = CurrDoc.lineAt(i).text;
		const IsTarget = linetext.match(TargetLabel);
		if (IsTarget) {
			const TargetText = linetext.replace(TargetLabel, '');
			if (TargetText !== LastSourceText) {
				var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);
				JSONSource.target = TargetText;
			}
		}
		else { LastSourceText = linetext }
	}
	SaveJSONTransfile(JSONTrans);
}
async function ClearCurrentDocument() {
	var currEditor = vscode.window.activeTextEditor;
	let CurrDoc = currEditor.document;
	const WSEdit = new vscode.WorkspaceEdit;
	const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(CurrDoc.lineCount, 0));
	await WSEdit.delete(CurrDoc.uri, range);
	await vscode.workspace.applyEdit(WSEdit);
	//await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

async function WriteNewXlfFile(NewTitle = '') {
	if (await ErrorIfNotEmptyDoc()) { return; }
	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);

	let XlfDoc = await vscode.workspace.openTextDocument(GetEngFileName(JSONTrans));
	const TotalFinalText = GetFullFinalXlfText(XlfDoc);
	const options = {
		canSelectMany: false,
		openLabel: 'Save',
		title: NewTitle,
		filters: {
			'xlf': ['xlf'],
		}
	};
	let fileUri = await vscode.window.showSaveDialog(options);
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(TotalFinalText));
	vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}
function GetFullFinalXlfText(XlfOriginalDoc) {
	var JSONTrans = [];
	JSONTrans = ReadJSONTransFile(JSONTrans);

	let TotalFinalText = '';
	for (var i = 0; i < XlfOriginalDoc.lineCount; i++) {
		let LineText = XlfOriginalDoc.lineAt(i).text;
		LineText = LineText.replace(RexLanguageLine, GetLanguageText);
		if (TotalFinalText !== '') {
			TotalFinalText = TotalFinalText + carriage;
		}
		TotalFinalText = TotalFinalText + LineText;
		if (LineText.match('<source>')) {
			const SourceText = LineText.replace(RexRemoveLabels, GetTranslationText);
			var JSONSource = JSONTrans.find(Obj => Obj.source == SourceText);
			let TargetText = '';
			if (JSONSource) { TargetText = JSONSource.target; }
			let TargetLineText = LineText.replace(SourceText, TargetText);
			TargetLineText = TargetLineText.replace(/source\>/g, 'target>');
			TotalFinalText = TotalFinalText + carriage + TargetLineText;
		}
	}
	return TotalFinalText;
}
function GetLanguageText(fullMatch = '', startLabel = '', content = '', endLabel = '') {
	return (startLabel + GetTargetLanguage() + endLabel);
}
function GetTargetLanguage() {
	const ExtConf = vscode.workspace.getConfiguration('');
	if (ExtConf) {
		return (ExtConf.get('TargetLanguage'));
	}
}
async function ErrorIfNotEmptyDoc() {
	var currEditor = vscode.window.activeTextEditor;
	if (!currEditor) {
		await vscode.window.showErrorMessage('There is no current editor.')
		return true;
	}
	let CurrDoc = currEditor.document;
	if (!CurrDoc) {
		await vscode.window.showErrorMessage('There is no current document.')
		return true;
	}

	let CharCount = 0;
	for (var i = 0; i < CurrDoc.lineCount; i++) {
		CharCount = CharCount + CurrDoc.lineAt(i).text.length;
	}
	if (CharCount > 0) {
		await vscode.window.showErrorMessage('The current document must be empty.')
		return true;
	}

	return false;
}
function SetEngFileName(JSONTrans, EngFileName = '') {
	JSONTrans.push(
		{
			"EngFileName": EngFileName
		});

}
function GetEngFileName(JSONTrans) {
	var element = JSONTrans.find(Obj => Obj.EngFileName != '');
	return (element.EngFileName);
}
//verify if the folder of the xlf file exists
function NewFileFolderExists(fileName = '') {
	const fs = require('fs');
	const path = require('path');
	const folder = path.dirname(fileName);
	if (!fs.existsSync(folder)) {
		vscode.window.showErrorMessage('The folder not exists:' + folder);
		return false;
	}
	return true;
}
function processUnitTransExclusion(JSONTrans, line = '', LastSourceText = '') {		
	if (line.search(/<\/trans-unit>/i) <= -1) {
		return;
	};	
	let ExcludeUnitTrans = 'N';
	for (let index = 0; index < unitTrans.length; index++) {
		const element = unitTrans[index];		
		if (MatchAnyExclusion(element)) {
			ExcludeUnitTrans = 'Y';			
		}		
	}
	UpdateExcludeCsv(unitTrans, ExcludeUnitTrans, JSONTrans, LastSourceText);
	unitTrans = [];
}
//funtion that take string and try to match it with an regexp array
function MatchAnyExclusion(fileLine) {	
	if (!Exclusions) { return false; }

	for (let index = 0; index < Exclusions.length; index++) {		
		const element = Exclusions[index];
		if (fileLine.search(RegExp(element, 'gi')) > -1) {
			return true;
		}
	}
	return false;
}
function SetExclusions(translateSteps) {
	Exclusions = []	
		if (translateSteps.ExclusionsFromManual) {
			Exclusions = translateSteps.ExclusionsFromManual;
		}			
}
function UpdateExcludeCsv(unitTrans, ExcludeUnitTrans, JSONTrans, LastSourceText) {
	var JSONSource = JSONTrans.find(Obj => Obj.source == LastSourceText);	
	if (JSONSource) {
		if (JSONSource.ExcludeTransFromCSV !== 'N') {
			JSONSource.ExcludeTransFromCSV = ExcludeUnitTrans;
		}
	}
}