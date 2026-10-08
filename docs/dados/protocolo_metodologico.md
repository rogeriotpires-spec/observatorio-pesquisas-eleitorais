# Protocolo metodológico (versão de trabalho)

**Projeto:** acurácia de pesquisas eleitorais brasileiras, 2014–2026  
**Versão:** 0.1 — congelada para orientar a coleta; revisões futuras devem ser registradas com data e justificativa.  
**Status:** protocolo em construção; resultados de 2026 e Paraná/Senado 2022 são estudos-piloto, não conclusões nacionais.

## 1. Pergunta de pesquisa

Quão próximas das urnas são as estimativas divulgadas por institutos antes da eleição? Quais institutos apresentam menores erros em disputas comparáveis? Em quais direções candidatos e partidos são sistematicamente superestimados ou subestimados? A pesquisa descreve padrões e sua incerteza. Não infere fraude, intenção, influência sobre voto útil, alocação de recursos ou causalidade sem evidência e desenho próprios.

## 2. Universo e unidade de análise

O universo de interesse são eleições regulares brasileiras realizadas de 2014 até a data de corte do estudo, para:

- Presidência da República;
- governos estaduais e do Distrito Federal;
- Senado Federal em todas as unidades da Federação;
- prefeituras das capitais.

Unidade básica: **estimativa de uma candidatura em uma pesquisa, dentro de um cenário e disputa**. Unidades relacionadas não são independentes: pesquisas de uma mesma eleição, candidaturas repetidas e candidatos no mesmo levantamento compartilham contexto e erro. Inferências e intervalos devem agrupar observações por disputa e, quando aplicável, por instituto/eleição.

## 3. Desenho e seleção de casos

O estudo começa com uma amostra menor de disputas cuja documentação possa ser reconstruída. A seleção será intencional, não probabilística: incluirá (a) casos trazidos pelo usuário ou de grande discrepância pública; e (b) casos de contraste escolhidos por regra explícita, para reduzir seleção apenas por resultados extremos. A lista de casos considerados, incluídos e excluídos, com motivo, será mantida em planilha de auditoria.

Não será chamada de “amostra representativa do Brasil” nem sustentará ranking geral se a cobertura de cargos, ciclos e institutos for insuficiente. Um ranking nacional de institutos só será publicado se cada instituto classificado tiver pelo menos cinco disputas comparáveis, em ao menos dois ciclos eleitorais; abaixo disso, mostrar-se-á o histórico caso a caso, sem ordenação de competência geral. Para conclusões sobre viés partidário geral, exigir-se-á cobertura de múltiplas disputas, ciclos e institutos, contabilizando cada disputa uma vez na agregação principal.

## 4. Regra para selecionar a pesquisa final

Para cada instituto, cargo, território, turno e cenário comparável, selecionar a última pesquisa **publicada antes das 8h locais do dia da votação**. A coleta pode terminar antes, mas data de campo não substitui data/hora de publicação. A hora e a data efetivas da divulgação serão documentadas em fonte contemporânea (página do instituto, veículo que a publicou, arquivo web ou publicação datada). A data prevista no registro TSE, isoladamente, não comprova publicação.

Se a hora não puder ser verificada, classificar como “horário não confirmado” e não usar na análise principal quando a elegibilidade temporal depender desse dado. Publicações após as 8h ficam excluídas, mesmo que tenham sido registradas ou coletadas antes. Para eleições com segundo turno, cada turno é uma disputa separada; a comparação deve usar apenas pesquisa que corresponda ao turno e cenário analisados.

## 5. Fontes e cadeia de evidência

1. **Resultado eleitoral:** arquivos e relatórios de totalização do TSE, preservados sem alteração; conferir percentuais por agregação independente quando os dados permitirem.
2. **Registro, questionário e plano amostral:** cadastro oficial do TSE e documentos submetidos pela entidade responsável.
3. **Estimativa publicada e momento da divulgação:** relatório original ou página do instituto; em seguida, veículo de comunicação com matéria contemporânea e horário verificável.
4. **Conflitos e correções:** preservar cada versão, data, autor e motivo. Não substituir silenciosamente informação contraditória.

Cada observação deve guardar URL, cópia/PDF quando legalmente disponível, data de acesso, código TSE, campos transcritos e nível de evidência. Transcrição dupla ou conferência independente é recomendada para números-chave. Arquivos originais não serão editados; transformações serão feitas em scripts versionados, com manifesto SHA-256.

## 6. Comparabilidade e denominadores

Comparar a mesma candidatura, turno, cargo, território e cenário. Registrar se a pesquisa divulga intenção sobre todos os entrevistados, votos válidos estimados, cenário com candidatura sub judice, ou outra base. A análise principal compara a mesma métrica: votos válidos projetados com votação oficial calculada sobre votos válidos nominais, desde que o número de opções e a forma de resposta sejam compatíveis. Se a fonte divulgar apenas intenção sobre todos os entrevistados ou percentual de resposta múltipla, não converter silenciosamente: apresentar a série separada ou uma normalização explicitamente identificada e apenas como sensibilidade.

