// Cache de leitura em memória (ADR-04). Guarda resultados já consultados para não repetir a busca.
const itens = new Map();

export const obter    = (chave) => itens.get(chave);
export const guardar  = (chave, valor) => { itens.set(chave, valor); };

// Apaga todas as chaves que começam com o prefixo. Chamado SEMPRE que os dados mudam.
export function invalidar(prefixo) {
  for (const chave of [...itens.keys()]) if (chave.startsWith(prefixo)) itens.delete(chave);
}
