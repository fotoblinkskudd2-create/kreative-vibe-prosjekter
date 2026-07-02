// TicShield v0.1 — burst-deteksjon + vibrasjons-respons
// Target: ESP32 (Arduino core) + MPU6050 IMU + vibrasjonsmotor + knapp
// Sikkerhet: denne skissen driver KUN en vibrasjonsmotor (lavspenning,
// trygt mot hud). Den driver ALDRI strøm direkte mot hud/nerve. Se README
// for hvordan et sertifisert TENS-apparat kan trigges via relé/optokobler.

#include <Wire.h>
#include <MPU6050.h>

const int PIN_VIBRATION = 25;
const int PIN_TENS_TRIGGER = 26;   // valgfri: puls til relé/optokobler mot eksternt sertifisert TENS-apparat
const int PIN_BUTTON = 27;         // manuell "marker hendelse nå" (for kalibrering/logging)

const unsigned long SAMPLE_INTERVAL_MS = 20;   // 50 Hz
const unsigned long BURST_WINDOW_MS = 300;     // hvor lenge en burst må vedvare
const unsigned long VIBRATION_PULSE_MS = 400;
const unsigned long TENS_TRIGGER_PULSE_MS = 150;
const unsigned long REFRACTORY_MS = 1500;      // min tid mellom to trigg, unngår spam

const float BASELINE_ALPHA = 0.02f;            // EMA-glatting for baseline
const float BURST_THRESHOLD_MULT = 3.0f;       // burst = energi > baseline * denne faktoren

MPU6050 imu;

float baselineEnergy = 0.0f;
bool baselineInitialized = false;

unsigned long burstStartedAt = 0;
bool inBurstCandidate = false;

unsigned long lastTriggerAt = 0;
unsigned long vibrationOffAt = 0;
unsigned long tensTriggerOffAt = 0;

unsigned long eventCount = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  pinMode(PIN_VIBRATION, OUTPUT);
  pinMode(PIN_TENS_TRIGGER, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  digitalWrite(PIN_VIBRATION, LOW);
  digitalWrite(PIN_TENS_TRIGGER, LOW);

  imu.initialize();
  if (!imu.testConnection()) {
    Serial.println("event=error,msg=imu_not_found");
  }

  Serial.println("event=boot,device=ticshield,version=0.1");
}

float readMotionEnergy() {
  int16_t ax, ay, az, gx, gy, gz;
  imu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float accelMag = sqrtf((float)ax * ax + (float)ay * ay + (float)az * az);
  float gyroMag = sqrtf((float)gx * gx + (float)gy * gy + (float)gz * gz);

  return accelMag * 0.01f + gyroMag * 0.005f;
}

void triggerCounterStim() {
  unsigned long now = millis();
  if (now - lastTriggerAt < REFRACTORY_MS) return;

  lastTriggerAt = now;
  eventCount++;

  digitalWrite(PIN_VIBRATION, HIGH);
  vibrationOffAt = now + VIBRATION_PULSE_MS;

  digitalWrite(PIN_TENS_TRIGGER, HIGH);
  tensTriggerOffAt = now + TENS_TRIGGER_PULSE_MS;

  Serial.print("event=burst_detected,count=");
  Serial.print(eventCount);
  Serial.print(",t_ms=");
  Serial.println(now);
}

void handleManualMarker() {
  static bool lastState = HIGH;
  bool state = digitalRead(PIN_BUTTON);
  if (lastState == HIGH && state == LOW) {
    Serial.print("event=manual_marker,t_ms=");
    Serial.println(millis());
  }
  lastState = state;
}

void loop() {
  static unsigned long lastSampleAt = 0;
  unsigned long now = millis();

  if (now - lastSampleAt >= SAMPLE_INTERVAL_MS) {
    lastSampleAt = now;

    float energy = readMotionEnergy();

    if (!baselineInitialized) {
      baselineEnergy = energy;
      baselineInitialized = true;
    } else {
      baselineEnergy = baselineEnergy * (1.0f - BASELINE_ALPHA) + energy * BASELINE_ALPHA;
    }

    bool overThreshold = energy > baselineEnergy * BURST_THRESHOLD_MULT;

    if (overThreshold) {
      if (!inBurstCandidate) {
        inBurstCandidate = true;
        burstStartedAt = now;
      } else if (now - burstStartedAt >= BURST_WINDOW_MS) {
        triggerCounterStim();
        inBurstCandidate = false;
      }
    } else {
      inBurstCandidate = false;
    }
  }

  if (vibrationOffAt && now >= vibrationOffAt) {
    digitalWrite(PIN_VIBRATION, LOW);
    vibrationOffAt = 0;
  }
  if (tensTriggerOffAt && now >= tensTriggerOffAt) {
    digitalWrite(PIN_TENS_TRIGGER, LOW);
    tensTriggerOffAt = 0;
  }

  handleManualMarker();
}
