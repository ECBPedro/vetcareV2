// Regras de negócio do módulo Identidade e Acesso.
import { listarUsuarios } from "../../infraestrutura/persistencia/identidade.repositorio.js";

// Devolve o usuário (sem a senha) se o login estiver certo; senão, null.
export function autenticar(email, senha) {
  const usuario = listarUsuarios().find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!usuario || !usuario.ativo || usuario.senha !== senha) return null;

  const { senha: _senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}
