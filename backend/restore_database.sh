#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./restore_database.sh backup.sql"
    exit 1
fi

mysql \
-h mysql-3a75dad5-kamab3301-4a82.h.aivencloud.com \
-P 10451 \
-u avnadmin \
-p \
EWASTE_db < "$1"

echo "Database restored successfully!"