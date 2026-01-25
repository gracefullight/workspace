// @ts-ignore
declare const Zotero: any;

export function addToWindow(window: Window) {
    const document = window.document;

    // Add context menu item to the Item Tree context menu
    const itemMenu = document.getElementById('zotero-itemmenu');
    if (itemMenu) {
        // Remove existing if any (cleanup safety)
        const existing = document.getElementById('uts-copy-menuitem');
        if (existing) existing.remove();

        const menuItem = document.createXULElement
            ? document.createXULElement('menuitem')
            : document.createElement('menuitem');

        menuItem.id = 'uts-copy-menuitem';
        menuItem.setAttribute('label', 'Copy UTS APA 7th Citation');
        menuItem.setAttribute('class', 'menuitem-iconic');
        // menuItem.setAttribute('image', rootURI + 'icon.png');

        menuItem.addEventListener('command', async () => {
            await copyCitation(window);
        });

        itemMenu.appendChild(menuItem);
    }
}

export function removeFromWindow(window: Window) {
    const document = window.document;
    const menuItem = document.getElementById('uts-copy-menuitem');
    if (menuItem) {
        menuItem.remove();
    }
}

export function addToAllWindows() {
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
        addToWindow(win);
    }
}

export function removeFromAllWindows() {
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
        removeFromWindow(win);
    }
}

export async function startup({ id, version, rootURI }: { id: string, version: string, rootURI: string }) {
    Zotero.debug("UTS Copy: Index Startup");
    addToAllWindows();
}

export function shutdown() {
    Zotero.debug("UTS Copy: Index Shutdown");
    removeFromAllWindows();
}

async function copyCitation(window: Window) {
    try {
        const pane = Zotero.getActiveZoteroPane(); // This usually gets the focused pane
        // Or better, use the pane from the specific window if possible.
        // In Zotero 7, Zotero.getActiveZoteroPane() might be global or window specific?
        // ZoteroPane is usually window-scope.
        // Let's rely on Zotero.getActiveZoteroPane() which is standard.

        if (!pane) return;

        const items = pane.getSelectedItems();
        if (!items || !items.length) return;

        // UTS APA 7th uses standard APA 7th
        const format = "bibliography=http://www.zotero.org/styles/apa";

        const qc = Zotero.QuickCopy;
        const biblio = qc.getContentFromItems(items, format);

        const text = biblio.text || biblio;

        if (window.navigator.clipboard) {
            await window.navigator.clipboard.writeText(text);
        } else {
             // @ts-ignore
            const clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
                            .getService(Components.interfaces.nsIClipboardHelper);
            clipboard.copyString(text);
        }

        Zotero.debug("UTS Copy: Copied to clipboard");
    } catch (e) {
        Zotero.debug("UTS Copy Error: " + e);
    }
}
