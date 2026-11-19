import { API_BASE_URL } from "../config/api";

function getToken() {
  return localStorage.getItem("helpticket_token");
}

async function request(path, options = {}, retries = 2) {
  const token = getToken();
  const method = (options.method || "GET").toUpperCase();
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkErr) {
    if (method === "GET" && retries > 0) {
      await new Promise((r) => setTimeout(r, 2000));
      return request(path, options, retries - 1);
    }
    throw networkErr;
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("helpticket_token");
      localStorage.removeItem("helpticket_user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    if (method === "GET" && retries > 0 && [502, 503, 504].includes(res.status)) {
      await new Promise((r) => setTimeout(r, 2000));
      return request(path, options, retries - 1);
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensagem || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const ticketsApi = {
  listar: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", params.page);
    if (params.pageSize) qs.set("pageSize", params.pageSize);
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    if (params.meus) qs.set("meus", "true");
    return request(`/api/tickets?${qs}`);
  },
  obterPorId: (id) => request(`/api/tickets/${id}`),
  criar: (body) => request("/api/tickets", { method: "POST", body: JSON.stringify(body) }),
  atualizarStatus: (id, status) =>
    request(`/api/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  atribuirAgente: (id, idAgente) =>
    request(`/api/tickets/${id}/agente`, { method: "PATCH", body: JSON.stringify({ idAgente }) }),
  salvarAnexos: (id, anexos) =>
    request(`/api/tickets/${id}/anexos`, { method: "POST", body: JSON.stringify({ anexos }) }),
  adicionarComentario: (id, mensagem, interno = false) =>
    request(`/api/tickets/${id}/comentarios`, { method: "POST", body: JSON.stringify({ mensagem, interno }) }),
  stats: () => request("/api/tickets/stats"),
};

export const usuariosApi = {
  listar: () => request("/api/usuarios"),
  criar: (body) => request("/api/usuarios", { method: "POST", body: JSON.stringify(body) }),
  atualizar: (id, body) => request(`/api/usuarios/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletar: (id) => request(`/api/usuarios/${id}`, { method: "DELETE" }),
  obterMeuPerfil: () => request("/api/usuarios/me"),
  atualizarMeuPerfil: (body) => request("/api/usuarios/me", { method: "PUT", body: JSON.stringify(body) }),
};

export const notificacoesApi = {
  listar: () => request("/api/notificacoes"),
  marcarTodasLidas: () => request("/api/notificacoes/ler-todas", { method: "PATCH" }),
};

export const configuracoesApi = {
  obter: () => request("/api/configuracoes"),
  salvar: (body) => request("/api/configuracoes", { method: "PUT", body: JSON.stringify(body) }),
  testarEmail: (emailDestino) =>
    request("/api/configuracoes/testar-email", { method: "POST", body: JSON.stringify({ emailDestino }) }),
};
