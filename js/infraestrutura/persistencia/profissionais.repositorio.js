// Repositório do módulo Profissionais (nesta sprint só leitura: REQ 06 fica para a próxima).
import { criarColecao } from "./colecao.js";

export const veterinarios = criarColecao("veterinarios", [
  { id: 1, usuarioId: 3,    nome: "Dr. Paulo Reis",   crmv: "BA-00001", especialidade: "Clínica geral", ativo: true },
  { id: 2, usuarioId: null, nome: "Dra. Marta Nunes", crmv: "BA-00002", especialidade: "Dermatologia",  ativo: true },
  { id: 3, usuarioId: null, nome: "Dr. Jorge Dias",   crmv: "BA-00003", especialidade: "Cirurgia",      ativo: true },
]);