**Senado com duas vagas:** em eleições nas quais o eleitor podia votar em dois candidatos, os percentuais de entrevistados que citam cada nome podem somar até aproximadamente 200%, enquanto a participação de cada candidatura no total de votos nominais válidos do TSE soma 100%. Não comparar diretamente as duas escalas. Se a pergunta permitiu duas escolhas e o relatório informa apoio por candidato, converter a distribuição de respostas em composição das escolhas válidas (`apoio do candidato / soma dos apoios de todos os candidatos listados × 100`) e comparar com o TSE somente quando a lista e a base forem suficientemente completas e a definição de voto válido estiver documentada. Se a pesquisa já publicar percentuais normalizados de votos válidos, usar essa escala diretamente. Caso contrário, apresentar a eleição em camada separada. Registrar a pergunta, denominador, opções incluídas e fórmula antes de calcular erros. Em eleição de uma vaga, aplicar a comparação usual de uma escolha, observando a base da pesquisa.

Diferenças por arredondamento não serão redistribuídas. Se candidatura for retirada, indeferida, incluída provisoriamente ou tiver votos sub judice, não reclassificar a urna como se fosse um cenário conhecido pelo eleitor na pesquisa: apresentar a apuração corrente e, se necessário, uma análise de sensibilidade jurídica separada.

## 7. Métricas pré-especificadas

Para candidatura `c`, pesquisa `p` e disputa `r`:

- **Erro assinado:** `e = estimativa − resultado`. Positivo indica superestimação numérica; negativo, subestimação.
- **Erro absoluto:** `|e|`.
- **MAE da disputa/pesquisa:** média dos erros absolutos das candidaturas comparáveis, incluindo todas as candidaturas cuja estimativa e resultado estejam disponíveis. Informar cobertura e dados faltantes; não omitir candidaturas pequenas sem justificativa.
- **Viés médio assinado:** média do erro assinado, sempre descrita como tendência nesta amostra, não intenção.
- **Acurácia da liderança:** acerto de ordem entre candidaturas, divulgado como descritivo secundário; empate técnico e margem de erro serão tratados separadamente.

Quando apenas dois nomes puderem ser pareados com segurança, reportar “MAE do par”, nunca MAE da eleição. Publicar também tabela por candidatura. Estimativas arredondadas serão mantidas como publicadas e a precisão final não excederá a precisão de origem.

## 8. Comparação de institutos e partidos

Para o instituto, calcular primeiro erro por disputa e, em seguida, resumir disputas de modo que uma eleição com muitas pesquisas/candidaturas não domine automaticamente outra. Informar número de disputas, ciclos, cargos e observações por instituto. Incluir dispersão e intervalo de incerteza (preferencialmente bootstrap agrupado por disputa quando houver número suficiente de grupos); não ordenar institutos em amostras minúsculas.

Para partido, atribuir a legenda pela filiação/candidatura oficial na eleição, sem transportar filiação atual ou histórica. Calcular erros das candidaturas e, na agregação principal, dar peso igual às disputas, evitando que partido com mais levantamentos publicados ganhe peso artificial. Separar efeito de partido, cargo, incumbência, região e ciclo se a base permitir; a simples média bruta é descritiva e pode refletir composição diferente de candidaturas. Partido só será denominado “superestimado/subestimado” se o erro médio assinado e sua incerteza forem compatíveis com essa afirmação; caso contrário, usar “tendência observada, inconclusiva”.

## 9. Casos discrepantes e leitura causal

Casos de grande discrepância serão verificados contra documento original, código de registro, cenário, denominador, data/hora e transcrição. Destacar casos sem insinuar má-fé. A pesquisa mede diferença entre estimativa e resultado; não mede por si só mudança de voto, efeito de “voto útil”, influência sobre doações ou uso de recursos de campanha. Para essas perguntas, seria necessário estudo causal separado, com dados de exposição, comportamento e decisões de campanha.

## 10. Critérios de conclusão

Conclusões nacionais ou por instituto/partido ficam condicionadas a: cobertura documentada do escopo; inclusão das últimas publicações elegíveis segundo a regra; comparabilidade de métrica/denominador; base de resultado consolidada; e quantidade suficiente de disputas independentes. Antes disso, os resultados são estudos de caso ou análises exploratórias. Toda atualização após decisão judicial ou correção de instituto deverá registrar nova data de corte e preservar a versão anterior.

## 11. Casos-piloto em andamento

- Senado do Paraná, 2022: piloto de cálculo com todos os dez candidatos; o Ipec corrigiu publicamente as datas de campo, em nota reproduzida por reportagem contemporânea. Falta localizar/preservar a nota primária autônoma para completar a cadeia documental.
- Governo do Paraná, 2022: comparação do par líder na última publicação Ipec, com erro de 7,64 p.p. para Ratinho Junior; divulgada na véspera, antes do corte temporal.
- Prefeitura de São Paulo, 2024: três últimas pesquisas encontradas na véspera; cálculo preliminar limitado aos três primeiros candidatos e sem inferência de competência geral.
- Presidência, 2014–2026: série exploratória que compara, em cada pesquisa, a margem entre os dois candidatos que terminaram em primeiro e segundo lugar com a margem oficial. São 16 pesquisas-instituto comparadas à urna em quatro ciclos; em 2026 foram transcritas oito das 14 pesquisas compiladas. Ainda faltam candidatos, pesquisas e institutos para MAE integral e cobertura completa.
- Governo do Rio, 2026: comparação exploratória do par Paes–Ruas; oito linhas, incluindo normalização aproximada do Real Time; resultado ainda sensível à situação de Garotinho.

A matriz `MATRIZ_DE_CASOS.csv` registra as inclusões, razões, unidades comparadas, limites e pendências da amostra intencional. Esses casos mostram por que o protocolo separa MAE integral, MAE do par, última pesquisa elegível, cenário, data/hora de publicação e qualidade documental.
