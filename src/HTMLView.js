const vscode = require('vscode');
//const HtmlStartTagSource = '<label id="label">';
//const HtmlStartTagTarget = `<textarea id="textarea" rows="1" cols="120" name="textarea">`;
//const HtmlEndTagSource = '</label><br>';
//const HtmlEndTagTarget = `</textarea><br>`;
const HtmlStartTagSource = '<tr><td>';
const HtmlStartTagTarget = '<td><div contenteditable="">';
const HtmlEndTagSource = '</td>';
const HtmlEndTagTarget = '</div></td></tr>';
const UngreedySearchPattern = '(.*?)';


const TableRowsPattern =
  EscapeRegExp(HtmlStartTagSource) + UngreedySearchPattern
  + EscapeRegExp(HtmlEndTagSource)
  + EscapeRegExp(HtmlStartTagTarget) + UngreedySearchPattern
  + EscapeRegExp(HtmlEndTagTarget);
module.exports = {

  GetTranslationsHtml: function () { return GetTranslationsHtml() },
  EditHtmlTranslation: function (context) { EditHtmlTranslation(context) }
}

function EscapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&'); // $& significa toda la cadena coincidente
}
function GetHtmlTableContent() {
  let HtmlTableContent = '';
  var JSONTrans = [];
  var translations = require('./translations.js');
  JSONTrans = translations.ReadJSONTransFile(JSONTrans);
  for (var i = 0; i < JSONTrans.length; i++) {
    var element = JSONTrans[i];
    if ((element.target == '') || (element.target == element.source)) {
      HtmlTableContent = HtmlTableContent +        
        String.prototype.concat(
          HtmlStartTagSource ,
          element.source) +
          HtmlEndTagSource +
          HtmlStartTagTarget +
          HtmlEndTagTarget;
    }
  }
  return HtmlTableContent;
}
async function SaveHtmlTranslation(HtmlTranslation = '') {
  const TableRowsRegExp = new RegExp(TableRowsPattern, 'gm');
  const RowsMatches = HtmlTranslation.match(TableRowsRegExp);
  if (!RowsMatches) {
    return;
  }
  var JSONTrans = [];
  var translations = require('./translations.js');
  const executeTransSteps = require('./executeTransSteps.js');
  JSONTrans = await translations.ReadJSONTransFile(JSONTrans);
  for (var i = 0; i < Object.keys(RowsMatches).length; i++) {
    UpdateTranslationWithHtmlRow(RowsMatches[i], JSONTrans);
  }
  await translations.SaveJSONTransfile(JSONTrans);  
  const TransStepsJSON = await executeTransSteps.getTransStepsJSON();
  if (!TransStepsJSON) {
    return;
  }
  executeTransSteps.CreateFinalTranlationFile(TransStepsJSON);
}
function UpdateTranslationWithHtmlRow(HtmlRow = '', JSONTrans = []) {
  const TableRowsRegExp = new RegExp(TableRowsPattern, '');
  let SingleMatch = HtmlRow.match(TableRowsRegExp);
  if (!SingleMatch[2]) {
    return;
  }
  var JSONSource = JSONTrans.find(Obj => Obj.source == SingleMatch[1]);
  JSONSource.target = SingleMatch[2];
}
function EditHtmlTranslation(context) {
  const WebviewTranslations = vscode.window.createWebviewPanel(
    'Translations',
    'Translations: Set the target and push -Save- when is done',
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );
  WebviewTranslations.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'Save':
          SaveHtmlTranslation(message.text);
          WebviewTranslations.dispose();
          return;

      }
    },
    undefined,
    context.subscriptions
  );
  WebviewTranslations.webview.html = GetTranslationsHtml();
}
function GetTranslationsHtml() {
  let FinalTable = '';
  FinalTable =
    `<html>
    <style>`+
    GetCSSTableStyle() +
    `</style>
  <table id="table">
  <tr>
    <th>Source</th>
    <th>Target</th>
  </tr>`
    + GetHtmlTableContent() +
    `</table>
    <br></br>
  <Button onclick="Save()">Save and close</Button>
  <Script>
  function Save() {
      const vscode = acquireVsCodeApi();
    vscode.postMessage({
      command: "Save",
      text: document.getElementById('table').innerHTML
    });
	}
  </Script>
  </body>
  </html>   	
	`
  console.log(FinalTable);
  return FinalTable;
}
function GetCSSTableStyle() {
const CSSTableStyle = GetCSSTableStyleFromFile();
if (CSSTableStyle !== '') {
  return CSSTableStyle;
}
  return `table {
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
    border: 3px solid purple;
  }
  
  thead th:nth-child(1) {
    width: 40%;
  }
  
  thead th:nth-child(2) {
    width: 60%;
  }
  td, div {
    border: 1px solid purple;
    height: 40px;`;
 }
//returns css file content selected with a dialog
function GetCSSTableStyleFromFile() {  
	const ExtConf = vscode.workspace.getConfiguration('');
  let filePath = '';
	if (ExtConf) {
		filePath = ExtConf.get('CSSHTMLTableView');
	}
  if ((!filePath) || (filePath == '')) {
    return '';
  }
  const fs = require('fs');
  let cssFileContent = fs.readFileSync(filePath, 'utf8');
  return cssFileContent;
}