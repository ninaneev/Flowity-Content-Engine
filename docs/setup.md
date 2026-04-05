# Setup Local — Flowity Content Engine

> ⚠️ **IMPORTANTE**: Você PRECISA fazer este setup antes de começar qualquer tarefa.

---

## 1️⃣ Configurar `.env`

### O que é `.env`?

É um arquivo **secreto** onde você coloca senhas, chaves e URLs que não podem ir para o GitHub. Cada pessoa cria o seu localmente.

### Como criar

**1. Na raiz do projeto** (`C:\Users\seu-usuario\Documents\PI-Univesp`), crie um arquivo chamado `.env`

**2. Copie e cole isto:**

```env
# Database — use SQLite para dev local
DATABASE_URL=sqlite:///./flowity.db

# JWT — chave secreta do backend
JWT_SECRET=sua-chave-secreta-super-aleatoria-com-min-32-caracteres

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$R9h7cIPz0gi.URNNGRST2OPST2bxW2/d5QHHwBAYvxaF9WuwuXMYG

# Ollama (IA local)
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b

# n8n (automação)
N8N_WEBHOOK_SECRET=flowity-webhook-secret-key-123456789

# Frontend
VITE_API_URL=http://localhost:8000
```

**3. Salve o arquivo na raiz do projeto**

> ✅ O `.env` já está no `.gitignore` — ele NUNCA vai para o GitHub

---

## 2️⃣ Rodar Docker Compose

Depois de criar o `.env`, abra **PowerShell** e rode:

```bash
cd C:\Users\seu-usuario\Documents\PI-Univesp
docker compose up --build
```

Isso vai:
- ✅ Baixar imagens (primeira vez demora ~5 min)
- ✅ Subir frontend (port 5173)
- ✅ Subir backend (port 8000)
- ✅ Subir Ollama (port 11434 — IA local)
- ✅ Subir n8n (port 5678 — automação)

---

## 3️⃣ Verificar que tudo funciona

### Frontend

Abra seu navegador: **http://localhost:5173**

Você deve ver a tela de login do Flowity. Faça login com:
- **Usuário**: `admin`
- **Senha**: `admin`

Se entrar, ✅ tudo funciona!

### Backend (opcional)

Abra: **http://localhost:8000/docs**

Você deve ver o Swagger UI com todos os endpoints da API.

---

## ⚠️ NÃO fazer

- ❌ Não commitee `.env` no Git (está no `.gitignore`)
- ❌ Não compartilhe senhas reais em Slack/Discord
- ❌ Não mude esses valores sem avisar o Scrum Master

---

## ❓ Dúvidas?

1. **Docker não sobe?** → Verifique se Docker Desktop está aberto
2. **Login não funciona?** → Limpe o `.env` e copie novamente
3. **Porta 5173 já está em uso?** → Mude a porta no `vite.config.js`
4. **Ainda não funciona?** → Pergunta no Issue da sua tarefa

---

## Próximos passos

Depois de fazer o setup, você está pronto para:
1. Criar uma nova branch (`git checkout -b feat/issue-X-sua-tarefa`)
2. Começar a implementar sua tarefa
3. Fazer commits regulares
4. Abrir um PR quando terminar

Veja `docs/shadow-working-guide.md` para o fluxo Git completo.
