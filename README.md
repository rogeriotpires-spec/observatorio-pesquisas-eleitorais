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

## Coleta documental de 2026

Atualização de 12/10/2026, disponível em `docs/pesquisas-2026.html`. O novo módulo publica 13.581 percentuais de 246 relatórios e 12 institutos, com filtros, catálogo de 854 fontes/pendências e inventário das 250 empresas / 3.504 protocolos do retrato TSE de 11/10/2026. Nenhum instituto é considerado concluído.

Os 161 relatórios com data de primeira publicação pendente continuam identificados. Bases percentuais, opções de voto ao Senado, grafia original e campos vazios são preservados. A atualização não recalcula erros, rankings, resultados TSE nem as conclusões do recorte de 7/10/2026.

O pacote `docs/dados/coleta-2026/Pesquisas_2026_Dados_Fontes_e_Auditoria.zip` contém os 13 arquivos originais de dados/metadados e SHA-256 de cada um. Os PDFs continuam ligados às suas URLs oficiais. Os arquivos JSON são uma codificação reversível das 47 colunas de dados para consulta no navegador.

Para reproduzir a importação a partir do checkpoint entregue:

```sh
python scripts/importar_coleta_2026.py /caminho/para/eleitorais_2026_20261012
```

A publicação continua em GitHub Pages, branch `main`, pasta `/docs`. O domínio e o contador existente não foram alterados.
