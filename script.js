function toggleProgress() {
  const content = document.getElementById('progress-content');
  const chevron = document.getElementById('chevron-icon');
  content.classList.toggle('hidden');
  chevron.classList.toggle('rotated');
}

document.getElementById('file-upload').addEventListener('change', function(e) {
  const fileName = e.target.files[0] ? e.target.files[0].name : 'Selecionar arquivo (.xlsx, .csv, .txt)';
  document.getElementById('file-name-display').textContent = fileName;
});

let resultados = [];
const listaDiv = document.getElementById('lista-resultados');
document.getElementById('consultar-btn').addEventListener('click', consultarCNPJ);
document.getElementById('baixar-btn').addEventListener('click', baixarResultado);

function consultarCNPJ() {
  const cnpjInput = document.getElementById('cnpj-input');
  const fileInput = document.getElementById('file-upload');
  resultados = [];
  listaDiv.innerHTML = '';
  let cnpjs = [];

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = function(e) {
      const content = e.target.result;
      try {
        if (ext === 'xlsx') {
          const wb = XLSX.read(content, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
          const coluna = Object.keys(json[0] || {}).find(col => col.toLowerCase().includes("cnpj"));
          if (!coluna) {
            alert("Coluna 'CNPJ' não encontrada no arquivo Excel.");
            return;
          }
          cnpjs = json.map(row => row[coluna]).filter(val => val);
        } else {
          const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (ext === 'csv' && lines[0].toLowerCase().includes("cnpj")) {
            const headers = lines[0].split(',');
            const idx = headers.findIndex(h => h.toLowerCase().includes("cnpj"));
            if (idx === -1) {
              alert("Coluna 'CNPJ' não encontrada no CSV.");
              return;
            }
            cnpjs = lines.slice(1).map(line => line.split(',')[idx]).filter(Boolean);
          } else {
            cnpjs = lines;
          }
        }
      } catch (err) {
        alert("Erro ao processar o arquivo. Verifique se ele está em formato válido.");
        console.error(err);
        return;
      }
      iniciarConsultaComAnimacao(cnpjs);
      cnpjInput.value = '';
      fileInput.value = '';
      document.getElementById('file-name-display').textContent = 'Selecionar arquivo (.xlsx, .csv, .txt)';
    };

    if (ext === 'xlsx') reader.readAsBinaryString(file);
    else reader.readAsText(file);
  } else {
    cnpjs = cnpjInput.value.split('\n').map(l => l.trim()).filter(Boolean);
    iniciarConsultaComAnimacao(cnpjs);
    cnpjInput.value = '';
  }
}

function iniciarConsultaComAnimacao(cnpjs) {
  if (!cnpjs.length) {
    alert("Nenhum CNPJ encontrado.");
    return;
  }
  document.querySelector('.container').classList.replace('somente-esquerda', 'com-dos-paineis');
  resultados = [];
  listaDiv.innerHTML = '';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('cnpj-atual').textContent = '-';
  document.getElementById('ja-feito').textContent = '0';
  document.getElementById('faltam').textContent = cnpjs.length;
  document.getElementById('tempo-restante').textContent = '-';
  document.getElementById('tentativa-atual').textContent = '1';

  // Garante que o painel esteja expandido ao iniciar
  const content = document.getElementById('progress-content');
  const chevron = document.getElementById('chevron-icon');
  content.classList.remove('hidden');
  chevron.classList.remove('rotated');

  consultarComRetries(cnpjs, 5, 2000).then(res => {
    resultados = res;
    atualizarUI(res.length, res.length, 'Concluído', Date.now(), 1);
    
    // RECOLHER AUTOMATICAMENTE APÓS 1.5 SEGUNDOS DO TÉRMINO
    setTimeout(() => {
      content.classList.add('hidden');
      chevron.classList.add('rotated');
    }, 500);
  });
}

