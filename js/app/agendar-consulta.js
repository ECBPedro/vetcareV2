// Tela "Agendar consulta" (REQ 07).
import { montarLayout } from "./layout.js";
import { criar, mostrarAviso, preencherSelect } from "./dom.js";
import { listarAnimais } from "../api/controllers/cadastro.controller.js";
import { listarVeterinarios } from "../api/controllers/profissionais.controller.js";
import { horarios, agendarConsulta } from "../api/controllers/agendamento.controller.js";
import { hoje, paraBR } from "../compartilhado/datas.js";

const sessao = montarLayout();
if (sessao) iniciar();

function iniciar() {
  const form = document.querySelector("#form-agendar");
  const aviso = document.querySelector("#aviso");
  const grade = document.querySelector("#horarios");
  let escolhido = "";                                   // horário clicado pelo usuário

  const animais = listarAnimais({}).dados ?? [];
  const veterinarios = listarVeterinarios().dados ?? [];
  preencherSelect(form.animal, animais.map((a) => ({ valor: a.id, texto: `${a.tutorNome} — ${a.nome} (${a.especie})` })), "Selecione");
  preencherSelect(form.veterinario, veterinarios.map((v) => ({ valor: v.id, texto: v.nome })), "Selecione");
  form.data.value = hoje();
  form.data.min = hoje();

  function resumo() {
    const animal = animais.find((a) => String(a.id) === form.animal.value);
    const vet = veterinarios.find((v) => String(v.id) === form.veterinario.value);
    document.querySelector("#r-animal").textContent = animal?.nome ?? "—";
    document.querySelector("#r-tutor").textContent = animal?.tutorNome ?? "—";
    document.querySelector("#r-vet").textContent = vet?.nome ?? "—";
    document.querySelector("#r-data").textContent = form.data.value ? paraBR(form.data.value) : "—";
    document.querySelector("#r-hora").textContent = escolhido || "—";
  }

  function desenharHorarios() {
    grade.replaceChildren();
    if (!form.veterinario.value || !form.data.value) { grade.append(criar("p", { texto: "Escolha o veterinário e a data.", class: "subtitulo" })); return; }
    const resposta = horarios({ veterinarioId: form.veterinario.value, data: form.data.value });
    if (!resposta.ok) { mostrarAviso(aviso, resposta.erro, "erro"); return; }
    resposta.dados.forEach(({ hora, livre }) => {
      grade.append(criar("button", {
        texto: hora, type: "button", disabled: livre ? undefined : "disabled",
        class: `horario${hora === escolhido ? " escolhido" : ""}`,
        onclick: () => { escolhido = hora; desenharHorarios(); resumo(); },
      }));
    });
  }

  function mudou() { escolhido = ""; mostrarAviso(aviso, ""); desenharHorarios(); resumo(); }
  form.veterinario.addEventListener("change", mudou);
  form.data.addEventListener("change", mudou);
  form.animal.addEventListener("change", resumo);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const resposta = agendarConsulta({ animalId: form.animal.value, veterinarioId: form.veterinario.value, data: form.data.value, hora: escolhido });
    if (!resposta.ok) { mostrarAviso(aviso, resposta.erro, "erro"); desenharHorarios(); return; }
    mostrarAviso(aviso, `Consulta agendada para ${paraBR(resposta.dados.data)} às ${resposta.dados.hora}.`, "sucesso");
    escolhido = ""; desenharHorarios(); resumo();
  });

  desenharHorarios();
  resumo();
}
