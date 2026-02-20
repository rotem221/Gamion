import { useLocation } from "react-router-dom";

export function useIsHost(): boolean {
  const { pathname } = useLocation();
  return !pathname.startsWith("/play");
}
