import { useEffect } from "react";

export function usePageReloadOnUnfreeze() {
  useEffect(() => {
    let frozen = false;

    function handleFreeze() {
      frozen = true;
    }

    function handleResume() {
      if (frozen) window.location.reload();
    }

    document.addEventListener("freeze", handleFreeze);
    document.addEventListener("resume", handleResume);

    return () => {
      document.removeEventListener("freeze", handleFreeze);
      document.removeEventListener("resume", handleResume);
    };
  }, []);
}
