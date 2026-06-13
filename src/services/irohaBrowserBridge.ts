// Browser-only Iroha bridge.
// In Electron, window.iroha is provided by the preload script. In a plain
// browser there is no preload, so we install a minimal, pure-JS bridge that
// implements only what the Commons + wallet flow needs. Methods are added
// incrementally; each mirrors the Electron preload's behavior.

import {
  AccountAddress,
  encodeI105AccountAddress,
} from "@iroha/iroha-js/address";
import { publicKeyFromPrivate } from "@iroha/iroha-js/crypto";


const SORA_NETWORK_PREFIX = 753; // Minamoto default, matches electron/accountAddress.ts

const normalizeNetworkPrefix = (value?: number): number => {
  if (value === undefined) return SORA_NETWORK_PREFIX;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 0x3fff) {
    throw new Error("networkPrefix must be an integer between 0 and 16383.");
  }
  return n;
};

// Mirror of electron/accountAddress.ts deriveAccountAddressView, minus the
// optional native full-width rendering (which gracefully degrades to "").
const deriveAccountAddressView = (input: {
  domain: string;
  publicKeyHex: string;
  networkPrefix?: number;
}) => {
  const networkPrefix = normalizeNetworkPrefix(input.networkPrefix);
  const publicKey = Buffer.from(input.publicKeyHex.trim(), "hex");
  const address = AccountAddress.fromAccount({ publicKey });
  const literal = (prefix: number) =>
    encodeI105AccountAddress(address.canonicalBytes(), {
      chainDiscriminant: prefix,
    });
  return {
    accountId: literal(networkPrefix),
    i105AccountId: literal(networkPrefix),
    i105DefaultAccountId: literal(SORA_NETWORK_PREFIX),
    i105DefaultFullwidthAccountId: "",
    publicKeyHex: publicKey.toString("hex").toUpperCase(),
    accountIdWarning:
      "Native I105 rendering is unavailable; using canonical JS I105 rendering.",
  };
};
const sessionSecrets = new Map<string, string>();

// In the browser, route Torii calls through the same-origin proxy so CORS
// doesn't block them. https://taira.sora.org -> /taira, etc.
const toProxyBase = (toriiUrl: string): string => {
  if (toriiUrl.includes("taira.sora.org")) return "/taira";
  if (toriiUrl.includes("minamoto.sora.org")) return "/minamoto";
  return toriiUrl.replace(/\/+$/, "");
};

const browserIroha = {
  deriveAccountAddress(input: {
    domain: string;
    publicKeyHex: string;
    networkPrefix?: number;
  }) {
    return deriveAccountAddressView(input);
  },
  derivePublicKey(privateKeyHex: string) {
    const priv = Buffer.from(privateKeyHex.trim(), "hex");
    const publicKey = publicKeyFromPrivate(priv);
    return { publicKeyHex: Buffer.from(publicKey).toString("hex").toUpperCase() };
  },
  async isSecureVaultAvailable() {
    // No OS keychain in a browser tab; wallet keys live in session memory.
    return false;  
  },
 rememberSessionSecret(input: { accountId: string; privateKeyHex: string }) {
    sessionSecrets.set(input.accountId, input.privateKeyHex);
    return { stored: true };
  },
  getSessionSecret(accountId: string) {
    return sessionSecrets.get(accountId) ?? "";
  },
  async fetchAccountAssets(input: {
    toriiUrl: string;
    accountId: string;
    assetDefinitionId?: string;
    limit?: number;
  }) {
    const base = toProxyBase(input.toriiUrl);
    const acct = encodeURIComponent(input.accountId);
    const params = new URLSearchParams({ limit: String(input.limit ?? 50) });
    if (input.assetDefinitionId) params.set("asset", input.assetDefinitionId);
    const url = `${base}/v1/accounts/${acct}/assets?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Account assets request failed (${res.status})`);
    }
   const rawItems = Array.isArray(payload?.items) ? payload.items : [];
    const items = rawItems.map((it: any) => ({
      ...it,
      asset_id: it.asset_id ?? it.asset ?? "",
      assetId: it.asset_id ?? it.asset ?? "",
      quantity: it.quantity ?? "0",
    }));
    // Return the wrapper shape the UI expects: { items, total }.
    return { items, total: payload?.total ?? items.length };
  },
  }
// Only install when the Electron preload bridge is absent (i.e. real browser).
// Never override Electron's richer bridge.
if (typeof window !== "undefined" && !(window as any).iroha) {
  (window as any).iroha = browserIroha;
}

export {};