// Testes do REQ 01 (Manter Usuário) e do REQ 06 (Manter Veterinário). Rodar com: node --test
import "./preparar-ambiente.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { login } from "../js/api/controllers/auth.controller.js";
import { salvar } from "../js/infraestrutura/persistencia/armazenamento.js";
import * as usuarios from "../js/api/controllers/identidade.controller.js";
import * as vets from "../js/api/controllers/profissionais.controller.js";

const entrar = (email, senha) => salvar("token", login({ email, senha }).token);
const admin = () => entrar("carlos.silva@clinica.com", "admin123");
const novoUsuario = { nome: "Beatriz Lima", email: "beatriz@clinica.com", perfil: "RECEPCIONISTA", senha: "senha1234" };
const novoVet = { nome: "Dr. Lucas Prado", crmv: "ba-20202", especialidade: "Cirurgia", telefone: "(71) 98888-1111" };

test.beforeEach(() => { localStorage.clear(); });

test("REQ 01: só o administrador gerencia usuários", () => {
  entrar("ana.souza@clinica.com", "recep123");
  assert.equal(usuarios.listarUsuarios("").codigo, 403);
  assert.equal(usuarios.salvarUsuario(novoUsuario).codigo, 403);
  admin();
  assert.equal(usuarios.salvarUsuario(novoUsuario).ok, true);
});

test("REQ 01: validações (e-mail repetido, senha curta, perfil) e a senha nunca é devolvida", () => {
  admin();
  assert.equal(usuarios.salvarUsuario({ ...novoUsuario, senha: "123" }).erro, "A senha deve ter pelo menos 8 caracteres.");
  assert.equal(usuarios.salvarUsuario({ ...novoUsuario, email: "ana.souza@clinica.com" }).erro, "Já existe um usuário com este e-mail.");
  assert.equal(usuarios.salvarUsuario({ ...novoUsuario, perfil: "DONO" }).erro, "Escolha o perfil.");
  const criado = usuarios.salvarUsuario(novoUsuario);
  assert.equal("senha" in criado.dados, false);
  assert.ok(usuarios.listarUsuarios("").dados.every((u) => !("senha" in u)));
});

test("REQ 01: usuário criado consegue entrar; alterar sem senha mantém a senha; inativo não entra", () => {
  admin();
  const criado = usuarios.salvarUsuario(novoUsuario).dados;
  assert.equal(login({ email: "beatriz@clinica.com", senha: "senha1234" }).ok, true);
  usuarios.salvarUsuario({ ...novoUsuario, id: criado.id, nome: "Beatriz L. Souza", senha: "" });
  assert.equal(login({ email: "beatriz@clinica.com", senha: "senha1234" }).ok, true);     // senha antiga continua valendo
  usuarios.inativarUsuario(criado.id);
  assert.equal(login({ email: "beatriz@clinica.com", senha: "senha1234" }).ok, false);
  assert.equal(usuarios.reativarUsuario(criado.id).ok, true);
  assert.equal(login({ email: "beatriz@clinica.com", senha: "senha1234" }).ok, true);
});

test("REQ 01: não inativa a si mesmo, não deixa o sistema sem administrador e não muda o próprio perfil", () => {
  admin();
  assert.equal(usuarios.inativarUsuario(1).erro, "Você não pode inativar o seu próprio usuário.");
  assert.equal(usuarios.salvarUsuario({ id: 1, nome: "Carlos Silva", email: "carlos.silva@clinica.com", perfil: "RECEPCIONISTA" }).erro, "Você não pode alterar o seu próprio perfil.");
  const segundo = usuarios.salvarUsuario({ nome: "Outro Admin", email: "outro@clinica.com", perfil: "ADMINISTRADOR", senha: "admin9999" }).dados;
  entrar("outro@clinica.com", "admin9999");
  assert.equal(usuarios.inativarUsuario(1).ok, true);                                          // há dois: pode inativar um
  assert.equal(usuarios.inativarUsuario(segundo.id).erro, "Você não pode inativar o seu próprio usuário.");
});

test("REQ 01: usuário inativado perde o acesso imediatamente (mesmo com o token ainda válido)", () => {
  admin();
  const criado = usuarios.salvarUsuario(novoUsuario).dados;
  const tokenDela = login({ email: "beatriz@clinica.com", senha: "senha1234" }).token;
  usuarios.inativarUsuario(criado.id);
  salvar("token", tokenDela);
  assert.equal(usuarios.listarUsuarios("").codigo, 401);
});

test("REQ 06: cadastra veterinário (CRMV normalizado), valida e impede CRMV repetido", () => {
  admin();
  assert.equal(vets.salvarVeterinario({ ...novoVet, crmv: "123" }).ok, false);
  const criado = vets.salvarVeterinario(novoVet);
  assert.equal(criado.dados.crmv, "BA-20202");
  assert.equal(vets.salvarVeterinario(novoVet).erro, "Já existe um veterinário ativo com este CRMV.");
  assert.equal(vets.salvarVeterinario({ ...novoVet, especialidade: "Magia" }).ok, false);
});

test("REQ 06: vínculo só com usuário veterinário, ativo e livre", () => {
  admin();
  const livres = vets.usuariosParaVinculo().dados.map((u) => u.nome);
  assert.deepEqual(livres, ["Dra. Marta Nunes"]);                                              // Paulo já tem vínculo
  assert.equal(vets.salvarVeterinario({ ...novoVet, usuarioId: 2 }).ok, false);                // Ana é recepcionista
  assert.equal(vets.salvarVeterinario({ ...novoVet, usuarioId: 3 }).ok, false);                // Paulo já está vinculado
  const ok = vets.salvarVeterinario({ ...novoVet, crmv: "BA-30303", usuarioId: 4 });
  assert.equal(ok.ok, true);
  assert.equal(vets.consultarVeterinarios("").dados.find((v) => v.id === ok.dados.id).usuarioEmail, "marta.nunes@clinica.com");
});

test("REQ 06: alterar, inativar (sai da lista do agendamento) e permissão", () => {
  admin();
  const criado = vets.salvarVeterinario(novoVet).dados;
  assert.equal(vets.salvarVeterinario({ ...novoVet, id: criado.id, nome: "Dr. Lucas P. Prado" }).ok, true);
  assert.ok(vets.listarVeterinarios().dados.some((v) => v.nome === "Dr. Lucas P. Prado"));
  assert.equal(vets.inativarVeterinario(criado.id).ok, true);
  assert.ok(!vets.listarVeterinarios().dados.some((v) => v.id === criado.id));
  entrar("ana.souza@clinica.com", "recep123");
  assert.equal(vets.salvarVeterinario(novoVet).codigo, 403);
  assert.equal(vets.listarVeterinarios().ok, true);                                            // consultar continua liberado
});
