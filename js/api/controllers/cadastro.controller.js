// Controller do módulo Cadastro (tutores e animais).
import * as cadastro from "../../modulos/cadastro/index.js";
import { executar } from "../executar.js";

export const listarTutores   = (busca) => executar("tutor:consultar", () => cadastro.consultarTutores(busca));
export const salvarTutor     = (dados) => executar("tutor:gravar", () =>
  dados.id ? cadastro.alterarTutor(Number(dados.id), dados) : cadastro.cadastrarTutor(dados));
export const inativarTutor   = (id)    => executar("tutor:gravar", () => cadastro.inativarTutor(Number(id)));

export const listarAnimais   = (filtro) => executar("animal:consultar", () => cadastro.consultarAnimais(filtro));
export const salvarAnimal    = (dados) => executar("animal:gravar", () =>
  dados.id ? cadastro.alterarAnimal(Number(dados.id), dados) : cadastro.cadastrarAnimal(dados));
export const inativarAnimal  = (id)    => executar("animal:gravar", () => cadastro.inativarAnimal(Number(id)));
