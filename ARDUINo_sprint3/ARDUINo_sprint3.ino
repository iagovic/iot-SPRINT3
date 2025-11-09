#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==== Pinos ====
const int LED_PIN = 27;
const int BUZZER_PIN = 15;
const int BUTTON_PIN = 26;

// ==== Wi-Fi ====
const char* ssid = "Redmi 13C";
const char* password = "iago804f";

// ==== MQTT ====
const char* mqtt_server = "10.242.172.91";  
const int mqtt_port = 1883;
const char* mqtt_user = "gs2025";
const char* mqtt_password = "q1w2e3r4";

// Tópicos MQTT
const char* topic_subscribe = "motos/1/acao";  
const char* topic_publish   = "motos/1/status";  

WiFiClient espClient;
PubSubClient client(espClient);

StaticJsonDocument<200> doc;
char buffer[200];

// Controle do botão
int lastButtonState = HIGH;

// ==== Conectar Wi-Fi ====
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando ao WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ==== Callback MQTT ====
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.print("📩 Mensagem recebida [");
  Serial.print(topic);
  Serial.print("] ");
  Serial.println(msg);

  DeserializationError error = deserializeJson(doc, msg);
  if (error) {
    Serial.print("❌ Erro no JSON: ");
    Serial.println(error.c_str());
    return;
  }

  bool localizar = doc["localizar"];
  Serial.print("Valor de localizar: ");
  Serial.println(localizar);

  if (localizar) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("🚨 ALERTA ATIVADO!");
  } else {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("✅ ALERTA DESATIVADO!");
  }
}

// ==== Reconectar ao Broker ====
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔄 Conectando ao broker MQTT...");
    if (client.connect("MotoESP32", mqtt_user, mqtt_password)) {
      Serial.println(" conectado!");
      client.subscribe(topic_subscribe);
    } else {
      Serial.print(" falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s...");
      delay(5000);
    }
  }
}

// ==== Setup ====
void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  Serial.println("Setup concluído!");
}

// ==== Loop Principal ====
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  int buttonState = digitalRead(BUTTON_PIN);

  // Detecta apenas a transição (HIGH -> LOW)
  if (buttonState == LOW && lastButtonState == HIGH) {
    doc.clear();
    doc["id"] = 1;
    doc["localizar"] = false;

    Serial.println("📤 Publicando status: Moto ENCONTRADA");

    serializeJson(doc, buffer);
    client.publish(topic_publish, buffer);

    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
  }

  lastButtonState = buttonState;

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Wi-Fi desconectado. Tentando reconectar...");
    setup_wifi();
  }
}

