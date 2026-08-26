/*
=====================================
MACRO UUID EXTRACTOR
=====================================
Scans a macro folder (and subfolders) and generates a list of all macros
with their names and UUIDs, formatted for easy copy-paste into the Macro Launcher.

HOW TO USE:
1. Run this macro
2. Select the folder you want to scan
3. Choose output format (Dialog or Journal Entry)
4. Copy the generated list and paste into your Macro Launcher config

=====================================
*/

// =====================================
// Get all folders in the Macro directory
// =====================================
function getMacroFolders() {
  const folders = game.folders.filter(f => f.type === "Macro");
  
  // Build a tree structure for display
  const folderMap = new Map();
  const rootFolders = [];
  
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      folder: folder,
      children: []
    });
  });
  
  folders.forEach(folder => {
    if (folder.folder) {
      const parent = folderMap.get(folder.folder.id);
      if (parent) {
        parent.children.push(folderMap.get(folder.id));
      }
    } else {
      rootFolders.push(folderMap.get(folder.id));
    }
  });
  
  return { folderMap, rootFolders };
}

// =====================================
// Build folder options HTML with indentation
// =====================================
function buildFolderOptions(folderNodes, indent = 0) {
  let html = '';
  
  folderNodes.forEach(node => {
    const prefix = '&nbsp;&nbsp;'.repeat(indent) + (indent > 0 ? '└─ ' : '');
    html += `<option value="${node.folder.id}">${prefix}${node.folder.name}</option>`;
    
    if (node.children.length > 0) {
      html += buildFolderOptions(node.children, indent + 1);
    }
  });
  
  return html;
}

// =====================================
// Recursively collect macros from folder and subfolders
// Returns a map of folder names to their macros
// =====================================
function collectMacrosByFolder(folderId, folderMap) {
  const folderNode = folderMap.get(folderId);
  if (!folderNode) return {};
  
  const result = {};
  
  // Check if this folder has subfolders
  if (folderNode.children.length > 0) {
    // Has subfolders - create a category for each subfolder
    folderNode.children.forEach(child => {
      const childMacros = game.macros.filter(m => m.folder?.id === child.folder.id);
      if (childMacros.length > 0) {
        result[child.folder.name] = childMacros;
      }
      
      // Recursively process child's subfolders too
      const childResults = collectMacrosByFolder(child.folder.id, folderMap);
      Object.assign(result, childResults);
    });
    
    // Also include macros directly in the parent folder (if any)
    const parentMacros = game.macros.filter(m => m.folder?.id === folderId);
    if (parentMacros.length > 0) {
      result[folderNode.folder.name] = parentMacros;
    }
  } else {
    // No subfolders - just get macros from this folder
    const macros = game.macros.filter(m => m.folder?.id === folderId);
    if (macros.length > 0) {
      result[folderNode.folder.name] = macros;
    }
  }
  
  return result;
}

// =====================================
// Format macros for Macro Launcher config
// =====================================
function formatMacrosForConfig(macrosByFolder) {
  const categories = [];
  
  for (const [folderName, macros] of Object.entries(macrosByFolder)) {
    if (macros.length === 0) {
      categories.push(`  "${folderName}": [\n    // No macros found in this folder\n  ]`);
      continue;
    }
    
    const entries = macros.map(macro => {
      return `    { uuid: "${macro.uuid}" }, // ${macro.name}`;
    }).join(',\n');
    
    categories.push(`  "${folderName}": [\n${entries}\n  ]`);
  }
  
  return categories.join(',\n');
}

