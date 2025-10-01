CREATE TABLE motos_IOT (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(100),
    status VARCHAR2(20),
    contador NUMBER
);
 
-- Excluir a tabela (se já existir)
DROP TABLE motos_IOT;
 
-- Inserindo dados
INSERT INTO motos_IOT (nome, status, contador) VALUES ('Moto A', 'parada', 0);
INSERT INTO motos_IOT (nome, status, contador) VALUES ('Moto B', 'parada', 2);
INSERT INTO motos_IOT (nome, status, contador) VALUES ('Moto C', 'parada', 5);
INSERT INTO motos_IOT (nome, status, contador) VALUES ('Moto D', 'parada', 1);
 
-- Confirmar as alterações
COMMIT;
select *FROM motos_iot;