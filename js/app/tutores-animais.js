// Tela "Tutores e animais" (REQ 04 e REQ 05). Só conversa com o controller; nunca com o módulo direto.
import { montarLayout } from "./layout.js";
import { criar, mostrarAviso, preencherSelect } from "./dom.js";
import { listarTutores, salvarTutor, inativarTutor, listarAnimais, salvarAnimal, inativarAnimal } from "../api/controllers/cadastro.controller.js";
import { formatarCpf, formatarTelefone } from "../compartilhado/validacao.js";

const sessao = montarLayout();
if (sessao) iniciar();

function iniciar() {
  const aviso = document.querySelector("#aviso");
  const formTutor = document.querySelector("#form-tutor");
  const formAnimal = document.querySelector("#form-animal");
  const busca = document.querySelector("#busca");

  // Mostra o resultado de uma chamada: erro em vermelho, sucesso em verde.
  function responder(resposta, mensagemOk) {
    if (!resposta.ok) { mostrarAviso(aviso, resposta.erro, "erro"); return false; }
    mostrarAviso(aviso, mensagemOk, "sucesso");
    return true;
  }

  function atualizar() {
    const tutores = listarTutores(busca.value).dados ?? [];
    const animais = listarAnimais({ busca: busca.value }).dados ?? [];
    const todos = listarTutores("").dados ?? [];

    preencherSelect(formAnimal.tutorId, todos.map((t) => ({ valor: t.id, texto: t.nome })), "Selecione");

    document.querySelector("#lista-tutores").replaceChildren(...tutores.map((t) =>
      criar("tr", {}, [
        criar("td", { texto: t.nome }), criar("td", { texto: formatarCpf(t.cpf) }), criar("td", { texto: formatarTelefone(t.telefone) }),
        criar("td", {}, [
          criar("button", { texto: "Editar", class: "botao secundario pequeno", type: "button", onclick: () => editarTutor(t) }),
          criar("button", { texto: "Inativar", class: "botao perigo pequeno", type: "button", onclick: () => inativar("tutor", t) }),
        ]),
      ])));

    document.querySelector("#lista-animais").replaceChildren(...animais.map((a) =>
      criar("tr", {}, [
        criar("td", { texto: a.nome }), criar("td", { texto: a.especie }), criar("td", { texto: a.raca }), criar("td", { texto: a.tutorNome }),
        criar("td", {}, [
          criar("button", { texto: "Editar", class: "botao secundario pequeno", type: "button", onclick: () => editarAnimal(a) }),
          criar("button", { texto: "Inativar", class: "botao perigo pequeno", type: "button", onclick: () => inativar("animal", a) }),
        ]),
      ])));
  }

  function editarTutor(t) {
    formTutor.elements.id.value = t.id; formTutor.nome.value = t.nome; formTutor.cpf.value = formatarCpf(t.cpf);
    formTutor.telefone.value = formatarTelefone(t.telefone); formTutor.email.value = t.email;
    formTutor.scrollIntoView({ behavior: "smooth" });
  }

  function editarAnimal(a) {
    formAnimal.elements.id.value = a.id; formAnimal.tutorId.value = a.tutorId; formAnimal.nome.value = a.nome;
    formAnimal.especie.value = a.especie; formAnimal.sexo.value = a.sexo; formAnimal.raca.value = a.raca; formAnimal.nascimento.value = a.nascimento;
    formAnimal.scrollIntoView({ behavior: "smooth" });
  }

  function inativar(tipo, item) {
    const aviso2 = tipo === "tutor" ? `Inativar o tutor ${item.nome} e seus animais? O histórico será preservado.` : `Inativar o animal ${item.nome}? O histórico será preservado.`;
    if (!window.confirm(aviso2)) return;
    const resposta = tipo === "tutor" ? inativarTutor(item.id) : inativarAnimal(item.id);
    if (responder(resposta, "Registro inativado.")) atualizar();
  }

  formTutor.addEventListener("submit", (e) => {
    e.preventDefault();
    const resposta = salvarTutor(Object.fromEntries(new FormData(formTutor)));
    if (resposta.ok) { formTutor.reset(); atualizar(); }       // reset limpa o aviso, por isso o aviso vem depois
    responder(resposta, "Tutor salvo.");
  });

  formAnimal.addEventListener("submit", (e) => {
    e.preventDefault();
    const resposta = salvarAnimal(Object.fromEntries(new FormData(formAnimal)));
    if (resposta.ok) { formAnimal.reset(); atualizar(); }
    responder(resposta, "Animal salvo.");
  });

  // "Cancelar" (reset) também limpa o campo escondido de edição.
  [formTutor, formAnimal].forEach((f) => f.addEventListener("reset", () => { f.elements.id.value = ""; mostrarAviso(aviso, ""); }));
  busca.addEventListener("input", atualizar);
  atualizar();
}
