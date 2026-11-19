import { supabase } from "./supabase";

// --- AUTH ---
export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// --- TICKETS ---
export const ticketsService = {
  async listar({ page = 1, pageSize = 10, status = null, search = null } = {}) {
    let query = supabase
      .from("tickets")
      .select(`
        id, titulo, prioridade, status, created_at,
        solicitante:usuarios!tickets_solicitante_id_fkey(nome),
        responsavel:usuarios!tickets_responsavel_id_fkey(nome)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("titulo", `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data, count };
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        solicitante:usuarios!tickets_solicitante_id_fkey(id, nome, email),
        responsavel:usuarios!tickets_responsavel_id_fkey(id, nome),
        comentarios(id, texto, tipo, created_at, autor:usuarios(nome))
      `)
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async criar(ticket) {
    const { data, error } = await supabase.from("tickets").insert(ticket).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async atualizarStatus(id, status) {
    const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async stats() {
    const { data, error } = await supabase
      .from("tickets")
      .select("status, prioridade");
    if (error) throw new Error(error.message);
    return {
      abertos: data.filter(t => ["novo", "aberto"].includes(t.status)).length,
      emAndamento: data.filter(t => t.status === "em_andamento").length,
      resolvidosHoje: data.filter(t => t.status === "resolvido").length,
      criticos: data.filter(t => t.prioridade === "critica").length,
    };
  },
};

// --- COMENTÁRIOS ---
export const comentariosService = {
  async criar(comentario) {
    const { data, error } = await supabase.from("comentarios").insert(comentario).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// --- USUÁRIOS ---
export const usuariosService = {
  async listar() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, tipo, status")
      .order("nome");
    if (error) throw new Error(error.message);
    return data;
  },

  async criar(usuario) {
    const { data, error } = await supabase.from("usuarios").insert(usuario).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async atualizar(id, campos) {
    const { error } = await supabase.from("usuarios").update(campos).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async deletar(id) {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async buscarPorAuthId(authId) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", authId)
      .single();
    if (error) return null;
    return data;
  },
};

// --- NOTIFICAÇÕES ---
export const notificacoesService = {
  async listar(usuarioId) {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async marcarTodasLidas(usuarioId) {
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("usuario_id", usuarioId);
    if (error) throw new Error(error.message);
  },
};
