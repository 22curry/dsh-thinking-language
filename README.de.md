# dsh-thinking-language

[English](README.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | **Deutsch** | [Français](README.fr.md) | [Español](README.es.md) | [Português](README.pt.md)

Wähle in den DSH-Einstellungen, in welcher Sprache **DeepSeek Harness**-Modelle denken — Chinesisch, Englisch, Deutsch, Französisch, Spanisch, Portugiesisch, Japanisch, Koreanisch und mehr.

Die Wahl gehört zum Profil, nicht zu einer Unterhaltung: neue Sitzungen, andere Arbeitsbereiche, Subagenten und Neustarts behalten sie. Einmal einstellen, fertig.

---

## Warum es das gibt

Die Gedankenkette eines Modells erzeugt das Modell selbst — auch die Sprache wählt es. Beeinflussen lässt sich das nur an der Stelle, an der das Denken beginnt: im Request. Dieses Plugin fügt einen kurzen Abschnitt in den System-Prompt ein, der die Denksprache nennt. Das Denken wird damit **vom ersten Token an** in dieser Sprache geschrieben.

- kein zusätzlicher Modellaufruf, kein Übersetzungsdienst, keine Verzögerung
- nichts verlässt den Rechner
- die sichtbare Antwort folgt weiterhin der Sprache des Nutzers

## Installation

**Über die DSH-Oberfläche**

1. Diesen Ordner irgendwo ablegen.
2. In der Seitenleiste **Plugins** → **Add plugin** → **Install a third-party plugin**.
3. Den absoluten Pfad zu diesem Ordner einfügen (z. B. `C:\Users\you\dsh-thinking-language`) und installieren.
4. Das Bundle erscheint unter **Installed plugins** und ist danach aktiv.

**Von GitHub**

```bash
dsh plugin add github:22curry/dsh-thinking-language
```

In DSH Desktop stattdessen `github:22curry/dsh-thinking-language` unter **Plugins → Add plugin** einfügen: Die Desktop-App verwaltet ihr Profil selbst, die CLI steuert sie nicht.

**Über npm** (nach Veröffentlichung)

```bash
dsh plugin add dsh-thinking-language
```

## Benutzung

**Einstellungen** → **思考语言** öffnen, Sprache wählen, fertig.

Dieselbe Steuerung erscheint auch auf der Bundle-Seite unter **Plugins**; beide lesen und schreiben denselben Wert.

| Wahl | Wirkung |
| --- | --- |
| Gespräch folgen (Voreinstellung) | Dem Prompt wird nichts hinzugefügt; das Modell verhält sich wie zuvor. |
| `中文`, `English`, `日本語`, `한국어`, `Deutsch`, `Français`, `Español`, `Português`, `Italiano`, `Русский`, `العربية`, `हिन्दी`, `ไทย`, `Tiếng Việt`, `Türkçe`, `Bahasa Indonesia` | Das Modell denkt in dieser Sprache. |
| Andere Sprache… | Freitext für alles, was nicht in der Liste steht (z. B. `Norwegian`, `Cantonese`). |

Änderungen greifen beim nächsten Modell-Request; ein Neustart ist nicht nötig.

## So funktioniert es

- Die Host-Hälfte registriert einen System-Prompt-Abschnitt (`thinking-language`, order `10300`, der letzte im zusammengesetzten Prompt) mit einer zweizeiligen Anweisung. Bei *Gespräch folgen* ist der Text leer, der Abschnitt verschwindet — die Voreinstellung kostet nichts.
- Die Wahl liegt in der eigenen Konfiguration des Plugins (`thinking-language` im Profil-Patch). Das Feld ist volatile: ein Schreibvorgang wirkt sofort, der nächste Request liest den neuen Wert.
- Die Browser-Hälfte rendert beide Einstiegspunkte mit dem gemeinsamen Konfigurationsformular-Dienst; beide schreiben über das Settings-Dokument des Hosts. Deshalb überlebt der Wert Neustarts und gilt in jeder Sitzung.

## Datenschutz und Kosten

Kein Netzwerkzugriff, keine Telemetrie, keine Zugangsdaten. Die Anweisung kostet rund 50 Token pro Request — **nur wenn eine Sprache gewählt ist**. Bei der Voreinstellung wird sie gar nicht gesendet.

## Grenzen

- Es wirkt nur auf Modelle, die ihr Denken offenlegen; ein Modell ohne sichtbares Denken bleibt unberührt.
- Die Anweisung wird vom Modell befolgt, nicht vom Harness erzwungen — bei sehr kurzen Aufgaben kann es zur Gesprächssprache zurückfallen.
- Ein Sprachwechsel ändert das Präfix des System-Prompts, daher wird der Provider-Cache ab dort einmal neu aufgebaut.
- Bereits gespeichertes Denken in alten Sitzungen wird weder umgeschrieben noch übersetzt.

## Entwicklung

```bash
node --check index.js
node --check client.js
```

Den Ordner wie oben installieren; mit HMR lädt die Host-Hälfte an Ort und Stelle neu, die Browser-Hälfte zusammen mit dem Client-Modul, das sie registriert.

## Lizenz

MIT — siehe [LICENSE](./LICENSE).
