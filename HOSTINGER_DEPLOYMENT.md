# Guia de Implantação do Douglas Auto Car na Hostinger

Este documento fornece instruções detalhadas para implantar o sistema Douglas Auto Car em um servidor de hospedagem Hostinger.

## Por que a Hostinger?

A Hostinger oferece planos de hospedagem econômicos com suporte a Node.js e MySQL, tornando-a uma escolha excelente para o Douglas Auto Car. Além disso, a Hostinger possui data centers no Brasil, o que resulta em menor latência para os usuários brasileiros.

## Requisitos

- Uma conta na Hostinger com um plano de Hospedagem Premium, Business ou Cloud (que suporte Node.js)
- Um domínio registrado (pode ser adquirido na própria Hostinger)
- O código-fonte do projeto Douglas Auto Car

## Parte 1: Preparação do Ambiente na Hostinger

### 1. Comprar o Plano de Hospedagem

1. Acesse [Hostinger](https://www.hostinger.com.br/)
2. Escolha um plano Premium, Business ou Cloud (recomendamos Business para melhor desempenho)
3. Complete o processo de compra

### 2. Configurar o Domínio

1. No painel da Hostinger, vá para "Domínios" > "Meus Domínios"
2. Conecte seu domínio existente ou registre um novo
3. Configure os nameservers para apontarem para a Hostinger (se o domínio for externo)
4. Configure o registro DNS do domínio para apontar para seu servidor de hospedagem

## Parte 2: Configuração do Banco de Dados

### 1. Criar um Banco de Dados MySQL

1. No painel da Hostinger, vá para "Banco de Dados" > "MySQL"
2. Clique em "Criar Novo Banco de Dados"
3. Preencha as informações:
   - Nome do banco de dados: `douglascars` (ou um nome de sua escolha)
   - Nome de usuário: Crie um nome de usuário
   - Senha: Gere uma senha forte
   - Host: Selecione "Qualquer host" ou o host recomendado pela Hostinger
4. Anote as credenciais: Hostname, Nome do banco, Usuário e Senha

### 2. Importar o Esquema e Dados (Opcional)

Se você já possui um banco de dados PostgreSQL com dados e deseja migrá-los:

1. Siga as instruções no arquivo `MIGRACAO_POSTGRESQL_MYSQL.md` para converter seu banco de dados PostgreSQL para MySQL
2. No painel da Hostinger, vá para "Banco de Dados" > "phpMyAdmin"
3. Selecione seu banco de dados recém-criado
4. Clique na aba "Importar"
5. Selecione o arquivo SQL convertido e clique em "Executar"

## Parte 3: Configuração do Node.js

A Hostinger oferece suporte nativo a Node.js em seus planos premium, mas você precisa configurá-lo corretamente.

### 1. Acessar o Painel de Controle

1. Faça login no Painel de Controle da Hostinger (hPanel)
2. Navegue até a seção "Websites" e selecione seu domínio

### 2. Configurar Ambiente Node.js

1. No painel, localize e clique em "Node.js"
2. Habilite o Node.js para o seu site
3. Selecione a versão do Node.js (recomendamos a versão 20.x)
4. Configure as seguintes informações:
   - Nome da aplicação: `douglascars`
   - Arquivo de início: `server/index.ts` ou o arquivo principal do seu projeto
   - Diretório raiz: `/`
   - Versão do Node.js: 20.x
   - Comando de inicialização: `npm run start`
   - Variáveis de ambiente (adicione todas as necessárias):
     * `NODE_ENV`: `production`
     * `DATABASE_URL`: `mysql://usuarioDB:senhaDB@hostDB/douglascars`
     * `PORT`: `5000` (ou a porta fornecida pela Hostinger)
     * `VITE_FIREBASE_API_KEY`: seu valor
     * `VITE_FIREBASE_PROJECT_ID`: seu valor
     * `VITE_FIREBASE_APP_ID`: seu valor
     * Demais variáveis necessárias

5. Clique em "Salvar configurações"

## Parte 4: Upload do Código-Fonte

### 1. Preparar o Projeto para Produção

No seu ambiente de desenvolvimento local:

```bash
# No diretório do projeto
npm run build

# Certifique-se de criar um arquivo .env.production com suas variáveis
echo "NODE_ENV=production" > .env.production
echo "DATABASE_URL=mysql://usuarioDB:senhaDB@hostDB/douglascars" >> .env.production
# Adicione as demais variáveis necessárias
```

### 2. Upload via FTP

A forma mais simples de fazer upload é usando um cliente FTP:

1. No painel da Hostinger, vá para "Arquivos" > "Gerenciador de Arquivos" ou busque as credenciais FTP
2. Anote as credenciais FTP:
   - Servidor/Host FTP
   - Nome de usuário FTP
   - Senha FTP
   - Porta (geralmente 21)

3. Use um cliente FTP como FileZilla, WinSCP ou Cyberduck:
   - Conecte-se ao servidor usando as credenciais FTP
   - Navegue até a pasta raiz do seu website (geralmente `/public_html/`)
   - Faça upload de todos os arquivos do projeto (você pode excluir pastas como node_modules e arquivos de desenvolvimento)

### 3. Upload via Git (Se Disponível)

Se a Hostinger oferecer acesso Git para seu plano:

1. No painel da Hostinger, procure por opções de Git ou SSH
2. Configure o acesso SSH e chaves de autenticação
3. No seu ambiente local, adicione o repositório remoto:

```bash
git remote add hostinger ssh://usuariossh@seudominio.com.br/~/repositorio_git
git push hostinger main
```

## Parte 5: Configuração do Aplicativo

### 1. Instalação de Dependências

Por SSH ou pelo terminal da Hostinger (se disponível):

```bash
# Navegue até o diretório do projeto
cd /public_html

# Instale as dependências
npm install --production

# Se necessário, atualize o esquema do banco
npm run db:push
```

### 2. Configurar o Banco de Dados e Criar Usuário Admin

Se necessário, execute o script para criar o usuário administrador:

```bash
# Via SSH ou terminal da Hostinger
mysql -u seu_usuario -p
```

Na interface do MySQL:

```sql
USE douglascars;

INSERT INTO dealers (name, username, email, password, start_date, points, sales, is_admin)
VALUES ('Administrador', 'admin', 'admin@douglasautocar.com.br', 'senha_hash', CURDATE(), 0, 0, 1);

-- Substitua 'senha_hash' por uma senha criptografada em bcrypt
-- Você pode gerar esse hash em ferramentas online ou através do código Node.js
```

### 3. Configuração do Redirecionamento de Porta

A Hostinger geralmente usa um proxy para redirecionar o tráfego para a porta onde seu aplicativo Node.js está rodando. Certifique-se de que seu aplicativo esteja configurado para escutar na porta correta:

```javascript
// Em server/index.ts ou arquivo similar
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Parte 6: Configuração de Domínio e SSL

### 1. Configurar SSL/HTTPS

1. No painel da Hostinger, vá para "Websites" > Seu domínio > "SSL"
2. Clique em "Configurar" para Let's Encrypt SSL (geralmente gratuito)
3. Selecione "Certificado SSL Let's Encrypt"
4. Escolha o domínio principal e subdomínios que deseja incluir
5. Clique em "Instalar"

### 2. Configurar o Redirecionamento de WWW (Opcional)

1. No painel da Hostinger, vá para "Websites" > Seu domínio > "Redirecionamentos"
2. Adicione um redirecionamento para garantir que todas as requisições usem ou não o prefixo "www"
   - Sugestão: redirecione de `www.douglasautocar.com.br` para `douglasautocar.com.br` (ou vice-versa)

## Parte 7: Iniciar e Monitorar o Aplicativo

### 1. Iniciar o Aplicativo

Na seção Node.js do painel da Hostinger:

1. Clique em "Restart" ou "Start" para iniciar a aplicação Node.js
2. Verifique o status para confirmar que está rodando

### 2. Monitorar Logs

Se disponível no painel da Hostinger, verifique os logs da aplicação para identificar problemas:

1. Navegue até a seção "Logs" ou "Node.js"
2. Procure por registros de erro ou avisos
3. Se necessário, ajuste as configurações com base nos problemas identificados

## Parte 8: Testes e Verificação

### 1. Verificar a Aplicação

1. Acesse seu site pelo navegador: `https://douglasautocar.com.br`
2. Navegue pelas diferentes seções para garantir que tudo está funcionando
3. Teste o login de administrador
4. Verifique se os dados estão sendo carregados corretamente do banco de dados

### 2. Solução de Problemas Comuns

- **Erro 502 Bad Gateway**: Geralmente indica que o aplicativo Node.js não está em execução ou a porta está incorreta
- **Erro 404 Not Found**: Verifique se os arquivos foram carregados no diretório correto
- **Erros de banco de dados**: Verifique a string de conexão e as credenciais do banco de dados
- **Erros de JavaScript no cliente**: Verifique se todos os arquivos de build foram corretamente carregados

## Parte 9: Manutenção Contínua

### 1. Atualizações de Código

Para atualizar o aplicativo:

1. Faça as alterações necessárias no código localmente
2. Execute `npm run build` para gerar os arquivos de produção
3. Faça upload dos arquivos atualizados via FTP
4. Se necessário, reinicie o aplicativo Node.js no painel da Hostinger

### 2. Backups Regulares

1. No painel da Hostinger, configure backups regulares se disponível no seu plano
2. Exporte regularmente o banco de dados MySQL usando phpMyAdmin
3. Mantenha uma cópia local do código-fonte atualizado

### 3. Monitoramento de Desempenho

1. Configure ferramentas de monitoramento como Google Analytics, Hotjar ou similar
2. Monitore o tempo de resposta do servidor e a experiência do usuário
3. Ajuste recursos do servidor se necessário (upgrade de plano, otimizações de código)

## Recursos Adicionais

- [Centro de Ajuda da Hostinger](https://www.hostinger.com.br/tutoriais/)
- [Documentação Node.js](https://nodejs.org/en/docs/)
- [Guia de Otimização da MySQL](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

## Suporte Técnico

Para problemas específicos com a hospedagem:
- Suporte da Hostinger: [https://www.hostinger.com.br/contato](https://www.hostinger.com.br/contato)

Para problemas específicos com o Douglas Auto Car:
- Email: contato@douglasautocar.com.br
- WhatsApp: (28) 99933-9129

---

© 2025 Douglas Auto Car. Todos os direitos reservados.