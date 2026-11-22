# Validación manual

1. Abrir Cuenta en web y móvil. Elegir cada una de las cuatro paletas, en cada modo.
2. Navegar al catálogo y una lección; en web también al editor. Volver a Cuenta.
3. Recargar o cerrar y abrir la aplicación. Cerrar sesión y volver a entrar.
4. Con Del sistema, cambiar la apariencia del dispositivo; repetir con Claro y Oscuro.
5. Web: bloquear almacenamiento y elegir; comprobar aviso y cambio aplicado.
   Reemplazar pref.tema por JSON inválido y recargar: Original/Del sistema.
6. Recorrer con teclado/lector, probar 320 px, zoom 200 % y texto grande móvil.
7. Activar reducción de movimiento y transparencia y recorrer las variantes.

Marcar criterios solo tras comprobarlos en las plataformas indicadas.

## Comprobaciones realizadas (2026-11-09)

- Web: tipos, build de producción y lint correctos. Build conserva el aviso
  de tamaño de bundle superior a 500 kB.
- Móvil: tipos y lint correctos; no se realizó una sesión en dispositivo nativo.
- Prettier y git diff --check sin problemas en los cambios de ambos clientes.
- Chrome con sesión simulada, sin alterar datos del backend: 12 combinaciones,
  persistencia al recargar, modo del sistema y explícito, 320 px sin desborde,
  reducción de transparencia, fallo al guardar y recuperación de JSON inválido.
- Paridad de los tokens de las paletas nuevas entre web y móvil; 30 pares de
  contraste (texto/vidrio opaco, secundario/vidrio opaco, acción/vidrio opaco y
  texto sobre acción normal/hover): mínimo 6.10:1.
- Pendiente: recorrido visual nativo, lectores de pantalla y actividades/editor
  con datos reales. Los criterios que requieren ambas plataformas quedan abiertos.
- Web: comprobados también navegación por flechas, foco visible, acceso a Cuenta
  desde el menú y conservación del tema al cerrar la sesión simulada.
- Texto al 200 %: se corrigió el encabezado para envolver sus controles y se
  limitaron el menú y las opciones al ancho disponible; comprobado sin desborde.
