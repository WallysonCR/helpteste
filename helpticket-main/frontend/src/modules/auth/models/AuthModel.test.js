import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthModel from "./AuthModel";

describe("AuthModel.emptyState", () => {
  it("retorna formulário vazio", () => {
    expect(AuthModel.emptyState()).toEqual({ email: "", password: "" });
  });
});

describe("AuthModel.validate", () => {
  it("exige e-mail e senha", () => {
    const errors = AuthModel.validate({ email: "", password: "" });
    expect(errors.email).toBe("Informe seu e-mail.");
    expect(errors.password).toBe("Informe sua senha.");
  });

  it("rejeita e-mail com formato inválido", () => {
    const errors = AuthModel.validate({ email: "usuario@", password: "123456" });
    expect(errors.email).toBe("Informe um e-mail valido.");
  });

  it("rejeita senha com menos de 6 caracteres", () => {
    const errors = AuthModel.validate({ email: "a@b.com", password: "123" });
    expect(errors.password).toBe("A senha deve ter ao menos 6 caracteres.");
  });

  it("aceita credenciais válidas", () => {
    expect(AuthModel.validate({ email: "admin@helpticket.com", password: "admin123" })).toEqual({});
  });

  it("ignora espaços ao validar e-mail vazio", () => {
    expect(AuthModel.validate({ email: "   ", password: "123456" }).email).toBe("Informe seu e-mail.");
  });
});

describe("AuthModel.authenticate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("envia e-mail e senha para /api/auth/login e retorna os dados", async () => {
    const payload = { token: "jwt", nome: "Admin", tipoUsuario: "Administrador" };
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => payload });

    const data = await AuthModel.authenticate({ email: "admin@helpticket.com", password: "admin123" });

    expect(data).toEqual(payload);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ email: "admin@helpticket.com", senha: "admin123" });
  });

  it("lança mensagem amigável quando credenciais são inválidas (401)", async () => {
    fetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await expect(AuthModel.authenticate({ email: "a@b.com", password: "errada" }))
      .rejects.toThrow("E-mail ou senha invalidos.");
  });

  it("lança mensagem genérica em erro de servidor", async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(AuthModel.authenticate({ email: "a@b.com", password: "123456" }))
      .rejects.toThrow("Nao foi possivel entrar. Tente novamente.");
  });
});
