import type { FormEvent, MouseEvent } from "react";
import type { Bookmarks } from "webextension-polyfill";

import { clsx } from "clsx/lite";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { HexColorInput } from "react-colorful";

import { ColorPicker } from "#components/ColorPicker";
import { CaretDown } from "#components/icons/CaretDown.tsx";
import { Modal } from "#components/Modal";
import { dialColors } from "#lib/dialColors";
import { bookmarks } from "#stores/useBookmarks";
import { colorPicker } from "#stores/useColorPicker";
import { modals } from "#stores/useModals";
import { settings } from "#stores/useSettings";
import { getLinkName } from "#utils/filter";

import "./styles.css";

interface BookmarkModalProps {
  onClose?: () => void;
  onSave?: (data: { title: string; url: string; panel?: string }) => void;
  targetPanel?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-full" | "full-screen-panel" | null;
}

export const BookmarkModal = observer(function BookmarkModal({ 
  onClose, 
  onSave, 
  targetPanel 
}: BookmarkModalProps) {
  const [editingBookmark, setEditingBookmark] =
    useState<Bookmarks.BookmarkTreeNode | null>(null);
  const [editingPanelBookmark, setEditingPanelBookmark] = useState<any>(null);
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkURL, setBookmarkURL] = useState("");
  const [parentFolderId, setparentFolderId] = useState(
    (bookmarks.currentFolder as { id: string }).id || "",
  );

  // Get default panel based on current grid layout
  const getDefaultPanel = () => {
    const gridLayout = settings.gridLayout || "4-panel";
    switch (gridLayout) {
      case "full-screen":
        return "full-screen-panel";
      case "2-panel":
      case "3-panel":
      case "4-panel":
      default:
        return "top-left";
    }
  };

  const [selectedPanel, setSelectedPanel] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-full" | "full-screen-panel">(
    targetPanel || modals.currentPanel || getDefaultPanel()
  );
  const [customDialColor, setCustomDialColor] = useState("");
  const isEditing = modals.editingBookmarkId !== null;
  const bookmarkType = modals.isOpen?.includes("folder")
    ? "folder"
    : "bookmark";

  const usesPanelSystem = onSave && targetPanel;
  const isPanelBookmarkEdit = isEditing && editingPanelBookmark;

  // Panel display names - layout aware
  const getPanelDisplayName = (panel: string) => {
    const gridLayout = settings.gridLayout || "4-panel";
    
    switch (panel) {
      case "top-left":
        return gridLayout === "2-panel" ? "Left Panel" : "Top Left Panel";
      case "top-right":
        return gridLayout === "2-panel" ? "Right Panel" : "Top Right Panel";
      case "bottom-left":
        return "Bottom Left Panel";
      case "bottom-right":
        return "Bottom Right Panel";
      case "bottom-full":
        return gridLayout === "3-panel" ? "Bottom Panel" : "Bottom Full Panel";
      case "full-screen-panel":
        return "Full Screen Panel";
      default:
        return "Unknown Panel";
    }
  };

  // Get available panels based on grid layout
  const getAvailablePanels = () => {
    const gridLayout = settings.gridLayout || "4-panel";
    
    switch (gridLayout) {
      case "2-panel":
        return [
          { value: "top-left", label: "Left Panel" },
          { value: "top-right", label: "Right Panel" }
        ];
      case "3-panel":
        return [
          { value: "top-left", label: "Top Left Panel" },
          { value: "top-right", label: "Top Right Panel" },
          { value: "bottom-full", label: "Bottom Panel" }
        ];
      case "full-screen":
        return [
          { value: "full-screen-panel", label: "Full Screen Panel" }
        ];
      case "4-panel":
      default:
        return [
          { value: "top-left", label: "Top Left Panel" },
          { value: "top-right", label: "Top Right Panel" },
          { value: "bottom-left", label: "Bottom Left Panel" },
          { value: "bottom-right", label: "Bottom Right Panel" }
        ];
    }
  };

  // Handle modal close function
  const handleModalClose = () => {
    if (usesPanelSystem || isPanelBookmarkEdit) {
      modals.editingBookmarkId = null;
      modals.isOpen = null;
      onClose?.();
    } else {
      modals.closeModal();
      onClose?.();
    }
  };

  // Keyboard event handler for ESC and Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key always closes the modal
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleModalClose();
        return;
      }
      
      // Space key closes modal only when not focused on input elements
      if (e.key === " " || e.code === "Space") {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.contentEditable === "true"
        );
        
        // Only close on space if not typing in an input
        if (!isInputFocused) {
          e.preventDefault();
          e.stopPropagation();
          handleModalClose();
        }
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown, true);
    
    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [usesPanelSystem, isPanelBookmarkEdit, onClose]);

  useEffect(() => {
    async function loadBookmarkData() {
      if (modals.editingBookmarkId) {
        const panelManager = (window as any).panelBookmarkManager;
        
        if (panelManager && panelManager.isPanelBookmark(modals.editingBookmarkId)) {
          const panelBookmark = panelManager.getPanelBookmark(modals.editingBookmarkId);
          if (panelBookmark) {
            setEditingPanelBookmark(panelBookmark);
            setBookmarkTitle(panelBookmark.title || panelBookmark.name || "");
            setBookmarkURL(panelBookmark.url || "");
            setSelectedPanel(panelBookmark.panel || getDefaultPanel());
            const customColor = settings.dialColors[modals.editingBookmarkId];
            setCustomDialColor(customColor || "");
          }
        } else {
          const bookmark = await bookmarks.getBookmarkById(
            modals.editingBookmarkId,
          );
          if (bookmark) {
            setEditingBookmark(bookmark);
            setBookmarkTitle(bookmark.title || "");
            setBookmarkURL(bookmark.url || "");
            setparentFolderId(bookmark.parentId || "");
            const customColor = settings.dialColors[modals.editingBookmarkId];
            setCustomDialColor(customColor || "");
          }
        }
      }
    }

    loadBookmarkData();
  }, [modals.editingBookmarkId]);

  // Update selected panel when grid layout changes
  useEffect(() => {
    if (!isEditing) {
      const currentDefault = getDefaultPanel();
      const availablePanels = getAvailablePanels();
      const isCurrentPanelAvailable = availablePanels.some(p => p.value === selectedPanel);
      
      if (!isCurrentPanelAvailable) {
        setSelectedPanel(currentDefault as any);
      }
    }
  }, [settings.gridLayout, isEditing, selectedPanel]);

  const defaultDialColor = dialColors(
    getLinkName(bookmarkType === "folder" ? bookmarkTitle : bookmarkURL),
  );
  const dialColor = customDialColor
    ? customDialColor
    : (bookmarkType === "folder" && bookmarkTitle) ||
        (bookmarkType === "bookmark" && bookmarkURL)
      ? defaultDialColor
      : "";
  const disabled = bookmarkType === "folder" ? false : !bookmarkURL;
  
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (usesPanelSystem && onSave) {
      onSave({
        title: bookmarkTitle,
        url: bookmarkURL,
        panel: selectedPanel
      });
      return;
    }

    if (isEditing) {
      const color = dialColor !== defaultDialColor ? customDialColor : "";
      if (color && modals.editingBookmarkId) {
        settings.handleDialColors(modals.editingBookmarkId, color);
      } else if (modals.editingBookmarkId) {
        settings.handleClearColor(modals.editingBookmarkId);
      }
      
      if (isPanelBookmarkEdit) {
        const panelManager = (window as any).panelBookmarkManager;
        if (panelManager && modals.editingBookmarkId) {
          await bookmarks.updateBookmark(modals.editingBookmarkId, {
            title: bookmarkTitle,
            url: bookmarkURL,
          });
          
          await panelManager.updatePanelBookmark(modals.editingBookmarkId, {
            title: bookmarkTitle,
            url: bookmarkURL,
            panel: selectedPanel
          });
        }
        
        modals.editingBookmarkId = null;
        modals.isOpen = null;
        onClose?.();
        return;
      }
      
      const detailsChanged =
        ((bookmarkType === "folder" || bookmarkType === "bookmark") &&
          bookmarkTitle !== editingBookmark?.title) ||
        (bookmarkType === "bookmark" && bookmarkURL !== editingBookmark?.url);
      const parentChanged = parentFolderId !== editingBookmark?.parentId;

      let updatedBookmark: Bookmarks.BookmarkTreeNode | undefined;
      let closeModalOptions:
        | { focusAfterClosed?: FocusAfterClosed }
        | undefined;

      if (detailsChanged && modals.editingBookmarkId) {
        updatedBookmark = await bookmarks.updateBookmark(
          modals.editingBookmarkId,
          {
            title: bookmarkTitle,
            ...(bookmarkType === "bookmark" ? { url: bookmarkURL } : {}),
          },
        );
        closeModalOptions = {
          focusAfterClosed: () =>
            document.querySelector(`[data-id="${updatedBookmark!.id}"]`),
        };
      }

      if (parentChanged) {
        bookmarks.moveBookmark({
          id: modals.editingBookmarkId!,
          from: undefined,
          to: undefined,
          parentId: parentFolderId,
        });
        closeModalOptions = undefined;
      }

      modals.closeModal(closeModalOptions);
      onClose?.();
    
    } else {
      const panelManager = (window as any).panelBookmarkManager;

      if (panelManager && panelManager.addBookmarkToPanel && bookmarkType === "bookmark") {
        const targetPanelForNew = selectedPanel || getDefaultPanel();
        const created = await panelManager.addBookmarkToPanel({
          title: bookmarkTitle,
          url: bookmarkURL,
          panel: targetPanelForNew
        });

        if (dialColor !== defaultDialColor && created?.id) {
          settings.handleDialColors(created.id, customDialColor);
        }

        modals.closeModal({
          focusAfterClosed: () =>
            created?.id ? document.querySelector(`[data-id="${created.id}"]`) : undefined,
        });
        onClose?.();
        return;
      }

      const newBookmark = await bookmarks.createBookmark({
        url: bookmarkType === "bookmark" ? bookmarkURL : undefined,
        title: bookmarkTitle,
        parentId: parentFolderId,
      });

      if (dialColor !== defaultDialColor) {
        settings.handleDialColors(newBookmark.id, customDialColor);
      }

      if (panelManager) {
        const targetPanelForNew = selectedPanel || getDefaultPanel();
        const nextIndex = panelManager.getNextIndexForPanel
          ? panelManager.getNextIndexForPanel(targetPanelForNew)
          : 9999;

        const panelBookmarkEntry = {
          name: bookmarkTitle,
          title: bookmarkTitle,
          type: bookmarkType,
          index: nextIndex,
          url: bookmarkType === "bookmark" ? bookmarkURL : undefined,
          panel: targetPanelForNew,
          id: newBookmark.id,
          isPanelBookmark: true,
        };

        panelManager.addPanelBookmark(panelBookmarkEntry);
      }

      modals.closeModal({
        focusAfterClosed: () =>
          document.querySelector(`[data-id="${newBookmark.id}"]`),
      });
      onClose?.();
    }
  }

  function resetCustomDialColor(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setCustomDialColor("");
    (document.querySelector("#dial-color-input") as HTMLInputElement)?.focus();
  }

  useEffect(() => {
    if (!onClose) return;
    const handler = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const closeEl = t.closest('button[aria-label="Close"], .close-button, .modal-close, .Modal__close');
      if (closeEl) {
        setTimeout(() => onClose?.(), 0);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [onClose]);

  const handleCancel = () => {
    handleModalClose();
  };

  let modalTitle = `${isEditing ? "Edit" : "New"} ${
    bookmarkType === "bookmark" ? "Bookmark" : "Folder"
  }`;

  if (isPanelBookmarkEdit) {
    modalTitle += ` (${getPanelDisplayName(editingPanelBookmark?.panel || getDefaultPanel())})`;
  } else if (targetPanel) {
    modalTitle += ` (${getPanelDisplayName(targetPanel)})`;
  }

  const availablePanels = getAvailablePanels();

  return (
    <Modal
      onClose={onClose} 
      title={modalTitle}
      initialFocus="#title-input"
      width="400px"
    >
      <div className="BookmarkModal">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor="title-input">Name:</label>
            <input
              type="text"
              value={bookmarkTitle}
              className="input"
              id="title-input"
              onChange={(e) => setBookmarkTitle(e.target.value)}
              autoComplete="off"
            />
            {bookmarkType === "bookmark" && (
              <>
                <label htmlFor="url-input">URL:</label>
                <input
                  type="text"
                  value={bookmarkURL}
                  className="input"
                  id="url-input"
                  onChange={(e) => setBookmarkURL(e.target.value)}
                  autoComplete="off"
                  required
                />
              </>
            )}
            
            {/* Panel Selection - only show dropdown for editing panel bookmarks or when creating new bookmarks */}
            {usesPanelSystem && !isPanelBookmarkEdit ? (
              <>
                <label>Panel:</label>
                <div className="input" style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}>
                  {getPanelDisplayName(targetPanel || getDefaultPanel())}
                </div>
              </>
            ) : (
              <>
                <label htmlFor="panel-select">Panel:</label>
                <div className="folder-select">
                  <select
                    id="panel-select"
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value as any)}
                    className="input"
                  >
                    {availablePanels.map(panel => (
                      <option key={panel.value} value={panel.value}>
                        {panel.label}
                      </option>
                    ))}
                  </select>
                  <CaretDown />
                </div>
              </>
            )}

            <label htmlFor="dial-color-input">Color:</label>
            <div className="dial-color-input">
              <button
                className="btn defaultBtn colorBtn"
                style={{ backgroundColor: dialColor }}
                onClick={colorPicker.openColorPicker}
                aria-label="Open color picker"
                type="button"
              />
              {colorPicker.isOpen && (
                <ColorPicker
                  {...{
                    color: dialColor,
                    handler: setCustomDialColor,
                    label: "Dial Color",
                  }}
                />
              )}
              <HexColorInput
                color={dialColor}
                id="dial-color-input"
                onChange={setCustomDialColor}
                className={clsx(
                  "input",
                  dialColor && dialColor !== defaultDialColor && "connected",
                )}
                prefixed={true}
              />
              {dialColor && dialColor !== defaultDialColor && (
                <button
                  className="btn defaultBtn resetBtn"
                  onClick={resetCustomDialColor}
                  type="button"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="buttons">
            <button type="submit" className="btn submitBtn" disabled={disabled}>
              Submit
            </button>
            <button
              type="button"
              className="btn defaultBtn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
});