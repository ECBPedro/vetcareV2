// Tela "Gestão de usuários" (REQ 01). Só conversa com o controller.
import { montarLayout } from "./layout.js";
import { criar, mostrarAviso, preencherSelect } from "./dom.js";
import { listarUsuarios, salvarUsuario, inativarUsuario, reativarUsuario } from "../api/controllers/identidade.controller.js";
import { PERFIS } from "../api/seguranca/rbac.js";

const CLASSE_DO_PERFIL = { ADMINISTRADOR: "admin", RECEPCIONISTA: "recep", VETERINARIO: "vet" };

const sessao = montarLayout();
if (sessao) iniciar();

function iniciar() {
  const aviso = document.querySelector("#aviso");
  const form = document.querySelector("#form-usuario");
  const busca = document.querySelector("#busca");
  const filtroPerfil = document.querySelector("#filtro-perfil");
  const itensDePerfil = Object.entries(PERFIS).map(([valor, texto]) => ({ valor, texto }));
  preencherSelect(form.perfil, itensDePerfil, "Selecione");
  preencherSelect(filtroPerfil, itensDePerfil, "Todos");

  function abrirFormulario(usuario = null) {
    form.reset();
    form.elements.id.value = usuario?.id ?? "";
    if (usuario) { form.nome.value = usuario.nome; form.email.value = usuario.email; form.perfil.value = usuario.perfil; }
    document.querySelector("#titulo-form").textContent = usuario ? "Editar usuário" : "Novo usuário";
    document.querySelector("#rotulo-senha").textContent = usuario ? "Nova senha (deixe em branco para manter)" : "Senha (mínimo 8 caracteres)";
    mostrarAviso(aviso, "");
    form.hidden = false;
    form.nome.focus();
  }

  function fecharFormulario() { form.reset(); form.hidden = true; }

  function responder(resposta, mensagemOk) {
    mostrarAviso(aviso, resposta.ok ? mensagemOk : resposta.erro, resposta.ok ? "sucesso" : "erro");
    return resposta.ok;
  }

  function acao(rotulo, classe, funcao) {
    return criar("button", { texto: rotulo, type: "button", class: `botao ${classe} pequeno`, onclick: funcao });
  }

  function atualizar() {
    const usuarios = (listarUsuarios(busca.value).dados ?? []).filter((u) => !filtroPerfil.value || u.perfil === filtroPerfil.value);
    document.querySelector("#lista").replaceChildren(...usuarios.map((u) => {
      const botoes = [acao("Editar", "secundario", () => abrirFormulario(u))];
      if (u.ativo && u.id !== sessao.id) {
        botoes.push(acao("Inativar", "perigo", () => {
          if (!window.confirm(`Inativar o usuário ${u.nome}? Ele deixará de entrar no sistema.`)) return;
          if (responder(inativarUsuario(u.id), "Usuário inativado.")) atualizar();
        }));
      }
      if (!u.ativo) botoes.push(acao("Ativar", "secundario", () => { if (responder(reativarUsuario(u.id), "Usuário ativado.")) atualizar(); }));
      return criar("tr", {}, [
        criar("td", { texto: u.nome }), criar("td", { texto: u.email }),
        criar("td", {}, [criar("span", { texto: PERFIS[u.perfil], class: `selo ${CLASSE_DO_PERFIL[u.perfil]}` })]),
        criar("td", {}, [criar("span", { texto: u.ativo ? "Ativo" : "Inativo", class: u.ativo ? "selo" : "selo inativo" })]),
        criar("td", {}, botoes),
      ]);
    }));
  }

  document.querySelector("#novo").addEventListener("click", () => abrirFormulario());
  document.querySelector("#cancelar").addEventListener("click", () => { fecharFormulario(); mostrarAviso(aviso, ""); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const resposta = salvarUsuario(Object.fromEntries(new FormData(form)));
    if (resposta.ok) { fecharFormulario(); atualizar(); }
    responder(resposta, "Usuário salvo.");
  });
  busca.addEventListener("input", atualizar);
  filtroPerfil.addEventListener("change", atualizar);
  atualizar();
}
