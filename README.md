# 🚀 Entrega IoT

Este repositório contém todos os códigos utilizados no projeto IoT, incluindo **Python (Flask)**, **Frontend (React)** e **Banco de Dados (Oracle)**e **ARDUINO (arduino.ide)**

---

## 📂 Estrutura do Projeto
- **Flask (Backend)** → responsável por criar as rotas, conectar ao **Mosquitto (MQTT)** e ao **Banco de Dados**.  
- **Mosquitto** → usado como broker MQTT para comunicação em tempo real.  
- **Banco de Dados (Oracle)** → armazena os dados das motos monitoradas.  
- **Frontend (React)** → interface para visualizar e interagir com os dados.  

---

## ⚙️ Passo a Passo de Execução

1. **Configurar Mosquitto**
   - Alterar a pasta `.conf` para permitir execução online.  
   - Atualizar o IP no código para o endereço correto.  
   - Ligar o serviço do **Mosquitto**.

2. **Banco de Dados**
   - Executar o script SQL para criar as tabelas.  
   - Garantir que o banco esteja rodando corretamente.

3. **Backend (Flask)**
   - Rodar o arquivo:
     ```bash
     python app.py
     ```

4. **Frontend (React)**
   - Rodar o projeto:
     ```bash
     npm install
     npm run dev
     ```
   - Acesse no navegador: [http://localhost:5173](http://localhost:5173)

---

## ✅ Funcionamento
Após todos os serviços estarem ativos:
- O backend Flask conecta ao **Mosquitto** e ao **Banco de Dados**.  
- O frontend consome as rotas do Flask e exibe os dados em tempo real.  

---

## 👨‍💻 Tecnologias Utilizadas
- Python + Flask  
- Mosquitto (MQTT)  
- Oracle Database  
- React + TypeScript  
