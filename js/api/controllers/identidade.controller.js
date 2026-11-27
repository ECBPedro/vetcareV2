// Controller do módulo Identidade (REQ 01 Manter Usuário). Só o Administrador acessa.
import * as identidade from "../../modulos/identidade/index.js";
import { executar } from "../executar.js";

export const listarUsuarios = (busca) => executar("usuario:consultar", () => identidade.consultarUsuarios(busca));

// A sessão (quem pede) vem do token; assim o usuário não consegue "se passar" por outro.
export const salvarUsuario = (dados) => executar("usuario:gravar", (sessao) =>
  dados.id ? identidade.alterarUsuario(Number(dados.id), dados, sessao.id) : identidade.cadastrarUsuario(dados));
export const inativarUsuario = (id) => executar("usuario:gravar", (sessao) => identidade.inativarUsuario(Number(id), sessao.id));
export const reativarUsuario = (id) => executar("usuario:gravar", () => identidade.reativarUsuario(Number(id)));
