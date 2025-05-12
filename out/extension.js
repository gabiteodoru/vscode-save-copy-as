"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// extension.ts
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function activate(context) {
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
            const result = await vscode.window.showInformationMessage(`File saved as copy to: ${targetUri.fsPath}`, openAction);
            if (result === openAction) {
                const doc = await vscode.workspace.openTextDocument(targetUri);
                await vscode.window.showTextDocument(doc);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error occurred';
            vscode.window.showErrorMessage(`Error saving copy: ${errorMessage}`);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map