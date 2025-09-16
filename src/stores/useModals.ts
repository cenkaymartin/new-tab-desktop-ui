import type { FocusTarget } from "#utils/focus";

import { makeAutoObservable } from "mobx";

import { focusByDataId, targetFromEvent } from "#utils/focus";

interface ModalStore {
  focusAfterClosed: FocusTarget;
  isOpen: string | null;
  editingBookmarkId: string | null;
  allowPanelSelection: boolean;
  currentPanel: string | null;
  openModal(params: {
    modal: string;
    editingBookmarkId?: string | null;
    focusAfterClosed?: FocusTarget;
    allowPanelSelection?: boolean;
    currentPanel?: string | null;
  }): void;
  closeModal({ focusAfterClosed }?: { focusAfterClosed?: FocusTarget }): void;
  setFocusFromEvent(e: Event | { currentTarget?: EventTarget | null }): void;
  setFocusById(id: string): void;
}

export const modals: ModalStore = makeAutoObservable({
  focusAfterClosed: null,
  isOpen: null,
  editingBookmarkId: null, // Holds the ID of the bookmark currently being edited
  allowPanelSelection: false,
  currentPanel: null,
  openModal({
    modal,
    editingBookmarkId = null,
    focusAfterClosed = null,
    allowPanelSelection = false,
    currentPanel = null,
  }) {
    modals.isOpen = modal;
    modals.editingBookmarkId = editingBookmarkId;
    modals.focusAfterClosed = focusAfterClosed ?? null;
    modals.allowPanelSelection = allowPanelSelection;
    modals.currentPanel = currentPanel;
    document.documentElement.classList.add("modal-open");
  },
  closeModal({ focusAfterClosed = null } = {}) {
    if (!modals.isOpen) return;
    modals.isOpen = null;
    modals.editingBookmarkId = null;
    modals.allowPanelSelection = false;
    modals.currentPanel = null;
    if (focusAfterClosed) {
      modals.focusAfterClosed = focusAfterClosed;
    }
    document.documentElement.classList.remove("modal-open");
  },
  setFocusFromEvent(e) {
    // Store the element that triggered the action so focus can be restored later
    modals.focusAfterClosed = targetFromEvent(e);
  },
  setFocusById(id) {
    // Defer finding the element until after modal close and DOM updates
    modals.focusAfterClosed = focusByDataId(id);
  },
});