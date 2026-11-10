// Tela "Agenda" (REQ 09): visões por dia, semana ou profissional.
import { montarLayout } from "./layout.js";
import { criar, mostrarAviso, preencherSelect } from "./dom.js";
import { consultarAgenda } from "../api/controllers/agendamento.controller.js";
import { listarVeterinarios } from "../api/controllers/profissionais.controller.js";
import { hoje, paraBR, nomeDoDia, inicioDaSemana, somarDias } from "../compartilhado/datas.js";

const sessao = montarLayout();
if (sessao) iniciar();

function iniciar() {
  const ehVeterinario = sessao.perfil === "VETERINARIO";
  const dataInput = document.querySelector("#data");
  const vetSelect = document.querySelector("#veterinario");
  const aviso = document.querySelector("#aviso");
  let visao = "dia";

  dataInput.value = hoje();
  preencherSelect(vetSelect, (listarVeterinarios().dados ?? []).map((v) => ({ valor: v.id, texto: v.nome })), "Todos");
  if (ehVeterinario) {                                   // "Minha agenda": o controller já filtra pelo veterinário logado
    document.querySelector("#campo-vet").hidden = true;
    document.querySelector("#titulo").textContent = "Minha agenda";
  }

  function desenhar() {
    document.querySelectorAll(".aba").forEach((b) => b.classList.toggle("ativa", b.dataset.visao === visao));
    document.querySelector("#campo-data").hidden = visao === "profissional";
    mostrarAviso(aviso, "");
    const corpo = document.querySelector("#lista");
    corpo.replaceChildren();

    if (visao === "profissional" && !ehVeterinario && !vetSelect.value) {
      mostrarAviso(aviso, "Escolha um veterinário para ver as próximas consultas dele.", "alerta");
      return;
    }
    const resposta = consultarAgenda({ visao, data: dataInput.value, veterinarioId: vetSelect.value ? Number(vetSelect.value) : null });
    if (!resposta.ok) { mostrarAviso(aviso, resposta.erro, "erro"); return; }

    const sub = document.querySelector("#subtitulo");
    if (visao === "dia") sub.textContent = `${nomeDoDia(dataInput.value)}, ${paraBR(dataInput.value)}`;
    if (visao === "semana") sub.textContent = `Semana de ${paraBR(inicioDaSemana(dataInput.value))} a ${paraBR(somarDias(inicioDaSemana(dataInput.value), 6))}`;
    if (visao === "profissional") sub.textContent = "Próximas consultas do profissional";

    if (!resposta.dados.length) { corpo.append(criar("tr", {}, [criar("td", { texto: "Nenhuma consulta no período.", colspan: "5" })])); return; }
    resposta.dados.forEach((c) => corpo.append(criar("tr", {}, [
      criar("td", { texto: paraBR(c.data) }), criar("td", { texto: c.hora, style: "font-weight:700;color:#1b4965" }),
      criar("td", { texto: `${c.animalNome} · ${c.tutorNome}` }), criar("td", { texto: c.veterinarioNome }),
      criar("td", {}, [criar("span", { texto: c.status === "AGENDADA" ? "Confirmada" : "Cancelada", class: c.status === "AGENDADA" ? "selo" : "selo cancelada" })]),
    ])));
  }

  document.querySelectorAll(".aba").forEach((b) => b.addEventListener("click", () => { visao = b.dataset.visao; desenhar(); }));
  dataInput.addEventListener("change", desenhar);
  vetSelect.addEventListener("change", desenhar);
  desenhar();
}
