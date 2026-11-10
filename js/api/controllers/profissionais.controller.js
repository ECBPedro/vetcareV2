// Controller do módulo Profissionais.
import { listarVeterinarios as listar } from "../../modulos/profissionais/index.js";
import { executar } from "../executar.js";

export const listarVeterinarios = () => executar("profissional:consultar", () => listar());
