// Repositório do módulo Identidade e Acesso: guarda e devolve usuários.
import { ler, salvar } from "./armazenamento.js";

// Usuários de teste (os mesmos dos protótipos da apresentação)
const USUARIOS_INICIAIS = [
  { id: 1, nome: "Carlos Silva",   email: "carlos.silva@clinica.com", senha: "admin123", perfil: "ADMINISTRADOR", ativo: true },
  { id: 2, nome: "Ana Souza",      email: "ana.souza@clinica.com",    senha: "recep123", perfil: "RECEPCIONISTA", ativo: true },
  { id: 3, nome: "Dr. Paulo Reis", email: "paulo.reis@clinica.com",   senha: "vet12345", perfil: "VETERINARIO",   ativo: true },
];

export function listarUsuarios() {
  let lista = ler("usuarios");
  if (!lista) {              // primeira vez: grava os usuários de teste
    lista = USUARIOS_INICIAIS;
    salvar("usuarios", lista);
  }
  return lista;
}
