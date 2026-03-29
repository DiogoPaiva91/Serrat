# Mapeamento de Telas e Menus

## Menu Principal (Hamburger - canto superior direito)
O menu lateral slide-in contem 3 opcoes:

### 1. APLICATIVO (os_app)
- **URL:** https://operation.app.br/os_app?empresa=Serrat
- **Funcao:** Tela operacional mobile para funcionarios em campo
- **Elementos:**
  - Logo SERRAT no topo
  - Botao amarelo "FINALIZAR ORDEM DE SERVICO" (abre leitor QR Code via camera)
  - Tabela "ORDEM DE SERVICO FINALIZADOS" com colunas:
    - DATA HORA
    - EMPRESA / ENDERECO
    - QR CODE (codigo da cabine + nome)
  - Paginacao: 13 paginas de registros (29/03/2026)
- **Fluxo:** Funcionario escaneia QR Code da cabine -> registra servico -> aparece na lista

### 2. PAINEL DE CONTROLE (os_painel)
- **URL:** https://operation.app.br/os_painel?empresa=Serrat
- **Funcao:** Dashboard administrativo com visao geral
- **Elementos:**
  - Header: "PAINEL DE CONTROLE" + email logado + menu hamburger
  - **Mapa Google Maps:** Exibe marcadores vermelhos nos locais de servico (Santos/SP)
  - **Filtro de datas:** Campo inicio (01/03/2026) e fim (29/03/2026)
  - **Botao Excel:** Exportar dados para planilha
  - **Tabela de ordens de servico** com colunas:
    - No (numero da OS)
    - DATA HORA
    - EMPRESA / ENDERECO
    - FUNCIONARIO
    - TIPO SERVICO
    - ID CODIGO
    - ID NOME
    - OBSERVACAO
    - FOTO
    - LOCAL (icone mapa clicavel)
  - Paginacao: 192 paginas de registros
- **Dados observados:**
  - Funcionario ativo: LENI
  - Tipo servico: Higienizacao
  - Cabines: 01 a 19 (WC BTP)
  - Numeros OS: 47819 a 47829 (no periodo visivel)

### 3. QR CODE (gerenciamento - mesma URL do painel com view diferente)
- **URL:** https://operation.app.br/os_painel?empresa=Serrat (view QR CODE)
- **Funcao:** Cadastro e gerenciamento de QR Codes
- **Elementos:**
  - Campo de busca: "ID Codigo"
  - Campo de busca: "ID Material"
  - Botao amarelo "+ ADICIONAR"
  - Botao de refresh/sync
  - **Tabela de QR Codes** com colunas:
    - No
    - EMPRESA
    - ENDERECO
    - ID CODIGO
    - ID NOME
  - **Acoes por linha:**
    - Lixeira vermelha (Excluir)
    - Lapis verde (Editar)
    - Icone QR Code (visualizar/imprimir QR)
  - Paginacao: 2 paginas

## Cadastro de QR Codes (19 cabines)
| No | Empresa | ID Codigo | ID Nome |
|----|---------|-----------|---------|
| 1  | BRASIL TERMINAL PORTUARIO S/A | CABINE 01 | WC BTP |
| 2  | BRASIL TERMINAL PORTUARIO S/A | CABINE 02 | WC BTP |
| 3  | BRASIL TERMINAL PORTUARIO S/A | CABINE 03 | WC BTP |
| 4  | BRASIL TERMINAL PORTUARIO S/A | CABINE 04 | WC BTP |
| 5  | BRASIL TERMINAL PORTUARIO S/A | CABINE 05 | WC BTP |
| 6  | BRASIL TERMINAL PORTUARIO S/A | CABINE 06 | WC BTP |
| 7  | BRASIL TERMINAL PORTUARIO S/A | CABINE 07 | WC BTP |
| 8  | BRASIL TERMINAL PORTUARIO S/A | CABINE 08 | WC BTP |
| 9  | BRASIL TERMINAL PORTUARIO S/A | CABINE 09 | WC BTP |
| 10 | BRASIL TERMINAL PORTUARIO S/A | CABINE 10 | WC BTP |
| 11 | BRASIL TERMINAL PORTUARIO S/A | CABINE 11 | WC BTP |
| 12 | BRASIL TERMINAL PORTUARIO S/A | CABINE 12 | WC BTP |
| 13 | BRASIL TERMINAL PORTUARIO S/A | CABINE 13 | WC BTP |
| 14 | BRASIL TERMINAL PORTUARIO S/A | CABINE 14 | WC BTP |
| 15 | BRASIL TERMINAL PORTUARIO S/A | CABINE 15 | WC BTP |
| 16 | BRASIL TERMINAL PORTUARIO S/A | CABINE 16 | WC BTP |
| 17 | BRASIL TERMINAL PORTUARIO S/A | CABINE 17 | WC BTP |
| 18 | BRASIL TERMINAL PORTUARIO SA  | CABINE 18 | WC BTP |
| 19 | BRASILTERMINAL PORTUARIO SA   | CABINE 19 | WC BTP |

**Obs:** Cabines 18 e 19 possuem nome da empresa com grafia diferente (sem acento e sem espaco).
Endereco de todas: Brasil Terminal Portuario - Av. Engenheiro Augusto Barata, s/n - Porto Alemoa, Santos - SP, Brasil
