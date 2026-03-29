# Arquitetura Tecnica

## Stack
- **Plataforma:** Bubble.io (no-code/low-code)
- **Hospedagem:** bubble.io cloud (CDN: 46c3c6e011026bf43394e43090e7d83e.cdn.bubble.io)
- **Dominio customizado:** operation.app.br

## Paginas Identificadas (Bubble Pages)
| Pagina | URL | Funcao |
|--------|-----|--------|
| os_painel | /os_painel?empresa=Serrat | Painel administrativo + QR Code management |
| os_app | /os_app?empresa=Serrat | App operacional mobile |
| os_qrcode | /os_qrcode?empresa=Serrat | (redirecionamento/alias) |

## Parametros de URL
- `empresa=Serrat` - Parametro que identifica a empresa/tenant no sistema
- O sistema e multi-tenant (mesma plataforma para multiplas empresas)

## Integracoes
- **Google Maps API:** Mapa interativo com marcadores de geolocalizacao
- **Camera/QR Reader:** Leitor de QR Code nativo via camera do dispositivo
- **Exportacao Excel:** Geracao de planilha XLS/XLSX

## Bibliotecas Frontend (CSS/JS)
- Flickity (carousel/slider)
- Flickity Fullscreen
- iziToast 1.4 (notificacoes)
- Croppie 2.4.0 (crop de imagens)
- Animate.css (animacoes)
- Bootstrap 4.3.1 (grid/layout)
- Google Fonts: Barlow, Inter, Lato, Open Sans, Poppins, Roboto

## Componentes de UI
- **Menu lateral:** jPanelMenu (slide-in sidebar)
- **Paginacao:** Sistema proprio do Bubble
- **Modais:** Popups Bubble nativos
- **Tabelas:** Repeating Groups do Bubble

## Observacoes Tecnicas
- Cabines 18 e 19 tem nome da empresa com grafia inconsistente
  (sem acento, sem espaco em "BRASILTERMINAL")
- IDs de OS nao sao todos sequenciais (ex: 478, 485 ao inves de 47800+)
  possivelmente truncamento de exibicao na tabela
- Sistema responsivo (layout adaptavel mobile/desktop)
