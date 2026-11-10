// Ajudantes de tela. Regra de ouro: texto vindo do usuário entra SEMPRE por textContent (nunca innerHTML),
// assim ninguém consegue injetar código na página.
export function criar(tag, { texto, classe, ...atributos } = {}, filhos = []) {
  const elemento = document.createElement(tag);
  if (texto !== undefined) elemento.textContent = texto;
  if (classe) elemento.className = classe;
  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === undefined) continue;                  // atributo não informado: ignora
    if (nome.startsWith("on")) elemento.addEventListener(nome.slice(2).toLowerCase(), valor);
    else elemento.setAttribute(nome, valor);
  }
  elemento.append(...[].concat(filhos));
  return elemento;
}

export function mostrarAviso(elemento, texto, tipo = "erro") {
  elemento.textContent = texto;
  elemento.className = `aviso ${tipo}`;
  elemento.hidden = !texto;
}

export function preencherSelect(select, itens, rotuloVazio) {   // itens: [{ valor, texto }]
  select.replaceChildren(criar("option", { texto: rotuloVazio, value: "" }),
    ...itens.map((i) => criar("option", { texto: i.texto, value: String(i.valor) })));
}
