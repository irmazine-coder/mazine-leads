# MAZINE LEADS

Aplicação privada de prospecção comercial da MAZINE, construída com Next.js, Supabase e preparada para publicação na Vercel.

## 1. Requisitos
- Node.js LTS instalado (https://nodejs.org)
- Projeto Supabase criado
- Usuário criado em Supabase > Authentication > Users

## 2. Preparar o projeto
Extraia o ZIP. Abra a pasta `mazine-leads` no VS Code (ou terminal).

Instale as dependências:
```bash
npm install
```

## 3. Configurar Supabase
Crie um arquivo chamado `.env.local` na raiz do projeto, ao lado de `package.json`, com:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```
Use os valores do painel Supabase. Não coloque chave `secret` ou `service_role` em variáveis `NEXT_PUBLIC_`.

## 4. Criar a tabela
No Supabase, abra SQL Editor > New query. Copie o conteúdo de `supabase/schema.sql`, cole e clique em Run.

## 5. Iniciar localmente
```bash
npm run dev
```
Abra http://localhost:3000. Entre com o e-mail e a senha criados em Authentication > Users.

## 6. Publicar na Vercel
1. Envie a pasta do projeto para um repositório privado no GitHub.
2. Na Vercel, importe esse repositório.
3. Em Environment Variables, cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Faça o deploy.

## Segurança
- A tabela `leads` usa Row Level Security (RLS), restringindo registros ao usuário autenticado.
- O cadastro público não é implementado. Crie usuários pelo painel Supabase.
- Nunca exponha `SUPABASE_SECRET_KEY` ou `service_role` no navegador, GitHub ou variáveis `NEXT_PUBLIC_`.
