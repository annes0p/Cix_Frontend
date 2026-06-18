let incidencias = [
    {
        id: 1,
        tipo: "PRODUCTO_DANADO",
        titulo: "Bidón de aceite con fuga",
        descripcion:
            "Se detectó fuga en bidón de Edge 10W-40 al momento de recepción.",
        estado: "ABIERTA",
        prioridad: "ALTA",
        relacionado: {
            tipo: "PRODUCTO",
            id: 1,
            nombre: "Edge 10W-40",
        },
        reportadoPor: "Almacén",
        createdAt: new Date().toISOString(),
        resolvedAt: null,
    },
    {
        id: 2,
        tipo: "QUEJA_CLIENTE",
        titulo: "Cliente reporta producto incorrecto",
        descripcion:
            "Cliente indica que recibió un aceite distinto al solicitado en su pedido.",
        estado: "EN_PROCESO",
        prioridad: "MEDIA",
        relacionado: {
            tipo: "VENTA",
            id: 12,
            nombre: "VEN-0012",
        },
        reportadoPor: "Ventas",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        resolvedAt: null,
    },
];

let nextId = 3;

export const getIncidencias = async () => {
    return Promise.resolve([...incidencias]);
};

export const getIncidenciaById = async (id) => {
    return Promise.resolve(incidencias.find((i) => i.id === Number(id)));
};

export const crearIncidencia = async (data) => {
    const nueva = {
        id: nextId++,
        estado: "ABIERTA",
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        relacionado: data.relacionado || {
            tipo: null,
            id: null,
            nombre: null,
        },
        ...data,
    };
    incidencias = [nueva, ...incidencias];
    return Promise.resolve(nueva);
};

export const actualizarEstadoIncidencia = async (id, nuevoEstado) => {
    incidencias = incidencias.map((i) =>
        i.id === Number(id)
            ? {
                  ...i,
                  estado: nuevoEstado,
                  resolvedAt:
                      nuevoEstado === "RESUELTA" || nuevoEstado === "CERRADA"
                          ? new Date().toISOString()
                          : i.resolvedAt,
              }
            : i,
    );
    return Promise.resolve(incidencias.find((i) => i.id === Number(id)));
};

export const TIPOS_INCIDENCIA = [
    { value: "PRODUCTO_DANADO", label: "Producto dañado" },
    { value: "ERROR_PEDIDO", label: "Error en pedido" },
    { value: "DEVOLUCION", label: "Devolución" },
    { value: "QUEJA_CLIENTE", label: "Queja de cliente" },
    { value: "PROBLEMA_PROVEEDOR", label: "Problema con proveedor" },
];

export const ESTADOS_INCIDENCIA = [
    { value: "ABIERTA", label: "Abierta" },
    { value: "EN_PROCESO", label: "En proceso" },
    { value: "RESUELTA", label: "Resuelta" },
    { value: "CERRADA", label: "Cerrada" },
];

export const PRIORIDADES_INCIDENCIA = [
    { value: "ALTA", label: "Alta" },
    { value: "MEDIA", label: "Media" },
    { value: "BAJA", label: "Baja" },
];
