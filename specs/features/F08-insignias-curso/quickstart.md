# Quickstart: validar F08 Insignias por curso completado

Guía de validación manual. Un paso por criterio de `spec.md`, en el mismo orden.

## 1. Preparación

### 1.1 Levantar

Desde `brote_specs`, con los repos en la rama de F08 (o en `main` ya fusionada):

```bash
scripts/demo/iniciar.sh --datos      # migra (f08_insignias), siembra y arranca API y web
```

En otra terminal, el móvil: `cd ../brote_mobile_expo && npx expo start` (con
`EXPO_PUBLIC_URL_API` apuntando a la IP de la computadora).

Datos de prueba:

- **"Insignia rápida"**: publicado, 2 lecciones de teoría, **con** insignia.
- **"Japonés sencillo"**: publicado, 4 lecciones, **con** insignia.
- **"Git esencial"**: publicado, 6 lecciones, **sin** insignia.
- Cuentas: `autor@brote.test` (autor de los anteriores), `creador@brote.test` (sin cursos ni
  insignias), contraseña `brote12345`.

### 1.2 Con curl

```bash
API=http://localhost:3000
curl -s -c /tmp/f08 -H 'Content-Type: application/json' -H 'Origin: http://localhost:5173' \
  -d '{"correo":"creador@brote.test","contrasena":"brote12345"}' $API/sesiones
curl -s -b /tmp/f08 $API/usuarios/yo/insignias          # {"insignias":[]}
```

## 2. Criterios

| # | Criterio (spec) | Cómo se prueba |
|---|---|---|
| 1 | [web] Opción desactivada en un curso nuevo y en uno que ya existía | Con `autor@brote.test`: Mi panel → "Nuevo curso" → crear → en el mapa, la casilla "Dar una insignia a quien complete el curso" está sin marcar. Abrir un borrador de prueba ("Curso en borrador"): también sin marcar |
| 2 | [web] Activar, guardar, recargar | Marcar la casilla → "Guardar cambios" → "Cambios guardados" → F5 → sigue marcada |
| 3 | [web] En revisión o publicado no se cambia | Abrir el mapa de "Curso en revisión" y de "Git esencial": la casilla se ve y está deshabilitada |
| 4 | [web] Si guardar falla, conserva lo elegido | En un borrador, cambiar la casilla → `scripts/demo/api.sh apagar` → "Guardar cambios" → aviso de error y la casilla sigue como la dejó → `api.sh prender` |
| 5 | [web, móvil] Ganar la insignia al terminar la última lección | Con `creador@brote.test`: cursar "Insignia rápida" lección 1 → pantalla final sin aviso; lección 2 → pantalla final con la insignia y "¡Ganaste la insignia de Insignia rápida!". En el móvil, igual con "Japonés sencillo" (o con otra cuenta nueva) |
| 6 | [web, móvil] Repetir no vuelve a avisar | Repetir la lección 2 de "Insignia rápida": la pantalla final no muestra el aviso |
| 7 | [web, móvil] Curso sin insignia: sin aviso | Terminar todas las lecciones de "Git esencial" (o, más rápido, con curl el `PUT` de progreso de cada lección): ningún aviso; "Mis insignias" no cambia |
| 8 | [web, móvil] Lección que no es la última: sin aviso | Paso 5, lección 1 |
| 9 | [web] "Mis insignias" en Mi panel | Mi panel → sección "Mis insignias": portada en círculo con medalla, título y "Ganada el …", la más reciente primero (con dos insignias, la última ganada arriba) |
| 10 | [móvil] "Mis insignias" en Cuenta | Pestaña Cuenta → sección "Mis insignias" con lo mismo |
| 11 | [web, móvil] Estado vacío | Con una cuenta nueva: "Todavía no tienes insignias" y "Completa un curso que dé insignia para ganar la primera." |
| 12 | [web, móvil] La insignia es de la cuenta | Ganar en la web (paso 5) → abrir Cuenta en el móvil con la misma cuenta: aparece. Y al revés |
| 13 | [web, móvil] Se queda si el curso cambia | `autor@brote.test` retira "Insignia rápida" del catálogo, desmarca la casilla y le agrega una lección → con `creador@brote.test`, "Mis insignias" la sigue mostrando (con la portada generada si la suya no carga) |
| 14 | [web, móvil] Falla el registro de la última lección | En la pantalla final de la última lección con la API apagada: aviso de F04 sin insignia → prender la API → "Reintentar" → aparece la insignia. (Para llegar a la pantalla final con la API apagada: abrir la lección, `api.sh apagar`, cursarla) |
| 15 | [web, móvil] Error al cargar "Mis insignias" | Con la API apagada, abrir Mi panel / Cuenta: "No se pudieron cargar tus insignias." con "Reintentar"; el resto de la pantalla responde → prender la API → "Reintentar" la carga |
| 16 | [web, móvil] Portada que no carga | Con el curso de una insignia retirado (paso 13) o con una portada propia bloqueada (`npm run proxy:validacion`, modo `bloquear`): la insignia muestra la portada generada |

Con curl, para el paso 5 (la respuesta del último `PUT` trae `insigniaNueva` y la del
siguiente, `null`):

```bash
curl -s -b /tmp/f08 -X PUT -H 'Content-Type: application/json' \
  -d '{"aciertos":0,"preguntas":0}' $API/cursos/<idCurso>/lecciones/<idLeccion>/progreso
```
