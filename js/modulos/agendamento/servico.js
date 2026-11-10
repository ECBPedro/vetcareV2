// Regras do módulo Agendamento (REQ 07 Agendar Consulta e REQ 09 Consultar Agenda).
import { consultas } from "../../infraestrutura/persistencia/agendamento.repositorio.js";
import { obter, guardar, invalidar } from "../../infraestrutura/cache/cache.js";
import { buscarAnimal, buscarTutor } from "../cadastro/index.js";
import { buscarVeterinario } from "../profissionais/index.js";
import { ErroDeNegocio } from "../../compartilhado/validacao.js";
import { hoje, somarDias, inicioDaSemana, horariosDoExpediente, noPassado } from "../../compartilhado/datas.js";

const consultasAtivas = (veterinarioId, data) =>
  consultas.listar().filter((c) => c.veterinarioId === veterinarioId && c.data === data && c.status === "AGENDADA");

// Horários ocupados do dia — resultado guardado em cache (ADR-04).
function horasOcupadas(veterinarioId, data) {
  const chave = `agenda:${veterinarioId}:${data}`;
  let horas = obter(chave);
  if (!horas) {
    horas = consultasAtivas(veterinarioId, data).map((c) => c.hora);
    guardar(chave, horas);
  }
  return horas;
}

// Lista de horários do expediente, cada um "livre" ou não.
export function horariosDoDia(veterinarioId, data) {
  const ocupadas = horasOcupadas(Number(veterinarioId), data);
  return horariosDoExpediente().map((hora) => ({ hora, livre: !ocupadas.includes(hora) && !noPassado(data, hora) }));
}

// REQ 07: valida tudo e só então grava.
export function agendar({ animalId, veterinarioId, data, hora }) {
  const animal = buscarAnimal(Number(animalId));
  if (!animal || !animal.ativo) throw new ErroDeNegocio("Selecione um animal ativo.");
  const veterinario = buscarVeterinario(Number(veterinarioId));
  if (!veterinario || !veterinario.ativo) throw new ErroDeNegocio("Selecione um veterinário.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data ?? ""))) throw new ErroDeNegocio("Informe a data.");
  if (!horariosDoExpediente().includes(hora)) throw new ErroDeNegocio("Escolha um horário.");
  if (noPassado(data, hora)) throw new ErroDeNegocio("Não é possível agendar no passado.");

  // Conflito: consulta SEMPRE no repositório (dado fresco), nunca no cache.
  if (consultasAtivas(veterinario.id, data).some((c) => c.hora === hora)) {
    throw new ErroDeNegocio("Este horário já está ocupado para o veterinário.");
  }
  const consulta = consultas.salvar({ animalId: animal.id, tutorId: animal.tutorId, veterinarioId: veterinario.id, data, hora, status: "AGENDADA" });
  invalidar(`agenda:${veterinario.id}:${data}`);   // a agenda mudou: o cache desse dia perde a validade
  return consulta;
}

// REQ 09: visão "dia", "semana" ou "profissional" (próximas consultas de um veterinário).
export function consultarAgenda({ visao = "dia", data = hoje(), veterinarioId = null } = {}) {
  let de = data, ate = data;
  if (visao === "semana") { de = inicioDaSemana(data); ate = somarDias(de, 6); }
  if (visao === "profissional") { de = hoje(); ate = "9999-12-31"; }

  return consultas.listar()
    .filter((c) => c.data >= de && c.data <= ate && (!veterinarioId || c.veterinarioId === Number(veterinarioId)))
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .map((c) => ({
      id: c.id, data: c.data, hora: c.hora, status: c.status,
      animalNome: buscarAnimal(c.animalId)?.nome ?? "—",
      tutorNome: buscarTutor(c.tutorId)?.nome ?? "—",
      veterinarioNome: buscarVeterinario(c.veterinarioId)?.nome ?? "—",
    }));
}
