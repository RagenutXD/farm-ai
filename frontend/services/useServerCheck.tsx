// helper hook to check if server is online
import { useState } from "react";

export type ServerStatus = "idle" | "checking" | "connected" | "unreachable";

export function useServerCheck(serverUrl: string) {
  const [status, setStatus] = useState<ServerStatus>("idle");

  const check = async (): Promise<boolean> => {
    setStatus("checking");
    try {
      const res = await fetch(serverUrl, { method: "HEAD" });
      if (res.ok) {
        setStatus("connected");
        return true;
      } else {
        setStatus("unreachable");
        return false;
      }
    } catch {
      setStatus("unreachable");
      return false;
    }
  };

  return { status, check };
}