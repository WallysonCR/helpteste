import { supabase } from "./supabase";

const BUCKET = "anexos";

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("#");
    reader.readAsDataURL(file);
  });
}

export async function uploadAnexos(ticketId, files) {
  const resultados = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const nomeSeguro = file.name
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const caminho = `tickets/${ticketId}/${Date.now()}-${nomeSeguro}`;

    let publicUrl = null;
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(caminho, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
        publicUrl = data?.publicUrl;
      }
    } catch {
      // Fallback abaixo caso Supabase Storage retorne 500 ou falhe
    }

    if (!publicUrl) {
      publicUrl = await fileToDataUrl(file);
    }

    resultados.push({
      nomeArquivo: file.name,
      tipoArquivo: file.type || ext,
      tamanhoKb: Math.max(1, Math.ceil(file.size / 1024)),
      caminho: publicUrl,
    });
  }

  return resultados;
}
