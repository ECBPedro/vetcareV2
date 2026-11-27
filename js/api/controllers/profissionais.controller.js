// Controller do módulo Profissionais.
import * as profissionais from "../../modulos/profissionais/index.js";
import { executar } from "../executar.js";

// Usado pelo Agendamento (lista de veterinários ativos).
export const listarVeterinarios = () => executar("profissional:consultar", () => profissionais.listarVeterinarios());

// REQ 06 (só o Administrador grava).
export const consultarVeterinarios = (busca) => executar("profissional:consultar", () => profissionais.consultarVeterinarios(busca));
export const salvarVeterinario = (dados) => executar("profissional:gravar", () =>
  dados.id ? profissionais.alterarVeterinario(Number(dados.id), dados) : profissionais.cadastrarVeterinario(dados));
export const inativarVeterinario = (id) => executar("profissional:gravar", () => profissionais.inativarVeterinario(Number(id)));
export const usuariosParaVinculo = (veterinarioId) =>
  executar("profissional:gravar", () => profissionais.usuariosParaVinculo(veterinarioId ? Number(veterinarioId) : null));
