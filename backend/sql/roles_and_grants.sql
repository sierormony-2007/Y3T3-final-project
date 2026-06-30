-- ================================================================
-- PART 5 — ROLES, GRANTS, USER ACCOUNTS, TRANSPORT SECURITY
-- ================================================================
-- Sequelize models/migrations only manage TABLES — they have no concept
-- of MySQL roles, user accounts, or GRANT statements. This stays a plain
-- SQL script for a DBA to run once against the server, kept verbatim
-- from the original script. Run it manually, e.g.:
--   mysql -u root -p EWASTE_db < sql/roles_and_grants.sql
--
-- ⚠️ The last two ALTER USER ... REQUIRE SSL lines will make those
-- accounts unable to connect unless the MySQL server has SSL configured
-- (ssl-ca/cert/key in my.cnf). Comment them out for local/dev use.
-- ================================================================

CREATE ROLE IF NOT EXISTS
    'app_admin',
    'app_manager',
    'app_collector',
    'app_readonly';

GRANT ALL PRIVILEGES ON EWASTE_db.* TO 'app_admin';

GRANT SELECT ON EWASTE_db.* TO 'app_manager';
GRANT INSERT, UPDATE ON EWASTE_db.pickup_requests     TO 'app_manager';
GRANT INSERT, UPDATE ON EWASTE_db.request_devices     TO 'app_manager';
GRANT INSERT, UPDATE ON EWASTE_db.reward_transactions TO 'app_manager';
GRANT INSERT, UPDATE ON EWASTE_db.notifications       TO 'app_manager';

GRANT SELECT ON EWASTE_db.staff             TO 'app_collector';
GRANT SELECT ON EWASTE_db.device_categories TO 'app_collector';
GRANT SELECT (user_id, full_name, phone, address, city) ON EWASTE_db.users TO 'app_collector';
GRANT SELECT, UPDATE (status, completed_at) ON EWASTE_db.pickup_requests TO 'app_collector';
GRANT SELECT, INSERT ON EWASTE_db.request_devices TO 'app_collector';

GRANT SELECT ON EWASTE_db.* TO 'app_readonly';

-- Replace these placeholder passwords before using anywhere outside local/dev.
CREATE USER IF NOT EXISTS 'ewaste_admin'@'%'     IDENTIFIED BY 'CHANGE_ME_admin_2026!';
CREATE USER IF NOT EXISTS 'ewaste_manager'@'%'   IDENTIFIED BY 'CHANGE_ME_manager_2026!';
CREATE USER IF NOT EXISTS 'ewaste_collector'@'%' IDENTIFIED BY 'CHANGE_ME_collector_2026!';
CREATE USER IF NOT EXISTS 'ewaste_report'@'%'    IDENTIFIED BY 'CHANGE_ME_report_2026!';

GRANT 'app_admin'     TO 'ewaste_admin'@'%';
GRANT 'app_manager'   TO 'ewaste_manager'@'%';
GRANT 'app_collector' TO 'ewaste_collector'@'%';
GRANT 'app_readonly'  TO 'ewaste_report'@'%';

SET DEFAULT ROLE ALL TO
    'ewaste_admin'@'%', 'ewaste_manager'@'%',
    'ewaste_collector'@'%', 'ewaste_report'@'%';

ALTER USER 'ewaste_report'@'%'    REQUIRE SSL;
ALTER USER 'ewaste_collector'@'%' REQUIRE SSL;

FLUSH PRIVILEGES;

-- Verify:
-- SHOW GRANTS FOR 'ewaste_collector'@'%';
-- SELECT user, host FROM mysql.user WHERE user LIKE 'ewaste_%';
