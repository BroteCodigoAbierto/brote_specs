# 0017. Audios de los cursos en PostgreSQL

**Estado**: Aceptada · **Fecha**: 2026-11-08

## Contexto

Con F14 los autores suben el audio de la frase de un escuchar y repetir: MP3, M4A o WAV de
hasta 30 segundos y 5 MB. Comparte con las imágenes de F13 los 25 MB por lección y los 200
MB por curso, y las mismas reglas: un borrador solo lo oye su autor, y se borra con su curso
o cuando ya nada lo usa. La decisión 0016 es solo de las imágenes.

## Decisión

- Los bytes de cada audio van en PostgreSQL, en una tabla `audio` (`bytea`), al lado de
  `imagen`, con su curso, su formato, su duración, su peso y su huella. Se guardan sin sus
  datos ocultos (título, artista, carátula, lugar).
- La API los recibe (`POST /editor/cursos/:idCurso/audios`) y los sirve
  (`GET /audios/:idAudio`) con los permisos del curso y caché larga, como las imágenes.
- Ninguna consulta de metadatos trae los bytes.
- Una tabla aparte de `imagen`, no una de "archivos": sus columnas y sus `CHECK` son otros,
  y lo que comparten (el espacio del curso, el peso de la lección y la limpieza) son
  consultas que recorren las dos.

## Alternativas consideradas

- **Disco del servidor** y **almacenamiento compatible con S3**: por lo mismo que en la
  0016, y además dejarían las imágenes y los audios en lugares distintos.
- **Una tabla `archivo` para imágenes y audios**: obligaría a migrar la tabla y el código
  de F13 sin ganar nada.

## Consecuencias

- Sin servicio ni paquete nuevo: borrar un curso borra sus audios en la misma transacción y
  el respaldo de la base los incluye.
- La API sirve cada audio entero (los clientes no lo piden por partes). Si los archivos se
  mueven a un almacenamiento de objetos, se hace para imágenes y audios juntos, con una
  decisión nueva; el contrato no cambia, porque los clientes solo conocen `RUTA_AUDIOS` y el
  id.
- Detalle en `specs/features/F14-escuchar-repetir/research.md`, puntos 1 a 7.
