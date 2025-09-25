import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ToWords } from 'to-words';

const toWords = new ToWords({
  localeCode: 'pl-PL',
  converterOptions: { currency: false, ignoreDecimal: true },
});

function asNum(v: any): number {
  if (v && typeof v.toNumber === 'function') return v.toNumber(); // Prisma Decimal
  return Number(v);
}

function numToWordsPL(n: number): string {
  const jednostki = [
    'zero',
    'jeden',
    'dwa',
    'trzy',
    'cztery',
    'pięć',
    'sześć',
    'siedem',
    'osiem',
    'dziewięć',
  ];
  const nastki = [
    'dziesięć',
    'jedenaście',
    'dwanaście',
    'trzynaście',
    'czternaście',
    'piętnaście',
    'szesnaście',
    'siedemnaście',
    'osiemnaście',
    'dziewiętnaście',
  ];
  const dziesiatki = [
    '',
    '',
    'dwadzieścia',
    'trzydzieści',
    'czterdzieści',
    'pięćdziesiąt',
    'sześćdziesiąt',
    'siedemdziesiąt',
    'osiemdziesiąt',
    'dziewięćdziesiąt',
  ];
  const setki = [
    '',
    'sto',
    'dwieście',
    'trzysta',
    'czterysta',
    'pięćset',
    'sześćset',
    'siedemset',
    'osiemset',
    'dziewięćset',
  ];
  if (n === 0) return 'zero';
  let words = '';
  if (Math.floor(n / 1000) > 0) {
    const tys = Math.floor(n / 1000);
    if (tys === 1) words += 'tysiąc ';
    else if (
      tys % 10 >= 2 &&
      tys % 10 <= 4 &&
      (tys % 100 < 10 || tys % 100 >= 20)
    )
      words += `${numToWordsPL(tys)} tysiące `;
    else words += `${numToWordsPL(tys)} tysięcy `;
    n %= 1000;
  }
  if (Math.floor(n / 100) > 0) {
    words += setki[Math.floor(n / 100)] + ' ';
    n %= 100;
  }
  if (n >= 10 && n < 20) {
    words += nastki[n - 10] + ' ';
  } else {
    if (Math.floor(n / 10) > 0) words += dziesiatki[Math.floor(n / 10)] + ' ';
    if (n % 10 > 0) words += jednostki[n % 10] + ' ';
  }
  return words.trim();
}

function zlSuffix(n: number): string {
  if (n === 1) return 'złoty';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return 'złote';
  return 'złotych';
}

