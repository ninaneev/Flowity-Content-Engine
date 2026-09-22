import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { alertsApi } from "../../lib/api";

/** Card "Alertas" da SettingsPage: um único limite de engajamento, em %. */
export default function AlertSettingsCard() {
  const [valor, setValor] = useState("2");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    alertsApi
      .getSettings()
      .then((r) => {
        const pct = Math.round(r.data.min_engagement_rate * 1000) / 10;
        setValor(String(pct));
      })
      .catch(() => {});
  }, []);

  async function salvar(e) {
    e.preventDefault();
    // O botão não usa "disabled" para não tirar o foco de quem usa teclado.
    if (salvando) return;
    setMensagem("");
    setErro("");
    const numero = Number(String(valor).replace(",", "."));
    if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
      setErro("Informe um número entre 0 e 100.");
      return;
    }
    setSalvando(true);
    try {
      await alertsApi.updateSettings({ min_engagement_rate: numero / 100 });
      setMensagem(`Limite salvo: ${numero.toLocaleString("pt-BR")}%.`);
    } catch {
      setErro("Não foi possível salvar o limite. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <Bell size={18} className="text-flowity-purple" aria-hidden="true" />
        <h2 className="font-medium text-text-primary text-sm">Alertas</h2>
      </div>
      <p className="text-text-secondary text-xs mb-4">
        Avisa no painel de análise quando um post publicado fica abaixo desta taxa de engajamento.
      </p>
      <form onSubmit={salvar} className="flex flex-wrap items-end gap-3" noValidate>
        <div>
          <label className="label" htmlFor="limite-engajamento">
            Taxa mínima de engajamento (%)
          </label>
          <input
            id="limite-engajamento"
            className="input w-40 focus-visible:ring-2"
            type="number"
            min="0"
            max="100"
            step="0.1"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            aria-describedby={erro ? "limite-erro" : undefined}
            aria-invalid={erro ? "true" : undefined}
          />
        </div>
        <button
          type="submit"
          className="btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan"
          aria-disabled={salvando ? "true" : undefined}
        >
          {salvando ? "Salvando..." : "Salvar limite"}
        </button>
      </form>
      <div role="status" aria-live="polite" className="mt-3 text-sm">
        {mensagem && <p className="text-text-primary">✓ {mensagem}</p>}
      </div>
      {erro && (
        <p id="limite-erro" role="alert" className="mt-1 text-sm text-text-primary">
          ⚠ {erro}
        </p>
      )}
    </div>
  );
}
