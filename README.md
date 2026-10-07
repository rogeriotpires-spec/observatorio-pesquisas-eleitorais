# Observatório de Pesquisas Eleitorais

Site do estudo exploratório sobre pesquisas eleitorais brasileiras, com data de corte em 7 de outubro de 2026. Inclui relatório documentado, tabelas reproduzíveis e um explorador interativo por eleição, instituto, candidatura e partido.

## Conteúdo

- `docs/index.html`: síntese dos achados e acesso às tabelas.
- `docs/explorador.html`: filtros, gráficos comparativos e métricas descritivas carregados dos CSVs.
- `docs/relatorio.html`: relatório integral, metodologia, resultados, limites e referências.
- `docs/dados/`: arquivos CSV de resultados e matriz de casos, além do protocolo metodológico.

## Publicação no GitHub Pages

Em **Settings → Pages**, escolha **Deploy from a branch**, a branch `main` e a pasta `/docs`.

## Regenerar as páginas

Execute `python build_site.py` na pasta `github-pages`, com o relatório Markdown disponível em `estudo-pesquisas-eleitorais/estudo/RELATORIO_FINAL.md`.
