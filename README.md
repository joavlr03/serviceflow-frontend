<div align="center">

# ServiceFlow · Frontend

Interface web da plataforma **ServiceFlow**, construída com React 19, TypeScript e TanStack Router — gerada com apoio de IA via [Lovable](https://lovable.dev).

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.170-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://serviceflow-frontend-xi.vercel.app)

**[🔗 Acesse a Demo](https://serviceflow-frontend-xi.vercel.app)**

</div>

---

## Sobre

Frontend da plataforma SaaS ServiceFlow, voltada para gestão de empresas prestadoras de serviços (lava-rápidos, oficinas, barbearias, pet shops e similares). Consome a API REST do [serviceflow-api](https://github.com/joavlr03) via `VITE_API_URL`.

O projeto foi scaffoldado via **Lovable** (IA generativa para UI) e usa **TanStack Start** como meta-framework, com roteamento baseado em arquivo (`src/routes/`), autenticação JWT com refresh automático e suporte a empacotamento Android via **Capacitor**.

---

## Telas

| Login | Dashboard |
|:-----:|:---------:|
| ![Login]<img width="456" height="873" alt="Login" src="https://github.com/user-attachments/assets/948d6e7c-d9dd-4b85-9a57-b50bfac3ef33" /> | ![Dashboard]<img width="412" height="892" alt="Inicio" src="https://github.com/user-attachments/assets/81a740b1-3ba2-42d5-a0ee-6399efc4ba4d" />

| Agenda de Clientes | Perfil do Cliente |
|:---------:|:--------:|
| ![Agenda]<img width="399" height="777" alt="Agenda de Clientes" src="https://github.com/user-attachments/assets/e1289c4c-415b-4ded-9149-aa01fac9c960" /> | ![Perfil]<img width="442" height="810" alt="Cliente Perfil" src="https://github.com/user-attachments/assets/a1dd323c-98d6-4aac-94b6-14d4d19f44d7" />
 |

| Dashboard Financeiro | Cadastro de Despesas |
|:-----------:|:--------:|
| ![Financeiro]<img width="433" height="834" alt="Financeiro Home" src="https://github.com/user-attachments/assets/800f8c96-ce5f-48a8-9323-90edfb1b3bcd" /> | ![Despesas] <img width="455" height="803" alt="Cad despesas" src="https://github.com/user-attachments/assets/aba35062-bb24-49b5-a74f-2c7d6f9eb85f" />
 |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Meta-framework | TanStack Start 1.168 |
| Roteamento | TanStack Router 1.170 (file-based) |
| Data fetching | TanStack Query 5.101 |
| Estilização | Tailwind CSS 4, tw-animate-css |
| Componentes | shadcn/ui (Radix UI) |
| Formulários | React Hook Form 7 + Zod 3 |
| Gráficos | Recharts 2 |
| Calendário | React Day Picker 9 |
| Ícones | Lucide React 0.575 |
| Toasts | Sonner 2 |
| Build | Vite 8, Bun |
| Mobile | Capacitor 8 (Android) |
| Deploy | Vercel |
| Linting | ESLint 9 + Prettier 3 |

---

## Estrutura

```
serviceflow-frontend/
├── src/
│   ├── routes/                  # File-based routing (TanStack Router)
│   │   ├── __root.tsx           # Layout raiz (providers globais, QueryClient)
│   │   ├── index.tsx            # Redirect para /dashboard ou /login
│   │   ├── login.tsx            # Tela de login / recuperação de senha
│   │   └── _authenticated/      # Grupo de rotas protegidas por JWT
│   │       ├── dashboard.tsx    # Dashboard operacional
│   │       ├── agenda.tsx       # Agenda de atendimentos por dia
│   │       ├── clientes/        # Listagem e perfil de clientes + veículos
│   │       ├── ordens/          # Ordens de serviço (CRUD + status + WhatsApp)
│   │       └── financeiro/      # Dashboard financeiro + despesas
│   ├── components/
│   │   └── ui/                  # Componentes shadcn/ui (Button, Dialog, etc.)
│   ├── hooks/                   # Custom hooks: queries e mutations da API
│   ├── lib/                     # Cliente HTTP, utilitários (cn, formatação)
│   └── main.tsx                 # Entry point
├── android/                     # Projeto nativo Android (Capacitor)
├── public/                      # Assets estáticos
├── resources/                   # Ícones e splash screens (Capacitor)
├── .env.example                 # Variáveis de ambiente de referência
├── capacitor.config.ts          # Config do Capacitor
├── components.json              # Config do shadcn/ui
├── vercel.json                  # Rewrites para SPA na Vercel
└── vite.config.ts               # Config do Vite + TanStack Router plugin
```

---

## Pré-requisitos

- **Node.js** ≥ 20 (ou [Bun](https://bun.sh))
- **serviceflow-api** rodando em `localhost:9000`

---

## Instalação e execução

```bash
# 1. Clone
git clone https://github.com/joavlr03/serviceflow-frontend.git
cd serviceflow-frontend

# 2. Variáveis de ambiente
cp .env.example .env
# edite .env se o backend estiver em porta diferente

# 3. Instale as dependências
npm install        # ou: bun install

# 4. Suba o servidor de desenvolvimento
npm run dev        # ou: bun run dev
```

O app abre em **http://localhost:8080**.
A variável `VITE_API_URL` aponta por padrão para `http://localhost:9000/api/v2`.

---

## Scripts

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção |
| `npm run build:dev` | Build em modo development |
| `npm run preview` | Pré-visualização local do build |
| `npm run lint` | Verificação ESLint |
| `npm run format` | Formatação com Prettier |

---

## Variáveis de ambiente

```env
# .env
VITE_API_URL=http://localhost:9000/api/v2
```

Em produção, configure `VITE_API_URL` no painel da Vercel.

---

## Build Android (Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android   # abre no Android Studio
```

---

## Deploy (Vercel)

O `vercel.json` configura rewrites para que o roteamento client-side do TanStack Router funcione corretamente. Qualquer push para `main` dispara um novo deploy automático.

**Demo:** [serviceflow-frontend-xi.vercel.app](https://serviceflow-frontend-xi.vercel.app)

---

## Principais dependências

```json
"react": "^19.2.0",
"@tanstack/react-router": "1.170.18",
"@tanstack/react-start": "1.168.32",
"@tanstack/react-query": "^5.101.1",
"tailwindcss": "^4.2.1",
"@radix-ui/*": "variado",
"react-hook-form": "^7.71.2",
"zod": "^3.24.2",
"recharts": "^2.15.4",
"lucide-react": "^0.575.0",
"sonner": "^2.0.7",
"date-fns": "^4.1.0",
"@capacitor/core": "^8.5.0"
```

---

## Licença

Propriedade de [QoreLab Solutions](https://qorelab.com.br). Todos os direitos reservados.







