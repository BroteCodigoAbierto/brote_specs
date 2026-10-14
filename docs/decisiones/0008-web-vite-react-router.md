# 0008. Web como SPA con Vite y React Router

**Estado**: Aceptada · **Fecha**: 2026-10-14

## Contexto

El backend ya es un servidor Express que atiende a la web y al móvil.

## Decisión

La web es una **SPA**: Vite + React + TypeScript + React Router. Consume la
misma API que el móvil.

## Alternativas consideradas

- **Next.js**: mejor SEO para el catálogo, pero trae su propio servidor y se
  superpone con Express (dos backends).
- **React Router en modo framework**: punto medio, con servidor propio si se
  usa SSR.

## Consecuencias

- El catálogo público no tiene renderizado en servidor. Si el SEO se vuelve
  importante, es una decisión nueva.
- En producción la web son archivos estáticos.
