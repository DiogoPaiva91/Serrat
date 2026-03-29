# Fluxo Operacional do Sistema

## Fluxo de Trabalho

### 1. Cadastro (Admin)
1. Admin acessa tela QR CODE
2. Clica em "+ ADICIONAR"
3. Cadastra empresa, endereco, ID Codigo (ex: CABINE 01), ID Nome (ex: WC BTP)
4. Sistema gera QR Code unico para cada cabine
5. QR Code e impresso e fixado fisicamente na cabine

### 2. Operacao em Campo (Funcionario)
1. Funcionario acessa tela APLICATIVO no celular
2. Clica em "FINALIZAR ORDEM DE SERVICO"
3. Abre camera para leitura do QR Code
4. Escaneia QR Code da cabine
5. Sistema registra automaticamente:
   - Data/hora
   - Empresa e endereco (via QR Code)
   - Funcionario logado
   - Tipo servico (Higienizacao)
   - ID Codigo e ID Nome
   - Geolocalizacao (GPS)
   - Foto (se aplicavel)
6. Registro aparece na lista "ORDEM DE SERVICO FINALIZADOS"

### 3. Monitoramento (Gestor)
1. Gestor acessa PAINEL DE CONTROLE
2. Visualiza mapa com marcadores de servicos realizados
3. Filtra por periodo (data inicio/fim)
4. Consulta tabela detalhada com todas as OS
5. Clica no icone LOCAL para ver posicao exata no mapa
6. Exporta dados para Excel quando necessario

## Entidades do Sistema
- **Empresa:** Cliente contratante (ex: Brasil Terminal Portuario S/A)
- **QR Code:** Identificador unico de cada cabine/local
- **Ordem de Servico (OS):** Registro de servico realizado
- **Funcionario:** Operador que executa o servico
- **Tipo Servico:** Categoria do servico (ex: Higienizacao)

## Dados Estatisticos (29/03/2026)
- Total de paginas de OS no painel: 192 (periodo 01/03 a 29/03/2026)
- Total de cabines cadastradas: 19
- Funcionario ativo observado: LENI
- Frequencia de servico: multiplas vezes por dia por cabine
- Servico mais recente observado: 29/03/26 14:11 (CABINE 14)

## Autenticacao
- Login via email/senha
- Modal "Faca Login para entrar..."
- Opcoes: ENTRAR, CADASTRAR, RESET PASSWORD
- Email admin: nookwebapp@gmail.com
