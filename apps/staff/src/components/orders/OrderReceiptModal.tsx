import React, { useRef, useState, useEffect } from 'react';
import { OrderDto, SystemSettingsDto } from '@libreriard/shared';
import { toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Printer, Download, Copy, Image as ImageIcon, Check, FileText, AlertCircle } from 'lucide-react';
import { SettingsService } from '../../services/settings.service';

interface Props {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ADDRESS = 'Montevideo 949, B1617 Gral. Pacheco, Provincia de Buenos Aires';
const DEFAULT_PHONE = '+54 9 11 3884-6058';
const DEFAULT_EMAIL = 'libreriard@yahoo.com.ar';

export const OrderReceiptModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const receiptRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedPdf, setCopiedPdf] = useState(false);
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettingsDto | null>(null);

  useEffect(() => {
    new SettingsService().getSettings().then((res) => {
      if (res.success && res.data) setSettings(res.data);
    }).catch(() => {});
  }, []);

  const storeAddress = settings?.footerContact?.address || DEFAULT_ADDRESS;
  const storePhone = settings?.footerContact?.phone || DEFAULT_PHONE;
  const storeEmail = DEFAULT_EMAIL;
  const bankDetails = settings?.bankTransferDetails || {
    bankName: 'BANCO CREDICOOP',
    accountHolder: 'RUBEN DARIO DEGET Y SERGIO EZEQUIEL DEGET SH',
    cuitCuil: '30714624411',
    cbu: '1910197455019700872596',
    alias: 'ogro.caso.ruina',
    accountType: 'Cuenta Corriente'
  };

  const advance = order.advancePayment || 0;
  const balance = order.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, order.total - advance);

  const buildSummaryText = (): string => {
    return `LIBRERÍA RUBÉN DARÍO
Orden #${order.orderNumber} (${order.orderType === 'WHOLESALE' ? 'VENTA MAYORISTA' : 'VENTA MINORISTA'})
Fecha: ${new Date(order.createdAt).toLocaleDateString('es-AR')}
Cliente: ${order.customer.name || 'Consumidor Final'}${order.customer.cuitCuil ? ` (CUIT: ${order.customer.cuitCuil})` : ''}
Contacto: ${storeAddress} | Tel/WA: ${storePhone} | ${storeEmail}

DETALLE:
${order.items.map((it) => `- ${it.quantity}x ${it.productName}: $${it.unitPrice.toLocaleString('es-AR')} c/u = $${it.subtotal.toLocaleString('es-AR')}`).join('\n')}

Subtotal: $${order.subtotal.toLocaleString('es-AR')}
TOTAL: $${order.total.toLocaleString('es-AR')}
${advance > 0 ? `Adelanto: $${advance.toLocaleString('es-AR')}\nSaldo Pendiente: $${balance.toLocaleString('es-AR')}\n` : ''}
DATOS BANCARIOS:
${bankDetails.bankName} - ${bankDetails.accountType}
CBU: ${bankDetails.cbu} | Alias: ${bankDetails.alias}
Titular: ${bankDetails.accountHolder}

*Este documento no es válido como factura. Los precios cotizados se mantienen vigentes por 5 días hábiles a partir de la fecha de emisión. Pedidos se realizan una vez señados. Productos sujetos a disponibilidad.*`;
  };

  // Uses html-to-image (SVG foreignObject) for 100% native browser rasterization with no canvas baseline bugs
  const generateImageDataUrl = async (): Promise<string | null> => {
    if (!receiptRef.current) return null;
    return await toPng(receiptRef.current, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  };

  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;
    return await toBlob(receiptRef.current, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  };

  const generatePdfBlob = async (): Promise<{ pdf: jsPDF; blob: Blob; file: File } | null> => {
    const dataUrl = await generateImageDataUrl();
    if (!dataUrl) return null;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 8;
    const printWidth = pdfWidth - margin * 2;

    const element = receiptRef.current;
    const aspect = element ? element.offsetHeight / element.offsetWidth : 1.4;
    const printHeight = printWidth * aspect;

    pdf.addImage(dataUrl, 'PNG', margin, margin, printWidth, printHeight);
    const blob = pdf.output('blob');
    const file = new File([blob], `orden-${order.orderNumber}.pdf`, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });

    return { pdf, blob, file };
  };

  // Direct PDF print via hidden iframe to avoid printing HTML modal buttons/chrome
  const handlePrint = async () => {
    setLoadingAction('print');
    try {
      const generated = await generatePdfBlob();
      if (!generated) return;
      const blobUrl = URL.createObjectURL(generated.blob);

      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.src = blobUrl;
      document.body.appendChild(printFrame);

      printFrame.onload = () => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          const printWin = window.open(blobUrl);
          printWin?.print();
        }
        setTimeout(() => {
          try {
            document.body.removeChild(printFrame);
            URL.revokeObjectURL(blobUrl);
          } catch {}
        }, 60000);
      };
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadPdf = async () => {
    setLoadingAction('pdf');
    try {
      const generated = await generatePdfBlob();
      if (!generated) return;
      generated.pdf.save(`orden-${order.orderNumber}.pdf`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Copies the actual PDF file object (or shares it natively). Never copies text to the clipboard here.
  const handleCopyPdf = async () => {
    setLoadingAction('copyPdf');
    setPdfNotice(null);
    try {
      const generated = await generatePdfBlob();
      if (!generated) return;
      const { file, blob, pdf } = generated;

      let fileCopied = false;

      // 1. Attempt writing standard ClipboardItem with application/pdf (File object)
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const clipboardItem = new ClipboardItem({
            'application/pdf': file,
          });
          await navigator.clipboard.write([clipboardItem]);
          fileCopied = true;
        } catch {
          // Fallback attempt with blob directly
          try {
            const clipboardItem = new ClipboardItem({
              'application/pdf': blob,
            });
            await navigator.clipboard.write([clipboardItem]);
            fileCopied = true;
          } catch {}
        }
      }

      // 2. If standard clipboard API rejects application/pdf, attempt Web Share API
      // Web Share API on Windows 10/11 allows copying the file natively or sharing to WhatsApp/Mail
      if (!fileCopied && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Orden #${order.orderNumber}.pdf`,
          });
          fileCopied = true;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return; // User canceled the share window
          }
        }
      }

      if (fileCopied) {
        setCopiedPdf(true);
        setTimeout(() => setCopiedPdf(false), 3000);
      } else {
        // When the browser sandboxing strictly prevents arbitrary file copying to OS clipboard:
        // Automatically download the file to the user's disk so they have it immediately,
        // and notify them clearly instead of copying plain text or failing silently.
        pdf.save(`orden-${order.orderNumber}.pdf`);
        setPdfNotice('El navegador no permite copiar archivos PDF directamente al portapapeles por seguridad. Se descargó el archivo PDF a tu equipo.');
        setTimeout(() => setPdfNotice(null), 6000);
      }
    } catch (err) {
      console.error('Error al procesar PDF:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setLoadingAction('image');
    try {
      const dataUrl = await generateImageDataUrl();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `orden-${order.orderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopyImage = async () => {
    if (!receiptRef.current || !navigator.clipboard) return;
    setLoadingAction('copyImage');
    try {
      const blob = await generateImageBlob();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopySummaryText = async () => {
    await navigator.clipboard.writeText(buildSummaryText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-3.5 space-y-3 my-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Comprobante de Orden #{order.orderNumber}</span>
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Notice banner when PDF cannot be copied directly to clipboard due to browser security */}
        {pdfNotice && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] px-3 py-2 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span>{pdfNotice}</span>
            </div>
            <button onClick={() => setPdfNotice(null)} className="text-amber-400 hover:text-white shrink-0 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Printable/Exportable DOM Container - Rendered via html-to-image (SVG foreignObject) */}
        <div
          ref={receiptRef}
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {/* Header Table: Logo + Business Info (Left) | Order # + Date + Badge (Right) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #cbd5e1', margin: 0, padding: 0 }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'middle', padding: '0 0 5px 0' }}>
                  <table style={{ borderCollapse: 'collapse', margin: 0, padding: 0 }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                          <img
                            src="/logo.png"
                            alt="Librería Rubén Darío"
                            style={{ width: '34px', height: '34px', objectFit: 'contain', display: 'inline-block' }}
                          />
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', lineHeight: '16px', margin: 0, letterSpacing: '-0.02em' }}>
                            LIBRERÍA RUBÉN DARÍO
                          </div>
                          <div style={{ fontSize: '8px', color: '#475569', lineHeight: '11px', margin: '2px 0 0 0' }}>
                            {storeAddress}
                          </div>
                          <div style={{ fontSize: '8px', color: '#64748b', lineHeight: '11px', margin: '1px 0 0 0' }}>
                            Tel/WA (solo mensajes): <span style={{ fontWeight: 600, color: '#334155' }}>{storePhone}</span> • {storeEmail}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'right', padding: '0 0 5px 0', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11.5px', fontWeight: 800, color: '#0e7490', lineHeight: '13px', margin: 0 }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b', lineHeight: '11px', margin: '1px 0 0 0' }}>
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </div>
                  <div style={{ margin: '3px 0 0 0' }}>
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #94a3b8',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '8px',
                      fontWeight: 800,
                      color: '#1e293b',
                      lineHeight: '10px',
                      textAlign: 'center',
                      letterSpacing: '0.03em'
                    }}>
                      {order.orderType === 'WHOLESALE' ? 'VENTA MAYORISTA' : 'VENTA MINORISTA'}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Customer & Delivery Box */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            margin: '5px 0 0 0',
            padding: 0
          }}>
            <tbody>
              <tr>
                <td style={{ width: '60%', verticalAlign: 'top', padding: '4px 6px' }}>
                  <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', lineHeight: '9px', margin: 0 }}>
                    CLIENTE
                  </div>
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0f172a', lineHeight: '12px', margin: '1px 0 0 0' }}>
                    {order.customer.name || 'Consumidor Final'}
                  </div>
                  {order.customer.cuitCuil && (
                    <div style={{ fontSize: '8px', fontFamily: 'monospace', color: '#475569', lineHeight: '10px', margin: '1px 0 0 0' }}>
                      CUIT: {order.customer.cuitCuil}
                    </div>
                  )}
                </td>
                <td style={{ width: '40%', verticalAlign: 'top', textAlign: 'right', padding: '4px 6px' }}>
                  <div style={{ fontSize: '7.5px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', lineHeight: '9px', margin: 0 }}>
                    PAGO / ENTREGA
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#1e293b', lineHeight: '12px', margin: '1px 0 0 0' }}>
                    {order.paymentMethod}
                  </div>
                  <div style={{ fontSize: '8px', color: '#475569', lineHeight: '10px', margin: '1px 0 0 0' }}>
                    {order.deliveryMethod}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items Table (Ultra compact) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', margin: '5px 0 0 0', padding: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '7.5px', textTransform: 'uppercase', fontWeight: 800 }}>
                <th style={{ textAlign: 'left', padding: '2.5px 0' }}>PRODUCTO</th>
                <th style={{ textAlign: 'center', padding: '2.5px 0', width: '38px' }}>CANT.</th>
                <th style={{ textAlign: 'right', padding: '2.5px 0', width: '70px' }}>P. UNIT.</th>
                <th style={{ textAlign: 'right', padding: '2.5px 0', width: '75px' }}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '2px 4px 2px 0', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: '11px' }}>{item.productName}</div>
                    {item.discountApplied && (
                      <div style={{ fontSize: '7px', color: '#059669', fontWeight: 800, lineHeight: '9px' }}>Desc. volumen aplicado</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '2px 0', fontWeight: 600, verticalAlign: 'middle' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '2px 0', fontFamily: 'monospace', verticalAlign: 'middle' }}>${item.unitPrice.toLocaleString('es-AR')}</td>
                  <td style={{ textAlign: 'right', padding: '2px 0', fontFamily: 'monospace', fontWeight: 800, verticalAlign: 'middle' }}>${item.subtotal.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', margin: '4px 0 0 0', borderTop: '1px solid #cbd5e1' }}>
            <tbody>
              <tr>
                <td style={{ padding: '1.5px 0', color: '#475569' }}>Subtotal:</td>
                <td style={{ padding: '1.5px 0', textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>${order.subtotal.toLocaleString('es-AR')}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #e2e8f0', fontWeight: 900, fontSize: '10.5px', color: '#0f172a' }}>
                <td style={{ padding: '2.5px 0' }}>Total:</td>
                <td style={{ padding: '2.5px 0', textAlign: 'right', fontFamily: 'monospace' }}>${order.total.toLocaleString('es-AR')}</td>
              </tr>
              {advance > 0 && (
                <>
                  <tr style={{ color: '#047857', fontWeight: 600 }}>
                    <td style={{ padding: '1.5px 0' }}>Adelanto abonado:</td>
                    <td style={{ padding: '1.5px 0', textAlign: 'right', fontFamily: 'monospace' }}>-${advance.toLocaleString('es-AR')}</td>
                  </tr>
                  <tr style={{ color: '#be123c', fontWeight: 800, borderTop: '1px solid #ffe4e6' }}>
                    <td style={{ padding: '1.5px 0' }}>Saldo pendiente:</td>
                    <td style={{ padding: '1.5px 0', textAlign: 'right', fontFamily: 'monospace' }}>${balance.toLocaleString('es-AR')}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* Bank Transfer Details */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            margin: '5px 0 0 0',
            padding: 0
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 6px', fontSize: '7.5px', color: '#475569' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '7px', lineHeight: '9px', margin: '0 0 1.5px 0' }}>
                    DATOS BANCARIOS PARA TRANSFERENCIA
                  </div>
                  <div style={{ lineHeight: '10px', margin: '0 0 1px 0' }}>
                    <strong style={{ color: '#0f172a' }}>{bankDetails.bankName}</strong> ({bankDetails.accountType}) • <strong style={{ color: '#0f172a' }}>Titular:</strong> {bankDetails.accountHolder}
                  </div>
                  <div style={{ lineHeight: '10px', fontFamily: 'monospace', margin: 0 }}>
                    <strong style={{ color: '#0f172a' }}>CBU:</strong> {bankDetails.cbu} • <strong style={{ color: '#0f172a' }}>Alias:</strong> {bankDetails.alias}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Disclaimer (Ultra compact) */}
          <div style={{
            borderTop: '1px dashed #cbd5e1',
            margin: '4px 0 0 0',
            paddingTop: '3px',
            fontSize: '7px',
            color: '#64748b',
            textAlign: 'center',
            lineHeight: '9.5px'
          }}>
            <div style={{ margin: 0 }}>
              Este documento no es válido como factura. Precios cotizados válidos por 5 días hábiles a partir de la emisión.
            </div>
            <div style={{ fontWeight: 600, color: '#475569', margin: '1px 0 0 0' }}>
              Pedidos se realizan una vez señados. • Productos sujetos a disponibilidad.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={handleDownloadPdf}
            disabled={loadingAction === 'pdf'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title="Descargar archivo PDF"
          >
            <Download size={13} className="text-cyan-400" />
            <span>{loadingAction === 'pdf' ? 'Descargando...' : 'Descargar PDF'}</span>
          </button>

          <button
            onClick={handleCopyPdf}
            disabled={loadingAction === 'copyPdf'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title="Copiar o compartir archivo PDF"
          >
            {copiedPdf ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">¡PDF Copiado!</span>
              </>
            ) : (
              <>
                <FileText size={13} className="text-indigo-400" />
                <span>{loadingAction === 'copyPdf' ? 'Procesando...' : 'Copiar PDF'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={loadingAction === 'image'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title="Descargar imagen PNG"
          >
            <ImageIcon size={13} className="text-amber-400" />
            <span>{loadingAction === 'image' ? 'Descargando...' : 'Descargar Img'}</span>
          </button>

          <button
            onClick={handleCopyImage}
            disabled={loadingAction === 'copyImage'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title="Copiar imagen PNG al portapapeles"
          >
            {copiedImage ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">¡Imagen Copiada!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-emerald-400" />
                <span>{loadingAction === 'copyImage' ? 'Copiando...' : 'Copiar Img'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopySummaryText}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            title="Copiar texto resumen para WhatsApp"
          >
            {copiedText ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">¡Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={loadingAction === 'print'}
            className="p-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            title="Imprimir documento PDF"
          >
            <Printer size={13} />
            <span>{loadingAction === 'print' ? 'Preparando...' : 'Imprimir PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
