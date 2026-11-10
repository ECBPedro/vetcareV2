// Sessão do usuário: guarda o token e diz "quem está logado".
import { ler, salvar, remover } from "../infraestrutura/persistencia/armazenamento.js";
import { lerToken } from "../api/seguranca/token.js";

export function iniciarSessao(token) { salvar("token", token); }
export function encerrarSessao()     { remover("token"); }

export function sessaoAtual() {
  const token = ler("token");
  return token ? lerToken(token) : null;
}

// Use no começo de toda página protegida: sem login, volta para a tela de entrada.
export function exigirLogin() {
  const sessao = sessaoAtual();
  if (!sessao) {
    window.location.href = new URL("../../index.html", import.meta.url).href;
    return null;
  }
  return sessao;
}
