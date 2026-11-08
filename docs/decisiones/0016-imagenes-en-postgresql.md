# 0016. Imágenes de los cursos en PostgreSQL

**Estado**: Aceptada · **Fecha**: 2026-11-07

## Contexto

Con F13 los autores suben imágenes propias a sus cursos: hasta 10 MB cada una, 25 MB por
lección y 200 MB por curso. Es la primera vez que Brote guarda archivos. Las imágenes de un
borrador solo las ve su autor, y se borran con su curso o cuando ya nada las usa. F14 subirá
el audio propio de la misma forma.

## Decisión

- Los bytes de cada imagen van en PostgreSQL, en una tabla `imagen` (`bytea`), junto con su
  curso, su formato, su tamaño, su peso y su huella.
- La API las recibe (`POST /editor/cursos/:idCurso/imagenes`) y las sirve
  (`GET /imagenes/:idImagen`) con los permisos del curso y caché larga.
- Ninguna consulta de metadatos trae los bytes.

## Alternativas consideradas

- **Disco del servidor**: servir es más eficiente, pero el despliegue necesita un disco que
  persista, borrar queda fuera de la transacción (pueden quedar archivos sueltos) y el
  respaldo va aparte.
- **Almacenamiento de objetos compatible con S3** (MinIO en desarrollo): escala y admite una
  CDN, pero suma un contenedor, el SDK de AWS en el backend y URLs firmadas para que los
  borradores sigan privados.

## Consecuencias

- Sin servicio ni paquete nuevo: borrar un curso borra sus imágenes en la misma
  transacción y el respaldo de la base las incluye.
- La base crece con los cursos y la API sirve cada imagen. Si eso estorba, se mueve a un
  almacenamiento de objetos con una decisión nueva; el contrato no cambia, porque los
  clientes solo conocen `RUTA_IMAGENES` y el id.
- Detalle en `specs/features/F13-imagenes-propias/research.md`, punto 1.
