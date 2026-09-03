const selectPtkp = document.getElementById('ptkp');
const inputDipotongManual = document.getElementById('dipotongManual');

pasangFormatterAngka(inputDipotongManual);

function isiPilihanPtkp() {
  Object.entries(PTKP_TABLE).forEach(([kode, data]) => {
    const opt = document.createElement('option');
    opt.value = kode;
    opt.textContent = `${data.label} — ${formatRupiah(data.amount)}`;
    selectPtkp.appendChild(opt);
  });
}

function renderDaftarSumber() {
  const data = ambilSemuaSumber();
  const wrap = document.getElementById('daftarSumber');
  const pesanKosong = document.getElementById('pesanKosong');
  wrap.innerHTML = '';

  if (data.length === 0) {
    pesanKosong.style.display = 'block';
    return;
  }
  pesanKosong.style.display = 'none';

  data.forEach((sumber) => {
    const el = document.createElement('div');
    el.className = 'sumber-item';
    el.innerHTML = `
      <div>
        <div>${sumber.jenis}</div>
        <div class="meta">Neto: ${formatRupiah(sumber.neto)} · Sudah dipotong: ${formatRupiah(sumber.dipotong || 0)}</div>
      </div>
      <button data-id="${sumber.id}">Hapus</button>
    `;
    el.querySelector('button').addEventListener('click', () => {
      hapusSumber(sumber.id);
      renderDaftarSumber();
    });
    wrap.appendChild(el);
  });
}

document.getElementById('btnHitung').addEventListener('click', () => {
  const data = ambilSemuaSumber();
  const totalNeto = data.reduce((sum, s) => sum + (s.neto || 0), 0);
  const totalDipotongOtomatis = data.reduce((sum, s) => sum + (s.dipotong || 0), 0);
  const dipotongManual = parseAngka(inputDipotongManual.value);
  const totalKredit = totalDipotongOtomatis + dipotongManual;

  const ptkpData = PTKP_TABLE[selectPtkp.value];
  const pkpMentah = Math.max(0, totalNeto - ptkpData.amount);
  const { pkp, totalPajak, rincian } = hitungPajakProgresif(pkpMentah);

  document.getElementById('outNeto').textContent = formatRupiah(totalNeto);
  document.getElementById('outPtkp').textContent = formatRupiah(ptkpData.amount);
  document.getElementById('outPkp').textContent = formatRupiah(pkp);
  document.getElementById('tabelRincian').innerHTML = renderRincianTabel(rincian);
  document.getElementById('outTotalPajak').textContent = formatRupiah(totalPajak);
  document.getElementById('outKredit').textContent = formatRupiah(totalKredit);

  const selisih = totalPajak - totalKredit;
  const outSelisih = document.getElementById('outSelisih');
  const labelSelisih = document.getElementById('labelSelisih');
  if (selisih > 0) {
    labelSelisih.innerHTML = 'Kurang bayar (PPh Pasal 29) <span class="badge-kurang">bayar tambahan</span>';
    outSelisih.textContent = formatRupiah(selisih);
    outSelisih.style.color = 'var(--danger)';
  } else {
    labelSelisih.innerHTML = 'Lebih bayar <span class="badge-lebih">restitusi/kompensasi</span>';
    outSelisih.textContent = formatRupiah(Math.abs(selisih));
    outSelisih.style.color = 'var(--success)';
  }

  document.getElementById('hasil').classList.add('tampil');
});

isiPilihanPtkp();
renderDaftarSumber();
