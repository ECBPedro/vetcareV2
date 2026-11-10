// Padrão de todos os controllers: autoriza -> executa o módulo -> devolve { ok, dados } ou { ok:false, erro }.
import { autorizar } from "./seguranca/autorizacao.js";
import { ErroDeNegocio } from "../compartilhado/validacao.js";

export function executar(acao, funcao) {
  const autorizacao = autorizar(acao);
  if (!autorizacao.ok) return autorizacao;
  try {
    return { ok: true, dados: funcao(autorizacao.sessao) };
  } catch (erro) {
    if (erro instanceof ErroDeNegocio) return { ok: false, codigo: 422, erro: erro.message };
    throw erro;                                  // erro inesperado: não esconder
  }
}
