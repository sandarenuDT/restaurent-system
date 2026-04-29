import QRCode from 'qrcode';

export const generateQRCode = async (tableId: string): Promise<string> => {
  const url = `${process.env.FRONTEND_URL}/menu?table=${tableId}`;
  return QRCode.toDataURL(url, { width: 300, margin: 2 });
};