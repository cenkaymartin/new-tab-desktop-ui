import type { KeyboardEvent, MouseEvent } from "react";

import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

import { bookmarks } from "#stores/useBookmarks";
import { contextMenu } from "#stores/useContextMenu";
import { modals } from "#stores/useModals";
import { settings } from "#stores/useSettings";

import "./styles.css";

export const ContextMenu = observer(function ContextMenu() {
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [currIndex, setCurrIndex] = useState(-1);
  const [menuItems, setMenuItems] = useState<HTMLButtonElement[]>([]);

  useEffect(() => {
    // Set menu items when context menu is opened.
    // Reset menu items if context menu is opened while another is open.
    setMenuItems([
      ...Array.from(contextMenuRef.current?.querySelectorAll("button") || []),
    ]);
    setCurrIndex(-1);

    // Set menu position.
    contextMenuRef.current?.style.setProperty(
      "--context-menu-top",
      `${
        contextMenu.coords.y + contextMenuRef.current?.offsetHeight >=
        window.innerHeight
          ? contextMenu.coords.y - contextMenuRef.current?.offsetHeight
          : contextMenu.coords.y
      }px`,
    );
    contextMenuRef.current?.style.setProperty(
      "--context-menu-left",
      `${
        contextMenu.coords.x + contextMenuRef.current?.offsetWidth >=
        window.innerWidth
          ? contextMenu.coords.x - contextMenuRef.current?.offsetWidth
          : contextMenu.coords.x
      }px`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenu.coords]);

  useEffect(() => {
    // Focus current menu item.
    menuItems.forEach((el) => el.classList.remove("selected"));
    if (currIndex === -1) {
      contextMenuRef.current?.focus();
    } else {
      menuItems[currIndex]?.focus();
      menuItems[currIndex]?.classList.add("selected");
    }
  }, [currIndex, menuItems]);

  function handleContextMenu(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  function handleKeyDown(e: KeyboardEvent) {
    const isNotOnMenuItem = currIndex === -1;
    const isFirstItem = currIndex === 0;
    const isLastItem = currIndex === menuItems.length - 1;

    const focus = {
      firstItem: () => {
        setCurrIndex(0);
      },
      lastItem: () => {
        setCurrIndex(menuItems.length - 1);
      },
      previousItem: () => {
        const newIndex =
          isNotOnMenuItem || isFirstItem ? menuItems.length - 1 : currIndex - 1;
        setCurrIndex(newIndex);
      },
      nextItem: () => {
        const newIndex = isNotOnMenuItem || isLastItem ? 0 : currIndex + 1;
        setCurrIndex(newIndex);
      },
    };

    const keys: Record<string, () => void> = {
      Enter: () => {
        if (isNotOnMenuItem) {
          e.preventDefault();
          e.stopPropagation();
          focus.firstItem();
        }
      },
      " ": () => {
        if (isNotOnMenuItem) {
          e.preventDefault();
          e.stopPropagation();
          focus.firstItem();
        }
      },
      Escape: () => {
        e.preventDefault();
        e.stopPropagation();
        contextMenu.closeContextMenu();
      },
      Tab: () => {
        e.preventDefault();
        e.stopPropagation();
      },
      ArrowUp: () => {
        e.preventDefault();
        e.stopPropagation();
        focus.previousItem();
      },
      ArrowDown: () => {
        e.preventDefault();
        e.stopPropagation();
        focus.nextItem();
      },
      Home: () => {
        e.preventDefault();
        e.stopPropagation();
        focus.firstItem();
      },
      End: () => {
        e.preventDefault();
        e.stopPropagation();
        focus.lastItem();
      },
    };

    if (keys[e.key]) {
      keys[e.key]();
    }
  }

  function handleMouseEnter(e: MouseEvent<HTMLButtonElement>) {
    setCurrIndex(menuItems.indexOf(e.target as HTMLButtonElement));
  }

  function handleMouseLeave() {
    setCurrIndex(-1);
  }

  function Separator() {
    return (
      <li
        className="separator"
        role="separator"
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return (
    <div
      tabIndex={-1}
      ref={contextMenuRef}
      className="ContextMenu"
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onMouseLeave={handleMouseLeave}
      role="menu"
    >
      {contextMenu.focusAfterClosed?.dataset.type === "bookmark" ? (
        <ul>
          <li>
            <button
              onClick={handleOpenLinkTab}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Open <span className="lowercase">in</span> new tab
            </button>
          </li>
          {(__CHROME__ || __FIREFOX__) && (
            <>
              <li>
                <button
                  onClick={handleOpenLinkBackgroundTab}
                  role="menuitem"
                  onMouseEnter={handleMouseEnter}
                >
                  Open <span className="lowercase">in</span> background tab
                </button>
              </li>
              <li>
                <button
                  onClick={handleOpenLinkWindow}
                  role="menuitem"
                  onMouseEnter={handleMouseEnter}
                >
                  Open <span className="lowercase">in</span> new window
                </button>
              </li>
            </>
          )}
          <Separator />
          {contextMenu.focusAfterClosed.hasAttribute("data-thumbnail") ? (
            <>
              <li>
                <button
                  role="menuitem"
                  onClick={handleSelectThumbnail}
                  onMouseEnter={handleMouseEnter}
                >
                  Select custom thumbnail
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  onClick={handleClearThumbnail}
                  onMouseEnter={handleMouseEnter}
                >
                  Clear custom thumbnail
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                role="menuitem"
                onClick={handleSelectThumbnail}
                onMouseEnter={handleMouseEnter}
              >
                Select custom thumbnail
              </button>
            </li>
          )}
          <Separator />
          <li>
            <button
              role="menuitem"
              onClick={handleShowEditBookmark}
              onMouseEnter={handleMouseEnter}
            >
              Edit
            </button>
          </li>
          <li>
            <button
              onClick={handleCopyURL}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Copy link
            </button>
          </li>
          <Separator />
          <li className="delete">
            <button
              onClick={handleDeleteBookmark}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Delete
            </button>
          </li>
        </ul>
      ) : contextMenu.focusAfterClosed?.dataset.type === "folder" ? (
        <ul>
          <li>
            <button
              onClick={handleOpenAllTab}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Open all <span className="lowercase">in</span> new tabs
            </button>
          </li>
          {(__CHROME__ || __FIREFOX__) && (
            <>
              <li>
                <button
                  onClick={handleOpenAllWindow}
                  role="menuitem"
                  onMouseEnter={handleMouseEnter}
                >
                  Open all <span className="lowercase">in</span> new window
                </button>
              </li>{" "}
            </>
          )}
          <Separator />
          {contextMenu.focusAfterClosed.hasAttribute("data-thumbnail") ? (
            <>
              <li>
                <button
                  role="menuitem"
                  onClick={handleSelectThumbnail}
                  onMouseEnter={handleMouseEnter}
                >
                  Select custom thumbnail
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  onClick={handleClearThumbnail}
                  onMouseEnter={handleMouseEnter}
                >
                  Clear custom thumbnail
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                role="menuitem"
                onClick={handleSelectThumbnail}
                onMouseEnter={handleMouseEnter}
              >
                Select custom thumbnail
              </button>
            </li>
          )}
          <Separator />
          <li>
            <button
              role="menuitem"
              onMouseEnter={handleMouseEnter}
              onClick={handleShowEditFolder}
            >
              Edit
            </button>
          </li>
          <Separator />
          <li className="delete">
            <button
              onClick={handleDeleteFolder}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Delete
            </button>
          </li>
        </ul>
      ) : (
        <ul>
          <li>
            <button
              role="menuitem"
              onMouseEnter={handleMouseEnter}
              onClick={handleShowNewBookmark}
            >
              New bookmark
            </button>
          </li>
          <li>
            <button
              role="menuitem"
              onMouseEnter={handleMouseEnter}
              onClick={handleShowNewFolder}
            >
              New folder
            </button>
          </li>
          <Separator />
          <li>
            <button
              onClick={handleOpenSettings}
              role="menuitem"
              onMouseEnter={handleMouseEnter}
            >
              Customize
            </button>
          </li>
          <Separator />
          <li>
            <button
              role="menuitem"
              onClick={handleShowWhatsNew}
              onMouseEnter={handleMouseEnter}
            >
              What&apos;s new
            </button>
          </li>
          <Separator />
          <li>
            <button
              role="menuitem"
              onClick={handleShowAbout}
              onMouseEnter={handleMouseEnter}
            >
              About
            </button>
          </li>
        </ul>
      )}
    </div>
  );
});

function handleClearThumbnail() {
  contextMenu.closeContextMenu();
  if (contextMenu.focusAfterClosed?.dataset.id) {
    settings.handleClearThumbnail(contextMenu.focusAfterClosed.dataset.id);
  }
}

function handleCopyURL() {
  contextMenu.closeContextMenu();
  const element = contextMenu.focusAfterClosed as HTMLAnchorElement;
  if (element?.href) {
    navigator.clipboard.writeText(element.href);
  }
}

function handleDeleteBookmark() {
  contextMenu.closeContextMenu();
  
  const bookmarkId = contextMenu.focusAfterClosed?.dataset.id;
  if (!bookmarkId) return;

  const panelManager = (window as any).panelBookmarkManager;
  
  if (panelManager && panelManager.isPanelBookmark(bookmarkId)) {
    panelManager.deletePanelBookmark(bookmarkId);
  } else {
    bookmarks.deleteBookmark(bookmarkId);
  }
}

function handleDeleteFolder() {
  contextMenu.closeContextMenu();
  
  const folderId = contextMenu.focusAfterClosed?.dataset.id;
  if (!folderId) {
    console.warn('Folder ID not found');
    return;
  }

  console.log('Deleting folder with ID:', folderId);
  
  const panelManager = (window as any).panelBookmarkManager;
  
  if (panelManager) {
    if (panelManager.deletePanelFolder && panelManager.deletePanelFolder(folderId)) {
      console.log('Folder deleted via panel manager');
      return;
    }
    
    if (panelManager.deletePanelBookmark && panelManager.deletePanelBookmark(folderId)) {
      console.log('Folder deleted via panel bookmark manager');
      return;
    }
  }
  
  if (bookmarks.deleteFolder) {
    console.log('Falling back to normal bookmark system');
    bookmarks.deleteFolder(folderId);
  } else {
    console.error('No deletion method available for folder:', folderId);
  }
}

function handleOpenAllWindow() {
  contextMenu.closeContextMenu();
  if (contextMenu.focusAfterClosed?.dataset.id) {
    bookmarks.openAllWindow(contextMenu.focusAfterClosed.dataset.id);
  }
}

function handleOpenAllTab() {
  contextMenu.closeContextMenu();
  if (contextMenu.focusAfterClosed?.dataset.id) {
    bookmarks.openAllTab(contextMenu.focusAfterClosed.dataset.id);
  }
}

function handleOpenLinkBackgroundTab() {
  contextMenu.closeContextMenu();
  const element = contextMenu.focusAfterClosed as HTMLAnchorElement;
  if (element?.href) {
    bookmarks.openLinkBackgroundTab(element.href);
  }
}

function handleOpenLinkWindow() {
  contextMenu.closeContextMenu();
  const element = contextMenu.focusAfterClosed as HTMLAnchorElement;
  if (element?.href) {
    bookmarks.openLinkWindow(element.href);
  }
}

function handleOpenLinkTab() {
  contextMenu.closeContextMenu();
  const element = contextMenu.focusAfterClosed as HTMLAnchorElement;
  if (element?.href) {
    bookmarks.openLinkTab(element.href);
  }
}

function handleOpenSettings() {
  contextMenu.closeContextMenu();
  window.open("/settings.html", "_blank");
}

function handleSelectThumbnail() {
  contextMenu.closeContextMenu();
  if (contextMenu.focusAfterClosed?.dataset.id) {
    settings.handleSelectThumbnail(contextMenu.focusAfterClosed.dataset.id);
  }
}

function handleShowAbout() {
  modals.openModal({
    modal: "about",
    focusAfterClosed: contextMenu.focusAfterClosed || null,
  });
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}

function handleShowEditBookmark() {
  const bookmarkId = contextMenu.focusAfterClosed?.dataset.id;
  if (!bookmarkId) return;

  const panelManager = (window as any).panelBookmarkManager;
  
  if (panelManager && panelManager.isPanelBookmark(bookmarkId)) {
    panelManager.editPanelBookmark(bookmarkId);
  } else {
    modals.openModal({
      modal: "edit-bookmark",
      editingBookmarkId: bookmarkId,
      focusAfterClosed: contextMenu.focusAfterClosed || null,
    });
  }
  
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}

function handleShowEditFolder() {
  modals.openModal({
    modal: "edit-folder",
    editingBookmarkId: contextMenu.focusAfterClosed?.dataset.id || null,
    focusAfterClosed: contextMenu.focusAfterClosed || null,
  });
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}

function handleShowNewBookmark() {
  const clickedElement = contextMenu.focusAfterClosed;
  const panelContainer = clickedElement?.closest('[data-panel]');
  const currentPanel = panelContainer?.getAttribute('data-panel') as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-full";
  
  if (currentPanel) {
    document.dispatchEvent(new CustomEvent('openPanelBookmarkModal', {
      detail: { panel: currentPanel }
    }));
  } else {
    modals.openModal({
      modal: "new-bookmark",
      currentPanel: currentPanel,
      allowPanelSelection: true,
      focusAfterClosed: contextMenu.focusAfterClosed || null,
    });
  }
  
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}

function handleShowNewFolder() {
  modals.openModal({
    modal: "new-folder",
    focusAfterClosed: contextMenu.focusAfterClosed || null,
  });
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}

function handleShowWhatsNew() {
  modals.openModal({
    modal: "whats-new",
    focusAfterClosed: contextMenu.focusAfterClosed || null,
  });
  contextMenu.closeContextMenu({ focusAfterClosed: false });
}