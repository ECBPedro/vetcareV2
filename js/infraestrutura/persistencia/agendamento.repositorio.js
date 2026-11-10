// Repositório do módulo Agendamento. Os dados de teste usam a data de hoje, para a agenda nunca ficar vazia.
import { criarColecao } from "./colecao.js";
import { hoje } from "../../compartilhado/datas.js";

export const consultas = criarColecao("consultas", () => [
  { id: 1, animalId: 1, tutorId: 1, veterinarioId: 1, data: hoje(), hora: "09:00", status: "AGENDADA" },
  { id: 2, animalId: 2, tutorId: 1, veterinarioId: 2, data: hoje(), hora: "09:30", status: "AGENDADA" },
  { id: 3, animalId: 3, tutorId: 2, veterinarioId: 1, data: hoje(), hora: "10:00", status: "AGENDADA" },
  { id: 4, animalId: 4, tutorId: 3, veterinarioId: 2, data: hoje(), hora: "11:00", status: "CANCELADA" },
]);
