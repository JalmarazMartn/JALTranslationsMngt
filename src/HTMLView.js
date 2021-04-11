const vscode = require('vscode');
const HtmlStartTagSource = '<td>';
const HtmlStartTagTarget = '<td><div contenteditable="">';
const HtmlEndTagSource = '</td>';
const HtmlEndTagTarget = '</div></td>';
const UngreedySreachPattern = '(.*?)';
const TableRowsPattern = 
EscapeRegExp(HtmlStartTagSource)+ UngreedySreachPattern
+EscapeRegExp(HtmlEndTagSource)
+EscapeRegExp(HtmlStartTagTarget)+UngreedySreachPattern
+EscapeRegExp(HtmlEndTagTarget);
module.exports = {

	GetTranslationsHtml: function() {return GetTranslationsHtml()},
	EditHtmlTranslation: function(context) {EditHtmlTranslation(context)}	
}

function EscapeRegExp(string) {
	return string.replace(/[.*+\-?^${}()|[\]\\\/]/g,'\\$&'); // $& significa toda la cadena coincidente
  }
  function GetHtmlTableContent()
  {
      let HtmlTableContent = '';	
      var JSONTrans = [];
      var translations = require('./translations.js');
      JSONTrans = translations.ReadJSONTransFile(JSONTrans);	
      for (var i = 0; i < JSONTrans.length; i++) {		
          var element = JSONTrans[i];
          if ((element.target == '') ||(element.target == element.source)) {
              HtmlTableContent = HtmlTableContent + 
              '<tr>' +
              String.prototype.concat(
              HtmlStartTagSource,
              element.source) +
              HtmlEndTagSource +
              String.prototype.concat(			
              HtmlStartTagTarget
              ,element.source) +
              HtmlEndTagTarget +
              '</tr>';
          }
      }
      return HtmlTableContent;
  }
  function SaveHtmlTranslation(HtmlTranslation = '')
  {
      const TableRowsRegExp = new RegExp(TableRowsPattern,'gm');
      const RowsMatches = HtmlTranslation.match(TableRowsRegExp);
      if (!RowsMatches)
      {
          return;
      }
      var JSONTrans = [];
      var translations = require('./translations.js');      
      JSONTrans = translations.ReadJSONTransFile(JSONTrans);
      for (var i = 0; i < Object.keys(RowsMatches).length; i++) {
          UpdateTranslationWithHtmlRow(RowsMatches[i],JSONTrans);
      }
      		
      translations.SaveJSONTransfile(JSONTrans);	
      translations.WriteNewXlfFile('Select xlf file');	
  }
  function UpdateTranslationWithHtmlRow(HtmlRow='',JSONTrans = [])
  {
      const TableRowsRegExp = new RegExp(TableRowsPattern,'');
      let SingleMatch = HtmlRow.match(TableRowsRegExp);
      var JSONSource = JSONTrans.find(Obj => Obj.source == SingleMatch[1]);
      JSONSource.target = SingleMatch[2];	
  }
  function EditHtmlTranslation(context)
{
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
function GetTranslationsHtml()
{
	let FinalTable = '';
	FinalTable = 
	`
	<body>
	<table id="table" style="width:100%">
  <th>Source</th><th>Target</th>`
 + GetHtmlTableContent() +
  `</table>	
  <br></br>
  <Button onclick="Save()">Save and close</Button>
  <Script>
  function Save() {
      //document.getElementById('Target1').innerHTML = document.getElementById('Source1').innerHTML;
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
	return FinalTable;
}