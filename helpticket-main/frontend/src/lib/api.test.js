import { describe, it, expect, vi, beforeEach } from "vitest";
import { ticketsApi, usuariosApi, notificacoesApi } from "./api";

function mockResponse({ ok = true, status = 200, body = {} } = {}) {
  return { ok, status, json: async () => body };
}

describe("cliente da API (lib/api.js)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("envia o token JWT no header Authorization quando logado", async () => {
    localStorage.setItem("helpticket_token", "meu-token");
    fetch.mockResolvedValue(mockResponse({ body: { items: [], total: 0 } }));

    await ticketsApi.listar();

    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer meu-token");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("não envia Authorization quando não há token", async () => {
    fetch.mockResolvedValue(mockResponse({ body: [] }));
    await usuariosApi.listar();
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("monta a query string de listagem com filtros", async () => {
    fetch.mockResolvedValue(mockResponse({ body: { items: [], total: 0 } }));

    await ticketsApi.listar({ page: 2, pageSize: 5, status: "Aberto", search: "vpn", meus: true });

    const [url] = fetch.mock.calls[0];
    expect(url).toContain("/api/tickets?");
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=5");
    expect(url).toContain("status=Aberto");
    expect(url).toContain("search=vpn");
    expect(url).toContain("meus=true");
  });

  it("envia o corpo correto ao adicionar comentário", async () => {
    fetch.mockResolvedValue(mockResponse({ status: 201, body: { idComentario: 1 } }));

    await ticketsApi.adicionarComentario(9, "Teste", false);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/tickets/9/comentarios");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ mensagem: "Teste", interno: false });
  });

  it("retorna null para respostas 204 (No Content)", async () => {
    fetch.mockResolvedValue(mockResponse({ status: 204 }));
    const result = await ticketsApi.atualizarStatus(1, "Resolvido");
    expect(result).toBeNull();
  });

  it("usa PATCH para marcar notificações como lidas", async () => {
    fetch.mockResolvedValue(mockResponse({ status: 204 }));
    await notificacoesApi.marcarTodasLidas();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/notificacoes/ler-todas");
    expect(options.method).toBe("PATCH");
  });

  it("propaga a mensagem de erro retornada pela API", async () => {
    fetch.mockResolvedValue(mockResponse({ ok: false, status: 400, body: { mensagem: "Categoria inválida ou inativa." } }));
    await expect(ticketsApi.criar({})).rejects.toThrow("Categoria inválida ou inativa.");
  });

  it("usa mensagem genérica quando a API não retorna corpo", async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error("sem json"); } });
    await expect(ticketsApi.stats()).rejects.toThrow("Erro 500");
  });

  it("limpa a sessão quando o token expira (401)", async () => {
    localStorage.setItem("helpticket_token", "expirado");
    localStorage.setItem("helpticket_user", JSON.stringify({ nome: "Teste" }));
    fetch.mockResolvedValue(mockResponse({ ok: false, status: 401 }));

    await expect(ticketsApi.listar()).rejects.toThrow("Sessão expirada. Faça login novamente.");
    expect(localStorage.getItem("helpticket_token")).toBeNull();
    expect(localStorage.getItem("helpticket_user")).toBeNull();
  });
});
