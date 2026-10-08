# Observatório de Pesquisas Eleitorais

Site estático do estudo exploratório sobre pesquisas eleitorais brasileiras, com corte em 7 de outubro de 2026. A experiência pública foi reconstruída em páginas leves e responsivas, com conclusões acompanhadas dos gráficos, dados consultáveis e limitações à vista.

## Páginas

- `docs/index.html`: síntese visual, achados e comparações locais por disputa.
- `docs/explorador.html`: tabela filtrável construída a partir dos CSVs publicados.
- `docs/relatorio.html`: protocolo, resultados, interpretação e limitações.
- `docs/relatorio-final.pdf`: relatório científico completo.
- `docs/site.css`: identidade e componentes visuais compartilhados.
- `docs/dados/`: dados calculados, matriz de seleção e protocolo metodológico.

## Publicação

No GitHub, configure Pages em **Settings → Pages → Deploy from a branch → `main` → `/docs`**. Todos os caminhos do site são relativos e funcionam a partir do diretório `/docs`.

## Integridade dos achados

A amostra é intencional, com nove casos documentados. Não é um censo eleitoral e não permite ranking nacional de institutos. O MAE só deve ser comparado entre institutos no mesmo cargo e no mesmo conjunto de candidaturas. O corte do Governo do Rio em 2026 é provisório por causa de votos sub judice. Erros observados não demonstram intenção, fraude, voto útil ou causalidade.
