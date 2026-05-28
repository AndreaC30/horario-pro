import { useEffect, useState } from "react";

import { isOnline } from "../utils/network";

export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}
