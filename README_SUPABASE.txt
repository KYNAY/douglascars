# Instruções para Migração para o Supabase

## Arquivos Fornecidos:
- `supabase_douglascars_complete.sql.gz` - Script SQL completo com schema e dados para o Supabase

## Como Usar:

1. Descompacte o arquivo:
   ```
   gunzip supabase_douglascars_complete.sql.gz
   ```

2. Acesse o SQL Editor no Supabase:
   - Faça login no Supabase (https://app.supabase.com)
   - Selecione seu projeto
   - Clique na aba "SQL Editor" no menu lateral

3. Importe e execute o script:
   - Clique em "New Query"
   - Cole o conteúdo completo do arquivo descompactado
   - Clique em "Run" para executar

4. Verificação:
   - Após a execução, verifique no "Table Editor" se o schema "douglascars" foi criado
   - Confirme se todas as tabelas foram criadas com seus dados

## Configuração da Aplicação:

Depois de importar, configure a variável DATABASE_URL no seu ambiente:

```
DATABASE_URL=postgresql://postgres:[SEU_PASSWORD]@[HOST]:5432/postgres
```

Onde:
- [SEU_PASSWORD] é a senha do banco de dados criada no Supabase
- [HOST] é o host do seu projeto Supabase (disponível em Project Settings > Database)

## Schema e Tabelas incluídas:

O script criará um schema chamado "douglascars" com as seguintes tabelas:
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

## Observações Importantes:
- O script já configura o schema "douglascars" e todas as relações
- As sequências são atualizadas para os IDs corretos
- Use a referência completa às tabelas no código, incluindo o schema: "douglascars.nome_tabela"
