// Porta de entrada da "API": confere se há sessão válida e se o perfil pode executar a ação.
import { ler } from "../../infraestrutura/persistencia/armazenamento.js";
import { lerToken } from "./token.js";
import { temPermissao } from "./rbac.js";

export function autorizar(acao) {
  const token = ler("token");
  const sessao = token ? lerToken(token) : null;
  if (!sessao) return { ok: false, codigo: 401, erro: "Sessão expirada. Entre novamente." };
  if (!temPermissao(sessao.perfil, acao)) return { ok: false, codigo: 403, erro: "Você não tem permissão para esta ação." };
  return { ok: true, sessao };
}
