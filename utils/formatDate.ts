export default function formatDate(date?: string | number | Date | null): string | null {
  if (!date) {
    return null;
  }

  const data = new Date(date);
  if (isNaN(data.getTime())) {
    return null; // Caso a data seja inválida
  }

  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // +1 pois Janeiro é zero
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}