// Repositório do módulo Identidade e Acesso: guarda e devolve usuários.
import { criarColecao } from "./colecao.js";

// Usuários de teste (os mesmos dos protótipos da apresentação)
const USUARIOS_INICIAIS = [
  { id: 1, nome: "Carlos Silva",     email: "carlos.silva@clinica.com", senha: "admin123", perfil: "ADMINISTRADOR", ativo: true },
  { id: 2, nome: "Ana Souza",        email: "ana.souza@clinica.com",    senha: "recep123", perfil: "RECEPCIONISTA", ativo: true },
  { id: 3, nome: "Dr. Paulo Reis",   email: "paulo.reis@clinica.com",   senha: "vet12345", perfil: "VETERINARIO",   ativo: true },
  { id: 4, nome: "Dra. Marta Nunes", email: "marta.nunes@clinica.com",  senha: "vet12345", perfil: "VETERINARIO",   ativo: true },
  { id: 5, nome: "Rita Alves",       email: "rita.alves@clinica.com",   senha: "recep123", perfil: "RECEPCIONISTA", ativo: false },
];

const usuarios = criarColecao("usuarios", USUARIOS_INICIAIS);   // mesma chave de antes: "usuarios"

export const listarUsuarios = usuarios.listar;
export const buscarUsuario = usuarios.buscarPorId;
export const salvarUsuario = usuarios.salvar;
