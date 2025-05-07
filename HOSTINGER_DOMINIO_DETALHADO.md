# Guia Detalhado: Configuração de Domínio na Hostinger para o Douglas Auto Car

Este guia passo a passo fornece instruções específicas para configurar seu domínio na Hostinger e conectá-lo ao seu site Douglas Auto Car.

## Registrando um Novo Domínio na Hostinger

### Passo 1: Registrar o Domínio

1. Acesse [Hostinger](https://www.hostinger.com.br/) e faça login na sua conta
2. Clique em "Domínios" > "Registrar um Novo Domínio"
3. Na barra de pesquisa, digite "douglasautocar" (ou seu nome de domínio preferido)
4. Selecione a extensão desejada (.com.br, .com, etc.) - recomendamos .com.br para negócios brasileiros
5. Adicione o domínio ao carrinho e siga para o checkout
6. Complete a compra

### Passo 2: Verificação e Ativação

Para domínios .br:
1. Após a compra, você receberá um e-mail do Registro.br solicitando validação
2. Siga as instruções e forneça os documentos necessários (CNPJ ou CPF)
3. Aguarde a aprovação (geralmente 1-2 dias úteis)

Para outros domínios (.com, .net, etc.):
1. A ativação geralmente é automática após a compra
2. Você receberá um e-mail de confirmação quando estiver pronto

## Conectando um Domínio Existente à Hostinger

### Passo 1: Transferir o Domínio (Opcional)

Se quiser transferir completamente o domínio para a Hostinger:

1. No painel da Hostinger, vá para "Domínios" > "Transferir Domínios"
2. Insira seu domínio e siga as instruções
3. Você precisará de um código de autorização (auth code/EPP) do registrador atual
4. Complete o processo de transferência

### Passo 2: Manter o Domínio no Registrador Atual e Apontar para a Hostinger

Se preferir manter o domínio no registrador atual:

1. Obtenha os nameservers da Hostinger:
   - Faça login no painel da Hostinger
   - Vá para "Hosting" > Selecione seu plano
   - Acesse "Detalhes"
   - Anote os nameservers (normalmente são):
     * ns1.hostinger.com
     * ns2.hostinger.com
     * ns3.hostinger.com
     * ns4.hostinger.com

2. No painel do seu registrador atual:
   - Procure por "Nameservers", "DNS" ou "Gerenciador de DNS"
   - Atualize os nameservers para os da Hostinger
   - Salve as alterações

### Passo 3: Verificar Propagação de DNS

A propagação pode levar até 48 horas, mas geralmente é mais rápida.

Para verificar a propagação:
1. Acesse [whatsmydns.net](https://www.whatsmydns.net/)
2. Digite seu domínio e selecione "NS" (Nameserver)
3. Verifique se os nameservers da Hostinger aparecem nos resultados

## Conectando o Domínio ao Projeto Douglas Auto Car na Hostinger

### Passo 1: Configurar Hospedagem

1. No painel da Hostinger, vá para "Hosting" > Selecione seu plano
2. Clique em "Gerenciar"
3. Vá para "Websites" > "Novo Website"
4. Em "Escolha um domínio", selecione o domínio que você registrou ou conectou
5. Selecione "Usar arquivo existente" ou "Importar website"
6. Clique em "Adicionar Website"

### Passo 2: Configurar o Banco de Dados MySQL

1. Acesse o hPanel da Hostinger
2. Navegue até "Banco de Dados" > "MySQL"
3. Clique em "Criar Novo Banco de Dados"
4. Preencha os detalhes:
   - Nome do banco de dados: `douglascars`
   - Nome de usuário: Escolha um nome (ex: `douglascars_user`)
   - Senha: Gere uma senha forte
   - Host: Selecione "Localhost" para aplicações no mesmo servidor
5. Anote estas informações para uso no arquivo de configuração do projeto

### Passo 3: Subir o Projeto via FTP

1. No painel da Hostinger, vá para "Files" > "File Manager" ou "FTP"
2. Obtenha as credenciais FTP:
   - Host: geralmente `ftp.douglasautocar.com.br` ou o endereço fornecido pela Hostinger
   - Usuário: geralmente o mesmo da sua conta Hostinger
   - Senha: a senha da sua conta Hostinger
   - Porta: 21 (padrão)

3. Usando um cliente FTP (FileZilla, WinSCP, etc.):
   - Conecte-se ao servidor com as credenciais
   - Navegue até a pasta raiz (geralmente `/public_html/`)
   - Faça upload de todos os arquivos do projeto (build de produção)

### Passo 4: Configurar Node.js

A Hostinger oferece suporte a Node.js em seus planos de hospedagem premium:

1. No painel da Hostinger, vá para "Sites" > Selecione seu site
2. Clique em "Avançado" > "Node.js"
3. Ative o Node.js e configure:
   - Versão do Node.js: Selecione a versão 20.x (ou a mais recente disponível)
   - Diretório raiz: `/`
   - Arquivo de inicialização: `server/index.ts` (ou o arquivo principal do seu projeto)
   - Ponto de entrada da aplicação: Este é o comando para iniciar, use `npm run start`
   - Porta: 5000 (ou a porta que você configurou no projeto)

4. Configure as variáveis de ambiente:
   - `DATABASE_URL=mysql://douglascars_user:senha@localhost/douglascars`
   - `NODE_ENV=production`
   - `PORT=5000`
   - `VITE_FIREBASE_API_KEY=seu_valor`
   - `VITE_FIREBASE_PROJECT_ID=seu_valor`
   - `VITE_FIREBASE_APP_ID=seu_valor`
   - Adicione outras variáveis necessárias

5. Clique em "Salvar"

### Passo 5: Configuração do SSL/HTTPS

1. No painel da Hostinger, selecione seu domínio
2. Vá para "Segurança" > "SSL"
3. Clique em "Configurar" para instalar o certificado Let's Encrypt gratuito
4. Selecione "Certificado SSL Let's Encrypt"
5. Marque as opções para domínio e www (se aplicável)
6. Clique em "Instalar"

## Configurações Avançadas

### Configurando Redirecionamento WWW para Não-WWW (ou vice-versa)

1. No painel da Hostinger, vá para "Hosting" > Selecione seu site
2. Navegue até "Domínios" > "Redirecionamentos"
3. Adicione um novo redirecionamento:
   - Tipo: 301 (permanente)
   - Para redirecionar www para não-www:
     * De: `www.douglasautocar.com.br`
     * Para: `douglasautocar.com.br`
   - Ou para redirecionar não-www para www:
     * De: `douglasautocar.com.br`
     * Para: `www.douglasautocar.com.br`
4. Clique em "Adicionar Redirecionamento"

### Configurando Email Profissional

A Hostinger oferece planos de email empresarial:

1. No painel da Hostinger, vá para "Email" > "Email Profissional"
2. Selecione um plano adequado às suas necessidades
3. Durante a configuração, associe o email ao seu domínio
4. Crie contas de email como `contato@douglasautocar.com.br`, `vendas@douglasautocar.com.br`, etc.

## Verificação e Testes

### Teste do Site

1. Acesse seu site no navegador: `https://douglasautocar.com.br`
2. Teste a navegação e funcionalidades principais
3. Verifique se o SSL está funcionando (cadeado verde no navegador)

### Verificação do Banco de Dados

1. No painel da Hostinger, vá para "Banco de Dados" > "phpMyAdmin"
2. Faça login com as credenciais do banco de dados
3. Verifique se o banco de dados `douglascars` está presente e as tabelas estão criadas

### Teste de Performance

1. Use ferramentas como [Google PageSpeed Insights](https://pagespeed.web.dev/) ou [GTmetrix](https://gtmetrix.com/) para avaliar a performance do site
2. Verifique o tempo de resposta do servidor nas ferramentas de desenvolvimento do navegador
3. Monitore o uso de recursos no painel da Hostinger

## Solução de Problemas Específicos da Hostinger

### Problema: Site não está acessível

**Soluções**:
1. Verifique se o domínio está apontando corretamente:
   - No painel da Hostinger, confirme se o domínio está associado ao plano de hospedagem
   - Verifique a propagação DNS através de [dnschecker.org](https://dnschecker.org/)

2. Verifique se o Node.js está configurado corretamente:
   - Confirme que a aplicação Node.js está ativa no painel
   - Verifique os logs de erro no painel da Hostinger

### Problema: Erros 500 ou 502

**Soluções**:
1. Verifique os logs de erro:
   - No painel da Hostinger, vá para "Hosting" > "Logs de Erros"
   - Identifique o problema específico nos logs

2. Verifique a configuração do Node.js:
   - Confirme que a porta e arquivo de inicialização estão corretos
   - Verifique se as variáveis de ambiente estão configuradas corretamente

### Problema: Certificado SSL não funciona

**Soluções**:
1. Reinstale o certificado:
   - No painel da Hostinger, vá para "SSL"
   - Remova o certificado existente e instale novamente

2. Verifique redirecionamentos conflitantes:
   - Certifique-se de que não há redirecionamentos que interferem com HTTPS
   - Verifique se todas as URLs no código usam HTTPS

## Recursos Adicionais da Hostinger

- [Centro de Ajuda da Hostinger](https://www.hostinger.com.br/tutoriais)
- [Guia de Node.js na Hostinger](https://www.hostinger.com.br/tutoriais/como-instalar-node-js)
- [Suporte da Hostinger](https://www.hostinger.com.br/contato)

## Lista de Verificação Final

- [  ] Domínio registrado e ativo
- [  ] Nameservers configurados corretamente
- [  ] Hospedagem associada ao domínio
- [  ] Banco de dados MySQL criado e configurado
- [  ] Projeto Douglas Auto Car carregado via FTP
- [  ] Node.js configurado no painel da Hostinger
- [  ] Variáveis de ambiente definidas
- [  ] Certificado SSL instalado e funcionando
- [  ] Redirecionamentos configurados (www vs não-www)
- [  ] Site testado e funcionando em todos os navegadores
- [  ] Email profissional configurado (opcional)

---

© 2025 Douglas Auto Car. Todos os direitos reservados.