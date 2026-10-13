"""
Calcula os indicadores de tempo por publicação a partir de tempos-producao.csv.

Uso:
    python PI2/dados/calcular_tempos.py PI2/dados/tempos-producao.csv

Lê o CSV com separador ";" e UTF-8 com BOM (formato do Excel em português),
soma minutos_ferramenta + minutos_externos e imprime, por fluxo:
n, mediana, média, mínimo, máximo, desvio padrão e a redução da mediana em
relação ao fluxo manual. Só usa a biblioteca padrão do Python.
"""
from __future__ import annotations

import csv
import statistics
import sys
from pathlib import Path

FLUXOS = ("manual", "pi1", "pi2")
AMOSTRA_MINIMA = 10
COLUNAS_OBRIGATORIAS = {"id_post", "workflow", "data", "minutos_ferramenta", "minutos_externos"}


def _minutos(valor: str, linha: int, coluna: str) -> float:
    texto = (valor or "").strip().replace(",", ".")
    if texto == "":
        return 0.0
    try:
        numero = float(texto)
    except ValueError:
        raise SystemExit(f"Linha {linha}: '{coluna}' não é número: {valor!r}")
    if numero < 0:
        raise SystemExit(f"Linha {linha}: '{coluna}' negativo: {valor!r}")
    return numero


def ler_csv(caminho: Path) -> tuple[dict[str, list[float]], dict[str, int]]:
    tempos: dict[str, list[float]] = {f: [] for f in FLUXOS}
    autodeclarados: dict[str, int] = {f: 0 for f in FLUXOS}
    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        leitor = csv.DictReader(arquivo, delimiter=";")
        faltando = COLUNAS_OBRIGATORIAS - set(leitor.fieldnames or [])
        if faltando:
            raise SystemExit(
                f"Colunas ausentes: {', '.join(sorted(faltando))}. "
                "Confira se o arquivo usa ';' como separador."
            )
        for numero, linha in enumerate(leitor, start=2):
            if not any((v or "").strip() for v in linha.values()):
                continue  # linha em branco
            fluxo = (linha["workflow"] or "").strip().lower()
            if fluxo not in FLUXOS:
                raise SystemExit(f"Linha {numero}: workflow inválido {linha['workflow']!r} (use manual, pi1 ou pi2)")
            total = _minutos(linha["minutos_ferramenta"], numero, "minutos_ferramenta") + _minutos(
                linha["minutos_externos"], numero, "minutos_externos"
            )
            tempos[fluxo].append(total)
            if (linha.get("tipo_medicao") or "").strip().lower() == "autodeclarado":
                autodeclarados[fluxo] += 1
    return tempos, autodeclarados


def _fmt(valor: float | None) -> str:
    return "—" if valor is None else f"{valor:.1f}".replace(".", ",")


def main(argv: list[str]) -> int:
    # Saída em UTF-8 mesmo quando redirecionada para arquivo no Windows
    # (ex.: python calcular_tempos.py > resultados.md).
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    caminho = Path(argv[1]) if len(argv) > 1 else Path(__file__).with_name("tempos-producao.csv")
    tempos, autodeclarados = ler_csv(caminho)

    if not any(tempos.values()):
        print(f"{caminho}: nenhuma publicação registrada ainda. Nada a calcular.")
        return 0

    mediana_manual = statistics.median(tempos["manual"]) if tempos["manual"] else None

    print("| Fluxo | n | Mediana (min) | Média (min) | Mín. | Máx. | Desvio padrão | Redução da mediana vs. manual |")
    print("|-------|---|---------------|-------------|------|------|---------------|-------------------------------|")
    for fluxo in FLUXOS:
        valores = tempos[fluxo]
        if not valores:
            print(f"| {fluxo} | 0 | — | — | — | — | — | — |")
            continue
        mediana = statistics.median(valores)
        desvio = statistics.stdev(valores) if len(valores) > 1 else None
        if fluxo == "manual" or not mediana_manual:
            reducao = "—"
        else:
            reducao = _fmt((mediana_manual - mediana) / mediana_manual * 100) + " %"
        print(
            f"| {fluxo} | {len(valores)} | {_fmt(mediana)} | {_fmt(statistics.mean(valores))} | "
            f"{_fmt(min(valores))} | {_fmt(max(valores))} | {_fmt(desvio)} | {reducao} |"
        )

    print()
    for fluxo in FLUXOS:
        n = len(tempos[fluxo])
        if n < AMOSTRA_MINIMA:
            print(f"AVISO: '{fluxo}' tem {n} publicação(ões); o protocolo pede {AMOSTRA_MINIMA}.")
        if autodeclarados[fluxo]:
            print(f"Limitação: {autodeclarados[fluxo]} de {n} tempo(s) de '{fluxo}' são autodeclarados.")
    if mediana_manual is None:
        print("AVISO: sem publicações 'manual', não há linha de base para calcular a redução.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
