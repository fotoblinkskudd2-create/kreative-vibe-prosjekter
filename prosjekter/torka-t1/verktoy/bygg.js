// Bygger designpitchen til .docx og .md fra samme innholdsmodell.
// Bruk: node verktoy/bygg.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, Footer, PageNumber, LevelFormat, convertInchesToTwip,
} = require('docx');

const { meta, innhold } = require('./innhold.js');

const ROT = path.resolve(__dirname, '..');
const AKSENT = '1F3D33';
const GRA = 'F2F1EE';
const LINJE = 'C9C4BB';

// ─────────────────────────────────────────────── inline-formatering
// Deler tekst pa **fet** og *kursiv* og gir en liste med {t, b, i}.
function biter(s) {
  const ut = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let i = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > i) ut.push({ t: s.slice(i, m.index) });
    if (m[1] !== undefined) ut.push({ t: m[1], b: true });
    else ut.push({ t: m[2], i: true });
    i = m.index + m[0].length;
  }
  if (i < s.length) ut.push({ t: s.slice(i) });
  return ut;
}

const runs = (s, opts = {}) =>
  biter(s).map((d) => new TextRun({ text: d.t, bold: d.b || opts.bold, italics: d.i || opts.italics, ...opts }));

// ─────────────────────────────────────────────── docx-byggeklosser
function celle(tekst, { head = false, bredde, align } = {}) {
  return new TableCell({
    width: { size: bredde, type: WidthType.DXA },
    shading: head ? { type: ShadingType.CLEAR, fill: AKSENT, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 0 },
        children: runs(String(tekst), head ? { bold: true, color: 'FFFFFF', size: 19 } : { size: 19 }),
      }),
    ],
  });
}

function tabell({ head, rows, widths }) {
  const kant = { style: BorderStyle.SINGLE, size: 4, color: LINJE };
  const rader = [
    new TableRow({
      tableHeader: true,
      children: head.map((h, k) =>
        celle(h, { head: true, bredde: widths[k], align: k > 0 && head.length > 2 ? AlignmentType.RIGHT : undefined })),
    }),
    ...rows.map((r, ri) =>
      new TableRow({
        children: r.map((c, k) =>
          celle(c, {
            bredde: widths[k],
            align: k > 0 && r.length > 2 ? AlignmentType.RIGHT : (k > 0 && r.length === 2 ? AlignmentType.RIGHT : undefined),
          })),
      })),
  ];
  return new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: { top: kant, bottom: kant, left: kant, right: kant, insideHorizontal: kant, insideVertical: kant },
    rows: rader,
  });
}

function bildeParagraf(spec) {
  const bilde = fs.readFileSync(path.resolve(__dirname, spec.path));
  const bredde = Math.round((spec.widthCm / 2.54) * 96);
  const hoyde = Math.round(bredde * (1120 / 1660));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new ImageRun({ type: 'png', data: bilde, transformation: { width: bredde, height: hoyde } })],
  });
}

