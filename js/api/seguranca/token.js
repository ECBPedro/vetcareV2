// Token de DEMONSTRAÇÃO. Num sistema real ele seria gerado e assinado pelo servidor.
const VALIDADE_MS = 30 * 60 * 1000; // 30 minutos

export function criarToken(usuario) {
  const dados = {
    id: usuario.id,
    nome: usuario.nome,
    perfil: usuario.perfil,
    expiraEm: Date.now() + VALIDADE_MS,
  };
  return btoa(encodeURIComponent(JSON.stringify(dados)));
}

// Devolve os dados do token, ou null se for inválido ou estiver vencido.
export function lerToken(token) {
  try {
    const dados = JSON.parse(decodeURIComponent(atob(token)));
    return Date.now() > dados.expiraEm ? null : dados;
  } catch {
    return null;
  }
}
