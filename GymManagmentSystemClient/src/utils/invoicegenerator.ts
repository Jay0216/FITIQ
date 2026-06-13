// src/utils/invoiceGenerator.ts
//
// Generates and auto-downloads a styled A4 invoice PDF using jsPDF.
// No backend, no image assets required — runs entirely in the browser.
//
// Install:  npm install jspdf
//           npm install --save-dev @types/jspdf

import jsPDF from 'jspdf';
import type { PaymentTransaction } from '../API/paymentAPI';

// ─── Public interface ─────────────────────────────────────────────────────────

export interface InvoiceData {
  transaction:  PaymentTransaction;
  memberName:   string;   // cardholder name used as fallback
  memberId:     string;
  planName:     string;   // e.g. "Standard Membership"
  gymName?:     string;   // defaults to "FitZone Gym"
  gymAddress?:  string;
  gymPhone?:    string;
  gymEmail?:    string;
}

// ─── Colour palette ───────────────────────────────────────────────────────────

type RGB = [number, number, number];
const C: Record<string, RGB> = {
  primary:     [255, 107,  53],
  dark:        [ 18,  18,  18],
  darkAccent:  [ 40,  40,  40],
  textPrimary: [ 15,  15,  15],
  textMuted:   [120, 120, 120],
  border:      [225, 225, 225],
  success:     [ 22, 163,  74],
  white:       [255, 255, 255],
  bgLight:     [248, 248, 248],
  infoTint:    [240, 247, 255],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lkr = (n: number) => `Rs. ${n.toLocaleString('en-LK')}`;

const longDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

// ─── Main generator ───────────────────────────────────────────────────────────

export const downloadInvoice = (data: InvoiceData): void => {
  const doc      = new jsPDF({ unit: 'mm', format: 'a4' });
  const W        = 210;                        // A4 width
  const pad      = 20;                         // page side padding
  const gymName  = data.gymName    ?? 'FitIQ Gym';
  const address  = data.gymAddress ?? 'Kandy, Sri Lanka';
  const refShort = data.transaction.id.slice(-8).toUpperCase();

  // ── 1. Dark header ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 46, 'F');

  // Styled text logo — large gym name with orange first letter
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);

  // Draw first letter in primary orange
  doc.setTextColor(...C.primary);
  doc.text(gymName.charAt(0), pad, 20);

  // Draw rest of name in white
  // Measure first letter width to offset the rest
  const firstLetterW = doc.getTextWidth(gymName.charAt(0));
  doc.setTextColor(...C.white);
  doc.text(gymName.slice(1), pad + firstLetterW, 20);

  // Thin orange underline beneath gym name as brand accent
  const fullNameW = doc.getTextWidth(gymName);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.8);
  doc.line(pad, 22.5, pad + fullNameW, 22.5);

  // Address / contact line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(170, 170, 170);
  const contactParts = [address];
  if (data.gymPhone) contactParts.push(data.gymPhone);
  if (data.gymEmail) contactParts.push(data.gymEmail);
  doc.text(contactParts.join('  ·  '), pad, 30);

  // "INVOICE" label right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.primary);
  doc.text('INVOICE', W - pad, 19, { align: 'right' });

  // Invoice ref number beneath label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 160);
  doc.text(`# ${refShort}`, W - pad, 27, { align: 'right' });

  // ── 2. Orange accent bar ────────────────────────────────────────────────────
  doc.setFillColor(...C.primary);
  doc.rect(0, 46, W, 2.5, 'F');

  // ── 3. Bill-to / Invoice-date two-column row ────────────────────────────────
  let y = 64;

  // Left — member
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('BILLED TO', pad, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.textPrimary);
  doc.text(data.memberName, pad, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text(`Member ID: ${data.memberId}`, pad, y + 15);

  // Right — date + status
  const rx = W - pad;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('INVOICE DATE', rx, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.textPrimary);
  doc.text(longDate(data.transaction.transactionDate), rx, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('STATUS', rx, y + 17, { align: 'right' });

  // Green PAID pill
  const bW = 20, bH = 7;
  doc.setFillColor(...C.success);
  doc.roundedRect(rx - bW, y + 20, bW, bH, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text('PAID', rx - bW / 2, y + 24.8, { align: 'center' });

  y += 40;

  // ── 4. Section divider ──────────────────────────────────────────────────────
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(pad, y, W - pad, y);
  y += 10;

  // ── 5. Table header ─────────────────────────────────────────────────────────
  doc.setFillColor(...C.bgLight);
  doc.rect(pad, y, W - pad * 2, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  doc.text('DESCRIPTION',   pad + 4,    y + 6);
  doc.text('BILLING',       pad + 100,  y + 6);
  doc.text('AMOUNT (LKR)',  W - pad - 4, y + 6, { align: 'right' });
  y += 9;

  // ── 6. Line item ────────────────────────────────────────────────────────────
  doc.setFillColor(...C.white);
  doc.rect(pad, y, W - pad * 2, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.textPrimary);
  doc.text(data.planName, pad + 4, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text('Monthly', pad + 100, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.textPrimary);
  doc.text(lkr(data.transaction.amount), W - pad - 4, y + 9, { align: 'right' });

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(pad, y + 14, W - pad, y + 14);
  y += 26;

  // ── 7. Totals box ───────────────────────────────────────────────────────────
  const tbX = W - pad - 74;
  doc.setFillColor(...C.bgLight);
  doc.roundedRect(tbX, y, 74, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text('Subtotal',  tbX + 5,  y + 8);
  doc.text('Tax (0%)',  tbX + 5,  y + 16);
  doc.text(lkr(data.transaction.amount), tbX + 69, y + 8,  { align: 'right' });
  doc.text('Rs. 0',                      tbX + 69, y + 16, { align: 'right' });

  // Divider inside totals box
  doc.setDrawColor(...C.border);
  doc.line(tbX + 5, y + 20, tbX + 69, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.textPrimary);
  doc.text('Total',                      tbX + 5,  y + 26);
  doc.text(lkr(data.transaction.amount), tbX + 69, y + 26, { align: 'right' });

  y += 40;

  // ── 8. Reference info box ───────────────────────────────────────────────────
  doc.setFillColor(...C.infoTint);
  doc.roundedRect(pad, y, W - pad * 2, 24, 2, 2, 'F');

  // Left: transaction ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('TRANSACTION ID', pad + 5, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textPrimary);
  doc.text(data.transaction.id, pad + 5, y + 16);

  // Right: subscription ID
  const halfX = pad + (W - pad * 2) / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.textMuted);
  doc.text('SUBSCRIPTION ID', halfX, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.textPrimary);
  doc.text(data.transaction.subscriptionId, halfX, y + 16);

  y += 34;

  // ── 9. Thank-you note ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...C.textMuted);
  doc.text(
    'Thank you for being a valued member. See you at the gym!',
    W / 2, y, { align: 'center' }
  );

  // ── 10. Footer bar ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 277, W, 20, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`${gymName}  ·  ${address}`, W / 2, 285, { align: 'center' });
  doc.text(
    'This is a computer-generated invoice and does not require a signature.',
    W / 2, 291, { align: 'center' }
  );

  // ── Save ────────────────────────────────────────────────────────────────────
  doc.save(`Invoice-${refShort}.pdf`);
};