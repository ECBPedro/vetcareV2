// Repositório do módulo Cadastro: tutores e animais (dados de teste iguais aos protótipos).
import { criarColecao } from "./colecao.js";

export const tutores = criarColecao("tutores", [
  { id: 1, nome: "Marina Oliveira", cpf: "11122233344", telefone: "71999990000", email: "marina@email.com",   ativo: true },
  { id: 2, nome: "Rui Santos",      cpf: "22233344455", telefone: "71988880000", email: "rui@email.com",      ativo: true },
  { id: 3, nome: "Ana Paula",       cpf: "33344455566", telefone: "71977770000", email: "anapaula@email.com", ativo: true },
]);

export const animais = criarColecao("animais", [
  { id: 1, tutorId: 1, nome: "Thor", especie: "Cão",  raca: "Labrador", sexo: "Macho", nascimento: "2021-03-12", ativo: true },
  { id: 2, tutorId: 1, nome: "Mel",  especie: "Gato", raca: "Siamês",   sexo: "Fêmea", nascimento: "2022-05-20", ativo: true },
  { id: 3, tutorId: 2, nome: "Bob",  especie: "Cão",  raca: "Poodle",   sexo: "Macho", nascimento: "2019-08-02", ativo: true },
  { id: 4, tutorId: 3, nome: "Luna", especie: "Gato", raca: "SRD",      sexo: "Fêmea", nascimento: "2020-11-15", ativo: true },
]);
