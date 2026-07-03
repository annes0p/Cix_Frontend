# CIXOIL Frontend

Sistema web de gestión integral para CIXOIL S.A.C., empresa de lubricantes.
Permite administrar inventario, ventas, clientes, proveedores, órdenes de
compra, movimientos de stock y recomendaciones de aceite con inteligencia
artificial.

## Stack tecnológico

- React + Vite
- Tailwind CSS v4 (configurado en `src/index.css`, sin `tailwind.config.js`)
- React Router DOM
- Axios
- Lucide React
- Recharts

## Requisitos previos

- Node.js 18+
- Backend CIXOIL corriendo en `http://localhost:8080`

## Instalación

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`

## Módulos implementados

| Módulo            | Ruta             | Estado      |
| ----------------- | ---------------- | ----------- |
| Login             | `/login`         | ✅ Completo |
| Dashboard         | `/dashboard`     | ✅ Completo |
| Inventarios       | `/inventarios`   | ✅ Completo |
| Movimientos       | `/movimientos`   | ✅ Completo |
| Clientes          | `/clientes`      | ✅ Completo |
| Órdenes de Compra | `/ordenes`       | ✅ Completo |
| Proveedores       | `/proveedores`   | ✅ Completo |
| Reportes          | `/reportes`      | ✅ Completo |
| Alertas           | `/alertas`       | ✅ Completo |
| Configuración     | `/configuracion` | ✅ Completo |
| Recomendador IA   | `/recomendador`  | ✅ Completo |

## Estructura del proyecto

```
src/
├── api/
│   └── axios.js
├── assets/
│   └── logocixoil.jpeg
├── components/
│   ├── Layout.jsx
│   └── Sidebar.jsx
├── pages/
│   ├── Login/
│   ├── Dashboard/
│   ├── Inventarios/
│   ├── Movimientos/
│   ├── Clientes/
│   ├── OrdenesCompra/
│   ├── Proveedores/
│   ├── Reportes/
│   ├── Alertas/
│   ├── Configuracion/
│   └── Recomendador/
└── services/
    ├── api.js
    ├── authService.js
    ├── inventarioService.js
    ├── movimientosService.js
    ├── clienteService.js
    ├── dashboardService.js
    ├── ordenesService.js
    ├── proveedoresService.js
    ├── alertasService.js
    ├── reportesService.js
    ├── configuracionService.js
    └── recomendadorService.js
```

## Colores del sistema

```css
--color-cixoil-red: #660000 --color-cixoil-green: #2e7d32
  --color-cixoil-darkBg: #0d0d0d --color-cixoil-grayText: #666666;
```

## Reglas del equipo

- Nunca trabajar directamente en `main`
- Prefijos de commit: `Feat:`, `Fix:`, `Refactor:`, `Docs:`
- Tailwind CSS v4 — sin inline styles

## API externa

- SUNAT DNI: `GET https://apiperu.dev/api/dni/{numero}`
- SUNAT RUC: `GET https://apiperu.dev/api/ruc/{numero}`

## Equipo
