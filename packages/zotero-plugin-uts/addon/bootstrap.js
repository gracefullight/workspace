"use strict";
(() => {
  // src/bootstrap.ts
  function log(msg) {
    Zotero.debug("UTS Copy: " + msg);
  }
  globalThis.install = function() {
    log("Installed");
  };
  globalThis.startup = async function({ id, version, rootURI }) {
    log("Starting");
    Services.scriptloader.loadSubScript(rootURI + "index.global.js");
    if (typeof ZoteroPluginUTS !== "undefined") {
      await ZoteroPluginUTS.startup({ id, version, rootURI });
    }
  };
  globalThis.onMainWindowLoad = function({ window }) {
    if (typeof ZoteroPluginUTS !== "undefined") {
      ZoteroPluginUTS.addToWindow(window);
    }
  };
  globalThis.onMainWindowUnload = function({ window }) {
    if (typeof ZoteroPluginUTS !== "undefined") {
      ZoteroPluginUTS.removeFromWindow(window);
    }
  };
  globalThis.shutdown = function() {
    log("Shutting down");
    if (typeof ZoteroPluginUTS !== "undefined") {
      ZoteroPluginUTS.shutdown();
    }
  };
  globalThis.uninstall = function() {
    log("Uninstalled");
  };
})();
