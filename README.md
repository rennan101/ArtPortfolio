# Portfolio Studio — Artist Portfolio & CMS

Portfólio de artista profissional com CMS integrado para gerenciamento de fotos, reorganização via Drag & Drop, edição de textos, menus e formulário de contato.

---

## 🚀 Como Fazer o Deploy na Vercel

A Vercel utiliza arquitetura **Serverless**. Para que novas fotos enviadas pelo painel ADM fiquem salvas permanentemente na nuvem, o projeto já está integrado ao **Cloudinary** (gratuito até 25GB de armazenamento).

### Passo 1: Obter as Chaves Gratuitas do Cloudinary
1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com).
2. No seu Dashboard do Cloudinary, copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Passo 2: Publicar na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório do seu GitHub.
4. Na seção **"Environment Variables"** (Variáveis de Ambiente), adicione as seguintes 3 variáveis:
   - `CLOUDINARY_CLOUD_NAME` = *seu_cloud_name*
   - `CLOUDINARY_API_KEY` = *sua_api_key*
   - `CLOUDINARY_API_SECRET` = *seu_api_secret*
5. Clique em **Deploy**!

---

## 🖥️ Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start
```

- **Site Público**: `http://localhost:3000`
- **Painel ADM**: `http://localhost:3000/admin.html`
- **Senha Inicial**: `admin123`
