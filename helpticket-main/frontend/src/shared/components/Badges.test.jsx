import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StatusBadge from "./StatusBadge/StatusBadge";
import PriorityBadge from "./PriorityBadge/PriorityBadge";

describe("StatusBadge", () => {
  it.each([
    ["aberto", "Aberto", "info"],
    ["ematendimento", "Em Atendimento", "warning"],
    ["em_atendimento", "Em Atendimento", "warning"],
    ["resolvido", "Resolvido", "success"],
    ["fechado", "Fechado", "neutral"],
  ])("status '%s' exibe '%s' com tom '%s'", (status, label, tone) => {
    const html = renderToStaticMarkup(<StatusBadge status={status} />);
    expect(html).toContain(label);
    expect(html).toContain(`ht-badge--${tone}`);
  });

  it("status vindo da API em PascalCase funciona após toLowerCase", () => {
    const html = renderToStaticMarkup(<StatusBadge status={"EmAtendimento".toLowerCase()} />);
    expect(html).toContain("Em Atendimento");
  });

  it("status desconhecido exibe o valor cru em tom neutro", () => {
    const html = renderToStaticMarkup(<StatusBadge status="pendente" />);
    expect(html).toContain("pendente");
    expect(html).toContain("ht-badge--neutral");
  });
});

describe("PriorityBadge", () => {
  it.each([
    ["baixa", "Baixa", "success"],
    ["media", "Média", "warning"],
    ["alta", "Alta", "error"],
    ["critica", "Crítica", "error"],
  ])("prioridade '%s' exibe '%s' com tom '%s'", (priority, label, tone) => {
    const html = renderToStaticMarkup(<PriorityBadge priority={priority} />);
    expect(html).toContain(label);
    expect(html).toContain(`ht-badge--${tone}`);
  });

  it("respeita o tamanho informado", () => {
    const html = renderToStaticMarkup(<PriorityBadge priority="alta" size="sm" />);
    expect(html).toContain("ht-badge--sm");
  });
});
