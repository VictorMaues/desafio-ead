# 🏛️ Defensoria Pública - Frontend (Desafio EDA)

Interface web moderna desenvolvida em **Next.js (App Router)**, **TypeScript** e **TailwindCSS** para gerenciamento de assistidos e acompanhamento do histórico cronológico de atendimentos jurídicos da Defensoria Pública.

---

## 🚀 Como Executar (Dois Terminais)

Para utilizar o sistema completo, é necessário rodar o **Backend** (API FastAPI) e o **Frontend** (Next.js) simultaneamente em dois terminais separados:

### 🖥️ Terminal 1: Backend (Porta 8000)

Abra o primeiro terminal na raiz do projeto (`Desafio-EDA`):

```bash
# 1. Certifique-se de estar na raiz do projeto (atenção à sigla EDA):
cd /home/victor/Desafio-EDA

# 2. Ative o ambiente virtual Python
source .venv/bin/activate

# 3. Inicie o servidor da API com recarregamento automático
uvicorn backend.src.api.main:app --reload --port 8000
```

> 🌐 **API Backend ativa em:** [http://localhost:8000](http://localhost:8000)  
> 📚 **Documentação Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)  
> 📖 **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 💻 Terminal 2: Frontend (Porta 3000)

Abra o segundo terminal na pasta do frontend:

```bash
# 1. Navegue até a pasta do frontend:
cd /home/victor/Desafio-EDA/frontend
# (ou se já estiver na raiz do projeto: cd frontend)

# 2. Inicie o servidor de desenvolvimento do Next.js
bun run dev
# (caso utilize npm, execute: npm run dev)
```

> 🌐 **Aplicação Frontend ativa em:** [http://localhost:3000](http://localhost:3000)

---

## 📋 Funcionalidades da Interface

A aplicação é organizada em um painel em página única dividido em 3 blocos principais:

1. **Bloco 1: Cadastrar Assistido (`POST /assistidos`)**
   - Inputs: **Nome Completo** e **CPF** (limitado a 11 dígitos numéricos).
   - Validações: Exibe alerta visual caso ocorra duplicidade de CPF (`HTTP 409 Conflict`).

2. **Bloco 2: Registrar Atendimento (`POST /atendimentos`)**
   - Inputs: **CPF do Assistido** (com atalho para seleção rápida dos já cadastrados) e **Justificativa** (mínimo de 5 caracteres).
   - Validações: Exibe alerta visual se o assistido informado não existir na base (`HTTP 404 Not Found`).

3. **Bloco 3: Consultar Histórico por CPF (`GET /atendimentos/assistido/{cpf}`)**
   - Busca por CPF exibindo dados do assistido e uma **Linha do Tempo (Timeline)** cronológica de atendimentos com data/hora em UTC e UUID único.

---

## 🛠️ Tecnologias do Frontend

- **Next.js 16** (App Router & Turbopack)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **Bun** (Runtime & Package Manager)

---

## ⚙️ Configurações Opcionais

Por padrão, o frontend se comunica com a API em `http://localhost:8000`. Se desejar alterar o endereço do backend, crie um arquivo `.env.local` em `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
