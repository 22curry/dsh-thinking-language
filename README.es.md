# dsh-thinking-language

[English](README.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | **Español** | [Português](README.pt.md)

Elija en los ajustes de DSH el idioma en el que piensan los modelos de **DeepSeek Harness** — chino, inglés, alemán, francés, español, portugués, japonés, coreano y más.

La elección pertenece al perfil, no a una conversación: las sesiones nuevas, otros espacios de trabajo, los subagentes y los reinicios la conservan. Se configura una vez.

---

## Por qué existe

La cadena de razonamiento de un modelo la genera el propio modelo, en el idioma que decide usar. El único lugar donde se puede influir en esa decisión es la petición que la inicia. Este plugin añade una sección breve al prompt del sistema que indica el idioma de razonamiento. Así el pensamiento se **escribe en ese idioma desde el primer token**:

- sin llamadas adicionales al modelo, sin servicio de traducción, sin latencia;
- nada sale de tu máquina;
- la respuesta visible sigue el idioma en que escribe el usuario.

## Instalación

**Desde la interfaz de DSH**

1. Coloque esta carpeta donde quiera.
2. En la barra lateral: **Plugins** → **Add plugin** → **Install a third-party plugin**.
3. Pegue la ruta absoluta de esta carpeta (por ejemplo `C:\Users\you\dsh-thinking-language`) e instale.
4. El paquete aparece en **Installed plugins** y queda activo tras la instalación.

**Desde npm** (una vez publicado)

```bash
dsh plugin add dsh-thinking-language
```

## Uso

Abra **Ajustes** → **思考语言**, elija un idioma y listo.

El mismo control aparece también en la página del paquete en **Plugins**; ambos leen y escriben el mismo valor.

| Opción | Efecto |
| --- | --- |
| Seguir la conversación (predeterminado) | No se añade nada al prompt; el modelo se comporta igual que antes. |
| `中文`, `English`, `日本語`, `한국어`, `Deutsch`, `Français`, `Español`, `Português`, `Italiano`, `Русский`, `العربية`, `हिन्दी`, `ไทย`, `Tiếng Việt`, `Türkçe`, `Bahasa Indonesia` | El modelo razona en ese idioma. |
| Otro idioma… | Texto libre para lo que no esté en la lista (por ejemplo `Norwegian`, `Cantonese`). |

Los cambios se aplican en la siguiente petición al modelo; no hace falta reiniciar.

## Cómo funciona

- La parte Host registra una sección del prompt del sistema (`thinking-language`, orden `10300`, la última del prompt ensamblado) con una instrucción de dos líneas. Con *Seguir la conversación* el texto está vacío y la sección desaparece, así que la opción predeterminada no cuesta nada.
- La elección es la configuración del propio plugin (`thinking-language` en el patch del perfil). El campo es volatile: una escritura se aplica en el acto y la siguiente petición lee el valor nuevo.
- La parte del navegador dibuja los dos puntos de entrada con el servicio compartido de formularios de configuración; ambos escriben a través del documento de ajustes del Host. Por eso el valor sobrevive a los reinicios y lo comparten todas las sesiones.

## Privacidad y coste

Sin acceso a la red, sin telemetría, sin credenciales. La instrucción cuesta unos 50 tokens por petición **solo mientras hay un idioma seleccionado**; con el valor predeterminado no se envía.

## Limitaciones

- Solo actúa sobre modelos que exponen su razonamiento.
- La instrucción la sigue el modelo, no la impone el arnés — en tareas muy cortas puede volver al idioma de la conversación.
- Cambiar de idioma cambia el prefijo del prompt del sistema, así que la caché del proveedor se reconstruye una vez desde ese punto.
- El razonamiento ya registrado en sesiones antiguas no se reescribe ni se traduce.

## Desarrollo

```bash
node --check index.js
node --check client.js
```

Instale la carpeta como se indica arriba; con HMR la parte Host se recarga en el sitio y la del navegador junto con el módulo de cliente que registra.

## Licencia

MIT — véase [LICENSE](./LICENSE).
