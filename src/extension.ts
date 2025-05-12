// extension.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.saveAsCopy', async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const filePath = document.uri.fsPath;
        
        if (!filePath) {
            vscode.window.showErrorMessage('Current file has no path');
            return;
        }

        // Get file name and directory
        const dirName = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const fileExt = path.extname(fileName);
        const baseName = path.basename(fileName, fileExt);
        
        // Create a suggested name for the copy
        const suggestedName = `${baseName} copy${fileExt}`;
        
        // Show save dialog
        const targetUri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(dirName, suggestedName)),
            filters: {
                'All Files': ['*']
            }
        });
        
        if (!targetUri) {
            return; // User cancelled
        }
        
        try {
            // Read the current file content
            const content = await fs.promises.readFile(filePath);
            
            // Write to the new file
            await fs.promises.writeFile(targetUri.fsPath, content);
            
            // Show success message with option to open the copy
            const openAction = 'Open Copy';
            const result = await vscode.window.showInformationMessage(
                `File saved as copy to: ${targetUri.fsPath}`, 
                openAction
            );
            
            if (result === openAction) {
                const doc = await vscode.workspace.openTextDocument(targetUri);
                await vscode.window.showTextDocument(doc);
            }
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Unknown error occurred';
            vscode.window.showErrorMessage(`Error saving copy: ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}