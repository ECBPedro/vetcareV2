// Infraestrutura: único arquivo que conversa com o localStorage
// (o "banco de dados" desta demonstração fica no navegador).
const PREFIXO = "vetcare:";

export function ler(chave, padrao = null) {
  const bruto = localStorage.getItem(PREFIXO + chave);
  return bruto ? JSON.parse(bruto) : padrao;
}

export function salvar(chave, valor) {
  localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
}

export function remover(chave) {
  localStorage.removeItem(PREFIXO + chave);
}
