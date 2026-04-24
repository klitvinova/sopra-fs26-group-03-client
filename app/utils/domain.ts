import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl =
    process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://sopra-fs26-group-03-server.oa.r.appspot.com";
  const devUrl = "http://localhost:8080";

  // If we are in the browser, check the hostname
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return devUrl;
    }
  }

  return isProduction() ? prodUrl : devUrl;
}
