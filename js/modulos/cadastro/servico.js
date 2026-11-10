// Regras de negócio do módulo Cadastro (REQ 04 Manter Tutor e REQ 05 Manter Animal).
import { tutores, animais } from "../../infraestrutura/persistencia/cadastro.repositorio.js";
import { ErroDeNegocio, obrigatorio, validarCpf, validarTelefone, validarEmail, apenasDigitos } from "../../compartilhado/validacao.js";
import { hoje } from "../../compartilhado/datas.js";

export const ESPECIES = ["Cão", "Gato", "Ave", "Outro"];
export const SEXOS = ["Macho", "Fêmea"];

const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// ---------------- Tutor ----------------
function validarTutor(dados, idAtual = null) {
  const tutor = {
    nome: obrigatorio(dados.nome, "o nome completo"),
    cpf: validarCpf(dados.cpf),
    telefone: validarTelefone(dados.telefone),
    email: validarEmail(dados.email),
  };
  const repetido = tutores.listar().some((t) => t.ativo && t.cpf === tutor.cpf && t.id !== idAtual);
  if (repetido) throw new ErroDeNegocio("Já existe um tutor ativo com este CPF.");
  return tutor;
}

export function cadastrarTutor(dados) {
  return tutores.salvar({ ...validarTutor(dados), ativo: true });
}

export function alterarTutor(id, dados) {
  const atual = tutores.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Tutor não encontrado.");
  return tutores.salvar({ ...atual, ...validarTutor(dados, id) });
}

export function consultarTutores(busca = "") {
  const termo = normalizar(busca);
  const digitos = apenasDigitos(busca);
  return tutores.listar().filter((t) => t.ativo && (!termo || normalizar(t.nome).includes(termo) || (digitos && t.cpf.includes(digitos))));
}

export const buscarTutor = (id) => tutores.buscarPorId(id);   // devolve também tutor inativo (histórico)

// "Excluir" = inativar (ADR-07): o histórico é preservado. Os animais do tutor também são inativados.
export function inativarTutor(id) {
  const atual = tutores.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Tutor não encontrado.");
  animais.listar().filter((a) => a.tutorId === id && a.ativo).forEach((a) => animais.salvar({ ...a, ativo: false }));
  return tutores.salvar({ ...atual, ativo: false });
}

// ---------------- Animal ----------------
function validarAnimal(dados) {
  const tutor = tutores.buscarPorId(Number(dados.tutorId));
  if (!tutor || !tutor.ativo) throw new ErroDeNegocio("Selecione um tutor ativo para o animal.");
  if (!ESPECIES.includes(dados.especie)) throw new ErroDeNegocio("Escolha a espécie.");
  if (!SEXOS.includes(dados.sexo)) throw new ErroDeNegocio("Escolha o sexo.");
  const nascimento = String(dados.nascimento ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) || nascimento > hoje()) throw new ErroDeNegocio("Data de nascimento inválida.");
  return { tutorId: tutor.id, nome: obrigatorio(dados.nome, "o nome do animal"), especie: dados.especie,
           raca: obrigatorio(dados.raca, "a raça"), sexo: dados.sexo, nascimento };
}

export function cadastrarAnimal(dados) {
  return animais.salvar({ ...validarAnimal(dados), ativo: true });
}

export function alterarAnimal(id, dados) {
  const atual = animais.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Animal não encontrado.");
  return animais.salvar({ ...atual, ...validarAnimal(dados) });
}

// Devolve os animais ativos já com o nome do tutor (útil para telas e para o Agendamento).
export function consultarAnimais({ busca = "", tutorId = null } = {}) {
  const termo = normalizar(busca);
  return animais.listar()
    .filter((a) => a.ativo && (tutorId == null || a.tutorId === tutorId))
    .map((a) => ({ ...a, tutorNome: tutores.buscarPorId(a.tutorId)?.nome ?? "" }))
    .filter((a) => !termo || normalizar(a.nome).includes(termo) || normalizar(a.tutorNome).includes(termo));
}

export function buscarAnimal(id) {
  const animal = animais.buscarPorId(id);
  return animal ? { ...animal, tutorNome: tutores.buscarPorId(animal.tutorId)?.nome ?? "" } : null;
}

export function inativarAnimal(id) {
  const atual = animais.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Animal não encontrado.");
  return animais.salvar({ ...atual, ativo: false });
}
