// @ts-ignore
declare const Zotero: any;
// @ts-ignore
declare const Services: any;

function log(msg: string) {
    Zotero.debug("UTS Copy: " + msg);
}

// @ts-ignore
globalThis.install = function() {
    log("Installed");
}

// @ts-ignore
globalThis.startup = async function({ id, version, rootURI }: { id: string, version: string, rootURI: string }) {
    log("Starting");
    Services.scriptloader.loadSubScript(rootURI + 'index.global.js');

    // @ts-ignore
    if (typeof ZoteroPluginUTS !== 'undefined') {
        // @ts-ignore
        await ZoteroPluginUTS.startup({ id, version, rootURI });
    }
}

// @ts-ignore
globalThis.onMainWindowLoad = function({ window }: { window: Window }) {
    // @ts-ignore
    if (typeof ZoteroPluginUTS !== 'undefined') {
        // @ts-ignore
        ZoteroPluginUTS.addToWindow(window);
    }
}

// @ts-ignore
globalThis.onMainWindowUnload = function({ window }: { window: Window }) {
    // @ts-ignore
    if (typeof ZoteroPluginUTS !== 'undefined') {
        // @ts-ignore
        ZoteroPluginUTS.removeFromWindow(window);
    }
}

// @ts-ignore
globalThis.shutdown = function() {
    log("Shutting down");
    // @ts-ignore
    if (typeof ZoteroPluginUTS !== 'undefined') {
        // @ts-ignore
        ZoteroPluginUTS.shutdown();
    }
}

// @ts-ignore
globalThis.uninstall = function() {
    log("Uninstalled");
}
