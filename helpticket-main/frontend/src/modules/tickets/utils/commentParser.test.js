import { describe, it, expect } from "vitest";
import { isImageUrl, parseCommentMessage, buildAttachmentMarkdown } from "./commentParser";

describe("isImageUrl", () => {
  it("reconhece imagem pelo MIME type", () => {
    expect(isImageUrl("https://x.com/arquivo", "arquivo", "image/png")).toBe(true);
  });

  it("reconhece imagem em Data URL (fallback base64)", () => {
    expect(isImageUrl("data:image/jpeg;base64,AAAA")).toBe(true);
  });

  it("reconhece imagem pela extensão do nome do arquivo", () => {
    expect(isImageUrl("https://x.com/a", "print.JPG")).toBe(true);
    expect(isImageUrl("https://x.com/a", "foto.webp")).toBe(true);
  });

  it("reconhece imagem pela URL quando não há nome", () => {
    expect(isImageUrl("https://cdn.com/tela.png?token=123")).toBe(true);
  });

  it("não considera PDF ou DOCX como imagem", () => {
    expect(isImageUrl("https://x.com/relatorio.pdf", "relatorio.pdf", "application/pdf")).toBe(false);
    expect(isImageUrl("https://x.com/doc.docx", "doc.docx")).toBe(false);
  });
});

describe("parseCommentMessage", () => {
  it("retorna apenas texto quando não há anexos", () => {
    const r = parseCommentMessage("Olá, reinicie o computador.");
    expect(r.text).toBe("Olá, reinicie o computador.");
    expect(r.images).toHaveLength(0);
    expect(r.files).toHaveLength(0);
  });

  it("separa imagem e texto abaixo da imagem", () => {
    const r = parseCommentMessage("![print.png](https://cdn.com/print.png)\nSegue o erro da tela.");
    expect(r.images).toEqual([{ nome: "print.png", url: "https://cdn.com/print.png" }]);
    expect(r.text).toBe("Segue o erro da tela.");
  });

  it("extrai anexos que não são imagem", () => {
    const r = parseCommentMessage("[anexo:log.txt](https://cdn.com/log.txt)");
    expect(r.files).toEqual([{ nome: "log.txt", url: "https://cdn.com/log.txt" }]);
    expect(r.text).toBe("");
  });

  it("suporta múltiplas imagens e preserva quebras de linha do texto", () => {
    const msg = [
      "![a.png](https://cdn.com/a.png)",
      "![b.png](https://cdn.com/b.png)",
      "Linha 1",
      "Linha 2",
    ].join("\n");
    const r = parseCommentMessage(msg);
    expect(r.images).toHaveLength(2);
    expect(r.text).toBe("Linha 1\nLinha 2");
  });

  it("usa 'Imagem' como nome padrão quando o alt está vazio", () => {
    const r = parseCommentMessage("![](https://cdn.com/x.png)");
    expect(r.images[0].nome).toBe("Imagem");
  });

  it("lida com mensagem vazia ou indefinida", () => {
    expect(parseCommentMessage().text).toBe("");
    expect(parseCommentMessage("").images).toHaveLength(0);
  });
});

describe("buildAttachmentMarkdown", () => {
  it("gera markdown de imagem para arquivos de imagem", () => {
    const md = buildAttachmentMarkdown({ nomeArquivo: "tela.png", caminho: "https://cdn.com/tela.png", tipoArquivo: "image/png" });
    expect(md).toBe("![tela.png](https://cdn.com/tela.png)");
  });

  it("gera marcador de anexo para outros arquivos", () => {
    const md = buildAttachmentMarkdown({ nomeArquivo: "nota.pdf", caminho: "https://cdn.com/nota.pdf", tipoArquivo: "application/pdf" });
    expect(md).toBe("[anexo:nota.pdf](https://cdn.com/nota.pdf)");
  });

  it("é compatível com parseCommentMessage (ida e volta)", () => {
    const md = buildAttachmentMarkdown({ nomeArquivo: "x.jpg", caminho: "https://cdn.com/x.jpg", tipoArquivo: "image/jpeg" });
    const r = parseCommentMessage(`${md}\nTexto`);
    expect(r.images[0]).toEqual({ nome: "x.jpg", url: "https://cdn.com/x.jpg" });
    expect(r.text).toBe("Texto");
  });
});
