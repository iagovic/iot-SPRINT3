CREATE TABLE motos_IOT (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(100),
    status VARCHAR2(20),
    contador NUMBER,
    posicao NUMBER
);
 
-- Excluir a tabela (se já existir)
DROP TABLE motos_IOT;
 
-- Inserindo dados
INSERT INTO motos_IOT (nome, status, contador, posicao) VALUES ('Moto A', 'parada', 0, 1);
INSERT INTO motos_IOT (nome, status, contador, posicao) VALUES ('Moto B', 'parada', 2, 4 );
INSERT INTO motos_IOT (nome, status, contador, posicao) VALUES ('Moto C', 'parada', 5, 3);
INSERT INTO motos_IOT (nome, status, contador, posicao) VALUES ('Moto D', 'parada', 1, 2);
 
-- Confirmar as alterações
COMMIT;
select *FROM motos_iot;
