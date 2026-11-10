// Interface pública do módulo Cadastro: os outros arquivos só importam DAQUI.
export {
  ESPECIES, SEXOS,
  cadastrarTutor, alterarTutor, consultarTutores, buscarTutor, inativarTutor,
  cadastrarAnimal, alterarAnimal, consultarAnimais, buscarAnimal, inativarAnimal,
} from "./servico.js";
