/* Coleta documental de 12/10/2026. Nenhum percentual é recalculado. */
(() => {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function decode(pack) {
    return pack.linhas.map(values => Object.fromEntries(pack.colunas.map((field, i) => [field, pack.valores[i][values[i]]])));
  }
  const groupFields = ['id_fonte','pagina_pdf','cargo','cenario','turno','opcao_voto','base_percentual','modalidade','pergunta_original'];
  function groupRows(rows) {
    const grouped = new Map();
    for (const row of rows) {
      const key = JSON.stringify(groupFields.map(field => row[field]));
      if (!grouped.has(key)) grouped.set(key, {row, rows: []});
      grouped.get(key).rows.push(row);
    }
    return [...grouped.values()].map(group => ({...group, search: normalize([
      group.row.instituto, group.row.uf_territorial, group.row.abrangencia, group.row.cargo, group.row.cenario,
      group.row.registro_tse, group.row.id_fonte, group.row.pergunta_original,
      ...group.rows.map(row => row.resposta)
    ].join(' '))})).sort((a,b) => b.row.campo_fim.localeCompare(a.row.campo_fim) ||
      a.row.instituto.localeCompare(b.row.instituto,'pt-BR') || a.row.uf_territorial.localeCompare(b.row.uf_territorial) ||
      Number(a.row.pagina_pdf) - Number(b.row.pagina_pdf));
  }
  function matchesGroup(group, filters) {
    const fields = {instituto:'instituto',uf:'uf_territorial',cargo:'cargo',turno:'turno',base:'base_percentual',opcao:'opcao_voto',modalidade:'modalidade',temporal:'classificacao_temporal_t1'};
    return Object.entries(fields).every(([filter,field]) => !filters[filter] || group.row[field] === filters[filter]) &&
      normalize(filters.busca).split(/\s+/).filter(Boolean).every(word => group.search.includes(word));
  }
  function sourceState(source) {
    if (Number(source.percentuais_extraidos) > 0) return 'extraido';
    return /\.pdf$/i.test(source.arquivo_original) && source.sha256 ? 'pdf' : 'acesso';
  }
  function csvText(rows, columns) {
    const line = values => values.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(';');
    return '\ufeff' + [line(columns), ...rows.map(row => line(columns.map(column => row[column])))].join('\r\n') + '\r\n';
  }
  if (typeof module !== 'undefined') module.exports = {decode, groupRows, matchesGroup, sourceState, csvText};
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const ROOT = 'dados/coleta-2026/';
  const count = n => Number(n).toLocaleString('pt-BR');
  const date = value => value ? (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4) : value) : 'Pendente';
  const display = value => escape(value || 'Pendente');
  const ufNames = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',BR:'Brasil (nacional)'};
  const pages = {dados:1,fontes:1,cobertura:1};
  let tab = 'dados', meta, groups = [], filteredGroups = [], sources = [], institutes = [], coverage = new Map();
  let dataReady = false, sourcesReady = false, inventoryReady = false, renderSequence = 0;
  const requests = new Map();
  const commonIds = ['instituto','uf','busca'];
  const dataIds = ['cargo','turno','base','opcao','modalidade','temporal'];
  const allFilters = [...commonIds,...dataIds,'status-fonte','status-cobertura'];
  async function fetchJSON(file) {
    if (!requests.has(file)) requests.set(file, fetch(ROOT + file + '?v=20261012').then(response => {
      if (!response.ok) throw Error('Arquivo indisponível: ' + file + ' (HTTP ' + response.status + ')');
      return response.json();
    }).catch(error => { requests.delete(file); throw error; }));
    return requests.get(file);
  }
  function options(id, values, label = value => value) {
    const select = $(id), previous = select.value;
    select.options.length = 1;
    values.forEach(value => select.add(new Option(label(value),value)));
    if (values.includes(previous)) select.value = previous;
  }
  function filters() { return Object.fromEntries(allFilters.map(id => [id,$(id).value])); }
  function writeURL() {
    const params = new URLSearchParams();
    if (tab !== 'dados') params.set('tab',tab);
    for (const [key,value] of Object.entries(filters())) if (value) params.set(key,value);
    history.replaceState(null,'', location.pathname + (params.size ? '?' + params.toString() : ''));
  }
  function readURL() {
    const params = new URLSearchParams(location.search);
    tab = ['dados','fontes','cobertura','downloads'].includes(params.get('tab')) ? params.get('tab') : 'dados';
    allFilters.forEach(id => { $(id).value = params.get(id) || ''; });
  }
  function link(url,label,page) {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (!['https:','http:'].includes(parsed.protocol)) return '';
      if (page && /\.pdf$/i.test(parsed.pathname)) parsed.hash = 'page=' + encodeURIComponent(page);
      return `<a href="${escape(parsed.href)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
    } catch { return ''; }
  }
  function downloadRows(rows) {
    if (!rows.length) return;
    const blob = new Blob([csvText(rows,meta.colunas_dados)],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'Pesquisas_2026_Selecao.csv'; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url),1500);
  }
  function clearFilters() {
    allFilters.forEach(id => { $(id).value = ''; });
    pages.dados = pages.fontes = pages.cobertura = 1;
    writeURL(); render();
  }
  function setTab(next, save = true) {
    tab = next;
    document.querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === tab;
      button.setAttribute('aria-selected',String(active)); button.tabIndex = active ? 0 : -1;
    });
    ['dados','fontes','cobertura','downloads'].forEach(name => { $('panel-'+name).hidden = name !== tab; });
    $('filtros-comuns').hidden = tab === 'downloads';
    if (save) writeURL();
    render();
  }
  function pager(name,total,size) {
    const pageCount = Math.max(1,Math.ceil(total / size));
    pages[name] = Math.min(pages[name],pageCount);
    const page = pages[name];
    $('paginacao-'+name).innerHTML = `<button class="coleta-button" type="button" data-page="${name}" data-delta="-1" ${page===1?'disabled':''}>Anterior</button><span>Página ${count(page)} de ${count(pageCount)}</span><button class="coleta-button" type="button" data-page="${name}" data-delta="1" ${page===pageCount?'disabled':''}>Próxima</button>`;
    return (page-1) * size;
  }
  const empty = message => `<div class="coleta-empty"><strong>Nenhum registro neste filtro.</strong>${message} <button type="button" class="coleta-button" data-clear>Limpar filtros</button></div>`;
  function tableCard(group) {
    const r = group.row;
    const temporalFlag = !r.data_publicacao || !r.classificacao_temporal_t1.startsWith('Anterior') || r.campo_cruza_t1 === 'Sim';
    const values = group.rows.map(row => `<tr><td>${escape(row.resposta)}</td><td class="pct"><strong>${escape(row.valor_publicado)}</strong>${row.valor_publicado.includes('%')?'':'<small>%</small>'}</td></tr>`).join('');
    const limitations = [...new Set(group.rows.map(row=>row.limitacao_tabela).filter(Boolean))];
    return `<article class="poll-card"><header><span class="poll-kicker">${escape(r.instituto)} · ${escape(ufNames[r.uf_territorial] || r.uf_territorial)}</span><h3>${escape(r.cargo)} · ${escape(r.turno)}</h3><p class="poll-scenario">${escape(r.cenario)} · ${escape(r.modalidade || 'Modalidade pendente')}</p></header>
      <div class="poll-meta"><span>Campo: <b>${escape(date(r.campo_inicio))} a ${escape(date(r.campo_fim))}</b></span><span>Publicação: <b>${escape(date(r.data_publicacao))}</b></span><span>Registro: <b>${display(r.registro_tse)}</b></span></div>
      <div class="poll-base"><b>Base publicada:</b> ${escape(r.base_percentual)}<br><b>Pergunta / opção:</b> ${escape(r.opcao_voto)}</div>
      <div class="poll-temporal${temporalFlag?' flag':''}">1º turno: ${display(r.classificacao_temporal_t1)}${r.campo_cruza_t1==='Sim'?'<br><b>O campo inclui o dia do 1º turno.</b>':''}${r.campo_cruza_t2==='Sim'?'<br><b>O campo inclui o dia do 2º turno.</b>':''}</div>
      <table class="poll-table"><thead><tr><th scope="col">Candidatura / resposta publicada</th><th class="pct" scope="col">Percentual</th></tr></thead><tbody>${values}</tbody></table>
      <details class="poll-audit"><summary>Metodologia, datas e conferência</summary><p><b>Amostra:</b> ${display(r.amostra)} · <b>Margem:</b> ${display(r.margem_erro_pp)} p.p. · <b>Confiança:</b> ${display(r.nivel_confianca)}</p><p><b>Contratante:</b> ${display(r.contratante)} · <b>CNPJ do instituto:</b> ${display(r.cnpj_instituto)}</p><p><b>Pergunta original:</b> ${display(r.pergunta_original)}</p><p><b>Tipo da data de publicação:</b> ${display(r.tipo_data_publicacao)}<br><b>Data do catálogo:</b> ${display(r.data_catalogo)}<br><b>Divulgação prevista no TSE:</b> ${escape(date(r.divulgacao_prevista_tse))}. Previsão não comprova publicação.</p><p><b>Em relação ao 2º turno:</b> ${display(r.classificacao_temporal_t2)}<br><b>Situação do campo:</b> ${display(r.situacao_pos_primeiro_turno)}</p><p><b>Conferência:</b> ${display(r.conferencia)}<br><b>Status:</b> ${display(r.status_dado)}</p>${limitations.map(value=>`<p><b>Limitação da tabela:</b> ${escape(value)}</p>`).join('')}${r.limitacoes_fonte?`<p><b>Limitação da fonte:</b> ${escape(r.limitacoes_fonte)}</p>`:''}<p><b>Identificação:</b> ${escape(r.id_fonte)} · página ${escape(r.pagina_pdf)}. Extração parcial; ausência de uma categoria aqui não comprova ausência no relatório.</p></details>
      <div class="poll-links">${link(r.url_relatorio_original,'Relatório original · p. '+r.pagina_pdf,r.pagina_pdf)}${link(r.url_pagina_oficial,'Página oficial')}<button class="coleta-button" type="button" data-source="${escape(r.id_fonte)}">Ver fonte e pendências</button></div></article>`;
  }
  function renderData() {
    const f = filters(); filteredGroups = groups.filter(group=>matchesGroup(group,f));
    const observations = filteredGroups.reduce((total,group)=>total+group.rows.length,0);
    const reports = new Set(filteredGroups.map(group=>group.row.id_fonte)).size;
    $('contagem-dados').textContent = `${count(observations)} percentuais · ${count(filteredGroups.length)} tabelas / cenários · ${count(reports)} relatórios neste filtro`;
    $('baixar-filtrado').disabled = observations === 0;
    const start = pager('dados',filteredGroups.length,4);
    $('lista-dados').innerHTML = filteredGroups.length ? filteredGroups.slice(start,start+4).map(tableCard).join('') : empty('A coleta é parcial. Consulte as fontes e a cobertura para verificar as pendências.');
  }
  function sourceCard(s) {
    return `<article class="source-card"><span class="source-status">${escape(s.instituto)} · ${escape(ufNames[s.uf_territorial] || s.uf_territorial || 'Território pendente')}</span><h3>${escape(s.titulo)}</h3><p><b>${escape(s.status_conferencia)}</b> · ${count(s.percentuais_extraidos)} percentuais extraídos</p><p>Campo: ${escape(date(s.campo_inicio))} a ${escape(date(s.campo_fim))} · Publicação: ${escape(date(s.data_publicacao))}<br>Registro: ${display(s.registro_tse)}</p><p>${display(s.classificacao_temporal_t1)}${s.campo_cruza_t1==='Sim'?' · Campo inclui o dia do 1º turno.':''}${s.campo_cruza_t2==='Sim'?' · Campo inclui o dia do 2º turno.':''}</p><details><summary>Datas, limitações e identificação</summary><p>Tipo de data: ${display(s.tipo_data_publicacao)}<br>Catálogo: ${display(s.data_catalogo)}<br>Rótulo do catálogo: ${display(s.data_rotulo_catalogo)}<br>Publicação original informada: ${display(s.publicacao_original)}<br>Divulgação prevista no TSE: ${escape(date(s.divulgacao_prevista_tse))}. Previsão não comprova publicação.</p><p>2º turno: ${display(s.classificacao_temporal_t2)}<br>${display(s.situacao_pos_primeiro_turno)}</p><p>Limitações: ${display(s.limitacoes)}</p><p>Contratante: ${display(s.contratante)}<br>Amostra: ${display(s.amostra)} · Margem: ${display(s.margem_erro_pp)} p.p. · Confiança: ${display(s.nivel_confianca)}<br>Origem dos metadados: ${display(s.fonte_metadados)}</p><p>${escape(s.id_fonte)}<br>SHA-256: ${display(s.sha256)}<br>Arquivo original no acervo: ${display(s.arquivo_original)}</p></details><div class="poll-links">${link(s.url_pagina_oficial,'Página oficial')}${link(s.url_relatorio_original,'Relatório original')}${link(s.url_registro_oficial,'Cadastro TSE')}${Number(s.percentuais_extraidos)?`<button class="coleta-button" type="button" data-report="${escape(s.id_fonte)}">Ver percentuais</button>`:''}</div></article>`;
  }
  function renderSources() {
    const f = filters(), words = normalize(f.busca).split(/\s+/).filter(Boolean);
    const list = sources.filter(s=>(!f.instituto || f.instituto===s.instituto) && (!f.uf || f.uf===s.uf_territorial) &&
      (!f['status-fonte'] || sourceState(s)===f['status-fonte']) && words.every(word=>normalize([s.titulo,s.instituto,s.id_fonte,s.registro_tse,s.abrangencia,s.uf_territorial].join(' ')).includes(word)));
    $('contagem-fontes').textContent = `${count(list.length)} fontes neste filtro · ${count(list.filter(s=>Number(s.percentuais_extraidos)>0).length)} com percentuais · ${count(list.filter(s=>/\.pdf$/i.test(s.arquivo_original)&&s.sha256).length)} PDFs baixados`;
    const start = pager('fontes',list.length,12);
    $('lista-fontes').innerHTML = list.length ? list.slice(start,start+12).map(sourceCard).join('') : empty('Não há fonte catalogada para esta combinação. Isso não comprova que não houve publicação.');
  }
  function renderCoverage() {
    const f = filters(), words = normalize(f.busca).split(/\s+/).filter(Boolean);
    const list = institutes.map(i=> {
      const cell = coverage.get(i.cnpj_instituto+'|'+f.uf);
      const data = !f.uf ? i.percentuais_conferidos : cell?.percentuais_conferidos || '0';
      const sourceCount = !f.uf ? i.fontes_catalogadas : cell?.fontes_oficiais_catalogadas || '0';
      return {i,cell,data,sourceCount,pdfs:!f.uf?i.pdfs_baixados:cell?.pdfs_baixados||'0',
        state:Number(data)>0?'dados':Number(sourceCount)>0?'fontes':'pendente',
        status:!f.uf?i.status:cell?.status||'Publicação oficial não confirmada para esta UF'};
    }).filter(r=>(!f.instituto||r.i.instituto===f.instituto) && (!f['status-cobertura']||f['status-cobertura']===r.state) &&
      words.every(word=>normalize([r.i.instituto,r.i.nomes_no_tse,r.i.cnpj_instituto].join(' ')).includes(word)))
      .sort((a,b)=>Number(b.data>0)-Number(a.data>0) || Number(b.sourceCount>0)-Number(a.sourceCount>0) || a.i.instituto.localeCompare(b.i.instituto,'pt-BR'));
    $('contagem-cobertura').textContent = `${count(list.length)} empresas · ${f.uf?ufNames[f.uf]:'Brasil e todas as UFs'} · ${count(list.filter(r=>r.state==='dados').length)} com percentuais`;
    const start = pager('cobertura',list.length,25);
    const body = list.slice(start,start+25).map(r=>`<tr><td><strong>${escape(r.i.instituto)}</strong><small>CNPJ ${escape(r.i.cnpj_instituto)}</small>${f.uf&&r.cell?.cargos_com_percentuais?`<small>${escape(r.cell.cargos_com_percentuais)}</small>`:''}${link(r.cell?.url_fonte||r.i.url_oficial,'Fonte oficial')}</td><td class="num">${count(r.sourceCount)}</td><td class="num">${count(r.pdfs)}</td><td class="num">${count(r.data)}</td><td><span class="coverage-state">${escape(r.status)}</span>${Number(r.data)>0?`<button class="coleta-button" type="button" data-institute="${escape(r.i.instituto)}">Ver percentuais</button>`:''}</td></tr>`).join('');
    $('lista-cobertura').innerHTML = list.length ? `<div class="coleta-coverage-table" tabindex="0" role="region" aria-label="Cobertura por instituto, tabela com rolagem horizontal"><table><thead><tr><th scope="col">Instituto</th><th scope="col" class="num">Fontes</th><th scope="col" class="num">PDFs</th><th scope="col" class="num">Percentuais</th><th scope="col">Situação</th></tr></thead><tbody>${body}</tbody></table></div>` : empty('Altere o nome ou a situação pesquisada.');
  }
  async function ensureInventory() {
    if (inventoryReady) return;
    const data = await fetchJSON('inventario.json');
    institutes = decode(data.institutos);
    coverage = new Map(decode(data.cobertura).map(row=>[row.cnpj_instituto+'|'+row.uf_territorial,row]));
    options('instituto',[...new Set(institutes.map(i=>i.instituto))].sort((a,b)=>a.localeCompare(b,'pt-BR')));
    inventoryReady = true;
  }
  async function render() {
    const sequence = ++renderSequence;
    $('erro-carga').hidden = true;
    if (tab === 'downloads') { $('carregamento').hidden = true; return; }
    $('carregamento').hidden = false;
    $('carregamento').textContent = 'Carregando ' + (tab==='dados'?'os percentuais':tab==='fontes'?'as fontes':'a cobertura') + '…';
    try {
      if (tab === 'dados' && !dataReady) {
        const packs = await Promise.all(meta.arquivos_dados.map(fetchJSON));
        const rows = packs.flatMap(decode);
        if (rows.length !== meta.estatisticas.observacoes) throw Error('A base recebida está incompleta. Recarregue a página.');
        groups = groupRows(rows); dataReady = true;
      } else if (tab === 'fontes' && !sourcesReady) {
        sources = (await Promise.all(meta.arquivos_fontes.map(fetchJSON))).flatMap(decode);
        if (sources.length !== meta.estatisticas.fontes_catalogadas) throw Error('O catálogo recebido está incompleto.');
        sourcesReady = true;
      } else if (tab === 'cobertura') await ensureInventory();
      if (sequence !== renderSequence) return;
      if (tab==='dados') renderData();
      if (tab==='fontes') renderSources();
      if (tab==='cobertura') renderCoverage();
      $('carregamento').hidden = true;
    } catch (error) {
      if (sequence !== renderSequence) return;
      $('carregamento').hidden = true; $('erro-carga').hidden = false;
      $('erro-mensagem').textContent = error.message;
    }
  }
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click',()=>{ if (meta) setTab(button.dataset.tab); });
    button.addEventListener('keydown',event=>{
      const tabs = [...document.querySelectorAll('[data-tab]')], index = tabs.indexOf(button);
      let next;
      if (event.key==='ArrowRight') next=tabs[(index+1)%tabs.length];
      if (event.key==='ArrowLeft') next=tabs[(index+tabs.length-1)%tabs.length];
      if (event.key==='Home') next=tabs[0];
      if (event.key==='End') next=tabs.at(-1);
      if (next && meta) {event.preventDefault(); next.focus(); setTab(next.dataset.tab);}
    });
  });
  let timer;
  allFilters.forEach(id=>$(id).addEventListener(id==='busca'?'input':'change',()=>{
    if (!meta) return;
    clearTimeout(timer);
    const update=()=>{pages.dados=pages.fontes=pages.cobertura=1;writeURL();render();};
    if (id==='busca') timer=setTimeout(update,180); else update();
  }));
  ['limpar-dados','limpar-fontes','limpar-cobertura'].forEach(id=>$(id).addEventListener('click',clearFilters));
  $('baixar-filtrado').addEventListener('click',()=>downloadRows(filteredGroups.flatMap(group=>group.rows)));
  $('abrir-fontes').addEventListener('click',()=>setTab('fontes'));
  document.addEventListener('click',event=>{
    const button = event.target.closest('button'); if (!button || !meta) return;
    if (button.hasAttribute('data-clear')) clearFilters();
    if (button.dataset.page) {
      pages[button.dataset.page] += Number(button.dataset.delta); render();
      $('filtros-comuns').scrollIntoView({behavior:'smooth',block:'start'});
    }
    if (button.dataset.source || button.dataset.report) {
      allFilters.forEach(id=>{$(id).value='';});
      $('busca').value = button.dataset.source || button.dataset.report;
      pages.dados=pages.fontes=1; setTab(button.dataset.source?'fontes':'dados');
      $('filtros-comuns').scrollIntoView({behavior:'smooth',block:'start'});
    }
    if (button.dataset.institute) {
      dataIds.forEach(id=>{$(id).value='';}); $('busca').value='';
      $('instituto').value=button.dataset.institute; pages.dados=1;setTab('dados');
      $('filtros-comuns').scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
  async function init() {
    try {
      $('erro-carga').hidden=true; $('carregamento').hidden=false;
      meta = await fetchJSON('indice.json');
      await ensureInventory();
      options('uf',Object.keys(ufNames).sort(),uf=>uf+' · '+ufNames[uf]);
      const map = {cargo:'cargo',turno:'turno',base:'base_percentual',opcao:'opcao_voto',modalidade:'modalidade',temporal:'classificacao_temporal_t1'};
      Object.entries(map).forEach(([id,field])=>options(id,meta.filtros[field]));
      readURL(); setTab(tab,false);
    } catch (error) { $('carregamento').hidden=true;$('erro-carga').hidden=false;$('erro-mensagem').textContent=error.message; }
  }
  $('tentar-novamente').addEventListener('click',()=>meta&&inventoryReady?render():init());
  window.addEventListener('popstate',()=>{if(meta){readURL();setTab(tab,false);}});
  init();
})();
