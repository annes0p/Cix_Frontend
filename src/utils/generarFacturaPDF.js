import jsPDF from "jspdf";

export const generarFacturaPDF = (mov) => {
    const doc = new jsPDF();
    const margen = 20;
    let y = 20;

    const lineaH = () => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margen, y, 190, y);
        y += 6;
    };

    // Header
    doc.setFillColor(102, 0, 0);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CIXOIL S.A.C.", margen, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestion de Lubricantes", margen, 22);
    doc.text("RUC: 20123456789 | Chiclayo, Peru", margen, 29);

    y = 45;
    doc.setTextColor(0, 0, 0);

    // Titulo comprobante
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(102, 0, 0);
    doc.text(mov.factura || "COMPROBANTE DE VENTA", 105, y, {
        align: "center",
    });
    y += 6;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${mov.id}`, 105, y, { align: "center" });
    y += 10;

    lineaH();

    // Info venta
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA VENTA", margen, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    const fecha = new Date(mov.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    doc.text(`Fecha: ${fecha}`, margen, y);
    doc.text(`Estado: ${mov.estado}`, 110, y);
    y += 5;
    doc.text(`Vendedor: ${mov.vendedor || "-"}`, margen, y);
    doc.text(`Pago: ${mov.condicionPago || "-"}`, 110, y);
    y += 10;

    lineaH();

    // Info cliente
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", margen, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${mov.cliente}`, margen, y);
    y += 5;
    doc.text(`Documento: ${mov.nit || "-"}`, margen, y);
    y += 10;

    lineaH();

    // Tabla productos
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE PRODUCTOS", margen, y);
    y += 6;

    // Header tabla
    doc.setFillColor(240, 240, 240);
    doc.rect(margen, y - 4, 170, 8, "F");
    doc.setFontSize(8);
    doc.text("Producto", margen + 2, y);
    doc.text("Cant.", 130, y);
    doc.text("Precio", 148, y);
    doc.text("Subtotal", 168, y);
    y += 6;

    doc.setFont("helvetica", "normal");

    if (mov.productos && mov.productos.length > 0) {
        mov.productos.forEach((p) => {
            doc.text(p.nombre.substring(0, 40), margen + 2, y);
            doc.text(String(p.cantidad), 132, y);
            doc.text(`S/. ${Number(p.precio).toFixed(2)}`, 146, y);
            doc.text(`S/. ${Number(p.subtotal).toFixed(2)}`, 166, y);
            y += 6;
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        });
    } else {
        doc.setTextColor(150, 150, 150);
        doc.text("Sin detalle de productos", margen + 2, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
    }

    y += 4;
    lineaH();

    // Totales
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, 140, y);
    doc.text(`S/. ${Number(mov.subtotal).toFixed(2)}`, 175, y, {
        align: "right",
    });
    y += 5;

    doc.text(`IGV (18%):`, 140, y);
    doc.text(`S/. ${Number(mov.iva).toFixed(2)}`, 175, y, { align: "right" });
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(102, 0, 0);
    doc.text(`TOTAL:`, 140, y);
    doc.text(`S/. ${Number(mov.total).toFixed(2)}`, 175, y, { align: "right" });
    y += 12;

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Gracias por su compra — CIXOIL S.A.C.", 105, y, {
        align: "center",
    });
    y += 5;
    doc.text(
        `Documento generado el ${new Date().toLocaleDateString("es-PE")}`,
        105,
        y,
        { align: "center" },
    );

    doc.save(`factura-${mov.id}.pdf`);
};
