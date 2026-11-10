// Coleção genérica: lista de objetos com "id", guardada no armazenamento.
// Todos os repositórios usam isto; trocar por um banco de verdade seria mexer só aqui.
import { ler, salvar as gravar } from "./armazenamento.js";

export function criarColecao(chave, iniciais = []) {
  const listar = () => {
    let lista = ler(chave);
    if (!lista) {                                   // primeira vez: grava os dados de teste
      lista = typeof iniciais === "function" ? iniciais() : iniciais;
      gravar(chave, lista);
    }
    return lista;
  };

  return {
    listar,
    buscarPorId: (id) => listar().find((item) => item.id === id) ?? null,
    salvar(item) {                                  // sem id = inclusão; com id = alteração
      const lista = listar();
      if (item.id == null) {
        item = { ...item, id: Math.max(0, ...lista.map((i) => i.id)) + 1 };
        lista.push(item);
      } else {
        lista[lista.findIndex((i) => i.id === item.id)] = item;
      }
      gravar(chave, lista);
      return item;
    },
  };
}
