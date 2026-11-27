// Porta de entrada da "API": confere se há sessão válida e se o perfil pode executar a ação.
import { ler } from "../../infraestrutura/persistencia/armazenamento.js";
import { lerToken } from "./token.js";
import { temPermissao } from "./rbac.js";
import { buscarUsuarioPorId } from "../../modulos/identidade/index.js";

export function autorizar(acao) {
  const token = ler("token");
  const dadosDoToken = token ? lerToken(token) : null;
  if (!dadosDoToken) return { ok: false, codigo: 401, erro: "Sessão expirada. Entre novamente." };

  // Confere o usuário no cadastro: quem foi inativado perde o acesso na hora,
  // e o perfil vale o que está cadastrado agora (não o que ficou gravado no token).
  const usuario = buscarUsuarioPorId(dadosDoToken.id);
  if (!usuario || !usuario.ativo) return { ok: false, codigo: 401, erro: "Sessão encerrada: usuário inativo." };

  const sessao = { ...dadosDoToken, perfil: usuario.perfil };
  if (!temPermissao(sessao.perfil, acao)) return { ok: false, codigo: 403, erro: "Você não tem permissão para esta ação." };
  return { ok: true, sessao };
}
