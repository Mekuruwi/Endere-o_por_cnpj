# Consulta CNPJ

Uma ferramenta web simples para consultar informações de empresas brasileiras através do CNPJ usando a [BrasilAPI](https://brasilapi.com.br/).

## 📋 Descrição

Esta aplicação HTML permite:
- Consultar múltiplos CNPJs de uma vez
- Importar arquivos (.txt, .csv, .xlsx) com lista de CNPJs
- Visualizar resultados diretamente no navegador
- Exportar resultados em formato Excel (.xlsx)

## 🚀 Funcionalidades

- **Consulta em Lote**: Cole múltiplos CNPJs (um por linha) ou faça upload de um arquivo
- **Suporte a Arquivos**: Aceita arquivos `.txt`, `.csv` e `.xlsx`
- **Resultados em Tempo Real**: Exibe razão social, nome fantasia e endereço completo
- **Exportação**: Baixe os resultados em formato Excel para análise posterior
- **Interface Responsiva**: Design moderno e adaptável a diferentes dispositivos

## 💻 Como Usar

### Opção 1: Consulta Manual
1. Abra o arquivo `puxar_endereço.html` em qualquer navegador moderno
2. Digite ou cole os CNPJs na área de texto (um por linha)
3. Clique em **"Consultar"**
4. Aguarde o carregamento dos dados
5. Visualize os resultados na tela

### Opção 2: Upload de Arquivo
1. Clique em **"Escolher arquivo"** e selecione seu arquivo (.txt, .csv ou .xlsx)
2. Para arquivos Excel, a primeira coluna deve conter os CNPJs
3. Clique em **"Consultar"**
4. Os resultados serão exibidos abaixo

### Exportar Resultados
- Após a consulta, clique em **"Baixar Resultado (XLSX)"** para salvar os dados em uma planilha Excel

## 📁 Estrutura de Arquivos

```
/workspace
└── puxar_endereço.html    # Aplicação principal (HTML + CSS + JavaScript)
```

## 🔧 Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com a internet (para acessar a API da BrasilAPI)
- Nenhuma instalação necessária - basta abrir o arquivo HTML

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização com gradientes e animações
- **JavaScript Vanilla** - Lógica de consulta e manipulação de dados
- **[SheetJS (xlsx)](https://sheetjs.com/)** - Leitura e escrita de arquivos Excel
- **[BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/)** - API pública para consulta de CNPJ

## ⚠️ Limitações

- A BrasilAPI pode ter limites de requisições simultâneas
- Algumas empresas podem não ter todos os dados disponíveis
- O desempenho depende da quantidade de CNPJs consultados

## 📝 Formato dos Dados de Saída

Os resultados incluem:
- **CNPJ**: Número do CNPJ consultado
- **Razão Social**: Nome jurídico da empresa
- **Nome Fantasia**: Nome comercial (se disponível)
- **Endereço**: Logradouro, número, bairro, cidade, UF e CEP

## 🔒 Privacidade

- Todas as consultas são feitas diretamente do seu navegador para a BrasilAPI
- Nenhum dado é armazenado em servidores externos
- Os resultados ficam apenas na sua sessão do navegador

## 📄 Licença

Este projeto é de uso livre e aberto.

## 🤝 Contribuição

Sinta-se à vontade para modificar e melhorar esta ferramenta conforme necessário.

---

**Desenvolvido para facilitar consultas de CNPJ em lote de forma simples e rápida.**
