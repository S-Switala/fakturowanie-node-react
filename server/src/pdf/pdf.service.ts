import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import { Response } from 'express';
import * as path from 'path';

@Injectable()
export class PdfService {
  generateInvoicePDF(invoice: any, res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    try {
      const {
        street,
        houseNumber,
        postalCode,
        city,
        name,
        pesel,
        paymentMethod,
      } = invoice.client;
      const {
        fullName,
        companyName,
        nip,
        email,
        phone,
        bank,
        account,
        street: sStreet,
        houseNumber: sHouseNumber,
        postalCode: sPostalCode,
        city: sCity,
      } = invoice.user;

      const sellerAddress = `${sStreet} ${sHouseNumber}, ${sPostalCode} ${sCity}`;
      const clientAddress = `${street} ${houseNumber}, ${postalCode} ${city}`;

      const fontPath = path.join(
        process.cwd(),
        'src',
        'pdf',
        'fonts',
        'DejaVuSans.ttf',
      );

      doc.registerFont('DejaVu', fontPath);
      doc.font('DejaVu');

      // Start piping
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=faktura.pdf');
      doc.pipe(res);

      // -- WYSTAWCA (LEWA)
      doc
        .fontSize(12)
        .text('Wystawca:', 50, 50)
        .text(`Imię i nazwisko: ${fullName}`, 50)
        .text(`Firma: ${companyName}`, 50)
        .text(`NIP: ${nip}`, 50)
        .text(`Adres: ${sellerAddress}`, 50)
        .text(`Bank: ${bank || '-'}`, 50)
        .text(`Nr konta: ${account || '-'}`, 50)
        .text(`Telefon: ${phone || '-'}`, 50)
        .text(`Email: ${email}`, 50);

      // -- NUMER I DATA (PRAWA GÓRA)
      doc
        .fontSize(12)
        .text(`Faktura nr: ${invoice.number}`, 350, 50)
        .text(
          `Data wystawienia: ${new Date(invoice.createdAt).toLocaleDateString('pl-PL')}`,
          350,
        );

      // -- TYTUŁ I RESZTA (POD KONTENERAMI)
      const contentTop = 190;

      doc
        .fontSize(16)
        .text(`Tytuł: ${invoice.title}`, 50, contentTop, { underline: true });

      let y = contentTop + 30;

      doc.fontSize(12).text('Odbiorca faktury:', 50, y);
      y += 20;

      doc.text(`Imię i nazwisko: ${name}`, 50, y);
      y += 15;
      doc.text(`Adres: ${clientAddress}`, 50, y);
      y += 15;
      doc.text(`PESEL: ${pesel || '-'}`, 50, y);
      y += 15;
      doc.text(`Forma płatności: ${paymentMethod || '-'}`, 50, y);
      y += 15;
      doc.text(
        `Termin płatności: ${new Date(invoice.dueDate).toLocaleDateString('pl-PL')}`,
        50,
        y,
      );
      y += 15;
      doc.text(`Kwota do zapłaty: ${invoice.amount} PLN`, 50, y);
      y += 15;
      doc.text(`Status: ${invoice.status}`, 50, y);

      doc.end();
    } catch (err) {
      console.error('Błąd generowania PDF:', err);
      if (!res.headersSent) {
        res.status(500).send('Błąd podczas generowania PDF');
      }
    }
  }
}
