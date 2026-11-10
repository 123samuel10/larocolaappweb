# Arquitectura de La Rocola

La aplicación se organiza por funcionalidades. Administración y pantalla pública
agrupan sus componentes, datos y comportamiento.

```text
app/
├── features/
│   ├── administracion/
│   │   └── acceso/
│   │       ├── api/auth.server.ts
│   │       ├── components/
│   │       └── session.server.ts
│   └── pantalla/
│       ├── api/cola.server.ts
│       ├── components/
│       ├── hooks/useColaEnVivo.ts
│       ├── pantalla.server.ts
│       ├── pantalla.css
│       └── types.ts
├── shared/
│   ├── format/
│   └── supabase/
├── routes/
├── routes.ts
├── root.tsx
└── app.css
```

## Responsabilidades

- `routes/` conecta las URL, los loaders, las actions y los metadatos con cada
  funcionalidad.
- `features/administracion/acceso/` contiene el acceso del administrador,
  la validación de su rol y la sesión mediante cookie.
- `features/pantalla/` contiene la cola pública y el acceso móvil mediante QR.
  `pantalla.server.ts` coordina las consultas y prepara los datos de cada vista.
- `api/` contiene la comunicación con servicios externos. Las consultas actuales
  usan Supabase. Las futuras llamadas HTTP pertenecen a la funcionalidad que
  consume sus respuestas.
- `components/` contiene la presentación. Los datos llegan mediante props.
- `hooks/` contiene el comportamiento del navegador. La suscripción en vivo y su
  limpieza pertenecen a `useColaEnVivo`.
- `types.ts` define los contratos compartidos dentro de la funcionalidad.
- `shared/` contiene la configuración de Supabase y las funciones de formato
  que pueden reutilizar las funcionalidades. Sus pruebas están junto al código.
- `app.css` contiene el tema y los estilos comunes. `pantalla.css` contiene los
  estilos específicos de la cola pública.

## Crecimiento del panel

Las funcionalidades del panel, como establecimientos y usuarios, se añaden dentro
de `features/administracion/`, junto a `acceso/`. Cada una incorpora sus propios
componentes, API, hooks y tipos conforme los necesite.

Las rutas delegan en las funcionalidades. Las funcionalidades pueden consumir
`shared/`. Los módulos compartidos son independientes de las rutas y del dominio.

Los archivos `.server.ts` contienen operaciones exclusivas del servidor.
Los componentes y hooks de navegador consumen tipos y datos serializables.
La autenticación administrativa crea un cliente de Auth por operación para
mantener las credenciales de cada petición aisladas.

## Verificación

```sh
pnpm run typecheck
pnpm test
pnpm run build
```
