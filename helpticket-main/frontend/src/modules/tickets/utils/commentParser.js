export function isImageUrl(url = "", nome = "", tipo = "") {
  if (tipo && tipo.startsWith("image/")) return true;
  if (url.startsWith("data:image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(nome || url);
}

export function parseCommentMessage(mensagem = "") {
  const images = [];
  const files = [];
  const textLines = [];

  for (const line of mensagem.split("\n")) {
    const imgMatch = line.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (imgMatch) {
      images.push({ nome: imgMatch[1] || "Imagem", url: imgMatch[2] });
      continue;
    }
    const fileMatch = line.match(/^\[anexo:([^\]]+)\]\((.+)\)$/);
    if (fileMatch) {
      files.push({ nome: fileMatch[1], url: fileMatch[2] });
      continue;
    }
    textLines.push(line);
  }

  return {
    images,
    files,
    text: textLines.join("\n").trim(),
  };
}

export function buildAttachmentMarkdown(anexo) {
  return isImageUrl(anexo.caminho, anexo.nomeArquivo, anexo.tipoArquivo)
    ? `![${anexo.nomeArquivo}](${anexo.caminho})`
    : `[anexo:${anexo.nomeArquivo}](${anexo.caminho})`;
}
