import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Senplay Movie",
  description: "Cara Senplay mengelola dan melindungi data pengguna.",
};

const CONTACT_EMAIL = "officialsenplay@gmail.com";

const SECTIONS: LegalSection[] = [
  {
    title: "Data yang Kami Kumpulkan",
    paragraphs: [
      "Kami hanya mengumpulkan data seminimal mungkin yang dibutuhkan agar layanan berjalan.",
    ],
    items: [
      "Data akun (jika fitur akun tersedia): alamat email, nama pengguna, dan kata sandi yang disimpan dalam bentuk hash, tidak pernah dalam teks asli.",
      "Aktivitas di layanan: riwayat tontonan, daftar favorit, dan preferensi tampilan.",
      "Data teknis: jenis perangkat, browser, dan alamat IP yang tercatat otomatis pada log server untuk keamanan dan perbaikan bug.",
      "Data lokal di perangkat: cookie atau penyimpanan lokal browser untuk menjaga sesi login dan preferensi.",
    ],
  },
  {
    title: "Data yang Tidak Kami Simpan",
    paragraphs: [
      "Senplay tidak meminta dan tidak menyimpan data sensitif pengguna. Jangan pernah mengirimkan data berikut kepada kami:",
    ],
    items: [
      "Nomor KTP, paspor, atau dokumen identitas lainnya.",
      "Data pembayaran seperti nomor kartu kredit atau rekening bank.",
      "Data kesehatan, biometrik, atau lokasi presisi.",
      "Kata sandi akun lain di luar Senplay.",
    ],
  },
  {
    title: "Cara Kami Menggunakan Data",
    items: [
      "Menyediakan dan menjaga fitur akun serta sesi login.",
      "Menampilkan riwayat tontonan dan daftar favorit milik kamu.",
      "Mencegah penyalahgunaan, spam, dan serangan terhadap layanan.",
      "Memperbaiki performa dan kualitas layanan.",
    ],
    paragraphs: [
      "Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi kamu kepada pihak mana pun.",
    ],
  },
  {
    title: "Pihak Ketiga",
    paragraphs: [
      "Konten video di Senplay diambil otomatis dari penyedia pihak ketiga di Internet. Saat kamu memutar video, penyedia tersebut dapat mengumpulkan data sesuai kebijakan privasi mereka sendiri, yang berada di luar kendali kami.",
      "Kami juga dapat memakai layanan infrastruktur seperti hosting dan CDN yang memproses data teknis agar situs dapat diakses.",
    ],
  },
  {
    title: "Penyimpanan dan Keamanan",
    paragraphs: [
      "Kata sandi disimpan dalam bentuk hash dan koneksi ke situs dilindungi HTTPS. Meski begitu, tidak ada sistem yang sepenuhnya bebas risiko, jadi gunakan kata sandi yang kuat dan unik.",
      "Data akun disimpan selama akun aktif. Jika akun dihapus, data akun dan riwayat terkait akan dihapus dari sistem kami, kecuali log keamanan yang disimpan untuk jangka waktu terbatas.",
    ],
  },
  {
    title: "Hak Kamu",
    paragraphs: [
      "Sesuai Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022), kamu berhak untuk:",
    ],
    items: [
      "Mengakses dan memperbarui data pribadi yang kami simpan.",
      "Meminta penghapusan akun beserta datanya.",
      "Menarik persetujuan atas pemrosesan data kapan saja.",
      "Mengajukan keberatan atau pertanyaan tentang pengelolaan data kamu.",
    ],
  },
  {
    title: "Anak di Bawah Umur",
    paragraphs: [
      "Layanan ini tidak ditujukan untuk anak di bawah 13 tahun. Jika kami mengetahui ada akun milik anak di bawah usia tersebut, akun akan kami hapus.",
    ],
  },
  {
    title: "Perubahan Kebijakan",
    paragraphs: [
      "Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terbaru selalu tercantum di bagian atas halaman. Dengan terus menggunakan layanan setelah perubahan, kamu dianggap menyetujui kebijakan yang baru.",
    ],
  },
  {
    title: "Hubungi Kami",
    paragraphs: [
      "Untuk pertanyaan, permintaan akses, atau penghapusan data, hubungi kami melalui:",
    ],
    footer: (
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="w-fit text-accent-text transition-colors hover:text-accent-hover"
      >
        {CONTACT_EMAIL}
      </a>
    ),
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      updatedAt="23 November 2026"
      intro="Privasi kamu penting bagi kami. Halaman ini menjelaskan data apa yang dikumpulkan Senplay, untuk apa data itu dipakai, dan bagaimana kami menjaganya."
      sections={SECTIONS}
    />
  );
}
