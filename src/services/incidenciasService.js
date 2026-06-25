import api from "./api";

export const TIPOS_INCIDENCIA = [
    { value: "PRODUCTO_DANADO", label: "Producto dañado", idBackend: 1 },
    { value: "ERROR_PEDIDO", label: "Error en pedido", idBackend: 2 },
    { value: "DEVOLUCION", label: "Devolución", idBackend: 3 },
    { value: "QUEJA_CLIENTE", label: "Queja de cliente", idBackend: 4 },
    {
        value: "PROBLEMA_PROVEEDOR",
        label: "Problema con proveedor",
        idBackend: 5,
    },
];

export const PRIORIDAD_POR_TIPO = {
    PRODUCTO_DANADO: "ALTA",
    ERROR_PEDIDO: "ALTA",
    DEVOLUCION: "MEDIA",
    QUEJA_CLIENTE: "MEDIA",
    PROBLEMA_PROVEEDOR: "MEDIA",
};

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

const TIPO_A_ID = {
    PRODUCTO_DANADO: 1,
    ERROR_PEDIDO: 2,
    DEVOLUCION: 3,
    QUEJA_CLIENTE: 4,
    PROBLEMA_PROVEEDOR: 5,
};

const ID_A_TIPO = {
    1: "PRODUCTO_DANADO",
    2: "ERROR_PEDIDO",
    3: "DEVOLUCION",
    4: "QUEJA_CLIENTE",
    5: "PROBLEMA_PROVEEDOR",
};

const CATEGORIA_A_ID = {
    PRODUCTO: 1,
    VENTA: 2,
    ORDEN_COMPRA: 3,
    CLIENTE: 4,
    PROVEEDOR: 5,
};

const ID_A_CATEGORIA = {
    1: "PRODUCTO",
    2: "VENTA",
    3: "ORDEN_COMPRA",
    4: "CLIENTE",
    5: "PROVEEDOR",
};

const PRIORIDAD_A_BACKEND = {
    ALTA: "HIGH",
    MEDIA: "MEDIUM",
    BAJA: "LOW",
};

const PRIORIDAD_A_FRONTEND = {
    HIGH: "ALTA",
    MEDIUM: "MEDIA",
    LOW: "BAJA",
};

const ESTADO_A_FRONTEND = {
    OPEN: "ABIERTA",
    RESOLVED: "RESUELTA",
    CLOSED: "CERRADA",
    CANCELED: "CERRADA",
};

// ─── Transformadores ──────────────────────────────────────────────────────

const toFrontend = (inc) => ({
    id: inc.id,
    titulo: inc.title,
    tipo: ID_A_TIPO[inc.incidentType?.id] || "PRODUCTO_DANADO",
    prioridad: PRIORIDAD_A_FRONTEND[inc.priority] || "MEDIA",
    descripcion: inc.description,
    reportadoPor: inc.reportedBy,
    estado: ESTADO_A_FRONTEND[inc.incidentStatus] || "ABIERTA",
    relacionado: inc.incidentCategory
        ? {
              tipo: ID_A_CATEGORIA[inc.incidentCategory?.id] || null,
              id: inc.incidentCategory?.id || null,
              nombre: inc.reference || null,
          }
        : { tipo: null, id: null, nombre: null },
    createdAt: new Date().toISOString(),
    resolvedAt:
        inc.incidentStatus === "RESOLVED" || inc.incidentStatus === "CLOSED"
            ? new Date().toISOString()
            : null,
});

const toBackend = (data) => ({
    title: data.titulo,
    idIncidentType: TIPO_A_ID[data.tipo] || 1,
    priority: PRIORIDAD_A_BACKEND[data.prioridad] || "MEDIUM",
    description: data.descripcion,
    reportedBy: data.reportadoPor || "Vendedor",
    idIncidentCategory: data.relacionado?.tipo
        ? CATEGORIA_A_ID[data.relacionado.tipo]
        : null,
    reference: data.relacionado?.nombre || null,
});

// ─── Funciones del service ────────────────────────────────────────────────

export const getIncidencias = async () => {
    const response = await api.get("/incidents");
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data.map(toFrontend) : [];
};

export const getIncidenciaById = async (id) => {
    const response = await api.get(`/incidents/${id}`);
    const data = response.data.data || response.data;
    return toFrontend(data);
};

export const crearIncidencia = async (data) => {
    const response = await api.post("/incidents", toBackend(data));
    const created = response.data.data || response.data;
    return toFrontend(created);
};

export const actualizarEstadoIncidencia = async (id, nuevoEstado) => {
    const endpointMap = {
        RESUELTA: `/incidents/${id}/resolve`,
        CERRADA: `/incidents/${id}/close`,
        ABIERTA: `/incidents/${id}/reopen`,
    };
    const endpoint = endpointMap[nuevoEstado];
    if (!endpoint) return;
    const response = await api.patch(endpoint);
    const data = response.data.data || response.data;
    return toFrontend(data);
};

export const documentarResolucion = async (id, documentacion) => {
    // Primero actualiza la incidencia con la documentación vía PUT
    const incActual = await getIncidenciaById(id);
    const response = await api.put(`/incidents/${id}`, {
        ...toBackend(incActual),
        description: incActual.descripcion + "\n\nRESOLUCIÓN: " + documentacion,
    });
    // Luego la marca como resuelta
    await api.patch(`/incidents/${id}/resolve`);
    const data = response.data.data || response.data;
    return toFrontend(data);
};
