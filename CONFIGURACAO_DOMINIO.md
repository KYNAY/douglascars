# Guia de Configuração de Domínio para o Douglas Auto Car

Este guia detalhado explica como registrar, configurar e apontar um domínio para o seu projeto Douglas Auto Car, independentemente da plataforma de hospedagem utilizada.

## Índice

1. [Registrando um Novo Domínio](#1-registrando-um-novo-domínio)
2. [Apontando um Domínio Existente](#2-apontando-um-domínio-existente)
3. [Configuração DNS por Plataforma de Hospedagem](#3-configuração-dns-por-plataforma-de-hospedagem)
   - [Hostinger (Recomendado)](#hostinger-recomendado)
   - [Easypanel](#easypanel)
   - [Dokku](#dokku)
   - [Vercel](#vercel)
   - [Netlify](#netlify)
4. [Configuração de SSL/HTTPS](#4-configuração-de-sslhttps)
5. [Testes e Verificação](#5-testes-e-verificação)
6. [Configurações Adicionais](#6-configurações-adicionais)
7. [Solução de Problemas Comuns](#7-solução-de-problemas-comuns)

## 1. Registrando um Novo Domínio

### Escolha de um Registrador

Você pode registrar um domínio em vários registradores. Recomendamos:
- [Registro.br](https://registro.br/) - Para domínios .br (brasileiro)
- [Hostinger](https://www.hostinger.com.br/registrar-dominio) - Conveniente se você usar a hospedagem deles
- [Namecheap](https://www.namecheap.com/)
- [GoDaddy](https://br.godaddy.com/)

### Processo de Registro

1. **Verificação de disponibilidade**:
   - Acesse o site do registrador escolhido
   - Digite o nome de domínio desejado (exemplo: douglasautocar.com.br)
   - Verifique se está disponível

2. **Escolha do TLD (Top Level Domain)**:
   - Para negócios brasileiros, recomendamos `.com.br` ou `.com`
   - Outras opções: `.net`, `.auto`, `.cars`

3. **Período de registro**:
   - Escolha por quanto tempo deseja registrar (geralmente 1-10 anos)
   - Geralmente há desconto para períodos mais longos

4. **Informações de contato e pagamento**:
   - Preencha suas informações pessoais ou da empresa
   - Para domínios `.br`, tenha em mãos os documentos (CNPJ da empresa ou CPF)
   - Efetue o pagamento (cartão de crédito, boleto, PIX, etc.)

### Após o Registro

O processo de ativação do domínio pode levar de alguns minutos a 48 horas, dependendo do TLD e do registrador. Para domínios `.br`, a validação de documentos pode levar mais tempo.

## 2. Apontando um Domínio Existente

Se você já possui um domínio e deseja apontá-lo para o projeto Douglas Auto Car, precisará:

1. **Acessar o painel de controle do registrador atual**:
   - Faça login no painel onde o domínio está registrado
   - Procure a seção "DNS", "Gerenciador de DNS" ou "Nameservers"

2. **Opções de configuração**:
   - **Método 1 - Alterar os nameservers**: Direciona todo o controle de DNS para sua plataforma de hospedagem
   - **Método 2 - Configurar registros DNS**: Mantém o controle no registrador atual, mas aponta para sua hospedagem

### Método 1: Alterando Nameservers

Este método é recomendado quando você usa a mesma empresa para hospedagem e domínio (ex: Hostinger).

1. Obtenha os nameservers da sua hospedagem (geralmente fornecidos ao contratar o plano)
2. No painel do registrador, procure por "Nameservers" ou "DNS"
3. Substitua os nameservers atuais pelos da sua hospedagem
4. Exemplos de nameservers comuns:
   - Hostinger: `ns1.hostinger.com`, `ns2.hostinger.com`, `ns3.hostinger.com`, `ns4.hostinger.com`
   - DigitalOcean: `ns1.digitalocean.com`, `ns2.digitalocean.com`, `ns3.digitalocean.com`

### Método 2: Configurando Registros DNS

Este método oferece mais controle e é recomendado quando você usa plataformas diferentes para domínio e hospedagem.

## 3. Configuração DNS por Plataforma de Hospedagem

### Hostinger (Recomendado)

#### Se registrou o domínio na Hostinger:

1. Faça login no painel da Hostinger
2. Vá para "Domínios" > "Meus Domínios"
3. Selecione seu domínio
4. Clique em "Gerenciar"
5. Vá para "DNS / Nameservers"
6. Verifique se os nameservers estão configurados para os da Hostinger (já deve estar por padrão)
7. Vá para "Websites" > "Hospedar Website"
8. Escolha o domínio para hospedar seu site
9. Pronto! A Hostinger configura automaticamente os registros necessários

#### Se o domínio está em outro registrador:

**Opção A - Mudar os nameservers para a Hostinger**:
1. No painel do registrador, altere os nameservers para os da Hostinger:
   - `ns1.hostinger.com`
   - `ns2.hostinger.com`
   - `ns3.hostinger.com`
   - `ns4.hostinger.com`
2. Aguarde a propagação (pode levar até 48 horas)
3. Siga os passos 7-9 acima

**Opção B - Manter os nameservers atuais e configurar os registros DNS**:
1. No painel da Hostinger, obtenha o endereço IP do seu servidor
2. No painel do seu registrador, crie os seguintes registros:
   - Registro **A**: `@` (ou deixe vazio) apontando para o IP do servidor
   - Registro **A**: `www` apontando para o mesmo IP
   - Registro **CNAME**: `www` apontando para `@` (opcional, alternativa ao registro A para www)

### Easypanel

Se você está hospedando com Easypanel em um servidor próprio:

1. Obtenha o endereço IP público do seu servidor Easypanel
2. No painel do seu registrador de domínio, configure os seguintes registros DNS:
   - Registro **A**: `@` apontando para o IP do seu servidor
   - Registro **A**: `www` apontando para o mesmo IP
   - Registros adicionais (opcionais):
     - Registro **MX** para configurar email (se necessário)
     - Registro **TXT** para verificações de domínio (SPF, DKIM)

3. Dentro do painel Easypanel:
   - Acesse "Projects" > Selecione seu projeto
   - Vá para "Domains"
   - Adicione seu domínio: `douglasautocar.com.br`
   - Adicione também o subdomínio www: `www.douglasautocar.com.br`
   - Habilite HTTPS para ambos

### Dokku

Se você está hospedando com Dokku em seu próprio servidor:

1. Obtenha o endereço IP público do seu servidor Dokku
2. Configure os registros DNS no seu registrador:
   - Registro **A**: `@` apontando para o IP do seu servidor
   - Registro **A** ou **CNAME**: `www` apontando respectivamente para o IP ou domínio principal
   
3. Configure o domínio no Dokku (via SSH):
```bash
dokku domains:add douglascars douglasautocar.com.br
dokku domains:add douglascars www.douglasautocar.com.br
```

4. Configure SSL (Let's Encrypt):
```bash
dokku letsencrypt:enable douglascars
```

### Vercel

Se você está hospedando na Vercel:

1. No painel da Vercel, vá para seu projeto
2. Selecione "Settings" > "Domains"
3. Adicione seu domínio: `douglasautocar.com.br`
4. A Vercel fornecerá instruções personalizadas para configurar o DNS

5. Geralmente, você precisa adicionar:
   - Um registro **A** para o domínio raiz
   - Um registro **CNAME** para o subdomínio www
   
6. A Vercel cuidará automaticamente da configuração SSL/HTTPS

### Netlify

Se você está hospedando na Netlify:

1. No painel da Netlify, vá para seu site
2. Selecione "Settings" > "Domain management" > "Add custom domain"
3. Digite seu domínio: `douglasautocar.com.br`
4. A Netlify fornecerá instruções específicas para configurar o DNS

5. Em geral, você precisará configurar:
   - Um registro **A** para o domínio raiz, apontando para os IPs da Netlify
   - Um registro **CNAME** para `www`, apontando para seu site na Netlify

6. A Netlify também oferece serviço de DNS próprio, que pode simplificar a configuração

## 4. Configuração de SSL/HTTPS

É essencial configurar SSL/HTTPS para seu site para garantir conexões seguras.

### Hostinger

1. No painel da Hostinger, selecione seu domínio
2. Vá para "Segurança" > "SSL"
3. Clique em "Instalar" para Let's Encrypt SSL (gratuito)
4. Selecione as opções e complete a instalação

### Easypanel

1. No painel do Easypanel, acesse seu projeto
2. Vá para "Domains"
3. Para cada domínio, ative a opção "Enable HTTPS"
4. O Easypanel utilizará Let's Encrypt automaticamente

### Dokku

Usando o plugin Let's Encrypt para Dokku:
```bash
dokku letsencrypt:enable douglascars
```

### Vercel e Netlify

Ambas as plataformas configuram SSL automaticamente quando você adiciona um domínio personalizado.

## 5. Testes e Verificação

Após configurar seu domínio, é importante verificar se tudo está funcionando corretamente:

1. **Verificação de DNS**: Use ferramentas como [dnschecker.org](https://dnschecker.org/) ou [whatsmydns.net](https://www.whatsmydns.net/) para verificar se os registros DNS foram propagados
2. **Teste de acesso**:
   - Acesse o domínio principal: `https://douglasautocar.com.br`
   - Teste o redirecionamento www: `https://www.douglasautocar.com.br`
   - Verifique se o certificado SSL está funcionando (cadeado verde no navegador)
3. **Teste de funcionalidades**: Navegue pelo site e teste todas as funcionalidades principais para garantir que não há problemas

## 6. Configurações Adicionais

### Redirecionamento WWW para Não-WWW (ou vice-versa)

É uma boa prática escolher uma versão principal do seu site (com ou sem www) e redirecionar a outra para ela:

#### Na Hostinger:
1. Vá para "Websites" > Seu domínio > "Redirecionamentos"
2. Adicione um redirecionamento de `www.douglasautocar.com.br` para `douglasautocar.com.br` (ou vice-versa)

#### No Dokku:
```bash
# Para redirecionar www para não-www:
dokku domains:add-global www.douglasautocar.com.br
dokku domains:set-global-vhost-domain douglasautocar.com.br
```

#### Nas outras plataformas:
- Vercel e Netlify têm opções para configurar redirecionamentos em seus painéis
- Easypanel pode requerer configuração manual de proxy

### Email Corporativo

Recomendamos configurar email corporativo para seu domínio:

1. **Na Hostinger**: Vá para "Email" > "Criar email profissional"
2. **Usando Google Workspace**: [Adicione seu domínio ao Google Workspace](https://workspace.google.com/)
3. **Usando Microsoft 365**: [Configure seu domínio com Microsoft 365](https://www.microsoft.com/microsoft-365/business)

### Monitoramento e Análise

Configure ferramentas para monitorar o desempenho do seu site:
1. [Google Analytics](https://analytics.google.com/) - Para análise de tráfego
2. [Google Search Console](https://search.google.com/search-console) - Para monitorar a indexação no Google
3. [UptimeRobot](https://uptimerobot.com/) - Para monitorar o tempo de atividade do site

## 7. Solução de Problemas Comuns

### O domínio não está apontando para o site

**Possíveis causas e soluções**:
- **Propagação de DNS**: Aguarde até 48 horas para a propagação completa
- **Registros incorretos**: Verifique se os registros DNS estão configurados corretamente
- **Configuração de servidor**: Verifique se o servidor está configurado para responder ao domínio

Para verificar a propagação de DNS:
```bash
dig douglasautocar.com.br A +short
dig www.douglasautocar.com.br A +short
```

### Certificado SSL não está funcionando

**Possíveis causas e soluções**:
- **Conflito de SSL**: Certifique-se de que você não tenha múltiplos certificados
- **Problemas de validação**: Verifique se a validação de domínio foi concluída
- **Configuração de servidor**: Verifique se o servidor está configurado para HTTPS

### Redirecionamentos não funcionam

**Possíveis causas e soluções**:
- **Configuração incorreta**: Verifique as regras de redirecionamento
- **Cache do navegador**: Teste em um navegador em modo anônimo ou limpe o cache
- **Configuração de servidor**: Verifique se o servidor está configurado corretamente

## Recursos Adicionais

- [Documentação DNS da Hostinger](https://www.hostinger.com.br/tutoriais/o-que-e-dns)
- [Guia Let's Encrypt](https://letsencrypt.org/getting-started/)
- [Melhores práticas de DNS](https://www.cloudflare.com/learning/dns/dns-best-practices/)
- [Ferramentas de verificação DNS](https://www.dnsinspect.com/)

---

© 2025 Douglas Auto Car. Todos os direitos reservados.