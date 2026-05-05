-- ==========================================
-- SCRIPT DE LIMPEZA (DROP)
-- Use este script para apagar todas as tabelas
-- e recomeçar do zero.
-- ==========================================

-- O uso de CASCADE garante que chaves estrangeiras e índices atrelados
-- também sejam destruídos sem gerar erros de dependência.

DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS grade_horarios CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS instancias_whatsapp CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- (Opcional) Se quiser apagar também os enums ou functions criadas posteriormente,
-- adicione os DROPs abaixo. Por ora, focado nas tabelas principais.
