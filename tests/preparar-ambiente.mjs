// Simula o localStorage do navegador para os testes rodarem no Node.
const dados = new Map();
globalThis.localStorage = {
  getItem: (k) => (dados.has(k) ? dados.get(k) : null),
  setItem: (k, v) => dados.set(k, String(v)),
  removeItem: (k) => dados.delete(k),
  clear: () => dados.clear(),
};
