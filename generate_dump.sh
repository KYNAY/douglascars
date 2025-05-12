#!/bin/bash

# Configurações de conexão
PGHOST="ep-mute-hill-a6ojm4nl.us-west-2.aws.neon.tech"
PGUSER="neondb_owner"
PGPASSWORD="npg_f5PigsNzKd7W"
PGDATABASE="neondb"

# Nome do arquivo de saída
OUTPUT_FILE="douglascars_complete_dump.sql"

# Obter apenas o esquema (sem dados)
echo "Exportando esquema..."
PGPASSWORD=$PGPASSWORD pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE --no-owner --no-acl --schema-only > $OUTPUT_FILE

# Adicionar dados usando INSERT statements
echo "Exportando dados com INSERT INTO..."
for table in brands vehicles reviews instagram_posts hero_slides vehicle_images dealers sales evaluation_requests financing_requests; do
  echo "Processando tabela: $table"
  PGPASSWORD=$PGPASSWORD pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE --no-owner --no-acl --inserts --data-only --table=$table >> $OUTPUT_FILE
done

# Compactar o arquivo
echo "Compactando arquivo..."
gzip -f $OUTPUT_FILE

echo "Dump completo criado como ${OUTPUT_FILE}.gz"
ls -la ${OUTPUT_FILE}.gz
