
/* =====================================
   SIA TOKO HAMBALI - APP.JS
   Kelompok 3
===================================== */

document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  const rupiah = (angka) =>
    "Rp " + Number(angka || 0).toLocaleString("id-ID");

  const tanggalHariIni = new Date().toISOString().slice(0, 10);

  const produkAwal = [
    { kode: "BRG001", nama: "Beras 5 Kg", satuan: "Karung", jual: 75000, beli: 68000, stok: 30, min: 5 },
    { kode: "BRG002", nama: "Minyak Goreng 1 L", satuan: "Botol", jual: 18000, beli: 15000, stok: 40, min: 8 },
    { kode: "BRG003", nama: "Gula Pasir 1 Kg", satuan: "Kg", jual: 17000, beli: 14000, stok: 35, min: 5 },
    { kode: "BRG004", nama: "Telur 1 Kg", satuan: "Kg", jual: 29000, beli: 26000, stok: 25, min: 5 },
    { kode: "BRG005", nama: "Mie Instan", satuan: "Bungkus", jual: 3500, beli: 2800, stok: 100, min: 20 },
    { kode: "BRG006", nama: "Air Mineral", satuan: "Botol", jual: 5000, beli: 3500, stok: 60, min: 10 }
  ];

  let data = {
    produk: JSON.parse(localStorage.getItem("hambali_produk") || "null") || produkAwal,
    penjualan: JSON.parse(localStorage.getItem("hambali_penjualan") || "[]"),
    pembelian: JSON.parse(localStorage.getItem("hambali_pembelian") || "[]"),
    stok: JSON.parse(localStorage.getItem("hambali_stok") || "[]"),
    rusak: JSON.parse(localStorage.getItem("hambali_rusak") || "[]"),
    kas: JSON.parse(localStorage.getItem("hambali_kas") || "[]")
  };

  function simpan() {
    localStorage.setItem("hambali_produk", JSON.stringify(data.produk));
    localStorage.setItem("hambali_penjualan", JSON.stringify(data.penjualan));
    localStorage.setItem("hambali_pembelian", JSON.stringify(data.pembelian));
    localStorage.setItem("hambali_stok", JSON.stringify(data.stok));
    localStorage.setItem("hambali_rusak", JSON.stringify(data.rusak));
    localStorage.setItem("hambali_kas", JSON.stringify(data.kas));
  }

  function aman(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  /* =====================================
     NAVIGASI MENU
  ===================================== */

  const judul = {
    dashboard: ["Dashboard", "Ringkasan keuangan dan operasional"],
    produk: ["Master Barang", "Daftar persediaan barang"],
    penjualan: ["Penjualan POS", "Pencatatan transaksi penjualan"],
    pembelian: ["Pembelian", "Pencatatan pembelian barang"],
    stok: ["Stok Opname", "Pemeriksaan persediaan"],
    rusak: ["Rusak & ED", "Pencatatan barang rusak dan kedaluwarsa"],
    kas: ["Kas & Prive", "Pencatatan transaksi kas"],
    pajak: ["Rekap Pajak", "Rekapitulasi pajak simulasi"],
    laporan: ["Laporan Produk", "Laporan kontribusi produk"],
    petunjuk: ["Petunjuk", "Panduan penggunaan aplikasi"],
    wa: ["Pesanan WA", "Pencatatan pesanan WhatsApp"]
  };

  function bukaMenu(id) {
    const bagian = $(id);
    if (!bagian) return;

    document.querySelectorAll(".section").forEach((s) => {
      s.classList.toggle("active", s.id === id);
    });

    document.querySelectorAll("[data-section]").forEach((b) => {
      b.classList.toggle("active", b.dataset.section === id);
    });

    if ($("pageTitle")) $("pageTitle").textContent = judul[id]?.[0] || id;
    if ($("pageSubtitle")) $("pageSubtitle").textContent = judul[id]?.[1] || "";

    if ($("sidebar")) $("sidebar").classList.remove("open");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("click", function (e) {
    const tombol = e.target.closest("[data-section]");
    if (tombol) {
      e.preventDefault();
      bukaMenu(tombol.dataset.section);
    }
  });

  if ($("menuToggle")) {
    $("menuToggle").addEventListener("click", () => {
      $("sidebar")?.classList.toggle("open");
    });
  }

  /* =====================================
     MASTER BARANG
  ===================================== */

  function isiPilihanBarang() {
    ["posKode", "stokKode", "rusakKode"].forEach((id) => {
      const el = $(id);
      if (!el) return;

      const nilaiLama = el.value;
      el.innerHTML = '<option value="">Pilih barang...</option>';

      data.produk.forEach((p) => {
        el.innerHTML += `<option value="${aman(p.kode)}">${aman(p.kode)} - ${aman(p.nama)}</option>`;
      });

      el.value = nilaiLama;
    });
  }

  function tampilProduk() {
    const tbody = $("masterBarangBody");
    if (!tbody) return;

    tbody.innerHTML = data.produk.map((p, i) => `
      <tr>
        <td>${aman(p.kode)}</td>
        <td>${aman(p.nama)}</td>
        <td>${aman(p.satuan)}</td>
        <td>${rupiah(p.jual)}</td>
        <td>${rupiah(p.beli)}</td>
        <td>${p.stok}</td>
        <td>${p.min}</td>
        <td>${p.stok <= p.min ? "Stok Menipis" : "Aman"}</td>
        <td><button type="button" class="btn danger" data-hapus-produk="${i}">Hapus</button></td>
      </tr>
    `).join("");

    const badge = document.querySelector("#produk .badge");
    if (badge) badge.textContent = data.produk.length + " produk aktif";

    isiPilihanBarang();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-produk]");
    if (!btn) return;

    const i = Number(btn.dataset.hapusProduk);
    if (!confirm("Hapus barang ini?")) return;

    data.produk.splice(i, 1);
    simpan();
    tampilProduk();
  });

  /* =====================================
     PENJUALAN POS
  ===================================== */

  function tampilPenjualan() {
    const tbody = $("penjualanBody");
    if (!tbody) return;

    tbody.innerHTML = data.penjualan.map((p, i) => `
      <tr>
        <td>${aman(p.nota)}</td>
        <td>${aman(p.tanggal)}</td>
        <td>${aman(p.kode)}</td>
        <td>${aman(p.nama)}</td>
        <td>${p.qty}</td>
        <td>${rupiah(p.harga)}</td>
        <td>${rupiah(p.diskon)}</td>
        <td>${rupiah(p.subtotal)}</td>
        <td>${aman(p.metode)}</td>
        <td><button type="button" class="btn danger" data-hapus-penjualan="${i}">Hapus</button></td>
      </tr>
    `).join("");
  }

  if ($("formPOS")) {
    $("formPOS").addEventListener("submit", (e) => {
      e.preventDefault();

      const kode = $("posKode").value;
      const produk = data.produk.find((p) => p.kode === kode);
      const qty = Number($("posQty").value);
      const diskon = Number($("posDiskon").value || 0);

      if (!produk) return alert("Pilih barang terlebih dahulu.");
      if (qty < 1) return alert("Qty minimal 1.");
      if (qty > produk.stok) return alert("Stok barang tidak mencukupi.");

      const subtotal = produk.jual * qty - diskon;
      if (subtotal < 0) return alert("Diskon tidak boleh melebihi harga transaksi.");

      data.penjualan.push({
        nota: $("posNota").value,
        tanggal: $("posTanggal").value,
        kode,
        nama: produk.nama,
        qty,
        harga: produk.jual,
        diskon,
        subtotal,
        metode: $("posMetode").value
      });

      produk.stok -= qty;

      simpan();
      tampilSemua();
      e.target.reset();
      $("posTanggal").value = tanggalHariIni;
      $("posQty").value = 1;
      alert("Transaksi penjualan berhasil disimpan.");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-penjualan]");
    if (!btn) return;

    const i = Number(btn.dataset.hapusPenjualan);
    const p = data.penjualan[i];

    if (!confirm("Hapus transaksi ini? Stok akan dikembalikan.")) return;

    const barang = data.produk.find((x) => x.kode === p.kode);
    if (barang) barang.stok += p.qty;

    data.penjualan.splice(i, 1);
    simpan();
    tampilSemua();
  });

  /* =====================================
     PEMBELIAN
  ===================================== */

  function tampilPembelian() {
    const tbody = $("pembelianBody");
    if (!tbody) return;

    tbody.innerHTML = data.pembelian.map((p, i) => `
      <tr>
        <td>${aman(p.nota)}</td>
        <td>${aman(p.tanggal)}</td>
        <td>${aman(p.pemasok)}</td>
        <td>${aman(p.jenis)}</td>
        <td>${rupiah(p.nilai)}</td>
        <td>${aman(p.metode)}</td>
        <td>${aman(p.bukti)}</td>
        <td>${p.bukti === "Ya" ? "Diterima" : "Ditolak"}</td>
        <td><button type="button" class="btn danger" data-hapus-pembelian="${i}">Hapus</button></td>
      </tr>
    `).join("");
  }

  if ($("formPembelian")) {
    $("formPembelian").addEventListener("submit", (e) => {
      e.preventDefault();

      const pembelian = {
        nota: $("beliNota").value,
        tanggal: $("beliTanggal").value,
        pemasok: $("beliPemasok").value,
        jenis: $("beliJenis").value,
        nilai: Number($("beliNilai").value),
        metode: $("beliMetode").value,
        bukti: $("beliBukti").value
      };

      data.pembelian.push(pembelian);

      if (pembelian.bukti === "Ya" && pembelian.jenis === "Persediaan") {
        const nilai = pembelian.nilai;
        // Nilai pembelian dicatat sebagai transaksi.
        // Rincian barang belum ditambahkan karena formulir tidak meminta kode barang.
      }

      simpan();
      tampilPembelian();
      e.target.reset();
      $("beliTanggal").value = tanggalHariIni;
      alert(pembelian.bukti === "Ya" ? "Pembelian berhasil dicatat." : "Pembelian dicatat dengan status ditolak.");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-pembelian]");
    if (!btn) return;

    if (!confirm("Hapus catatan pembelian?")) return;
    data.pembelian.splice(Number(btn.dataset.hapusPembelian), 1);
    simpan();
    tampilPembelian();
  });

  /* =====================================
     STOK OPNAME
  ===================================== */

  function tampilStok() {
    const tbody = $("stokBody");
    if (!tbody) return;

    tbody.innerHTML = data.stok.map((s, i) => `
      <tr>
        <td>${aman(s.tanggal)}</td>
        <td>${aman(s.kode)}</td>
        <td>${aman(s.nama)}</td>
        <td>${s.sistem}</td>
        <td>${s.fisik}</td>
        <td>${s.selisih}</td>
        <td>${aman(s.alasan)}</td>
        <td>${s.selisih === 0 ? "Sesuai" : "Perlu Penyesuaian"}</td>
        <td><button type="button" class="btn danger" data-hapus-stok="${i}">Hapus</button></td>
      </tr>
    `).join("");
  }

  if ($("formStok")) {
    $("formStok").addEventListener("submit", (e) => {
      e.preventDefault();

      const produk = data.produk.find((p) => p.kode === $("stokKode").value);
      if (!produk) return alert("Pilih barang.");

      const sistem = Number($("stokSistem").value);
      const fisik = Number($("stokFisik").value);
      const selisih = fisik - sistem;
      const alasan = $("stokAlasan").value;

      if (selisih !== 0 && !alasan.trim()) {
        return alert("Isi alasan jika terdapat selisih stok.");
      }

      data.stok.push({
        tanggal: $("stokTanggal").value,
        kode: produk.kode,
        nama: produk.nama,
        sistem,
        fisik,
        selisih,
        alasan
      });

      produk.stok = fisik;

      simpan();
      tampilSemua();
      e.target.reset();
      $("stokTanggal").value = tanggalHariIni;
      alert("Stok opname berhasil dicatat.");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-stok]");
    if (!btn) return;

    if (!confirm("Hapus catatan opname?")) return;
    data.stok.splice(Number(btn.dataset.hapusStok), 1);
    simpan();
    tampilStok();
  });

  /* =====================================
     BARANG RUSAK & ED
  ===================================== */

  function tampilRusak() {
    const tbody = $("rusakBody");
    if (!tbody) return;

    tbody.innerHTML = data.rusak.map((r, i) => `
      <tr>
        <td>${aman(r.tanggal)}</td>
        <td>${aman(r.kode)}</td>
        <td>${aman(r.nama)}</td>
        <td>${r.qty}</td>
        <td>${aman(r.alasan)}</td>
        <td>${aman(r.ed || "-")}</td>
        <td>${rupiah(r.nilai)}</td>
        <td><button type="button" class="btn danger" data-hapus-rusak="${i}">Hapus</button></td>
      </tr>
    `).join("");
  }

  if ($("formRusak")) {
    $("formRusak").addEventListener("submit", (e) => {
      e.preventDefault();

      const produk = data.produk.find((p) => p.kode === $("rusakKode").value);
      const qty = Number($("rusakQty").value);

      if (!produk) return alert("Pilih barang.");
      if (qty < 1 || qty > produk.stok) return alert("Qty tidak valid atau stok tidak cukup.");

      data.rusak.push({
        tanggal: $("rusakTanggal").value,
        kode: produk.kode,
        nama: produk.nama,
        qty,
        alasan: $("rusakAlasan").value,
        ed: $("rusakED").value,
        nilai: produk.beli * qty
      });

      produk.stok -= qty;

      simpan();
      tampilSemua();
      e.target.reset();
      $("rusakTanggal").value = tanggalHariIni;
      $("rusakQty").value = 1;
      alert("Barang rusak berhasil dicatat.");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-rusak]");
    if (!btn) return;

    if (!confirm("Hapus catatan barang rusak?")) return;
    const r = data.rusak[Number(btn.dataset.hapusRusak)];
    const barang = data.produk.find((p) => p.kode === r.kode);
    if (barang) barang.stok += r.qty;

    data.rusak.splice(Number(btn.dataset.hapusRusak), 1);
    simpan();
    tampilSemua();
  });

  /* =====================================
     KAS & PRIVE
  ===================================== */

  function tampilKas() {
    const tbody = $("kasBody");
    if (!tbody) return;

    tbody.innerHTML = data.kas.map((k, i) => `
      <tr>
        <td>${aman(k.tanggal)}</td>
        <td>${aman(k.jenis)}</td>
        <td>${aman(k.ket)}</td>
        <td>${rupiah(k.jumlah)}</td>
        <td>${k.jenis === "Prive" ? "Prive" : "Kas"}</td>
        <td><button type="button" class="btn danger" data-hapus-kas="${i}">Hapus</button></td>
      </tr>
    `).join("");
  }

  if ($("formKas")) {
    $("formKas").addEventListener("submit", (e) => {
      e.preventDefault();

      data.kas.push({
        tanggal: $("kasTanggal").value,
        jenis: $("kasJenis").value,
        ket: $("kasKet").value,
        jumlah: Number($("kasJumlah").value)
      });

      simpan();
      tampilKas();
      e.target.reset();
      $("kasTanggal").value = tanggalHariIni;
      alert("Transaksi kas berhasil dicatat.");
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus-kas]");
    if (!btn) return;

    if (!confirm("Hapus transaksi kas?")) return;
    data.kas.splice(Number(btn.dataset.hapusKas), 1);
    simpan();
    tampilKas();
  });

  /* =====================================
     LAPORAN & PAJAK
  ===================================== */

  function tampilLaporan() {
    const tbody = $("laporanBody");
    if (!tbody) return;

    const total = data.penjualan.reduce((a, p) => a + p.subtotal, 0);

    tbody.innerHTML = data.produk.map((p) => {
      const transaksi = data.penjualan.filter((x) => x.kode === p.kode);
      const qty = transaksi.reduce((a, x) => a + x.qty, 0);
      const nilai = transaksi.reduce((a, x) => a + x.subtotal, 0);
      const kontribusi = total ? (nilai / total * 100).toFixed(2) : "0.00";

      return `
        <tr>
          <td>${aman(p.nama)}</td>
          <td>${qty}</td>
          <td>${rupiah(nilai)}</td>
          <td>${kontribusi}%</td>
        </tr>
      `;
    }).join("");
  }

  function tampilPajak() {
    const tbody = $("pajakBody");
    if (!tbody) return;

    const omzet = data.penjualan.reduce((a, p) => a + p.subtotal, 0);
    const kumulatif = 123200000 + omzet;
    const dasar = Math.max(0, kumulatif - 500000000);

    tbody.innerHTML = `
      <tr>
        <td>November 2026</td>
        <td>${rupiah(omzet)}</td>
        <td>${rupiah(kumulatif)}</td>
        <td>${rupiah(dasar)}</td>
        <td>${rupiah(dasar * 0.005)}</td>
      </tr>
    `;
  }

  /* =====================================
     DASHBOARD
  ===================================== */

  function tampilDashboard() {
    const omzet = data.penjualan.reduce((a, p) => a + p.subtotal, 0);
    const hpp = data.penjualan.reduce((a, p) => {
      const barang = data.produk.find((x) => x.kode === p.kode);
      return a + (barang ? barang.beli * p.qty : 0);
    }, 0);

    const kasAkhir = 5600000 + omzet
      - data.pembelian.reduce((a, p) => a + (p.bukti === "Ya" && p.metode !== "Kredit" ? p.nilai : 0), 0)
      - data.kas.filter((k) => k.jenis === "Pengeluaran Operasional" || k.jenis === "Prive").reduce((a, k) => a + k.jumlah, 0);

    if ($("statPenjualan")) $("statPenjualan").textContent = rupiah(12800000 + omzet);
    if ($("statHPP")) $("statHPP").textContent = rupiah(10560000 + hpp);
    if ($("statLabaKotor")) $("statLabaKotor").textContent = rupiah(2240000 + omzet - hpp);
    if ($("statKasAkhir")) $("statKasAkhir").textContent = rupiah(kasAkhir);
  }

  /* =====================================
     PESANAN WA - DITAMBAHKAN
  ===================================== */

  function buatMenuWA() {
    if ($('[data-section="wa"]')) return;

    const nav = document.querySelector(".nav");
    if (nav) {
      const tombol = document.createElement("button");
      tombol.className = "nav-item";
      tombol.type = "button";
      tombol.dataset.section = "wa";
      tombol.innerHTML = '<span class="nav-icon">📱</span> Pesanan WA';
      nav.appendChild(tombol);
    }

    const content = document.querySelector(".content");
    if (!content) return;

    const section = document.createElement("section");
    section.id = "wa";
    section.className = "section";
    section.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Pesanan WhatsApp</h3>
          <p class="hint">Catat pesanan pelanggan dari WhatsApp.</p>
        </div>
        <form id="formWA" class="form-grid">
          <div class="form-group">
            <label>Nama Pelanggan</label>
            <input id="waNama" required placeholder="Nama pelanggan">
          </div>
          <div class="form-group">
            <label>Nomor WhatsApp</label>
            <input id="waNomor" required placeholder="08xxxxxxxxxx">
          </div>
          <div class="form-group">
            <label>Barang</label>
            <select id="waKode" required>
              <option value="">Pilih barang...</option>
              ${data.produk.map(p => `<option value="${aman(p.kode)}">${aman(p.nama)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah</label>
            <input id="waQty" type="number" min="1" value="1" required>
          </div>
          <div class="form-group full">
            <button class="btn primary" type="submit">Catat Pesanan</button>
          </div>
        </form>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Pelanggan</th><th>WhatsApp</th><th>Barang</th><th>Qty</th><th>Total</th><th>Aksi</th></tr></thead>
            <tbody id="waBody"></tbody>
          </table>
        </div>
      </div>
    `;

    content.appendChild(section);

    $("formWA").addEventListener("submit", (e) => {
      e.preventDefault();

      const produk = data.produk.find(p => p.kode === $("waKode").value);
      const qty = Number($("waQty").value);

      if (!produk) return alert("Pilih barang.");
      if (qty < 1) return alert("Jumlah tidak valid.");

      const total = produk.jual * qty;
      const nama = $("waNama").value;
      const nomor = $("waNomor").value.replace(/\D/g, "");

      const pesan = encodeURIComponent(
        `Halo ${nama}, pesanan Anda di Toko Hambali:\n${produk.nama} x ${qty}\nTotal: ${rupiah(total)}`
      );

      const baris = document.createElement("tr");
      baris.innerHTML = `
        <td>${aman(nama)}</td>
        <td>${aman(nomor)}</td>
        <td>${aman(produk.nama)}</td>
        <td>${qty}</td>
        <td>${rupiah(total)}</td>
        <td><a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/${nomor.startsWith("0") ? "62" + nomor.slice(1) : nomor}?text=${pesan}">Kirim WA</a></td>
      `;

      $("waBody").appendChild(baris);
      e.target.reset();
      $("waQty").value = 1;
      alert("Pesanan berhasil dibuat. Tekan Kirim WA untuk menghubungi pelanggan.");
    });
  }

  /* =====================================
     RENDER SEMUA
  ===================================== */

  function tampilSemua() {
    tampilProduk();
    tampilPenjualan();
    tampilPembelian();
    tampilStok();
    tampilRusak();
    tampilKas();
    tampilLaporan();
    tampilPajak();
    tampilDashboard();
  }

  // Set tanggal default
  [
    "posTanggal",
    "beliTanggal",
    "stokTanggal",
    "rusakTanggal",
    "kasTanggal"
  ].forEach((id) => {
    if ($(id)) $(id).value = tanggalHariIni;
  });

  buatMenuWA();
  tampilSemua();
  simpan();

  // Pastikan menu awal terlihat
  bukaMenu("dashboard");

});
