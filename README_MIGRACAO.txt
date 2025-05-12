# Instruções para Migração do Banco de Dados

## Arquivos Fornecidos:
- `douglascars_inserts.sql.gz` - Dump completo do banco PostgreSQL com comandos INSERT INTO

## Como Usar:

### Para PostgreSQL (PgWeb ou psql):

1. Descompacte o arquivo:
   ```
   gunzip douglascars_inserts.sql.gz
   ```

2. Importe usando psql:
   ```
   psql -U seu_usuario -d nome_do_banco < douglascars_inserts.sql
   ```

3. Ou via PgWeb:
   - Acesse o PgWeb
   - Selecione seu banco de dados
   - Vá para a aba SQL ou Query
   - Cole o conteúdo do arquivo descompactado
   - Execute

### Configuração da Aplicação:

Depois de importar, configure a variável DATABASE_URL no seu ambiente:

```
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/nome_do_banco
```

## Tabelas Incluídas:
- brands - Marcas de veículos
- vehicles - Veículos do estoque
- reviews - Avaliações de clientes
- instagram_posts - Posts do Instagram
- hero_slides - Slides do carrossel principal
- vehicle_images - Imagens adicionais de veículos
- evaluation_requests - Solicitações de avaliação
- financing_requests - Solicitações de financiamento
- dealers - Vendedores
- sales - Vendas

## Observações:
- Este dump foi formatado especificamente com comandos INSERT INTO em vez de COPY para melhor compatibilidade.
- Os dados são da base original do Neon PostgreSQL.