function docxNoder() {
  const ut = [];
  // forside
  ut.push(
    new Paragraph({ spacing: { before: 2200, after: 0 }, children: [new TextRun({ text: meta.tittel, bold: true, size: 72, color: AKSENT })] }),
    new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun({ text: meta.undertittel, size: 30 })] }),
    new Paragraph({ spacing: { before: 60, after: 0 }, children: [new TextRun({ text: meta.linje3, size: 24, color: '5A5A5A' })] }),
    new Paragraph({
      spacing: { before: 260, after: 0 },
      border: { top: { style: BorderStyle.SINGLE, size: 8, color: AKSENT, space: 8 } },
      children: [],
    }),
    new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: meta.rev, size: 20, color: '5A5A5A' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  for (const n of innhold) {
    if (n.pagebreak) { ut.push(new Paragraph({ children: [new PageBreak()] })); continue; }
    if (n.h1) {
      ut.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(n.h1)],
      }));
      continue;
    }
    if (n.h2) {
      ut.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(n.h2)],
      }));
      continue;
    }
    if (n.h3) {
      ut.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun(n.h3)],
      }));
      continue;
    }
    if (n.p) {
      ut.push(new Paragraph({ spacing: { after: 140, line: 300 }, children: runs(n.p, { size: 22 }) }));
      continue;
    }
    if (n.ul) {
      n.ul.forEach((li) => ut.push(new Paragraph({
        numbering: { reference: 'kuler', level: 0 },
        spacing: { after: 90, line: 290 }, children: runs(li, { size: 22 }),
      })));
      continue;
    }
    if (n.ol) {
      n.ol.forEach((li) => ut.push(new Paragraph({
        numbering: { reference: 'tall', level: 0 },
        spacing: { after: 90, line: 290 }, children: runs(li, { size: 22 }),
      })));
      continue;
    }
    if (n.table) {
      ut.push(tabell(n.table));
      ut.push(new Paragraph({ spacing: { after: 180 }, children: [] }));
      continue;
    }
    if (n.img) {
      ut.push(bildeParagraf(n.img));
      ut.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 220 },
        children: [new TextRun({ text: n.img.caption, size: 18, italics: true, color: '5A5A5A' })],
      }));
      continue;
    }
    if (n.callout) {
      n.callout.forEach((avsnitt, k) => ut.push(new Paragraph({
        spacing: { before: k === 0 ? 120 : 0, after: 140, line: 320 },
        indent: { left: 300, right: 300 },
        shading: { type: ShadingType.CLEAR, fill: GRA, color: 'auto' },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: AKSENT, space: 12 } },
        children: runs(avsnitt, { size: 22 }),
      })));
      continue;
    }
  }
  return ut;
}

// ─────────────────────────────────────────────── markdown-rendring
function markdown() {
  const l = [`# ${meta.tittel}`, '', `**${meta.undertittel}**`, '', `${meta.linje3}  `, `${meta.rev}`, ''];
  for (const n of innhold) {
    if (n.h1) l.push('', `## ${n.h1}`, '');
    else if (n.h2) l.push('', `### ${n.h2}`, '');
    else if (n.h3) l.push('', `#### ${n.h3}`, '');
    else if (n.p) l.push(n.p, '');
    else if (n.ul) { n.ul.forEach((x) => l.push(`- ${x}`)); l.push(''); }
    else if (n.ol) { n.ol.forEach((x, i) => l.push(`${i + 1}. ${x}`)); l.push(''); }
    else if (n.callout) { n.callout.forEach((x) => l.push(`> ${x}`, '>')); l.pop(); l.push(''); }
    else if (n.img) l.push(`![${n.img.caption}](${n.img.path.replace('../', '')})`, '', `*${n.img.caption}*`, '');
    else if (n.table) {
      const t = n.table;
      l.push(`| ${t.head.join(' | ')} |`);
      l.push(`|${t.head.map(() => '---').join('|')}|`);
      t.rows.forEach((r) => l.push(`| ${r.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`));
      l.push('');
    }
  }
  return l.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

// ─────────────────────────────────────────────── skriv filer
const doc = new Document({
  creator: 'TORKA',
  title: `${meta.tittel} - ${meta.undertittel}`,
  description: meta.linje3,
  numbering: {
    config: [
      {
        reference: 'kuler',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.28), hanging: convertInchesToTwip(0.18) } } },
        }],
      },
      {
        reference: 'tall',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.30), hanging: convertInchesToTwip(0.20) } } },
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22, color: '1C1C1C' } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Calibri', size: 34, bold: true, color: AKSENT },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0, keepNext: true },
      },
      {
        id: 'Heading2', name: 'heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Calibri', size: 26, bold: true, color: '2C2C2C' },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1, keepNext: true },
      },
      {
        id: 'Heading3', name: 'heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Calibri', size: 23, bold: true, color: '2C2C2C' },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2, keepNext: true },
      },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1400, bottom: 1400, left: 1440, right: 1440 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `${meta.tittel} · `, size: 16, color: '8A8A8A' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '8A8A8A' })],
        })],
      }),
    },
    children: docxNoder(),
  }],
});

const utDocx = path.join(ROT, 'TORKA-T1-designpitch.docx');
const utMd = path.join(ROT, 'TORKA-T1-designpitch.md');

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(utDocx, buf);
  fs.writeFileSync(utMd, markdown());
  console.log(`skrev ${utDocx} (${(buf.length / 1024).toFixed(0)} kB)`);
  console.log(`skrev ${utMd}`);
});
