#!/bin/bash

source .env

mkdir -p backups

mysqldump \
-h $DB_HOST \
-P $DB_PORT \
-u $DB_USER \
-p$DB_PASSWORD \
--single-transaction \
--routines \
--triggers \
--events \
--set-gtid-purged=OFF \
$DB_NAME > backups/EWASTE_db_$(date +%Y%m%d_%H%M%S).sql