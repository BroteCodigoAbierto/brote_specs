# 0020. Silos opcionales, exploración abierta, Estudio y variante visual

**Estado**: Aceptada · **Fecha**: 2026-11-26 · **Actualiza parcialmente**: [0014](0014-publicacion-con-revision.md), [0015](0015-sistema-de-diseno-vidrio.md), [0018](0018-moderacion-en-mi-panel.md), [0019](0019-catalogo-sin-cursos-completados.md)

## Contexto

Brote cuenta con un núcleo sólido de 13 tipos de actividades interactivas, editor visual, medios propios y progreso entre web y móvil. Sin embargo, para convertirse en una plataforma educativa profesional y útil tanto para creadores independientes como para escuelas, preparatorias y universidades, necesita resolver cuatro brechas estructurales:

1. **Exploración limitada:** el catálogo obligaba a iniciar sesión antes de ver cualquier curso, solo ordenaba alfabéticamente y ocultaba los cursos completados incluso al buscarlos. Tampoco existían categorías, niveles, filtro por idioma ni agrupación por módulos.
2. **Ciclo de autoría rígido:** todo curso exigía pasar por revisión global y no había forma de compartir un curso mediante enlace privado, exportarlo/importarlo en JSON, bifurcar un curso abierto ni recibir reportes de error de los alumnos.
3. **Ausencia de espacios institucionales (silos opcionales):** universidades, escuelas o comunidades necesitan espacios propios con catálogo aislado, moderación delegada, acceso por código o dominio, y aulas con seguimiento docente, sin complicar la experiencia de quien usa Brote en modo abierto.
4. **Flexibilidad visual:** preservar el sistema *vidrio sobre luz* (Liquid Glass, decisión 0015) como diseño por defecto y ofrecer una variante opcional de mayor contraste y densidad estructurada (*Editorial*).

## Decisión

1. **Liquid Glass por defecto + variante visual opcional (`editorial`):**
   - El aspecto predeterminado sigue siendo `"vidrio"` (Liquid Glass, decisión 0015).
   - Se agrega la preferencia local `"pref.aspecto"` (`"vidrio" | "editorial"`) en el menú de cuenta (web) y en Cuenta (móvil). En web se aplica con `data-variante="editorial"` sobre `:root` reutilizando los mismos tokens CSS.

2. **Exploración pública y catálogo enriquecido:**
   - El catálogo (`GET /cursos`), el detalle de curso (`GET /cursos/:idCurso`), los perfiles de autor (`GET /autores/:idAutor`), los portales de organización públicos (`GET /organizaciones/:slug`) y la primera lección de cada curso publicado funcionan con **sesión opcional**. Guardar progreso y crear contenido siguen exigiendo sesión.
   - `Curso` agrega `categoria`, `nivel`, `etiquetas`, `visibilidad` (`publico`, `enlacePrivado`, `organizacion`), `claveEnlace`, `idOrganizacion` (nullable), `tambienPublico`, `permiteFork` e `idCursoOrigen`.
   - `Leccion` agrega `modulo` (texto opcional) para agrupar visualmente lecciones en unidades sin afectar cursos planos.
   - Los cursos completados llevan la marca `completado: true` y el usuario decide con un filtro opcional si ocultarlos (`ocultarCompletados=1`), en lugar de desaparecer silenciosamente del catálogo (actualiza 0019).

3. **Arquitectura de silos opcionales (progresiva):**
   - **Silo lógico opcional (`Organizacion` + `MiembroOrganizacion`):** si el usuario no pertenece a ninguna organización, la interfaz permanece completamente comunitaria. Al crear o unirse a una organización (por código o dominio), aparece un selector de espacio para alternar entre la comunidad y sus organizaciones, con catálogo aislado, cursos opcionalmente compartidos al catálogo abierto (estilo OCW) y moderación delegada a los administradores de la organización.
   - **Aulas / Grupos (`Grupo` + `MiembroGrupo`):** opcionalmente, un docente crea un grupo con código de inscripción para un curso; los alumnos que se unen aceptan explícitamente compartir su avance en ese curso con el docente (con exportación a CSV).
   - **Silo físico / Self-Hosting:** `GET /configuracion` expone `MODO_INSTANCIA` (`comunidad | organizacion`), `NOMBRE_INSTANCIA` y `ORGANIZACION_INSTANCIA` para que una institución pueda desplegar su propia instancia dedicada y conectar la app móvil apuntando a su URL.

4. **Estudio de autor dedicado (`/estudio`):**
   - La navegación web se organiza en **Explorar** (`/`), **Mi aprendizaje** (`/panel`) y **Estudio** (`/estudio`).
   - Un curso con `visibilidad = "enlacePrivado"` o dentro de una organización sin revisión obligatoria (o creado por un admin de la organización) puede **publicarse directamente** sin esperar al administrador global.
   - Se agregan **bifurcación (fork)** de cursos abiertos (`permiteFork = true`), **exportación/importación JSON** y **reportes de error por actividad** enviados desde el reproductor.

## Consecuencias

- Total compatibilidad con los cursos y lecciones ya existentes (todos los campos nuevos tienen valores por defecto seguros o son nulos).
- El contrato sube a `0.14.0` y se copia a los tres repositorios de código.
- El diseño *Liquid Glass* sigue siendo la identidad oficial de Brote; la variante *Editorial* es una preferencia opt-in del usuario.
