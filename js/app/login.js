// Comportamento da tela de login (index.html).
import { login } from "../api/controllers/auth.controller.js";
import { iniciarSessao, sessaoAtual } from "./sessao.js";

const irParaInicio = () => {
  window.location.href = new URL("../../paginas/inicio.html", import.meta.url).href;
};

if (sessaoAtual()) irParaInicio();   // já está logado

const formulario = document.querySelector("#form-login");
const mensagemErro = document.querySelector("#erro");

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();             // impede a página de recarregar
  const resposta = login({
    email: formulario.email.value,
    senha: formulario.senha.value,
  });

  if (!resposta.ok) {
    mensagemErro.textContent = resposta.erro;
    mensagemErro.hidden = false;
    return;
  }
  iniciarSessao(resposta.token);
  irParaInicio();
});
