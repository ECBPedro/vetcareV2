// Regras do módulo Profissionais (REQ 06 Manter Veterinário).
import { veterinarios } from "../../infraestrutura/persistencia/profissionais.repositorio.js";
import { consultarUsuarios, buscarUsuarioPorId } from "../identidade/index.js";     // só pela interface pública
import { ErroDeNegocio, obrigatorio, validarTelefone } from "../../compartilhado/validacao.js";

export const ESPECIALIDADES = ["Clínica geral", "Cirurgia", "Dermatologia", "Cardiologia", "Ortopedia", "Outra"];

const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// ---- consultas (já existiam: usadas pelo Agendamento) ----
export const listarVeterinarios = () => veterinarios.listar().filter((v) => v.ativo);
export const buscarVeterinario = (id) => veterinarios.buscarPorId(id);   // devolve também inativo (histórico da agenda)
export const buscarVeterinarioPorUsuario = (usuarioId) => veterinarios.listar().find((v) => v.usuarioId === usuarioId) ?? null;

// Usuários que podem ser vinculados: perfil Veterinário, ativos e ainda sem veterinário.
export function usuariosParaVinculo(veterinarioId = null) {
  const ocupados = new Set(veterinarios.listar().filter((v) => v.ativo && v.usuarioId && v.id !== veterinarioId).map((v) => v.usuarioId));
  return consultarUsuarios().filter((u) => u.ativo && u.perfil === "VETERINARIO" && !ocupados.has(u.id));
}

// ---- REQ 06: manter veterinário ----
function validarVeterinario(dados, idAtual = null) {
  const crmv = String(dados.crmv ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}-\d{3,6}$/.test(crmv)) throw new ErroDeNegocio("CRMV inválido: use o formato UF-número (ex.: BA-12345).");
  if (listarVeterinarios().some((v) => v.crmv === crmv && v.id !== idAtual)) throw new ErroDeNegocio("Já existe um veterinário ativo com este CRMV.");
  if (!ESPECIALIDADES.includes(dados.especialidade)) throw new ErroDeNegocio("Escolha a especialidade.");

  let usuarioId = null;                                   // o vínculo é opcional, mas sem ele o veterinário não entra no sistema
  if (dados.usuarioId) {
    usuarioId = Number(dados.usuarioId);
    if (!usuariosParaVinculo(idAtual).some((u) => u.id === usuarioId)) {
      throw new ErroDeNegocio("Usuário inválido para o vínculo: precisa ter perfil Veterinário, estar ativo e não estar ligado a outro veterinário.");
    }
  }
  return { nome: obrigatorio(dados.nome, "o nome completo"), crmv, especialidade: dados.especialidade, telefone: validarTelefone(dados.telefone), usuarioId };
}

export const cadastrarVeterinario = (dados) => veterinarios.salvar({ ...validarVeterinario(dados), ativo: true });

export function alterarVeterinario(id, dados) {
  const atual = veterinarios.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Veterinário não encontrado.");
  return veterinarios.salvar({ ...atual, ...validarVeterinario(dados, id) });
}

// Veterinários ativos, já com o e-mail do usuário vinculado (para a tela).
export function consultarVeterinarios(busca = "") {
  const termo = normalizar(busca);
  return listarVeterinarios()
    .filter((v) => !termo || normalizar(v.nome).includes(termo) || normalizar(v.crmv).includes(termo))
    .map((v) => ({ ...v, usuarioEmail: v.usuarioId ? buscarUsuarioPorId(v.usuarioId)?.email ?? "" : "" }));
}

// "Excluir" = inativar: o histórico da agenda continua mostrando o nome dele.
export function inativarVeterinario(id) {
  const atual = veterinarios.buscarPorId(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Veterinário não encontrado.");
  return veterinarios.salvar({ ...atual, ativo: false });
}
