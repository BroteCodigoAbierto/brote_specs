# Research: F08 Insignias por curso completado

Solo lo que F08 tiene de nuevo. El stack y los patrones están en `docs/decisiones/`.

## 1. La insignia se guarda, no se calcula

- **Decisión**: tabla `insignia` con una fila por alumno y curso.
- **Por qué**: la spec dice que una insignia ganada no se pierde aunque el curso agregue
  lecciones o el autor la desactive. Calcularla al vuelo desde `progreso` la haría
  desaparecer en esos casos.
- **Descartado**: calcularla en cada consulta (sin migración, pero contradice la spec).

## 2. Se da en el mismo pedido que registra la lección

- **Decisión**: `registrarProgreso` hace el `upsert` de F04 y luego, si el curso tiene
  `daInsignia`, cuenta sus lecciones y las filas de `progreso` del alumno en esas
  lecciones. Si son iguales (y hay al menos una), crea la insignia con `createMany` y
  `skipDuplicates`: si se creó una fila, es nueva y la respuesta trae `insigniaNueva`; si
  ya existía, `null`.
- **Por qué**: la pantalla final ya espera esa respuesta, así que no hace falta otro pedido
  ni otro estado. `skipDuplicates` (`ON CONFLICT DO NOTHING`) evita dos insignias si dos
  dispositivos terminan a la vez, y solo uno de los dos la anuncia como nueva.
- **Descartado**: un pedido aparte del cliente ("¿gané algo?"), que abre una ventana en la
  que el progreso se guardó pero la insignia no; y un trigger en la base, que esconde la
  regla fuera del servicio (principio III).

## 3. Qué cuenta como "todas las lecciones"

- **Decisión**: las lecciones que el curso tiene en ese momento; `progreso` se borra con la
  lección (F04), así que las filas del alumno en el curso son siempre de lecciones que
  existen.
- **Consecuencia**: un alumno que completó el curso antes de que se activara la insignia la
  gana al terminar de nuevo cualquier lección (supuesto de la spec).

## 4. "Mis insignias" incluye cursos retirados

- **Decisión**: `traerInsignias` no filtra por `publicado`. Trae título e `idPortada` del
  curso.
- **Por qué**: la insignia no se pierde al retirarse el curso. Su portada puede no cargar
  (las imágenes de un curso no publicado solo las ve su autor, F13): `PortadaCurso` ya cae a
  la portada generada, que es lo que pide la spec.

## 5. `daInsignia` viaja con los datos del curso

- **Decisión**: campo opcional de `CuerpoDatosCurso`, como `idioma` (F14): sin él no cambia;
  el `POST` sin él crea `false`. La web lo manda solo si cambió.
- **Por qué**: se guarda con "Guardar cambios" como los demás datos, y `actualizarCurso` ya
  rechaza cambios en un curso en revisión o publicado (F06), así que la regla de "solo en
  borrador" sale gratis.

## 6. Cómo se dibuja

- **Decisión**: componente `InsigniaCurso` que reusa `PortadaCurso` dentro de un círculo y
  le pone `Medal` (Lucide) en un círculo `acento`.
- **Por qué**: cada insignia se distingue por su curso sin diseñar imágenes nuevas, y
  `PortadaCurso` ya resuelve imagen, carga y portada generada en los dos clientes.

## 7. Datos de prueba

- **Decisión**: `CursoPrueba.daInsignia?`. "Japonés sencillo" (4 lecciones) con insignia,
  "Git esencial" sin ella, y un curso publicado nuevo de 2 lecciones de teoría, "Insignia
  rápida", con insignia, para validar en un minuto.
