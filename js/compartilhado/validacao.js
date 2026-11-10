// Validações e erro de negócio compartilhados pelos módulos.
export class ErroDeNegocio extends Error {}   // erro "esperado": a mensagem pode ser mostrada ao usuário

export const apenasDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

export function obrigatorio(valor, descricao) {
  const texto = String(valor ?? "").trim();
  if (!texto) throw new ErroDeNegocio(`Informe ${descricao}.`);
  return texto;
}

export function validarCpf(cpf) {
  const digitos = apenasDigitos(cpf);
  if (digitos.length !== 11) throw new ErroDeNegocio("O CPF deve ter 11 números.");
  return digitos;
}

export function validarTelefone(telefone) {
  const digitos = apenasDigitos(telefone);
  if (digitos.length < 10 || digitos.length > 11) throw new ErroDeNegocio("Telefone inválido: use DDD + número.");
  return digitos;
}

export function validarEmail(email) {
  const texto = String(email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) throw new ErroDeNegocio("E-mail inválido.");
  return texto;
}

export function formatarCpf(cpf) {
  return apenasDigitos(cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarTelefone(telefone) {
  const d = apenasDigitos(telefone);
  return d.length === 11 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
