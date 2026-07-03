// src/web/lib/mockWallet.ts
//
// MOCK WALLET — TESTNET / DEMO ONLY. Generates a local Ed25519 keypair,
// persists it in the browser, and stands in for the real SoraSwap (SORA v3)
// wallet at the identity seam. NO REAL VALUE: this cannot move real Taira XOR.
// When SoraSwap / the real Iroha 3 web SDK ships, replace this module's
// implementation behind the same interface (getAccountId / signChallenge).
//
// The private key here lives in localStorage and is NOT secure — that is
// acceptable ONLY because this is a valueless testnet mock. Real keys must
// live in the real wallet, never in app storage.

import * as ed from "@noble/ed25519";

const STORAGE_KEY = "sora_commons_mock_wallet_v1";

function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(h: string): Uint8Array {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

type StoredWallet = { privHex: string };

let cachedPrivHex: string | null = null;

function loadOrCreatePriv(): string {
  if (cachedPrivHex) return cachedPrivHex;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredWallet = JSON.parse(raw);
      if (parsed?.privHex) { cachedPrivHex = parsed.privHex; return cachedPrivHex; }
    }
  } catch { /* fall through to create */ }
  // generate a fresh private key (32 random bytes)
  const priv = crypto.getRandomValues(new Uint8Array(32));
  const privHex = bytesToHex(priv);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ privHex } as StoredWallet)); } catch { /* ignore */ }
  cachedPrivHex = privHex;
  return privHex;
}

export async function getPublicKeyHex(): Promise<string> {
  const priv = hexToBytes(loadOrCreatePriv());
  const pub = await ed.getPublicKeyAsync(priv);
  return bytesToHex(pub);
}

// MOCK account-id derivation. NOT the real Iroha 3 network-prefix derivation.
// Replace with the real algorithm (prefix 369 Taira / 753 Minamoto) when the
// SORA v3 SDK is available. Visibly-mock prefix so it can never be mistaken
// for a real chain id.
export async function getAccountId(): Promise<string> {
  const pubHex = await getPublicKeyHex();
  return "mock-taira-" + pubHex.slice(0, 32);
}

export async function signChallenge(nonce: string): Promise<string> {
  const priv = hexToBytes(loadOrCreatePriv());
  const msg = new TextEncoder().encode(nonce);
  const sig = await ed.signAsync(msg, priv);
  return bytesToHex(sig);
}

// For the future auth-verify step: verify a signature against a pubkey.
export async function verifyChallenge(nonce: string, sigHex: string, pubHex: string): Promise<boolean> {
  try {
    const msg = new TextEncoder().encode(nonce);
    return await ed.verifyAsync(hexToBytes(sigHex), msg, hexToBytes(pubHex));
  } catch { return false; }
}

// Testnet convenience: wipe the mock identity (get a fresh one on next load).
export function resetMockWallet(): void {
  cachedPrivHex = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}