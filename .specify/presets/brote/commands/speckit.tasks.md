## Reglas de Brote (tienen prioridad sobre las instrucciones del núcleo de abajo)

**Idioma**: tasks.md va en español con acentos.

**Organización**: en Brote las tareas se agrupan **por repo**, no por historia de usuario (las specs no tienen historias P1/P2). Sigue el orden de la plantilla: Preparación → Backend → Web → Móvil → Cierre → Validación manual. Borra las fases de los repos que la feature no toca. Usa la etiqueta de repo (`[specs]`, `[back]`, `[web]`, `[movil]`) donde el núcleo pone la etiqueta de historia (`[US1]`).

**Rutas**: cada tarea lleva la ruta exacta relativa a la raíz de su repo (los repos están en `../brote_backend_express`, `../brote_web_react`, `../brote_mobile_expo`).

**Pruebas**: no generes tareas de pruebas automáticas (la constitución define validación manual). En su lugar, la fase final tiene una tarea `V01`, `V02`, ... por cada criterio de aceptación de spec.md, copiado tal cual y con su plataforma.

**Tamaño**: cada tarea debe poder terminarse y revisarse sola, en un commit. Si una tarea toca más de 2 o 3 archivos, pártela.

**Fase de cierre obligatoria**: integrar data-model.md a `specs/02-modelo-datos.md`, integrar las pantallas a `specs/01-navegacion.md`, `npm run contrato:revisar` si cambió el contrato, y revisar que spec.md coincide con lo construido.

---

