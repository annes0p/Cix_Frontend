import jsPDF from "jspdf";

const encabezado = (doc, subtitulo) => {
    doc.setFillColor(102, 0, 0);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CIXOIL S.A.C.", 20, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitulo, 20, 22);
    doc.text("RUC: 20123456789 | Chiclayo, Peru", 20, 29);
};

const lineaSeparadora = (doc, y) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    return y + 6;
};

const textoConSalto = (doc, texto, x, y, maxWidth, lineHeight = 5) => {
    const lineas = doc.splitTextToSize(texto, maxWidth);
    lineas.forEach((linea) => {
        doc.text(linea, x, y);
        y += lineHeight;
    });
    return y;
};

export const generarReporteRecomendacionPDF = (datos) => {
    const doc = new jsPDF();
    let y = 45;

    encabezado(doc, "Reporte de recomendacion de lubricante");

    doc.setTextColor(102, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMENDACION INTELIGENTE", 105, y, { align: "center" });
    y += 10;

    y = lineaSeparadora(doc, y);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VEHICULO", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = textoConSalto(doc, datos.vehiculo || "-", 20, y, 170);
    doc.text(`Tipo de uso: ${datos.tipoUso || "-"}`, 20, y);
    y += 10;

    y = lineaSeparadora(doc, y);

    doc.setFont("helvetica", "bold");
    doc.text("ACEITE RECOMENDADO", 20, y);
    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(102, 0, 0);
    doc.text(datos.producto || "-", 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Prioridad: ${datos.prioridad || "-"}`, 20, y);
    y += 5;
    y = textoConSalto(doc, `Motivo: ${datos.motivo || "-"}`, 20, y, 170);
    y += 4;

    if (datos.beneficios?.length) {
        y = lineaSeparadora(doc, y);
        doc.setFont("helvetica", "bold");
        doc.text("BENEFICIOS", 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        datos.beneficios.forEach((b) => {
            y = textoConSalto(doc, `- ${b}`, 20, y, 170);
        });
        y += 4;
    }

    if (datos.intervalosCambio) {
        doc.setFont("helvetica", "bold");
        doc.text("Intervalo de cambio:", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(datos.intervalosCambio, 70, y);
        y += 6;
    }

    if (datos.consejo) {
        doc.setFont("helvetica", "bold");
        doc.text("Consejo:", 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        y = textoConSalto(doc, datos.consejo, 20, y, 170);
    }

    if (datos.advertencia) {
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 100, 0);
        doc.text("Advertencia:", 20, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        y = textoConSalto(doc, datos.advertencia, 20, y, 170);
        doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Documento generado el ${new Date().toLocaleDateString("es-PE")}`,
        105,
        285,
        { align: "center" },
    );

    doc.save(`recomendacion-${Date.now()}.pdf`);
};

export const generarResumenRutaPDF = (ruta, resumenTexto) => {
    const doc = new jsPDF();
    let y = 45;

    encabezado(doc, "Resumen de ruta de reparto");

    doc.setTextColor(102, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
        `RUTA #${ruta.id?.toString().padStart(4, "0")}`,
        105,
        y,
        { align: "center" },
    );
    y += 10;

    y = lineaSeparadora(doc, y);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${ruta.routeDate}`, 20, y);
    doc.text(`Estado: ${ruta.progressStatus}`, 110, y);
    y += 10;

    y = lineaSeparadora(doc, y);

    doc.setFont("helvetica", "bold");
    doc.text("PARADAS", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    (ruta.trips || []).forEach((t) => {
        const venta = t.sale
            ? ` (venta VEN-${t.sale.id.toString().padStart(4, "0")} a ${t.sale.client?.name || "cliente"}, S/. ${t.sale.total})`
            : "";
        y = textoConSalto(
            doc,
            `- ${t.origin?.name} -> ${t.destination?.name}: ${t.progressStatus}${venta}`,
            20,
            y,
            170,
        );
        if (y > 260) {
            doc.addPage();
            y = 20;
        }
    });

    y += 4;
    y = lineaSeparadora(doc, y);

    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN (IA)", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    y = textoConSalto(doc, resumenTexto || "-", 20, y, 170);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Documento generado el ${new Date().toLocaleDateString("es-PE")}`,
        105,
        285,
        { align: "center" },
    );

    doc.save(`ruta-${ruta.id}.pdf`);
};
