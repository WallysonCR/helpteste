// Setup global dos testes (Vitest).
//
// Node 22+ expõe um `localStorage` experimental que fica indefinido sem a flag
// `--localstorage-file` e sobrescreve o do jsdom. Para os testes não dependerem
// da versão do Node, usamos uma implementação simples em memória.

class MemoryStorage {
  #data = new Map();

  get length() {
    return this.#data.size;
  }

  key(index) {
    return Array.from(this.#data.keys())[index] ?? null;
  }

  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null;
  }

  setItem(key, value) {
    this.#data.set(key, String(value));
  }

  removeItem(key) {
    this.#data.delete(key);
  }

  clear() {
    this.#data.clear();
  }
}

for (const name of ["localStorage", "sessionStorage"]) {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true });
  if (typeof window !== "undefined" && window !== globalThis) {
    Object.defineProperty(window, name, { value: storage, configurable: true, writable: true });
  }
}
