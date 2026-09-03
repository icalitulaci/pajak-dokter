// tax-core.js — logika bersama perhitungan PPh Orang Pribadi untuk dokter
// Sumber aturan: lihat RESEARCH-pajak-dokter.md di root proyek

const PTKP_TABLE = {
  TK0: { label: 'TK/0 — Belum kawin, 0 tanggungan', amount: 54000000 },
  TK1: { label: 'TK/1 — Belum kawin, 1 tanggungan', amount: 58500000 },
  TK2: { label: 'TK/2 — Belum kawin, 2 tanggungan', amount: 63000000 },
  TK3: { label: 'TK/3 — Belum kawin, 3 tanggungan', amount: 67500000 },
  K0: { label: 'K/0 — Kawin, 0 tanggungan', amount: 58500000 },
  K1: { label: 'K/1 — Kawin, 1 tanggungan', amount: 63000000 },
  K2: { label: 'K/2 — Kawin, 2 tanggungan', amount: 67500000 },
  K3: { label: 'K/3 — Kawin, 3 tanggungan', amount: 72000000 },
};

const TAX_BRACKETS = [
  { upTo: 60000000, rate: 0.05 },
  { upTo: 250000000, rate: 0.15 },
  { upTo: 500000000, rate: 0.25 },
  { upTo: 5000000000, rate: 0.30 },
  { upTo: Infinity, rate: 0.35 },
];

const NPPN_DOKTER_DEFAULT = 0.5; // % norma penghitungan penghasilan neto untuk profesi dokter
const DPP_BUKAN_PEGAWAI = 0.5; // dasar pengenaan pajak PPh21 bukan pegawai = 50% x bruto
const BIAYA_JABATAN_RATE = 0.05;
const BIAYA_JABATAN_MAX = 6000000;

function formatRupiah(n) {
  if (isNaN(n) || n === null) n = 0;
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp ' + Math.round(Math.abs(n)).toLocaleString('id-ID');
}

function parseAngka(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9-]/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

// Format input angka secara live jadi "1.000.000" saat user mengetik
function pasangFormatterAngka(inputEl) {
  inputEl.addEventListener('input', () => {
    const angka = parseAngka(inputEl.value);
    const posisiDariKanan = inputEl.value.length - inputEl.selectionStart;
    inputEl.value = angka === 0 ? '' : angka.toLocaleString('id-ID');
    const posisiBaru = Math.max(0, inputEl.value.length - posisiDariKanan);
    inputEl.setSelectionRange(posisiBaru, posisiBaru);
  });
}

// --- Perhitungan neto per jenis sumber penghasilan ---
function hitungNetoGaji(bruto, iuran) {
  const biayaJabatan = Math.min(bruto * BIAYA_JABATAN_RATE, BIAYA_JABATAN_MAX);
  const neto = Math.max(0, bruto - biayaJabatan - iuran);
  return { biayaJabatan, neto };
}

function hitungNetoJasaMedis(bruto) {
  const dpp = bruto * DPP_BUKAN_PEGAWAI;
  return { dpp, neto: dpp };
}

function hitungNetoPraktikNppn(omzet, normaPersen) {
  const persen = normaPersen && normaPersen > 0 ? normaPersen : NPPN_DOKTER_DEFAULT * 100;
  const norma = persen / 100;
  return { norma, normaPersen: persen, neto: omzet * norma };
}

function hitungNetoPraktikPembukuan(omzet, biayaTotal) {
  return { neto: Math.max(0, omzet - biayaTotal) };
}

function hitungPajakProgresif(pkpMentah) {
  const pkp = Math.max(0, Math.floor(pkpMentah / 1000) * 1000);
  let sisa = pkp;
  let batasBawah = 0;
  let totalPajak = 0;
  const rincian = [];
  for (const bracket of TAX_BRACKETS) {
    if (sisa <= 0) break;
    const lebarLapisan = bracket.upTo - batasBawah;
    const kenaDiLapisanIni = Math.min(sisa, lebarLapisan);
    if (kenaDiLapisanIni > 0) {
      const pajakLapisan = kenaDiLapisanIni * bracket.rate;
      totalPajak += pajakLapisan;
      rincian.push({
        dari: batasBawah,
        sampai: bracket.upTo === Infinity ? null : bracket.upTo,
        tarif: bracket.rate,
        dasar: kenaDiLapisanIni,
        pajak: pajakLapisan,
      });
    }
    sisa -= kenaDiLapisanIni;
    batasBawah = bracket.upTo;
  }
  return { pkp, totalPajak, rincian };
}

function renderRincianTabel(rincian) {
  if (rincian.length === 0) {
    return '<p class="muted">Belum ada penghasilan kena pajak.</p>';
  }
  let html = '<table class="tabel-rincian"><thead><tr><th>Lapisan PKP</th><th>Tarif</th><th>Dasar</th><th>Pajak</th></tr></thead><tbody>';
  for (const r of rincian) {
    const label = r.sampai
      ? `${formatRupiah(r.dari)} – ${formatRupiah(r.sampai)}`
      : `> ${formatRupiah(r.dari)}`;
    html += `<tr><td>${label}</td><td>${(r.tarif * 100).toFixed(0)}%</td><td>${formatRupiah(r.dasar)}</td><td>${formatRupiah(r.pajak)}</td></tr>`;
  }
  html += '</tbody></table>';
  return html;
}

// --- Penyimpanan lintas-halaman (localStorage) untuk digabung di halaman Ringkasan ---
const STORAGE_KEY = 'pajakDokterSumberPenghasilan';

function simpanSumberPenghasilan(entry) {
  const data = ambilSemuaSumber();
  const idx = data.findIndex((d) => d.id === entry.id);
  if (idx >= 0) data[idx] = entry;
  else data.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ambilSemuaSumber() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function hapusSumber(id) {
  const data = ambilSemuaSumber().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
