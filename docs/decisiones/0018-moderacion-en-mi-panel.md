# 0018. Moderación de cursos en "Mi panel"

**Estado**: Aceptada · **Fecha**: 2026-11-21 · **Reemplaza en parte a**: [0014](0014-publicacion-con-revision.md)

## Contexto

La decisión 0014 dejó la aprobación de cursos en la base de datos: un administrador
cambia `publicado` a `true` a mano. Con varios autores enviando cursos, eso exige
acceso a la base y saber el id de cada curso, y no deja probar el curso antes de
decidir. Hace falta verlos, probarlos y aprobarlos o no desde la web. Este cambio se hizo fuera del flujo de Spec Kit, por única vez, sin spec ni plan.

## Decisión

- **Quién es administrador**: quien tenga su correo en la variable de entorno
  `CORREOS_ADMINISTRADORES` de la API (separados por coma, sin distinguir mayúsculas).
  No hay rol en la base ni pantalla para nombrar administradores.
- El contrato agrega `Usuario.esAdministrador`; la web lo usa para mostrar la sección.
- **"Cursos en revisión"** va primero en "Mi panel", solo para administradores: una
  tarjeta por curso con portada, título, autor, descripción, lecciones y fecha de envío,
  del enviado hace más tiempo al más reciente. Toda la tarjeta abre su revisión.
- **La revisión** (`/moderacion/:idCurso`) muestra el curso como lo vería un alumno y sus
  lecciones con "Probar". Probar corre la lección en memoria, como "Probar lección" del
  editor (F05): no registra progreso ni da insignias. El administrador también ve las
  imágenes y los audios del curso mientras está en revisión.
- **Aprobar** (con confirmación) publica el curso. **No aprobar** (con un motivo
  opcional de hasta 1000 caracteres) lo regresa a su autor como borrador con "Revisión
  no aprobada" y el motivo, como ya lo muestra F06. Las dos acciones vuelven a "Mi
  panel" y dicen qué pasó. Si el curso ya no existe (404) o ya no está en revisión
  (409), porque otro administrador decidió o su autor lo retiró, también.
- API: `GET /moderacion/cursos`, `GET /moderacion/cursos/:idCurso`,
  `POST /moderacion/cursos/:idCurso/aprobacion` y `POST /moderacion/cursos/:idCurso/rechazo`,
  con `requerirSesion` y `requerirAdministrador` (401, luego 403).
- Retirar del catálogo sigue en la base, como dice 0014. El trigger y el `CHECK` de F06
  se quedan: aprobar y rechazar escriben lo mismo que se escribía a mano.

## Alternativas consideradas

- **Columna de rol en `user`**: obliga a una migración sobre una tabla de Better Auth y
  a una forma de asignar el rol; para uno o dos administradores no hace falta.
- **Plugin `admin` de Better Auth**: trae roles, baneos y suplantación que Brote no usa.
- **Pantalla aparte (`/moderacion`)**: una ruta y un enlace más en la navegación para
  una sola lista; "Mi panel" ya es la página personal.

## Consecuencias

- En producción hay que definir `CORREOS_ADMINISTRADORES` en Vercel. Sin ella no hay
  administradores y todo funciona como antes.
- Cambiar quién es administrador es cambiar la variable y redesplegar.
- El móvil no cambia: solo recibe el contrato nuevo (0.13.0).
