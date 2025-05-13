# Guia Rápido de Implantação

Este guia contém instruções rápidas para configurar o projeto Douglas Auto Car no GitHub e fazer a implantação na Hostinger.

## 1. Configuração no GitHub

### 1.1. Criar um repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "New" (Novo) para criar um repositório
3. Preencha as informações:
   - Nome do repositório: `douglas-auto-car`
   - Descrição: `Sistema de gestão para Douglas Auto Car`
   - Visibilidade: Escolha entre "Public" (Público) ou "Private" (Privado)
4. Clique em "Create repository" (Criar repositório)

### 1.2. Conectar o repositório local ao GitHub

```bash
# No diretório do projeto (via Git Bash ou terminal)
git remote add origin https://github.com/seu-usuario/douglas-auto-car.git

# Verificar se o remote foi adicionado corretamente
git remote -v

# Adicionar arquivos ao repositório
git add .

# Fazer o commit inicial
git commit -m "Commit inicial: Douglas Auto Car"

# Enviar para o GitHub
git push -u origin main
```

Substitua `seu-usuario` pelo seu nome de usuário no GitHub.

## 2. Implantação na Hostinger

### 2.1. Preparar o projeto para implantação

No Windows:
1. Execute o arquivo `prepare-hostinger.bat` clicando duas vezes nele ou via prompt de comando:
   ```
   prepare-hostinger.bat
   ```

No Linux/Mac:
1. Torne o script executável:
   ```bash
   chmod +x prepare-hostinger.sh
   ```
2. Execute o script:
   ```bash
   ./prepare-hostinger.sh
   ```

3. Edite o arquivo `.env.production` com as credenciais corretas do seu banco de dados na Hostinger.

### 2.2. Adquirir hospedagem na Hostinger

1. Acesse [Hostinger](https://www.hostinger.com.br/)
2. Escolha um plano Premium, Business ou Cloud (que suporte Node.js)
3. Complete o processo de compra

### 2.3. Configurar o banco de dados na Hostinger

1. No painel da Hostinger, vá para "Banco de Dados" > "MySQL"
2. Clique em "Criar Novo Banco de Dados"
3. Preencha as informações:
   - Nome do banco de dados: `douglascars`
   - Nome de usuário: Crie um nome de usuário
   - Senha: Gere uma senha forte
4. Anote as credenciais para usar no arquivo `.env.production`

### 2.4. Importar o banco de dados

1. No painel da Hostinger, vá para "Banco de Dados" > "phpMyAdmin"
2. Selecione seu banco de dados
3. Clique na aba "Importar"
4. Selecione o arquivo SQL do projeto e clique em "Executar"

### 2.5. Configurar o Node.js na Hostinger

1. No painel da Hostinger, localize e clique em "Node.js"
2. Habilite o Node.js para o seu site
3. Configure as seguintes informações:
   - Nome da aplicação: `douglascars`
   - Arquivo de início: `dist/index.js`
   - Diretório raiz: `/`
   - Versão do Node.js: 20.x (ou a versão mais recente disponível)
   - Comando de inicialização: `node dist/index.js`

### 2.6. Enviar os arquivos para a Hostinger

1. Compacte a pasta `deploy-hostinger` gerada pelo script
2. No painel da Hostinger, vá para "Arquivos" > "Gerenciador de Arquivos"
3. Navegue até a pasta raiz do seu site (geralmente `/public_html/`)
4. Faça upload do arquivo compactado
5. Descompacte o arquivo no servidor

### 2.7. Iniciar a aplicação

1. No painel da Hostinger, vá para a seção "Node.js"
2. Clique em "Restart" ou "Start" para iniciar a aplicação
3. Acesse seu site pelo navegador para verificar se está funcionando corretamente

## 3. Manutenção e Atualizações

### 3.1. Atualizar o código no GitHub

```bash
# Após fazer alterações no código
git add .
git commit -m "Descrição das alterações"
git push origin main
```

### 3.2. Atualizar a implantação na Hostinger

1. Execute novamente o script de preparação para implantação
2. Compacte a pasta `deploy-hostinger`
3. Faça upload para a Hostinger e descompacte
4. Reinicie a aplicação Node.js no painel da Hostinger

---

Para instruções mais detalhadas, consulte os arquivos na pasta `1-TUTORIAL`. 