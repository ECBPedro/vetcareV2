// Testes automáticos das regras de negócio. Rodar com: node --test tests/
import "./preparar-ambiente.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { login } from "../js/api/controllers/auth.controller.js";
import { salvar } from "../js/infraestrutura/persistencia/armazenamento.js";
import * as cadastro from "../js/api/controllers/cadastro.controller.js";
import * as agenda from "../js/api/controllers/agendamento.controller.js";
import { somarDias, hoje } from "../js/compartilhado/datas.js";

const entrar = (email, senha) => salvar("token", login({ email, senha }).token);
const AMANHA = somarDias(hoje(), 1);
const tutorValido = { nome: "Teste da Silva", cpf: "999.888.777-66", telefone: "(71) 98888-7777", email: "teste@email.com" };

test.beforeEach(() => { localStorage.clear(); });

test("REQ 02: login com senha errada é recusado com mensagem genérica", () => {
  const r = login({ email: "ana.souza@clinica.com", senha: "errada" });
  assert.equal(r.ok, false);
  assert.equal(r.erro, "Usuário ou senha inválidos.");
});

test("RBAC: veterinário não pode cadastrar tutor; recepcionista pode", () => {
  entrar("paulo.reis@clinica.com", "vet12345");
  assert.equal(cadastro.salvarTutor(tutorValido).codigo, 403);
  entrar("ana.souza@clinica.com", "recep123");
  assert.equal(cadastro.salvarTutor(tutorValido).ok, true);
});

test("sem login, nenhuma ação é permitida", () => {
  assert.equal(cadastro.listarTutores("").codigo, 401);
});

test("REQ 04: valida CPF, impede CPF repetido e faz exclusão lógica", () => {
  entrar("ana.souza@clinica.com", "recep123");
  assert.equal(cadastro.salvarTutor({ ...tutorValido, cpf: "123" }).ok, false);
  const criado = cadastro.salvarTutor(tutorValido);
  assert.equal(cadastro.salvarTutor(tutorValido).erro, "Já existe um tutor ativo com este CPF.");
  assert.equal(cadastro.inativarTutor(criado.dados.id).ok, true);
  assert.equal(cadastro.listarTutores("Teste").dados.length, 0);   // some da lista, mas continua guardado
});

test("REQ 05: animal precisa de tutor ativo; inativar tutor inativa seus animais", () => {
  entrar("ana.souza@clinica.com", "recep123");
  const animalSemTutor = { nome: "Rex", especie: "Cão", sexo: "Macho", raca: "SRD", nascimento: "2020-01-01" };
  assert.equal(cadastro.salvarAnimal(animalSemTutor).ok, false);
  assert.equal(cadastro.salvarAnimal({ ...animalSemTutor, tutorId: 1 }).ok, true);
  cadastro.inativarTutor(1);
  assert.equal(cadastro.listarAnimais({ tutorId: 1 }).dados.length, 0);
});

test("REQ 07: não permite dois agendamentos no mesmo horário do mesmo veterinário", () => {
  entrar("ana.souza@clinica.com", "recep123");
  const dados = { animalId: 1, veterinarioId: 1, data: AMANHA, hora: "10:00" };
  assert.equal(agenda.agendarConsulta(dados).ok, true);
  assert.equal(agenda.agendarConsulta({ ...dados, animalId: 3 }).erro, "Este horário já está ocupado para o veterinário.");
  assert.equal(agenda.agendarConsulta({ ...dados, veterinarioId: 2 }).ok, true);   // outro veterinário: livre
});

test("REQ 07: não agenda no passado e só a recepção agenda", () => {
  entrar("ana.souza@clinica.com", "recep123");
  assert.equal(agenda.agendarConsulta({ animalId: 1, veterinarioId: 1, data: "2020-01-01", hora: "09:00" }).erro, "Não é possível agendar no passado.");
  entrar("carlos.silva@clinica.com", "admin123");
  assert.equal(agenda.agendarConsulta({ animalId: 1, veterinarioId: 1, data: AMANHA, hora: "09:00" }).codigo, 403);
});

test("cache da agenda: o horário agendado aparece como ocupado na hora (invalidação)", () => {
  entrar("ana.souza@clinica.com", "recep123");
  const antes = agenda.horarios({ veterinarioId: 1, data: AMANHA }).dados.find((h) => h.hora === "14:00");
  assert.equal(antes.livre, true);                                    // esta leitura fica em cache
  agenda.agendarConsulta({ animalId: 1, veterinarioId: 1, data: AMANHA, hora: "14:00" });
  const depois = agenda.horarios({ veterinarioId: 1, data: AMANHA }).dados.find((h) => h.hora === "14:00");
  assert.equal(depois.livre, false);                                  // cache foi invalidado
});

test("REQ 09: veterinário vê só a própria agenda; semana inclui os 7 dias", () => {
  entrar("paulo.reis@clinica.com", "vet12345");
  const dia = agenda.consultarAgenda({ visao: "dia", data: hoje() }).dados;
  assert.ok(dia.length > 0 && dia.every((c) => c.veterinarioNome === "Dr. Paulo Reis"));
  entrar("ana.souza@clinica.com", "recep123");
  assert.ok(agenda.consultarAgenda({ visao: "semana", data: hoje() }).dados.length >= 4);
});
