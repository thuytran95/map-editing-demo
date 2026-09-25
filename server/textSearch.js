/**
 * Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không phân biệt dấu, hoa/thường.
 * Ví dụ: "Hồ Điều Hòa" -> "ho dieu hoa"
 */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Đối tượng có khớp từ khóa không (tìm trong tên, mô tả và giá trị thuộc tính). */
export function matchesKeyword(feature, keyword) {
  const k = normalizeText(keyword);
  if (!k) return true;
  const p = feature.properties ?? {};
  const haystack = [
    p.name,
    p.description,
    ...(p.attributes ?? []).map((a) => `${a.key} ${a.value}`),
  ]
    .map(normalizeText)
    .join(' | ');
  return haystack.includes(k);
}
