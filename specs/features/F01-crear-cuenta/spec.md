# F01: Crear cuenta e iniciar sesión

**Estado**: Borrador
**Creada**: 2026-10-19
**Repos afectados**: backend | web | móvil
**Rama**: `feature/F01-crear-cuenta` (en cada repo afectado)
**Descripción original**: "F01 Crear cuenta e iniciar sesión, en web y móvil."

> Brote no se usa sin cuenta. Sin sesión, la web y el móvil solo muestran las
> pantallas "Entrar" y "Crear cuenta"; cualquier otra pantalla lleva a
> "Entrar". En la web, después de entrar se regresa a la página que se
> intentaba abrir; en el móvil se llega al inicio.
>
> Crear cuenta: se pide nombre para mostrar, correo y contraseña. El nombre es
> libre, puede repetirse entre usuarios y es el que aparecerá como autor de los
> cursos. Una misma cuenta sirve para cursar y para crear cursos; no se elige
> rol. Al crear la cuenta, la sesión queda iniciada y se entra al inicio. La
> cuenta queda activa de inmediato (no se verifica el correo).
>
> Entrar: con correo y contraseña. Si no coinciden, el mensaje es el mismo sin
> importar si el correo existe o no ("Correo o contraseña incorrectos").
>
> Sesión: la misma cuenta funciona en web y en móvil, y puede tener sesión en
> los dos a la vez. La sesión sigue después de cerrar el navegador o la app,
> hasta que el usuario la cierra o expira. Si expira, la siguiente acción lleva
> a "Entrar" con el aviso de que la sesión terminó. "Cerrar sesión" existe en
> web y móvil, solo afecta a ese dispositivo y lleva a "Entrar".
>
> Validaciones (también las vuelve a hacer el servidor): nombre obligatorio, de
> 1 a 50 caracteres sin contar espacios al inicio y al final, solo espacios
> cuenta como vacío; correo obligatorio, con formato de correo, se ignoran
> mayúsculas y espacios al inicio y al final, no puede repetirse ("Ya existe
> una cuenta con ese correo"); contraseña obligatoria, de 8 a 128 caracteres,
> con botón para mostrarla u ocultarla, sin escribirla dos veces. Los errores
> de cada campo aparecen junto a él al intentar enviar.
>
> Estados: mientras se envía, el botón queda deshabilitado y no se puede enviar
> dos veces. Si algo falla (datos rechazados, servidor caído o, en el móvil,
> sin conexión) se muestra un mensaje y no se pierde lo capturado.
>
> Fuera de alcance: verificación del correo, recuperar la contraseña, entrar
> con Google u otros proveedores, editar el perfil o cambiar la contraseña,
> borrar la cuenta, y el rol de administrador (la aprobación de cursos se hace
> en la base de datos, ver F06).

## Objetivo

Que cada persona tenga una cuenta propia con la que entra a Brote desde la web
o desde el teléfono. Sin cuenta no se puede usar Brote: el progreso es de cada
usuario (F04) y los cursos tienen autor (F05).

## Actor

- **Visitante**: persona sin sesión en ese dispositivo (tenga o no cuenta).
- **Usuario**: persona con sesión iniciada. La misma cuenta cursa y crea
  cursos; no hay roles que elegir.

## Precondiciones

- El visitante tiene la web abierta en un navegador o la app instalada en su
  teléfono.
- Para crear cuenta, entrar o cerrar sesión hace falta llegar al servidor. Si
  no se puede, se maneja en "Casos de error".

## Datos de entrada

### Crear cuenta

- Nombre para mostrar: texto, obligatorio, de 1 a 50 caracteres después de
  quitar los espacios al inicio y al final.
- Correo: texto, obligatorio, con formato de correo, máximo 254 caracteres
  después de quitar los espacios al inicio y al final.
- Contraseña: texto, obligatorio, de 8 a 128 caracteres.

### Entrar

- Correo: texto, obligatorio, con formato de correo.
- Contraseña: texto, obligatorio.

## Flujo principal

### Acceso sin sesión

1. El visitante abre cualquier pantalla de Brote que no sea "Entrar" ni
   "Crear cuenta" (en la web, también escribiendo la dirección directamente).
2. El sistema lo lleva a "Entrar". En la web recuerda la página que intentaba
   abrir.
3. Desde "Entrar" puede ir a "Crear cuenta", y desde "Crear cuenta" puede
   volver a "Entrar".

### Crear cuenta

1. El visitante abre "Crear cuenta".
2. Escribe nombre para mostrar, correo y contraseña. Puede pulsar el botón
   "Mostrar" / "Ocultar" para ver u ocultar la contraseña.
3. Pulsa "Crear cuenta".
4. El sistema revisa los campos. Si alguno falla, muestra el error junto a ese
   campo y no envía nada.
5. Si todo es válido, el sistema envía los datos; el botón queda deshabilitado
   mientras tanto.
6. El servidor vuelve a validar, comprueba que el correo no tenga ya una
   cuenta y crea la cuenta, activa de inmediato.
7. La sesión queda iniciada en ese dispositivo y el usuario llega al inicio
   (en web y en móvil).

### Entrar

1. El visitante abre "Entrar" (o llega ahí desde otra pantalla).
2. Escribe correo y contraseña. Puede ver u ocultar la contraseña.
3. Pulsa "Entrar".
4. El sistema revisa que ambos campos estén llenos y que el correo tenga
   formato de correo. Si falla, muestra el error junto al campo.
5. El sistema envía los datos; el botón queda deshabilitado mientras tanto.
6. Si el correo y la contraseña corresponden a una cuenta, la sesión queda
   iniciada en ese dispositivo.
7. En la web, el usuario llega a la página que intentaba abrir; si no
   intentaba abrir ninguna, al inicio. En el móvil llega al inicio.

### Volver con la sesión guardada

1. El usuario cierra el navegador o la app sin cerrar sesión.
2. Al volver a abrir Brote en ese mismo dispositivo, entra directo a la
   pantalla que abrió, sin pasar por "Entrar", mientras no hayan pasado 30
   días sin usarlo.

### Sesión expirada

1. La sesión de un dispositivo expira cuando pasan 30 días sin usar Brote en
   ese dispositivo. Cada uso la renueva: quien entra al menos una vez cada 30
   días no vuelve a escribir su contraseña.
2. La siguiente acción del usuario en ese dispositivo que necesita al servidor
   lo lleva a "Entrar" con el aviso "Tu sesión terminó. Vuelve a entrar."
3. En la web, después de entrar regresa a la página donde estaba; en el móvil,
   al inicio.

### Cerrar sesión

1. El usuario pulsa "Cerrar sesión":
   - En la web, en el menú de la cuenta, que se abre desde la barra superior
     donde aparece su nombre.
   - En el móvil, en la pestaña "Cuenta", que muestra su nombre y su correo.
2. El sistema termina la sesión de ese dispositivo y lo lleva a "Entrar".
3. Las sesiones de la misma cuenta en otros dispositivos siguen abiertas.

## Validaciones

Las hace el cliente al pulsar el botón de enviar y las vuelve a hacer el
servidor con las mismas reglas y los mismos mensajes. El servidor agrega una
revisión más estricta del correo (ver abajo).

- Nombre:
  - Se le quitan los espacios al inicio y al final antes de validarlo y de
    guardarlo. Un nombre formado solo por espacios cuenta como vacío.
  - Vacío: "Escribe tu nombre."
  - Más de 50 caracteres: "El nombre puede tener hasta 50 caracteres."
  - Puede repetirse entre usuarios.
- Correo:
  - Se le quitan los espacios al inicio y al final y se pasa a minúsculas
    antes de validarlo, de compararlo y de guardarlo. `Ana@Correo.com ` y
    `ana@correo.com` son el mismo correo.
  - Vacío: "Escribe tu correo."
  - Formato de correo: tiene exactamente una `@`, al menos un carácter antes de
    ella, un dominio después con al menos un punto que no está ni al inicio ni
    al final, y ningún espacio. Si no: "Escribe un correo válido."
  - Más de 254 caracteres: "Escribe un correo válido."
  - El servidor rechaza además algunos correos que cumplen la forma anterior
    pero no son válidos en la práctica: un dominio que termina en una sola
    letra (`ana@correo.c`), letras con acento (`ñandú@correo.com`) o un
    dominio de solo números (`ana@123.45`). El mensaje es el mismo, "Escribe
    un correo válido.", junto al campo de correo.
  - Al crear cuenta, si el correo ya tiene una cuenta: "Ya existe una cuenta
    con ese correo." (junto al campo de correo).
- Contraseña:
  - No se le quitan espacios ni se cambia nada: se usa tal como se escribió.
  - Vacía: "Escribe una contraseña." (en "Entrar": "Escribe tu contraseña.")
  - Al crear cuenta, menos de 8 caracteres: "La contraseña debe tener al menos
    8 caracteres."
  - Al crear cuenta, más de 128 caracteres: "La contraseña puede tener hasta
    128 caracteres."
  - En "Entrar" no se revisa la longitud: una contraseña que no cumple
    simplemente no coincide.
- En "Entrar", si el correo no existe o la contraseña no coincide, el mensaje
  es siempre "Correo o contraseña incorrectos.", arriba del formulario y no
  junto a un campo.
- Todos los errores de campo aparecen a la vez, cada uno junto a su campo, al
  pulsar el botón de enviar. El error de un campo desaparece en cuanto el
  usuario lo modifica.

## Estados de la pantalla

### Al abrir Brote (web y móvil)

- Cargando: mientras se comprueba si hay una sesión guardada, se muestra un
  indicador de carga (en el móvil, la pantalla de arranque de la app); no
  aparece "Entrar" ni la pantalla pedida.
- Con sesión: se muestra la pantalla pedida.
- Sin sesión: se muestra "Entrar".
- Sin conexión (móvil): si hay una sesión guardada, el usuario entra igual; si
  no la hay, se muestra "Entrar".
- Error (web): si el servidor no responde, se muestra "No se pudo conectar con
  Brote. Inténtalo de nuevo en un momento." con un botón "Reintentar".

### "Crear cuenta" y "Entrar" (web y móvil)

- Listo: formulario con sus campos vacíos, la contraseña oculta y el botón de
  enviar habilitado. El botón está habilitado aunque los campos estén vacíos:
  al pulsarlo se muestran los errores.
- Con errores de campo: cada error junto a su campo; lo capturado sigue ahí.
- Enviando: el botón queda deshabilitado y muestra que se está enviando;
  pulsarlo de nuevo (o pulsar Enter) no envía otra vez. Los campos siguen
  mostrando lo capturado.
- Error: mensaje arriba del formulario (ver "Casos de error"); el botón vuelve
  a habilitarse y lo capturado sigue ahí, incluida la contraseña.
- Sin conexión (móvil): mensaje "Sin conexión. Revisa tu conexión e inténtalo
  de nuevo."; lo capturado sigue ahí.
- "Entrar" después de una sesión expirada: muestra además el aviso "Tu sesión
  terminó. Vuelve a entrar."

## Resultado esperado

- Al crear cuenta existe un nuevo usuario con su nombre (sin espacios al
  inicio y al final) y su correo (en minúsculas y sin espacios), y ese
  dispositivo queda con sesión iniciada.
- Al entrar, ese dispositivo queda con sesión iniciada.
- La sesión sigue después de cerrar y volver a abrir el navegador o la app.
- Al cerrar sesión, ese dispositivo queda sin sesión; los demás no cambian.
- La contraseña nunca se guarda ni se muestra tal como se escribió, y nunca se
  devuelve al cliente.

## Casos de error

- Campos inválidos al enviar: cada error junto a su campo; no se envía nada;
  lo capturado sigue ahí.
- El servidor rechaza los datos (validación del servidor o correo repetido):
  el error aparece junto al campo correspondiente, con el mismo mensaje que da
  el cliente; lo capturado sigue ahí.
- Correo o contraseña no coinciden al entrar: "Correo o contraseña
  incorrectos."; lo capturado sigue ahí.
- El servidor no responde o falla (web y móvil): "No se pudo conectar con
  Brote. Inténtalo de nuevo en un momento."; lo capturado sigue ahí. En el
  móvil, 15 segundos sin respuesta cuentan como que el servidor no responde.
- Sin conexión en el móvil: "Sin conexión. Revisa tu conexión e inténtalo de
  nuevo."; lo capturado sigue ahí.
- La sesión expiró mientras el usuario usaba Brote: la siguiente acción que
  necesita al servidor lo lleva a "Entrar" con el aviso "Tu sesión terminó.
  Vuelve a entrar."
- Cerrar sesión sin conexión o con el servidor caído: el dispositivo queda sin
  sesión de todos modos y llega a "Entrar".
- El usuario con sesión abre "Entrar" o "Crear cuenta": lo lleva al inicio.

## Fuera de alcance

- Verificar el correo.
- Recuperar o restablecer la contraseña.
- Entrar con Google u otros proveedores.
- Editar el perfil (nombre, correo) o cambiar la contraseña.
- Borrar la cuenta.
- Ver o cerrar las sesiones de otros dispositivos.
- Limitar los intentos fallidos al entrar: en el MVP no hay límite.
- Rol de administrador: la aprobación de cursos se hace en la base de datos
  (ver F06).
- El contenido del inicio: lo define F02.

## Criterios de aceptación

### Acceso sin sesión

- [ ] [web] Dado que no hay sesión, cuando abro `/` o cualquier otra dirección
  de Brote que no sea "Entrar" ni "Crear cuenta", entonces veo "Entrar".
- [ ] [móvil] Dado que no hay sesión, cuando abro la app, entonces veo
  "Entrar" y no puedo llegar a ninguna otra pantalla salvo "Crear cuenta".
- [ ] [web, móvil] Desde "Entrar" puedo ir a "Crear cuenta" y desde "Crear
  cuenta" puedo volver a "Entrar".

### Crear cuenta

- [x] [web, móvil] Con nombre, correo y contraseña válidos, al pulsar "Crear
  cuenta" llego al inicio con la sesión iniciada.
- [x] [web, móvil] Con todos los campos vacíos, al pulsar "Crear cuenta" veo
  "Escribe tu nombre.", "Escribe tu correo." y "Escribe una contraseña.", cada
  uno junto a su campo.
- [x] [web, móvil] Un nombre de solo espacios muestra "Escribe tu nombre.".
- [ ] [web, móvil] Un nombre de 50 caracteres con espacios al inicio y al
  final se acepta y se guarda sin esos espacios; uno de 51 caracteres muestra
  "El nombre puede tener hasta 50 caracteres.".
- [x] [web, móvil] Puedo crear una cuenta con un nombre que ya usa otra
  cuenta.
- [x] [web, móvil] `ana@correo` y `ana correo@x.com` muestran "Escribe un
  correo válido.".
- [x] [web, móvil] Si ya existe `ana@correo.com`, crear una cuenta con
  ` ANA@Correo.com ` muestra "Ya existe una cuenta con ese correo." junto al
  correo y conserva lo capturado.
- [ ] [web, móvil] Una contraseña de 7 caracteres muestra "La contraseña debe
  tener al menos 8 caracteres."; una de 8 se acepta; una de 129 muestra "La
  contraseña puede tener hasta 128 caracteres.".
- [x] [web, móvil] El botón "Mostrar" / "Ocultar" muestra y oculta la contraseña sin borrar
  lo escrito; no hay campo para repetir la contraseña.
- [x] [web, móvil] Corregir un campo con error quita su mensaje.
- [x] [backend] Enviar al servidor, sin pasar por el cliente, un nombre vacío,
  un correo inválido o una contraseña de 7 caracteres se rechaza con el mismo
  mensaje que da el cliente y no crea la cuenta.

### Entrar

- [x] [web, móvil] Con el correo y la contraseña de una cuenta existente,
  escribiendo el correo con mayúsculas y espacios alrededor, entro y llego al
  inicio.
- [x] [web, móvil] Con un correo que no existe veo "Correo o contraseña
  incorrectos."; con un correo existente y otra contraseña veo exactamente el
  mismo mensaje.
- [ ] [web] Dado que no hay sesión, cuando abro una dirección protegida (p. ej.
  `/glosario`) y entro, entonces llego a esa misma dirección.
- [x] [móvil] Después de entrar llego al inicio.
- [ ] [web, móvil] Con sesión iniciada, abrir "Entrar" o "Crear cuenta" me
  lleva al inicio.

### Estados

- [ ] [web, móvil] Mientras se envía el formulario, el botón está
  deshabilitado; pulsarlo varias veces seguidas (o pulsar Enter) crea una sola
  cuenta o hace un solo intento de entrar.
- [ ] [web, móvil] Con el servidor apagado, al enviar veo "No se pudo conectar
  con Brote. Inténtalo de nuevo en un momento." y lo capturado sigue en los
  campos, incluida la contraseña.
- [ ] [móvil] En modo avión, al enviar veo "Sin conexión. Revisa tu conexión e
  inténtalo de nuevo." y lo capturado sigue en los campos.
- [ ] [web, móvil] Al abrir Brote con una sesión guardada no se ve "Entrar" ni
  por un instante.
- [ ] [web] Con el servidor apagado, al recargar Brote veo "No se pudo conectar
  con Brote. Inténtalo de nuevo en un momento." y "Reintentar"; al encender el
  servidor y pulsar "Reintentar" veo la pantalla que corresponde.
- [ ] [móvil] Con una sesión iniciada, en modo avión cierro y abro la app y
  entro al inicio con mi nombre.

### Sesión

- [x] [web] Después de entrar, cierro el navegador por completo, lo vuelvo a
  abrir y sigo con sesión.
- [x] [móvil] Después de entrar, cierro la app por completo (no solo la mando
  al fondo), la vuelvo a abrir y sigo con sesión.
- [ ] [web, móvil] Con la misma cuenta puedo tener sesión en la web y en el
  móvil al mismo tiempo.
- [x] [web] Con sesión, la barra superior muestra mi nombre y abre un menú
  con "Cerrar sesión".
- [x] [móvil] Con sesión, la pestaña "Cuenta" muestra mi nombre, mi correo y
  "Cerrar sesión".
- [ ] [web, móvil] Al pulsar "Cerrar sesión" llego a "Entrar"; al volver
  atrás o recargar no recupero la sesión; en el otro dispositivo sigo con
  sesión.
- [ ] [web, móvil] Dado que la sesión del dispositivo expiró, cuando hago
  cualquier acción que necesita al servidor, entonces llego a "Entrar" con el
  aviso "Tu sesión terminó. Vuelve a entrar.".
- [ ] [web] Después de entrar tras una sesión expirada, regreso a la página
  donde estaba.

## Datos que toca

- **Usuario**: persona con cuenta; la misma cuenta cursa y crea cursos.
  - id.
  - nombre: nombre para mostrar, sin espacios al inicio y al final; puede
    repetirse; es el que aparece como autor de los cursos.
  - correo: en minúsculas y sin espacios al inicio y al final; único.
  - contraseña: se guarda de forma que no pueda leerse ni recuperarse; nunca
    sale del servidor.
  - creadoEn: fecha de creación de la cuenta.
- **Sesion**: acceso abierto de un usuario en un dispositivo (un navegador o
  una instalación de la app). Un usuario puede tener varias a la vez.
  - usuario al que pertenece.
  - expiraEn: cuándo deja de valer; 30 días después de su último uso.
  - creadaEn.

## Supuestos

- "Inicio" es la pantalla principal de cada cliente (`/` en la web y la
  pestaña de catálogo en el móvil). Mientras F02 no exista, es una pantalla
  mínima que muestra el nombre del usuario.
- Al crear cuenta se llega siempre al inicio, aunque en la web se hubiera
  intentado abrir otra página antes.
- En la web, si la dirección que se intentaba abrir no existe, después de
  entrar se llega a esa dirección y se ve "Página no encontrada", con su
  enlace al inicio (como cualquier dirección que no existe).
- El correo puede tener hasta 254 caracteres (límite habitual de un correo).
- La longitud de nombre y contraseña se cuenta en caracteres Unicode: una
  letra con acento cuenta como uno; algunos emojis compuestos (p. ej. familias
  o banderas) cuentan como varios.
- Que el mensaje de correo repetido diga que ya existe la cuenta (a diferencia
  de "Entrar") es una decisión explícita: se prefiere la claridad al crear
  cuenta.
- En la web no se detecta "sin conexión" aparte: se muestra el mismo mensaje
  que con el servidor caído.
- Cerrar sesión no pide confirmación.
- La pestaña "Cuenta" es nueva en el móvil (se agrega a
  `specs/01-navegacion.md` al cerrar la feature). Por ahora solo muestra
  nombre, correo y "Cerrar sesión"; editar el perfil queda fuera de alcance.
- Si la sesión expira mientras el usuario captura algo en otra feature, qué
  pasa con lo capturado lo define la spec de esa feature.
