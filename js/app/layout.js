// Monta o topo e o menu lateral (iguais em todas as páginas internas).
import { exigirLogin, encerrarSessao } from "./sessao.js";
import { menuDoPerfil, podeAcessar, PERFIS } from "../api/seguranca/rbac.js";

export function montarLayout() {
  const sessao = exigirLogin();
  if (!sessao) return null;

  const pagina = window.location.pathname.split("/").pop();
  if (pagina !== "inicio.html" && !podeAcessar(sessao.perfil, pagina)) {
    window.location.href = "inicio.html";   // perfil sem permissão
    return null;
  }

  document.querySelector("#nome-usuario").textContent = sessao.nome;
  document.querySelector("#perfil-usuario").textContent = PERFIS[sessao.perfil];

  const menu = document.querySelector("#menu");
  menuDoPerfil(sessao.perfil).forEach((item) => {
    const link = document.createElement("a");
    link.textContent = item.texto;
    link.href = item.pagina;
    if (item.pagina === pagina) link.classList.add("ativo");
    menu.appendChild(link);
  });

  document.querySelector("#sair").addEventListener("click", () => {
    encerrarSessao();
    window.location.href = new URL("../../index.html", import.meta.url).href;
  });
  return sessao;
}
