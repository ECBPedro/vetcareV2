// Controller do módulo Agendamento.
import * as agendamento from "../../modulos/agendamento/index.js";
import { buscarVeterinarioPorUsuario } from "../../modulos/profissionais/index.js";
import { executar } from "../executar.js";

export const horarios = ({ veterinarioId, data }) =>
  executar("agenda:consultar", () => agendamento.horariosDoDia(veterinarioId, data));

export const agendarConsulta = (dados) =>
  executar("agenda:agendar", () => agendamento.agendar(dados));

// O veterinário logado vê, por padrão, só a própria agenda ("Minha agenda").
export const consultarAgenda = (filtro) =>
  executar("agenda:consultar", (sessao) => {
    const proprio = sessao.perfil === "VETERINARIO" ? buscarVeterinarioPorUsuario(sessao.id)?.id : null;
    return agendamento.consultarAgenda({ ...filtro, veterinarioId: proprio ?? filtro.veterinarioId });
  });

// REQ 08: só quem pode agendar pode cancelar (matriz de permissões da Etapa 1).
export const cancelarConsulta = (id) =>
  executar("agenda:agendar", () => agendamento.cancelar(Number(id)));