// =====================================
// Show results in a dialog
// =====================================
function showResultsDialog(content, folderName, categoryCount) {
  const dialogContent = `
    <div style="margin-bottom: 12px;">
      <p style="font-weight: bold; color: #ED2E28;">Extracted ${categoryCount} categories from "${folderName}"</p>
      <p style="font-size: 0.9em; color: #999;">Copy the text below and paste into your Macro Launcher configuration:</p>
    </div>
    <textarea 
      readonly 
      style="width: 100%; height: 400px; font-family: monospace; font-size: 0.85em; background: #1a1a1a; color: #00ff00; border: 1px solid #333; padding: 8px;"
      id="macro-export-text"
    >${content}</textarea>
  `;
  
  new Dialog({
    title: "Macro UUID Export",
    content: dialogContent,
    buttons: {
      copy: {
        icon: '<i class="fas fa-copy"></i>',
        label: "Copy to Clipboard",
        callback: (html) => {
          const textarea = html.find('#macro-export-text')[0];
          textarea.select();
          document.execCommand('copy');
          ui.notifications.info("Copied to clipboard!");
        }
      },
      journal: {
        icon: '<i class="fas fa-book"></i>',
        label: "Create Journal Entry",
        callback: () => createJournalEntry(content, folderName)
      },
      close: {
        icon: '<i class="fas fa-times"></i>',
        label: "Close"
      }
    },
    default: "copy"
  }, {
    width: 600,
    height: 550
  }).render(true);
}

// =====================================
// Create a journal entry with the results
// =====================================
async function createJournalEntry(content, folderName) {
  const journalContent = `
    <h1>Macro UUIDs: ${folderName}</h1>
    <p><em>Generated on ${new Date().toLocaleString()}</em></p>
    <p>Copy and paste this into your Macro Launcher configuration:</p>
    <pre style="background: #1a1a1a; color: #00ff00; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 0.85em;">${content}</pre>
  `;
  
  const journal = await JournalEntry.create({
    name: `Macro UUIDs - ${folderName}`,
    content: journalContent
  });
  
  journal.sheet.render(true);
  ui.notifications.info(`Journal entry created: ${journal.name}`);
}

// =====================================
// Main execution
// =====================================
async function main() {
  const { folderMap, rootFolders } = getMacroFolders();
  
  if (rootFolders.length === 0 && folderMap.size === 0) {
    return ui.notifications.warn("No macro folders found. Create some folders first!");
  }
  
  // Build folder selection dialog
  const folderOptions = buildFolderOptions(rootFolders);
  
  const selectionContent = `
    <div style="margin-bottom: 12px;">
      <p style="font-size: 0.9em; color: #999;">
        Select a macro folder to export. If the folder has subfolders, each subfolder will be exported as a separate category.
      </p>
    </div>
    <div style="margin-bottom: 8px;">
      <label style="font-weight: bold; display: block; margin-bottom: 4px;">Folder:</label>
      <select id="folder-select" style="width: 100%; padding: 4px;">
        ${folderOptions}
      </select>
    </div>
    <div style="margin-top: 12px; padding: 8px; background: rgba(237, 46, 40, 0.1); border-left: 3px solid #ED2E28;">
      <p style="font-size: 0.85em; margin: 0; color: #ED2E28;">
        <i class="fas fa-info-circle"></i> Subfolders become separate categories automatically
      </p>
    </div>
  `;
  
  new Dialog({
    title: "Extract Macro UUIDs",
    content: selectionContent,
    buttons: {
      extract: {
        icon: '<i class="fas fa-download"></i>',
        label: "Extract UUIDs",
        callback: (html) => {
          const selectedFolderId = html.find('#folder-select').val();
          const selectedFolder = game.folders.get(selectedFolderId);
          
          if (!selectedFolder) {
            return ui.notifications.error("Folder not found!");
          }
          
          // Collect macros organized by folder
          const macrosByFolder = collectMacrosByFolder(selectedFolderId, folderMap);
          
          if (Object.keys(macrosByFolder).length === 0) {
            return ui.notifications.warn(`No macros found in "${selectedFolder.name}" or its subfolders`);
          }
          
          // Format the output
          const formatted = formatMacrosForConfig(macrosByFolder);
          const categoryCount = Object.keys(macrosByFolder).length;
          
          // Show results
          showResultsDialog(formatted, selectedFolder.name, categoryCount);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "extract"
  }, {
    width: 400
  }).render(true);
}

// Run the extractor
main();