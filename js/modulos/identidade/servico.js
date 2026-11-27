// Regras de negócio do módulo Identidade e Acesso (REQ 01 Manter Usuário e REQ 02 Autenticar Usuário).
import { listarUsuarios, buscarUsuario, salvarUsuario } from "../../infraestrutura/persistencia/identidade.repositorio.js";
import { ErroDeNegocio, obrigatorio, validarEmail } from "../../compartilhado/validacao.js";

export const PERFIS_VALIDOS = ["ADMINISTRADOR", "RECEPCIONISTA", "VETERINARIO"];
const TAMANHO_MINIMO_SENHA = 8;

const semSenha = ({ senha: _senha, ...resto }) => resto;       // a senha NUNCA sai deste módulo
const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// ---------------- REQ 02: autenticar (já existia) ----------------
// Devolve o usuário (sem a senha) se o login estiver certo; senão, null.
export function autenticar(email, senha) {
  const usuario = listarUsuarios().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!usuario || !usuario.ativo || usuario.senha !== senha) return null;
  return semSenha(usuario);
}

// ---------------- REQ 01: manter usuário ----------------
function validarUsuario(dados, idAtual = null) {
  const email = validarEmail(dados.email);
  if (listarUsuarios().some((u) => u.email.toLowerCase() === email && u.id !== idAtual)) {
    throw new ErroDeNegocio("Já existe um usuário com este e-mail.");
  }
  if (!PERFIS_VALIDOS.includes(dados.perfil)) throw new ErroDeNegocio("Escolha o perfil.");
  return { nome: obrigatorio(dados.nome, "o nome"), email, perfil: dados.perfil };
}

function validarSenha(senha) {
  if (String(senha ?? "").length < TAMANHO_MINIMO_SENHA) {
    throw new ErroDeNegocio(`A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }
  return String(senha);
}

// O sistema nunca pode ficar sem administrador ativo.
function garantirQueRestaAdministrador(usuario) {
  const ativos = listarUsuarios().filter((u) => u.perfil === "ADMINISTRADOR" && u.ativo);
  if (usuario.perfil === "ADMINISTRADOR" && usuario.ativo && ativos.length <= 1) {
    throw new ErroDeNegocio("O sistema precisa ter pelo menos um administrador ativo.");
  }
}

export function cadastrarUsuario(dados) {
  return semSenha(salvarUsuario({ ...validarUsuario(dados), senha: validarSenha(dados.senha), ativo: true }));
}

// solicitanteId = quem está pedindo a alteração (vem do token, nunca da tela).
export function alterarUsuario(id, dados, solicitanteId) {
  const atual = buscarUsuario(id);
  if (!atual) throw new ErroDeNegocio("Usuário não encontrado.");
  const novo = validarUsuario(dados, id);
  if (novo.perfil !== atual.perfil) {
    if (id === solicitanteId) throw new ErroDeNegocio("Você não pode alterar o seu próprio perfil.");
    garantirQueRestaAdministrador(atual);
  }
  const senha = dados.senha ? validarSenha(dados.senha) : atual.senha;   // em branco = mantém a senha
  return semSenha(salvarUsuario({ ...atual, ...novo, senha }));
}

// Lista TODOS os usuários (ativos e inativos), sem a senha. A tela mostra o status.
export function consultarUsuarios(busca = "") {
  const termo = normalizar(busca);
  return listarUsuarios()
    .filter((u) => !termo || normalizar(u.nome).includes(termo) || normalizar(u.email).includes(termo))
    .map(semSenha);
}

export function buscarUsuarioPorId(id) {
  const usuario = buscarUsuario(id);
  return usuario ? semSenha(usuario) : null;
}

// "Excluir" = inativar (ADR 07 da Etapa 1): o usuário deixa de entrar, mas o histórico fica.
export function inativarUsuario(id, solicitanteId) {
  const atual = buscarUsuario(id);
  if (!atual || !atual.ativo) throw new ErroDeNegocio("Usuário não encontrado ou já inativo.");
  if (id === solicitanteId) throw new ErroDeNegocio("Você não pode inativar o seu próprio usuário.");
  garantirQueRestaAdministrador(atual);
  return semSenha(salvarUsuario({ ...atual, ativo: false }));
}

export function reativarUsuario(id) {
  const atual = buscarUsuario(id);
  if (!atual || atual.ativo) throw new ErroDeNegocio("Usuário não encontrado ou já ativo.");
  return semSenha(salvarUsuario({ ...atual, ativo: true }));
}
