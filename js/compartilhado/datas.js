// Funções de data. As datas viajam como texto "AAAA-MM-DD" e as horas como "HH:MM".
const dois = (n) => String(n).padStart(2, "0");
const paraTexto = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
const paraData = (iso) => new Date(`${iso}T12:00:00`);   // meio-dia evita problemas de fuso

export const hoje = () => paraTexto(new Date());

export function paraBR(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function somarDias(iso, dias) {
  const d = paraData(iso);
  d.setDate(d.getDate() + dias);
  return paraTexto(d);
}

export function inicioDaSemana(iso) {      // segunda-feira
  const dia = paraData(iso).getDay();       // 0 = domingo
  return somarDias(iso, dia === 0 ? -6 : 1 - dia);
}

export function nomeDoDia(iso) {
  return ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][paraData(iso).getDay()];
}

// Expediente: 08:00 às 17:30, de 30 em 30 minutos.
export function horariosDoExpediente() {
  const lista = [];
  for (let h = 8; h < 18; h++) for (const m of [0, 30]) lista.push(`${dois(h)}:${dois(m)}`);
  return lista;
}

export function noPassado(data, hora) {
  return new Date(`${data}T${hora}:00`) < new Date();
}
