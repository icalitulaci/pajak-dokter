const SUMBER_CONFIG = [
  {
    id: 'gaji-pegawai',
    chk: 'chk-gaji',
    toggle: 'toggle-gaji',
    jenis: 'Gaji Pegawai Tetap',
    hasilMini: 'hasilmini-gaji',
    ambilInputs() {
      return {
        bruto: parseAngka(document.getElementById('gaji-bruto').value),
        iuran: parseAngka(document.getElementById('gaji-iuran').value),
        dipotong: parseAngka(document.getElementById('gaji-dipotong').value),
      };
    },
    isiInputs(inputs) {
      document.getElementById('gaji-bruto').value = inputs.bruto ? inputs.bruto.toLocaleString('id-ID') : '';
      document.getElementById('gaji-iuran').value = inputs.iuran ? inputs.iuran.toLocaleString('id-ID') : '';
      document.getElementById('gaji-dipotong').value = inputs.dipotong ? inputs.dipotong.toLocaleString('id-ID') : '';
    },
    hitung(inputs) {
      const { biayaJabatan, neto } = hitungNetoGaji(inputs.bruto, inputs.iuran);
      return {
        bruto: inputs.bruto,
        neto,
        dipotong: inputs.dipotong,
        ringkasHtml: `Biaya jabatan: ${formatRupiah(biayaJabatan)} · Penghasilan neto: <strong>${formatRupiah(neto)}</strong>`,
      };
    },
  },
  {
    id: 'jasa-medis',
    chk: 'chk-jasa',
    toggle: 'toggle-jasa',
    jenis: 'Jasa Medis (Bukan Pegawai)',
    hasilMini: 'hasilmini-jasa',
    ambilInputs() {
      return {
        bruto: parseAngka(document.getElementById('jasa-bruto').value),
        punyaNpwp: document.getElementById('jasa-npwp').value,
        dipotong: parseAngka(document.getElementById('jasa-dipotong').value),
      };
    },
    isiInputs(inputs) {
      document.getElementById('jasa-bruto').value = inputs.bruto ? inputs.bruto.toLocaleString('id-ID') : '';
      document.getElementById('jasa-npwp').value = inputs.punyaNpwp || 'ya';
      document.getElementById('jasa-dipotong').value = inputs.dipotong ? inputs.dipotong.toLocaleString('id-ID') : '';
    },
    hitung(inputs) {
      const { neto } = hitungNetoJasaMedis(inputs.bruto);
      return {
        bruto: inputs.bruto,
        neto,
        dipotong: inputs.dipotong,
        ringkasHtml: `Dasar pengenaan pajak (50%): ${formatRupiah(neto)} · Penghasilan neto: <strong>${formatRupiah(neto)}</strong>`,
      };
    },
  },
  {
    id: 'praktik-nppn',
    chk: 'chk-nppn',
    toggle: 'toggle-nppn',
    jenis: 'Praktik Mandiri (Norma/NPPN)',
    hasilMini: 'hasilmini-nppn',
    ambilInputs() {
      return {
        omzet: parseAngka(document.getElementById('nppn-omzet').value),
        normaPersen: parseFloat(document.getElementById('nppn-norma').value) || 50,
      };
    },
    isiInputs(inputs) {
      document.getElementById('nppn-omzet').value = inputs.omzet ? inputs.omzet.toLocaleString('id-ID') : '';
      document.getElementById('nppn-norma').value = inputs.normaPersen || 50;
    },
    hitung(inputs) {
      const { neto, normaPersen } = hitungNetoPraktikNppn(inputs.omzet, inputs.normaPersen);
      return {
        bruto: inputs.omzet,
        neto,
        dipotong: 0,
        ringkasHtml: `Norma ${normaPersen}% × omzet · Penghasilan neto: <strong>${formatRupiah(neto)}</strong>`,
      };
    },
  },
  {
    id: 'praktik-pembukuan',
    chk: 'chk-pembukuan',
    toggle: 'toggle-pembukuan',
    jenis: 'Praktik Mandiri (Pembukuan)',
    hasilMini: 'hasilmini-pembukuan',
    ambilInputs() {
      return {
        omzet: parseAngka(document.getElementById('pb-omzet').value),
        sewa: parseAngka(document.getElementById('pb-sewa').value),
        staf: parseAngka(document.getElementById('pb-staf').value),
        obat: parseAngka(document.getElementById('pb-obat').value),
        penyusutan: parseAngka(document.getElementById('pb-penyusutan').value),
        lainnya: parseAngka(document.getElementById('pb-lainnya').value),
      };
    },
    isiInputs(inputs) {
      document.getElementById('pb-omzet').value = inputs.omzet ? inputs.omzet.toLocaleString('id-ID') : '';
      document.getElementById('pb-sewa').value = inputs.sewa ? inputs.sewa.toLocaleString('id-ID') : '';
      document.getElementById('pb-staf').value = inputs.staf ? inputs.staf.toLocaleString('id-ID') : '';
      document.getElementById('pb-obat').value = inputs.obat ? inputs.obat.toLocaleString('id-ID') : '';
      document.getElementById('pb-penyusutan').value = inputs.penyusutan ? inputs.penyusutan.toLocaleString('id-ID') : '';
      document.getElementById('pb-lainnya').value = inputs.lainnya ? inputs.lainnya.toLocaleString('id-ID') : '';
    },
    hitung(inputs) {
      const biayaTotal = inputs.sewa + inputs.staf + inputs.obat + inputs.penyusutan + inputs.lainnya;
      const { neto } = hitungNetoPraktikPembukuan(inputs.omzet, biayaTotal);
      return {
        bruto: inputs.omzet,
        neto,
        dipotong: 0,
        ringkasHtml: `Total biaya: ${formatRupiah(biayaTotal)} · Penghasilan neto: <strong>${formatRupiah(neto)}</strong>`,
      };
    },
  },
];

