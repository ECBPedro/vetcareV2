// RBAC = controle de acesso por papéis (perfis).
export const PERFIS = {
  ADMINISTRADOR: "Administrador",
  RECEPCIONISTA: "Recepcionista",
  VETERINARIO: "Veterinário",
};

// Menu de cada perfil (igual aos protótipos da apresentação).
const MENU = {
  ADMINISTRADOR: [
    { texto: "Agenda",       pagina: "agenda.html" },
    { texto: "Dashboard",    pagina: "dashboard.html" },
    { texto: "Relatórios",   pagina: "relatorios.html" },
    { texto: "Usuários",     pagina: "usuarios.html" },
    { texto: "Veterinários", pagina: "veterinarios.html" },
  ],
  RECEPCIONISTA: [
    { texto: "Agenda",            pagina: "agenda.html" },
    { texto: "Agendar Consulta",  pagina: "agendar-consulta.html" },
    { texto: "Tutores e animais", pagina: "tutores-animais.html" },
    { texto: "Pagamentos",        pagina: "pagamentos.html" },
  ],
  VETERINARIO: [
    { texto: "Atendimento", pagina: "atendimento.html" },
    { texto: "Minha agenda", pagina: "agenda.html" },
    { texto: "Prescrições", pagina: "prescricao.html" },
    { texto: "Vacinação",   pagina: "vacinacao.html" },
  ],
};

export function menuDoPerfil(perfil) {
  return MENU[perfil] ?? [];
}

export function podeAcessar(perfil, pagina) {
  return menuDoPerfil(perfil).some((item) => item.pagina === pagina);
}

// Permissões por AÇÃO (menor privilégio). Quem chama o controller é checado aqui (ADR-03).
const PERMISSOES = {
  "tutor:consultar":        ["ADMINISTRADOR", "RECEPCIONISTA", "VETERINARIO"],
  "tutor:gravar":           ["ADMINISTRADOR", "RECEPCIONISTA"],
  "animal:consultar":       ["ADMINISTRADOR", "RECEPCIONISTA", "VETERINARIO"],
  "animal:gravar":          ["ADMINISTRADOR", "RECEPCIONISTA"],
  "profissional:consultar": ["ADMINISTRADOR", "RECEPCIONISTA", "VETERINARIO"],
  "agenda:consultar":       ["ADMINISTRADOR", "RECEPCIONISTA", "VETERINARIO"],
  "agenda:agendar":         ["RECEPCIONISTA"],
};

export function temPermissao(perfil, acao) {
  return PERMISSOES[acao]?.includes(perfil) ?? false;
}
