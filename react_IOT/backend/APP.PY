from flask import Flask, jsonify, Response

import paho.mqtt.client as mqtt

import oracledb

import json

from flask_cors import CORS

import queue

import threading
 
app = Flask(__name__)


CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
  # 🔥 habilita CORS para todas as rotas
 
# === Config MQTT ===

MQTT_BROKER = "127.0.0.1"

MQTT_PORT = 1883

MQTT_USER = "gs2025"

MQTT_PASS = "q1w2e3r4"

MQTT_TOPIC_STATUS = "motos/+/status"  # + pega todas as motos
 
client = mqtt.Client()

client.username_pw_set(MQTT_USER, MQTT_PASS)

client.connect(MQTT_BROKER, MQTT_PORT, 60)
 
# === Conexão Oracle (usando pool) ===

dsn = oracledb.makedsn("oracle.fiap.com.br", 1521, service_name="orcl")

pool = oracledb.create_pool(

    user="rm558450",

    password="301205",

    dsn=dsn,

    min=1,

    max=5,

    increment=1

)
 
# === Fila para mensagens em tempo real ===

message_queue = queue.Queue()
 
# === Callback MQTT ===

def on_message(client, userdata, msg):

    payload = msg.payload.decode()

    print(f"📥 Mensagem recebida em {msg.topic}: {payload}")
 
    try:

        data = json.loads(payload)

        moto_id = data.get("id")

        localizar = data.get("localizar")
 
        if moto_id is None:

            return  # ignora mensagens inválidas
 
        if localizar is False:

            novo_status = "ENCONTRADA"

            incremento = ", contador = NVL(contador,0) + 1"

        else:

            novo_status = "ALERTA"

            incremento = ""
 
        with pool.acquire() as conn:

            with conn.cursor() as cur:

                cur.execute(f"""

                    UPDATE motos_IOT

                    SET status = :status {incremento}

                    WHERE id = :id

                """, {"status": novo_status, "id": moto_id})

            conn.commit()
 
        print(f"✅ Moto {moto_id} atualizada para {novo_status}")
 
        # 🔥 envia para o front em tempo real também

        message_queue.put({"id": moto_id, "status": novo_status})
 
    except Exception as e:

        print("Erro ao processar JSON:", e)
 
client.on_message = on_message

client.subscribe(MQTT_TOPIC_STATUS)
 
# Rodar MQTT em thread separada

mqtt_thread = threading.Thread(target=client.loop_forever)

mqtt_thread.daemon = True

mqtt_thread.start()
 
# === ENDPOINTS ===

@app.route("/api/motos")

def api_motos():

    with pool.acquire() as conn:

        with conn.cursor() as cur:

            cur.execute("SELECT id, nome, status, contador, posicao FROM motos_IOT ORDER BY id")


            colunas = [c[0].lower() for c in cur.description]

            dados = [dict(zip(colunas, linha)) for linha in cur.fetchall()]

    return jsonify(dados)
 
@app.route("/ativar_alerta/<int:moto_id>", methods=["POST"])

def ativar_alerta(moto_id):

    msg = {"id": moto_id, "localizar": True}

    client.publish(f"motos/{moto_id}/acao", json.dumps(msg))
 
    with pool.acquire() as conn:

        with conn.cursor() as cur:

            cur.execute("UPDATE motos_IOT SET status = 'ALERTA' WHERE id = :id", {"id": moto_id})

        conn.commit()
 
    # 🔥 envia evento também

    message_queue.put({"id": moto_id, "status": "ALERTA"})
 
    print(f"🚨 Alerta ativado para a moto {moto_id}")

    return jsonify({"status": "success", "moto_id": moto_id, "message": "Alerta ativado"})
 
@app.route("/desativar_alerta/<int:moto_id>", methods=["POST"])

def desativar_alerta(moto_id):

    msg = {"id": moto_id, "localizar": False}

    client.publish(f"motos/{moto_id}/acao", json.dumps(msg))
 
    with pool.acquire() as conn:

        with conn.cursor() as cur:

            cur.execute("UPDATE motos_IOT SET status = 'NORMAL' WHERE id = :id", {"id": moto_id})

        conn.commit()
 
    # 🔥 envia evento também

    message_queue.put({"id": moto_id, "status": "NORMAL"})
 
    print(f"✅ Alerta desativado para a moto {moto_id}")

    return jsonify({"status": "success", "moto_id": moto_id, "message": "Alerta desativado"})
 
# === Stream SSE (real-time) ===

@app.route("/stream")

def stream():

    def event_stream():

        while True:

            data = message_queue.get()

            yield f"data: {json.dumps(data)}\n\n"

    return Response(event_stream(), mimetype="text/event-stream")
 
if __name__ == "__main__":

    app.run(debug=True, threaded=True)

 