function baixarResultado() {
  if (!resultados.length) {
    alert("Nenhum resultado para baixar.");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(resultados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  XLSX.writeFile(wb, "resultado_cnpj.xlsx");
}

function validarCNPJ(cnpj) {
  return (cnpj.replace(/[^\d]/g, '').length === 14);
}

async function fetchComRetry(url, t = 3, d = 1000) {
  for (let i = 0; i < t; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch(err) {
      if (i === t - 1) throw err;
      await new Promise(r => setTimeout(r, d * Math.pow(2, i)));
    }
  }
}

function formatarTempo(s) {
  if (!isFinite(s)) return "Calculando...";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m} min ${sec} s`;
}

async function consultarComRetries(cnpjs, maxT, atraso) {
  let pend = [...cnpjs];
  resultados = [];
  let tent = 1;
  const total = cnpjs.length;
  const inicio = Date.now();

  while (pend.length && tent <= maxT) {
    document.getElementById('tentativa-atual').textContent = tent;
    const erros = [];

    for (const raw of pend) {
      const clean = raw.replace(/\D/g, '');
      if (!validarCNPJ(clean)) {
        resultados.unshift({ cnpj: raw, erro: "Inválido" });
        renderizarResultado(resultados[0]);
        atualizarUI(resultados.length, total, raw, inicio, tent);
        continue;
      }

      try {
        const data = await fetchComRetry(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, 3, 500);
        const idxExist = resultados.findIndex(r => r.cnpj === raw);
        if (idxExist > -1) resultados.splice(idxExist, 1);
        const item = {
          cnpj: raw,
          razao_social: data.razao_social || 'Não informado',
          nome_fantasia: data.nome_fantasia || 'Não informado',
          endereco: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}, ${data.cep || ''}`,
          natureza_juridica: `${data.natureza_juridica || ''}`,
          situacao_cadastral: data.descricao_situacao_cadastral || 'Desconhecido',
        };
        resultados.unshift(item);
        renderizarResultado(item);
      } catch {
        erros.push(raw);
      }

      atualizarUI(resultados.length + erros.length, total, raw, inicio, tent);
      await new Promise(r => setTimeout(r, 300));
    }

    pend = erros;
    if (pend.length && tent < maxT) {
      await new Promise(r => setTimeout(r, atraso));
      tent++;
    } else {
      pend.forEach(r => {
        resultados.unshift({ cnpj: r, erro: `Falhou após ${maxT} tentativas` });
        renderizarResultado(resultados[0]);
      });
      break;
    }
  }
  return resultados;
}

function atualizarUI(feitos, total, atual, inicio, tentAtual) {
  document.getElementById('cnpj-atual').textContent = atual;
  document.getElementById('ja-feito').textContent = feitos;
  document.getElementById('faltam').textContent = total - feitos;
  const decorrido = (Date.now() - inicio) / 1000;
  const porCNPJ = feitos > 0 ? decorrido / feitos : 0;
  document.getElementById('tempo-restante').textContent = formatarTempo(porCNPJ * (total - feitos));
  document.getElementById('tentativa-atual').textContent = tentAtual;
  document.getElementById('progress-bar').style.width = `${(feitos / total) * 100}%`;
}

function renderizarResultado(item) {
  const div = document.createElement('div');
  div.className = 'result-item';
  const isError = !!item.erro;
  
  // Função para criar linha com ícone de cópia
  const criarLinhaComCopia = (label, valor) => {
    if (!valor || valor === '-') return `<p><strong>${label}:</strong> <span class="value">-</span></p>`;
    return `
      <p>
        <strong>${label}:</strong> 
        <span class="value">${valor}</span>
        <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onclick="copiarTexto('${valor.replace(/'/g, "\\'")}', this)" title="Copiar">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </p>
    `;
  };

  const razaoSocialContent = isError 
    ? `<span class="error">${item.erro}</span>` 
    : `${criarLinhaComCopia('Razão Social', item.razao_social).replace('<p><strong>Razão Social:</strong>', '').replace('</p>', '')}`;

  div.innerHTML = `
    ${criarLinhaComCopia('CNPJ', item.cnpj)}
    ${criarLinhaComCopia('Razão Social', item.razao_social)}
    ${criarLinhaComCopia('Nome Fantasia', item.nome_fantasia)}
    ${criarLinhaComCopia('Endereço', item.endereco)}
    ${criarLinhaComCopia('Natureza', item.natureza_juridica)}
    ${criarLinhaComCopia('Situação', item.situacao_cadastral)}
  `;
  listaDiv.insertBefore(div, listaDiv.firstChild);
}

function copiarTexto(texto, elemento) {
  navigator.clipboard.writeText(texto).then(() => {
    // Feedback visual no ícone
    if (elemento) {
      elemento.classList.add('copied');
      setTimeout(() => {
        elemento.classList.remove('copied');
      }, 1500);
    }
    
    // Mostrar tooltip de confirmação
    mostrarTooltip('Copiado!', elemento);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    mostrarTooltip('Erro ao copiar', elemento);
  });
}

function mostrarTooltip(mensagem, elemento) {
  // Remove tooltip existente se houver
  const tooltipExistente = document.querySelector('.copy-tooltip');
  if (tooltipExistente) {
    tooltipExistente.remove();
  }

  // Cria novo tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'copy-tooltip';
  tooltip.textContent = mensagem;
  document.body.appendChild(tooltip);

  // Posiciona o tooltip próximo ao elemento clicado
  if (elemento) {
    const rect = elemento.getBoundingClientRect();
    tooltip.style.left = Math.max(10, rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
  } else {
    // Posição padrão (centro superior da tela)
    tooltip.style.left = '50%';
    tooltip.style.top = '80px';
    tooltip.style.transform = 'translateX(-50%)';
  }

  // Anima para mostrar
  requestAnimationFrame(() => {
    tooltip.classList.add('show');
  });

  // Remove após 2 segundos
  setTimeout(() => {
    tooltip.classList.remove('show');
    setTimeout(() => tooltip.remove(), 300);
  }, 2000);
}

document.getElementById('cnpj-input').addEventListener('keydown', function(event) {
  const valor = this.value.trim();
  if (event.key === 'Enter' && !event.shiftKey && valor !== "") {
    event.preventDefault();
    document.getElementById('consultar-btn').click();
  }
});
