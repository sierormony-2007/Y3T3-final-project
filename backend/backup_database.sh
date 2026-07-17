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
$DB_NAME > backup.sql