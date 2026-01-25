"use strict";
var ZoteroPluginUTS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    addToAllWindows: () => addToAllWindows,
    addToWindow: () => addToWindow,
    removeFromAllWindows: () => removeFromAllWindows,
    removeFromWindow: () => removeFromWindow,
    shutdown: () => shutdown,
    startup: () => startup
  });
  function addToWindow(window) {
    const document = window.document;
    const itemMenu = document.getElementById("zotero-itemmenu");
    if (itemMenu) {
      const existing = document.getElementById("uts-copy-menuitem");
      if (existing) existing.remove();
      const menuItem = document.createXULElement ? document.createXULElement("menuitem") : document.createElement("menuitem");
      menuItem.id = "uts-copy-menuitem";
      menuItem.setAttribute("label", "Copy UTS APA 7th Citation");
      menuItem.setAttribute("class", "menuitem-iconic");
      menuItem.addEventListener("command", async () => {
        await copyCitation(window);
      });
      itemMenu.appendChild(menuItem);
    }
  }
  function removeFromWindow(window) {
    const document = window.document;
    const menuItem = document.getElementById("uts-copy-menuitem");
    if (menuItem) {
      menuItem.remove();
    }
  }
  function addToAllWindows() {
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
      addToWindow(win);
    }
  }
  function removeFromAllWindows() {
    const windows = Zotero.getMainWindows();
    for (let win of windows) {
      removeFromWindow(win);
    }
  }
  async function startup({ id, version, rootURI }) {
    Zotero.debug("UTS Copy: Index Startup");
    addToAllWindows();
  }
  function shutdown() {
    Zotero.debug("UTS Copy: Index Shutdown");
    removeFromAllWindows();
  }
  async function copyCitation(window) {
    try {
      const pane = Zotero.getActiveZoteroPane();
      if (!pane) return;
      const items = pane.getSelectedItems();
      if (!items || !items.length) return;
      const format = "bibliography=http://www.zotero.org/styles/apa";
      const qc = Zotero.QuickCopy;
      const biblio = qc.getContentFromItems(items, format);
      const text = biblio.text || biblio;
      if (window.navigator.clipboard) {
        await window.navigator.clipboard.writeText(text);
      } else {
        const clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
        clipboard.copyString(text);
      }
      Zotero.debug("UTS Copy: Copied to clipboard");
    } catch (e) {
      Zotero.debug("UTS Copy Error: " + e);
    }
  }
  return __toCommonJS(src_exports);
})();
