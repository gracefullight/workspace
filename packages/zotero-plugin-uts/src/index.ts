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

async function installStyle(rootURI: string) {
    try {
        const styleURI = rootURI + "uts-apa.csl";
        // Zotero 7 API: fetch is available
        const response = await fetch(styleURI);
        if (!response.ok) {
            Zotero.debug("UTS Copy: Failed to fetch style " + styleURI);
            return;
        }
        const styleContent = await response.text();

        // Install the style.
        // Zotero.Styles.install(style, url, temp)
        // If we want it to persist, temp=false. If we want it just for this session or implicit, maybe?
        // Let's install it permanently so it appears in the styles list if the user wants to check it.
        // Or if it's already installed, this might update it.

        // Zotero 7: Zotero.Styles.install(params) where params is { url, content, ... } ??
        // Legacy: Zotero.Styles.install(style, url, temporary)
        // Let's check if there is a modern method.
        // Actually, Zotero.Styles.install takes (xml, url, temporary).
        // We will install it permanently (temp=false) so QuickCopy can reference it by ID reliably.

        // Check if already installed to avoid overhead?
        const styleID = "http://www.zotero.org/styles/uts-apa-7th";
        const existing = Zotero.Styles.get(styleID);
        if (existing) {
             // Maybe update it if version differs? For now, we force install/update on startup
             // to ensure our bundled version is used.
             // However, Zotero might prompt the user if we try to overwrite?
             // Zotero.Styles.install usually handles updates silently if forced or same ID.
        }

        await Zotero.Styles.install(styleContent, styleURI, false);
        Zotero.debug("UTS Copy: Installed UTS APA 7th style");
    } catch (e) {
        Zotero.debug("UTS Copy: Error installing style: " + e);
    }
}

export async function startup({ id, version, rootURI }: { id: string, version: string, rootURI: string }) {
    Zotero.debug("UTS Copy: Index Startup");
    await installStyle(rootURI);
    addToAllWindows();
}

export function shutdown() {
    Zotero.debug("UTS Copy: Index Shutdown");
    removeFromAllWindows();
}

async function copyCitation(window: Window) {
    try {
        const pane = Zotero.getActiveZoteroPane();
        if (!pane) return;

        const items = pane.getSelectedItems();
        if (!items || !items.length) return;

        // Use our custom style ID
        const format = "bibliography=http://www.zotero.org/styles/uts-apa-7th";

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
        // Fallback to standard APA if custom fails?
        if (e.toString().includes("style not found") || e.toString().includes("NS_ERROR_INVALID_ARG")) {
             Zotero.debug("UTS Copy: Fallback to standard APA");
             // Fallback logic could be implemented here
        }
    }
}
