# jal-translations-mngt README

With xlf files this exyension help to do this:
> Don´t type in the target .xlf file.
> Don´t translate twice. If you already translated, or NAV did it “Posting Date” to “Fecha registro”, I think that you don´t have to do it again….never.
I see the steps:
1.	Begin translation getting the original English .xlf file. From this file we can extract what to translate and remove the duplicates captions. We save in a json object the distinct captions to translate
2.	The second step is using the previous work saved in old .xlf files: the NAV standard xlf file, the .xlf translation generated by txt2Al translator, or other apps .xlf files you want to use.
3.	After this previous step, I have a lot of translation done working almost nothing. The next thing I want to have are the remaining translation, without duplicates in an Excel file to end the work. This must be the only manual work in the process 
4.	The final step must be building the final xlf in the target language: the file must be done merging the original file, previous translation files and our manual final translations in the Excel CSV files.

We made a VSCode extension to manage translation driven by a json file to do these four steps. We generate, 
### Step 1
    "OriginalXlfFile": [
        {"SkipStep": false},
        {"Path": "C:/Users/Jesus/Documents/AL/WarehouseAssistant/Translations/WarehouseAssistant.g.xlf"
This step starts with the English .xlf process. Here we must set the file generated in our first package generation with:

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Initial release

### 1.0.0

Initial release

