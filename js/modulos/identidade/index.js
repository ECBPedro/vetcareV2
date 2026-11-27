// Interface pública do módulo: os outros arquivos só importam DAQUI.
export {
  autenticar,
  cadastrarUsuario, alterarUsuario, consultarUsuarios, buscarUsuarioPorId, inativarUsuario, reativarUsuario,
} from "./servico.js";
