// Controller: valida a entrada, chama o módulo e devolve uma resposta simples.
import { autenticar } from "../../modulos/identidade/index.js";
import { criarToken } from "../seguranca/token.js";

export function login({ email, senha }) {
  if (!email || !senha) {
    return { ok: false, erro: "Informe usuário e senha." };
  }
  const usuario = autenticar(email, senha);
  if (!usuario) {
    // mesma mensagem para qualquer erro: não revela se o e-mail existe
    return { ok: false, erro: "Usuário ou senha inválidos." };
  }
  return { ok: true, token: criarToken(usuario), usuario };
}
