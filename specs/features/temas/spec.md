# Temas de la aplicación

## Objetivo
Elegir desde Cuenta entre Original, Océano, Terracota y Ciruela, en web y móvil.
Claro y oscuro son variantes de cada diseño, no diseños adicionales.

## Comportamiento
- Original y modo del sistema son los valores iniciales.
- Cambiar la paleta conserva el modo; cambiar el modo conserva la paleta.
- La elección se aplica inmediatamente a toda la interfaz y se recuerda en el
  dispositivo, incluso después de cerrar sesión. No se sincroniza entre dispositivos.
- Del sistema reacciona a cambios del sistema mientras la aplicación está abierta.
- Si no se puede leer la preferencia, se usa Original y Del sistema.
- Si no se puede guardar, se conserva el cambio durante la sesión y se avisa.
- El selector identifica su opción activa sin depender solo del color.

## Estados
Listo, guardando y error al guardar. No requiere conexión ni datos del servidor.

## Criterios de aceptación manuales
- [ ] Web y móvil: Cuenta permite elegir los cuatro diseños y los tres modos.
- [ ] Cambiar diseño/modo actualiza catálogo, actividades y editor web inmediatamente.
- [ ] Recargar/reabrir y cerrar sesión conservan la preferencia.
- [ ] Del sistema reacciona al sistema; modos explícitos lo ignoran.
- [ ] Datos inválidos o almacenamiento bloqueado no impiden usar la aplicación.
- [ ] Web: teclado, foco visible, 320 px y zoom 200 %; móvil: texto grande y lector.
- [ ] Vidrio, reducción de movimiento/transparencia y contraste se conservan.