const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  generateInvoicePDF(invoice: any, res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    // Nagłówki – możesz je też ustawiać w kontrolerze, ale tu nie zaszkodzą:
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=faktura-${invoice?.number ?? 'pdf'}.pdf`,
    );

    // Proste pipe – bez PassThrough
    doc.pipe(res);

    try {
      // Fallback czcionki (Helvetica gdy brak pliku)
      const fontPath = path.join(
        process.cwd(),
        'src',
        'pdf',
        'fonts',
        'DejaVuSans.ttf',
      );
      if (fs.existsSync(fontPath)) {
        doc.registerFont('DejaVu', fontPath);
        doc.font('DejaVu');
      } else {
        doc.font('Helvetica');
      }

      // Walidacja wejścia
      if (
        !invoice ||
        !invoice.user ||
        !invoice.client ||
        !Array.isArray(invoice.items)
      ) {
        throw new Error('Brak wymaganych danych (user/client/items).');
      }

      const {
        street: sStreet,
        houseNumber: sHouseNumber,
        postalCode: sPostalCode,
        city: sCity,
        fullName,
        companyName,
        nip,
        email,
        bank,
        account,
      } = invoice.user;

      const { street, houseNumber, postalCode, city, name, pesel } =
        invoice.client;

      const sellerAddress = `${sStreet} ${sHouseNumber}, ${sPostalCode} ${sCity}`;
      const clientAddress = `${street} ${houseNumber}, ${postalCode} ${city}`;

      // === RAMKA SPRZEDAWCA ===
      const boxX = 50;
      const boxY = 50;
      const boxWidth = 250;
      const lineHeight = 15;

      const sellerLines = [
        `Imię i nazwisko: ${fullName}`,
        `Firma: ${companyName || '-'}`,
        `NIP: ${nip || '-'}`,
        `Adres: ${sellerAddress}`,
        `Bank: ${bank || '-'}`,
        `Nr konta: ${account || '-'}`,
        `Email: ${email}`,
      ];

      const boxHeight = 25 + sellerLines.length * lineHeight;

      doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
      doc.fontSize(12).text('Sprzedawca', boxX + 5, boxY);

      let textY = boxY + 20;
      sellerLines.forEach((line: string) => {
        doc.fontSize(10).text(line, boxX + 5, textY);
        textY += lineHeight;
      });

      // === NUMER I DATA ===
      const createdAt = new Date(invoice.createdAt);
      const createdAtStr = !isNaN(createdAt.getTime())
        ? createdAt.toLocaleDateString('pl-PL')
        : '-';

      doc
        .fontSize(12)
        .text(`Faktura nr: ${invoice.number ?? '-'}`, 350, 50)
        .text(`Data wystawienia: ${createdAtStr}`, 350);

      // === ODBIORCA FAKTURY ===
      let y = boxY + boxHeight + 30;

      doc.fontSize(12).text('Odbiorca faktury:', 50, y);
      y += 20;

      const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
      const dueStr =
        due && !isNaN(due.getTime()) ? due.toLocaleDateString('pl-PL') : '-';

      doc.fontSize(10).text(`Imię i nazwisko: ${name}`, 50, y);
      y += 15;
      doc.text(`Adres: ${clientAddress}`, 50, y);
      y += 15;
      doc.text(`PESEL: ${pesel || '-'}`, 50, y);
      y += 15;
      doc.text(`Forma płatności: ${invoice.paymentMethod || '-'}`, 50, y);
      y += 15;
      doc.text(`Termin płatności: ${dueStr}`, 50, y);
      y += 15;

      const amount = asNum(invoice.amount);
      doc.text(`Kwota do zapłaty: ${amount.toFixed(2)} PLN`, 50, y);
      y += 15;
      doc.text(`Status: ${invoice.status}`, 50, y);

      // === TABELA POZYCJI FAKTURY ===
      doc.moveDown().moveDown();
      doc.fontSize(14).text('Pozycje faktury:');

      const tableTop = doc.y + 20;
      const columnPositions = [50, 80, 250, 300, 350, 450];
      const columnWidths = [30, 170, 50, 50, 100, 100];
      const rowHeight = 20;

      const drawCell = (
        x: number,
        y: number,
        width: number,
        height: number,
      ) => {
        doc.rect(x, y, width, height).stroke();
      };

      const drawRow = (row: string[], y: number) => {
        row.forEach((text, i) => {
          drawCell(columnPositions[i], y, columnWidths[i], rowHeight);
          doc.fontSize(10).text(text, columnPositions[i] + 5, y + 5, {
            width: columnWidths[i] - 10,
          });
        });
      };

      const headers = [
        'Lp.',
        'Nazwa usługi',
        'Ilość',
        'J.m.',
        'Cena',
        'Wartość',
      ];
      drawRow(headers, tableTop);

      let positionY = tableTop + rowHeight;
      let sum = 0;

      invoice.items.forEach((item: any, index: number) => {
        if (positionY + rowHeight > doc.page.height - 50) {
          doc.addPage();
          positionY = 50;
          drawRow(headers, positionY);
          positionY += rowHeight;
        }

        const qty = asNum(item.quantity);
        const price = asNum(item.price);
        const total = asNum(item.total);

        const row = [
          String(index + 1),
          item.name ?? '',
          qty.toFixed(2),
          item.unit ?? '',
          `${price.toFixed(2)} PLN`,
          `${total.toFixed(2)} PLN`,
        ];

        drawRow(row, positionY);
        sum += total;
        positionY += rowHeight;
      });

      if (positionY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        positionY = 50;
      }

      // Suma tabeli
      drawCell(350, positionY, 100, rowHeight);
      drawCell(450, positionY, 100, rowHeight);
      doc.fontSize(10).text('Suma:', 355, positionY + 5);
      doc.fontSize(10).text(`${sum.toFixed(2)} PLN`, 455, positionY + 5);

      // === PODSUMOWANIE ===
      const [zlStr, gr] = amount.toFixed(2).split('.');
      const zl = parseInt(zlStr, 10);
      const totalAmountText = `${numToWordsPL(zl)} ${zlSuffix(zl)} ${gr}/100 PLN`;
      positionY += 40;

      doc.fontSize(10).text(`Razem: ${amount.toFixed(2)} PLN`, 50, positionY);
      positionY += 15;
      doc.text(`Słownie: ${totalAmountText}`, 50, positionY);
      positionY += 15;
      doc.text(`Zapłacono: 0.00 PLN`, 50, positionY);
      positionY += 15;
      doc.text(`Pozostało do zapłaty: ${amount.toFixed(2)} PLN`, 50, positionY);

      // Linie podpisów
      positionY += 60;
      const lineLength = 150;
      const pageWidth = doc.page.width;
      const leftLineX = 80;
      const rightLineX = pageWidth - 80 - lineLength;

      doc
        .moveTo(leftLineX, positionY)
        .lineTo(leftLineX + lineLength, positionY)
        .stroke();
      doc
        .moveTo(rightLineX, positionY)
        .lineTo(rightLineX + lineLength, positionY)
        .stroke();

      positionY += 5;
      doc
        .fontSize(10)
        .text(
          'podpis osoby upoważnionej do odbioru rachunku',
          leftLineX,
          positionY + 5,
          { width: lineLength, align: 'center' },
        );
      doc
        .fontSize(10)
        .text(
          'podpis osoby upoważnionej do wystawienia rachunku',
          rightLineX,
          positionY + 5,
          { width: lineLength, align: 'center' },
        );
    } catch (err: any) {
      console.error('Błąd generowania PDF:', err?.message ?? err);
      try {
        doc.fontSize(14).text('Nie udało się wygenerować PDF.', 50, 50);
      } catch {}
    } finally {
      doc.end(); // ZAWSZE domknij dokument (nawet przy błędzie)
    }
  }
}
