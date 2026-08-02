if (typeof globalThis !== 'undefined' && typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = globalThis;
}
