// Tela "Cadastro de veterinário" (REQ 06). Só conversa com o controller.
import { montarLayout } from "./layout.js";
import { criar, mostrarAviso, preencherSelect } from "./dom.js";
import { consultarVeterinarios, salvarVeterinario, inativarVeterinario, usuariosParaVinculo } from "../api/controllers/profissionais.controller.js";
import { formatarTelefone } from "../compartilhado/validacao.js";

const sessao = montarLayout();
if (sessao) iniciar();

function iniciar() {
  const aviso = document.querySelector("#aviso");
  const form = document.querySelector("#form-vet");

  function responder(resposta, mensagemOk) {
    mostrarAviso(aviso, resposta.ok ? mensagemOk : resposta.erro, resposta.ok ? "sucesso" : "erro");
    return resposta.ok;
  }

  // A lista de usuários do vínculo muda conforme quem está sendo editado.
  function carregarUsuarios(veterinarioId = null, selecionado = "") {
    const usuarios = usuariosParaVinculo(veterinarioId).dados ?? [];
    preencherSelect(form.usuarioId, usuarios.map((u) => ({ valor: u.id, texto: `${u.nome} (${u.email})` })), "Sem vínculo (não entra no sistema)");
    form.usuarioId.value = selecionado ? String(selecionado) : "";
  }

  function novo() {
    form.reset();
    form.elements.id.value = "";
    document.querySelector("#titulo-form").textContent = "Novo veterinário";
    carregarUsuarios();
  }

  function editar(v) {
    form.elements.id.value = v.id; form.nome.value = v.nome; form.crmv.value = v.crmv; form.especialidade.value = v.especialidade;
    form.telefone.value = v.telefone ? formatarTelefone(v.telefone) : "";
    document.querySelector("#titulo-form").textContent = "Editar veterinário";
    carregarUsuarios(v.id, v.usuarioId);
    mostrarAviso(aviso, "");
    form.scrollIntoView({ behavior: "smooth" });
  }

  function atualizar() {
    const lista = consultarVeterinarios("").dados ?? [];
    document.querySelector("#lista").replaceChildren(...lista.map((v) => criar("tr", {}, [
      criar("td", { texto: v.nome }), criar("td", { texto: v.crmv }),
      criar("td", {}, [
        criar("button", { texto: "Editar", type: "button", class: "botao secundario pequeno", onclick: () => editar(v) }),
        criar("button", { texto: "Inativar", type: "button", class: "botao perigo pequeno", onclick: () => {
          if (!window.confirm(`Inativar ${v.nome}? As consultas antigas continuam no histórico.`)) return;
          if (responder(inativarVeterinario(v.id), "Veterinário inativado.")) { atualizar(); novo(); }
        } }),
      ]),
    ])));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const resposta = salvarVeterinario(Object.fromEntries(new FormData(form)));
    if (resposta.ok) { novo(); atualizar(); }
    responder(resposta, "Veterinário salvo.");
  });
  document.querySelector("#cancelar").addEventListener("click", () => { novo(); mostrarAviso(aviso, ""); });
  novo();
  atualizar();
}
