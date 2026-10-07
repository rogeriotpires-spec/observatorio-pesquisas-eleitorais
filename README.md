# Observatório de Pesquisas Eleitorais

Site estático com o relatório exploratório sobre pesquisas eleitorais brasileiras, com data de corte em 7 de outubro de 2026.

## Conteúdo

- `docs/index.html`: síntese dos achados e acesso às tabelas.
- `docs/relatorio.html`: relatório integral, metodologia, resultados, limites e referências.
- `docs/dados/`: arquivos CSV de resultados e matriz de casos, além do protocolo metodológico.

## Publicação no GitHub Pages

Em **Settings → Pages**, escolha **Deploy from a branch**, a branch `main` e a pasta `/docs`.

## Regenerar as páginas

Execute `python build_site.py` na pasta `github-pages`, com o relatório Markdown disponível em `estudo-pesquisas-eleitorais/estudo/RELATORIO_FINAL.md`.
