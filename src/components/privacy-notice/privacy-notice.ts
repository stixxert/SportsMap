import * as zustand from "zustand";

interface PrivacyDialogState {
  open: boolean;
}

interface PrivacyDialogActions {
  setOpen: (open: boolean) => void;
}

type PrivacyDialogStore = PrivacyDialogState & PrivacyDialogActions;

export const usePrivacyNoticeStore = zustand.create<PrivacyDialogStore>(
  (set) => ({
    open: false,
    setOpen: (open: boolean) => {
      set({ open });
    },
  }),
);

export const usePrivacyNoticeState = () =>
  usePrivacyNoticeStore((state) => state.open);