// Formatter angka untuk semua input rupiah
document.querySelectorAll('input[data-rupiah]').forEach(pasangFormatterAngka);

// Toggle buka/tutup section saat checkbox dicentang
SUMBER_CONFIG.forEach((cfg) => {
  const chk = document.getElementById(cfg.chk);
  const toggle = document.getElementById(cfg.toggle);
  chk.addEventListener('change', () => {
    toggle.classList.toggle('aktif', chk.checked);
  });
});

// Update pratinjau mini tiap kali input di dalam section berubah
SUMBER_CONFIG.forEach((cfg) => {
  const body = document.querySelector(`#${cfg.toggle} .sumber-toggle-body`);
  const mini = document.getElementById(cfg.hasilMini);
  const perbarui = () => {
    const inputs = cfg.ambilInputs();
    if (!inputs.bruto && !inputs.omzet) {
      mini.classList.remove('tampil');
      return;
    }
    const hasil = cfg.hitung(inputs);
    mini.innerHTML = hasil.ringkasHtml;
    mini.classList.add('tampil');
  };
  body.addEventListener('input', perbarui);
  body.addEventListener('change', perbarui);
});

// Pulihkan data yang sudah tersimpan dari kunjungan sebelumnya
function pulihkanDariPenyimpanan() {
  const data = ambilSemuaSumber();
  data.forEach((sumber) => {
    const cfg = SUMBER_CONFIG.find((c) => c.id === sumber.id);
    if (!cfg || !sumber.inputs) return;
    document.getElementById(cfg.chk).checked = true;
    document.getElementById(cfg.toggle).classList.add('aktif');
    cfg.isiInputs(sumber.inputs);
    document.querySelector(`#${cfg.toggle} .sumber-toggle-body`).dispatchEvent(new Event('input', { bubbles: true }));
  });
}
pulihkanDariPenyimpanan();

// Tombol Lanjut: hitung & simpan tiap sumber yang dicentang, hapus yang tidak dicentang, lalu pindah ke Ringkasan
document.getElementById('btnLanjut').addEventListener('click', () => {
  let adaYangDicentang = false;

  SUMBER_CONFIG.forEach((cfg) => {
    const dicentang = document.getElementById(cfg.chk).checked;
    if (dicentang) {
      adaYangDicentang = true;
      const inputs = cfg.ambilInputs();
      const hasil = cfg.hitung(inputs);
      simpanSumberPenghasilan({
        id: cfg.id,
        jenis: cfg.jenis,
        bruto: hasil.bruto,
        neto: hasil.neto,
        dipotong: hasil.dipotong,
        inputs,
      });
    } else {
      hapusSumber(cfg.id);
    }
  });

  const pesan = document.getElementById('pesanPeringatan');
  if (!adaYangDicentang) {
    pesan.classList.add('tampil');
    return;
  }
  pesan.classList.remove('tampil');
  window.location.href = 'ringkasan.html';
});
