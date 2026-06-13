#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ================= WIFI =================
const char* ssid = "00000";
const char* password = "00000000";

// ================= BACKEND =================
const char* backendUrl = "http://192.168.7.32:8080/api/attendance/device/event";
const char* commandUrl = "http://192.168.7.32:8080/api/attendance/device/door-command";

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= FINGERPRINT =================
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// ================= RELAY =================
#define RELAY_PIN 12

// ================= BUTTON =================
#define BUTTON_PIN 27

int id;

// ================= DOOR POLLING =================
unsigned long lastDoorCheck = 0;
const unsigned long doorCheckInterval = 5000; // 2 seconds

// ================= SETUP =================
void setup() {

  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  if (!finger.verifyPassword()) {
    lcd.print("Sensor Error");
    while (1);
  }

  WiFi.begin(ssid, password);

  lcd.clear();
  lcd.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  lcd.clear();
  lcd.print("WiFi Connected");

  Serial.println(WiFi.localIP());

  showReady();
}

// ================= LOOP =================
void loop() {

  // Check backend every 2 seconds
  if (millis() - lastDoorCheck >= doorCheckInterval) {

    lastDoorCheck = millis();

    checkDoorCommand();
  }
  scanFingerprint();
  checkButtonUnlock();
}

// ================= CHECK BACKEND COMMAND =================
void checkDoorCommand() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return;
  }

  HTTPClient http;

  Serial.println("\n========================");
  Serial.println("Checking Door Command...");
  Serial.println(commandUrl);

  http.begin(commandUrl);

  int code = http.GET();

  Serial.print("HTTP Code: ");
  Serial.println(code);

  if (code > 0) {

    String payload = http.getString();

    Serial.println("Response Payload:");
    Serial.println(payload);

    if (code == 200) {

      StaticJsonDocument<256> doc;

      DeserializationError error =
          deserializeJson(doc, payload);

      if (error) {

        Serial.print("JSON Parse Error: ");
        Serial.println(error.c_str());

        http.end();
        return;
      }

      bool unlock = doc["unlock"];
      String message = doc["message"];

      Serial.print("Unlock: ");
      Serial.println(unlock);

      Serial.print("Message: ");
      Serial.println(message);

      if (unlock) {

        lcd.clear();
        lcd.print("Access Granted");

        lcd.setCursor(0, 1);
        lcd.print(trimMessage(message));

        sendEvent("GRANTED", "Remote unlock");

        unlockDoor();
      }
    }

  } else {

    Serial.print("GET Failed: ");
    Serial.println(http.errorToString(code));
  }

  http.end();
}

// ================= SEND EVENT TO BACKEND =================
void sendEvent(String status, String message) {

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(backendUrl);

  http.addHeader("Content-Type", "application/json");

  String json =
    "{\"device\":\"ESP32\","
    "\"status\":\"" + status + "\","
    "\"message\":\"" + message + "\"}";

  http.POST(json);

  http.end();
}

// ================= FINGERPRINT =================
void scanFingerprint() {

  if (finger.getImage() != FINGERPRINT_OK) return;
  if (finger.image2Tz() != FINGERPRINT_OK) return;

  if (finger.fingerFastSearch() != FINGERPRINT_OK) {

    lcd.clear();
    lcd.print("Not Stored");

    sendEvent("DENIED", "Fingerprint not found");

    delay(1500);
    showReady();
    return;
  }

  lcd.clear();
  lcd.print("Access Granted");

  sendEvent("GRANTED", "Fingerprint match");

  unlockDoor();
}

// ================= BUTTON =================
void checkButtonUnlock() {

  if (digitalRead(BUTTON_PIN) == LOW) {

    lcd.clear();
    lcd.print("Button Access");

    sendEvent("GRANTED", "Button pressed");

    unlockDoor();

    while (digitalRead(BUTTON_PIN) == LOW) delay(10);
  }
}

// ================= UNLOCK =================
void unlockDoor() {

  digitalWrite(RELAY_PIN, LOW);
  delay(5000);
  digitalWrite(RELAY_PIN, HIGH);

  lcd.clear();
  lcd.print("Door Locked");

  delay(1500);
  showReady();
}

// ================= UI =================
void showReady() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PowerShack FITIQ");
  lcd.setCursor(0, 1);
  lcd.print("Ready...");
}

// ================= HELPER =================
String trimMessage(String msg) {
  if (msg.length() > 16) return msg.substring(0, 16);
  return msg;
}