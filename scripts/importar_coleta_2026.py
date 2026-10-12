"""Importa o checkpoint documental sem recalcular percentuais ou resultados eleitorais."""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]).resolve()
OUT = ROOT / 'docs/dados/coleta-2026'
OUT.mkdir(parents=True, exist_ok=True)


def read(name):
    with (SOURCE / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle, delimiter=';'))


def save(name, content):
    (OUT / name).write_text(json.dumps(content, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def pack(rows):
    columns = list(rows[0])
    dictionaries, indices = [], []
    for field in columns:
        values = list(dict.fromkeys(row[field] for row in rows))
        dictionaries.append(values)
        indices.append({value: i for i, value in enumerate(values)})
    encoded = [[indices[i][row[field]] for i, field in enumerate(columns)] for row in rows]
    result = dict(colunas=columns, valores=dictionaries, linhas=encoded)
    # A codificação é reversível, inclusive para grafia, vazios e zeros iniciais.
    restored = [dict(zip(columns, [dictionaries[i][value] for i, value in enumerate(row)])) for row in encoded]
    assert rows == restored
    return result


def chunks(label, rows, batch):
    files = []
    for start in range(0, len(rows), batch):
        name = f'{label}-{start // batch:02d}.json'
        save(name, pack(rows[start:start + batch]))
        files.append(name)
    return files


rows = read('dados.csv')
sources = read('fontes_pendencias.csv')
institutes = read('institutos.csv')
coverage = read('cobertura_instituto_uf.csv')
stats = json.loads((SOURCE / 'estatisticas.json').read_text())
assert len(rows) == stats['observacoes'] == 13581
assert len({row['id_observacao'] for row in rows}) == len(rows)
assert len({row['id_fonte'] for row in rows}) == stats['relatorios_com_percentuais']
assert len({row['instituto'] for row in rows}) == stats['institutos_com_percentuais']
assert len(institutes) == stats['institutos_tse'] and len(coverage) == len(institutes) * 28
assert {row['id_fonte'] for row in rows} <= {row['id_fonte'] for row in sources}
assert all(row['valor_publicado'] and row['pagina_pdf'] and row['url_pagina_oficial'] for row in rows)

# Exclui apenas a transcrição longa da metodologia no catálogo de tela.
# O arquivo original de fontes no download conserva todas as colunas.
web_sources = [{k: v for k, v in row.items() if k != 'metodologia_trecho'} for row in sources]
data_files = chunks('dados', rows, 1000)
source_files = chunks('fontes', web_sources, 150)
save('inventario.json', {
    'institutos': pack(institutes),
    'cobertura': pack([row for row in coverage if int(row['fontes_oficiais_catalogadas']) or int(row['percentuais_conferidos'])]),
    'ufs': read('resumo_por_uf.csv'),
})

download_names = ['dados.csv', 'fontes_pendencias.csv', 'institutos.csv', 'cobertura_instituto_uf.csv',
    'resumo_por_uf.csv', 'registros_tse.csv', 'manifesto_originais.csv', 'conferencia_tabelas.csv',
    'pendencias_extracao.csv', 'dicionario_campos.csv', 'estatisticas.json', 'controle_qualidade.json', 'LEIA_ME.txt']
hashes = {name: hashlib.sha256((SOURCE / name).read_bytes()).hexdigest() for name in download_names}
with zipfile.ZipFile(OUT / 'Pesquisas_2026_Dados_Fontes_e_Auditoria.zip', 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name in download_names:
        archive.write(SOURCE / name, name)
    archive.writestr('SHA256SUMS.txt', '\n'.join(f'{sha}  {name}' for name, sha in hashes.items()) + '\n')
with zipfile.ZipFile(OUT / 'Pesquisas_2026_Dados_Fontes_e_Auditoria.zip') as archive:
    assert archive.testzip() is None
    for name, sha in hashes.items():
        assert hashlib.sha256(archive.read(name)).hexdigest() == sha

pending_publication = {row['id_fonte'] for row in rows if not row['data_publicacao']}
meta = {
    'versao': '2026-10-12', 'estatisticas': stats,
    'relatorios_publicacao_pendente': len(pending_publication),
    'observacoes_publicacao_pendente': sum(not row['data_publicacao'] for row in rows),
    'colunas_dados': list(rows[0]), 'arquivos_dados': data_files, 'arquivos_fontes': source_files,
    'filtros': {field: sorted({row[field] for row in rows if row[field]}) for field in
        ['instituto', 'uf_territorial', 'cargo', 'turno', 'base_percentual', 'opcao_voto', 'modalidade', 'classificacao_temporal_t1']},
    'hashes_origem': hashes,
    'status_fontes': dict(Counter(row['status_conferencia'] for row in sources)),
}
save('indice.json', meta)
print(json.dumps({'linhas': len(rows), 'relatorios': stats['relatorios_com_percentuais'],
    'publicacao_pendente': len(pending_publication), 'pacotes_dados': len(data_files),
    'arquivos_publicados': len(list(OUT.iterdir())), 'bytes': sum(p.stat().st_size for p in OUT.iterdir()),
    'roundtrip': 'Todas as 47 colunas preservadas', 'zip': '13 arquivos originais e manifesto verificados'}, ensure_ascii=False))
