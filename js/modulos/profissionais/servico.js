// Regras do módulo Profissionais (nesta sprint: somente consulta de veterinários).
import { veterinarios } from "../../infraestrutura/persistencia/profissionais.repositorio.js";

export const listarVeterinarios = () => veterinarios.listar().filter((v) => v.ativo);
export const buscarVeterinario = (id) => veterinarios.buscarPorId(id);
export const buscarVeterinarioPorUsuario = (usuarioId) => veterinarios.listar().find((v) => v.usuarioId === usuarioId) ?? null;
