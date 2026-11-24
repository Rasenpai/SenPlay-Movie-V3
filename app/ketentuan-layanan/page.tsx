import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Ketentuan Layanan | Senplay Movie",
  description: "Aturan penggunaan layanan Senplay.",
};

const CONTACT_EMAIL = "officialsenplay@gmail.com";

const SECTIONS: LegalSection[] = [
  {
    title: "Penerimaan Ketentuan",
    paragraphs: [
      "Dengan mengakses atau menggunakan Senplay, kamu menyetujui ketentuan ini. Jika tidak setuju, mohon hentikan penggunaan layanan.",
    ],
  },
  {
    title: "Sifat Layanan",
    paragraphs: [
      "Senplay tidak menyimpan, meng-host, atau mendistribusikan file media apa pun. Seluruh konten ditampilkan dari penyedia pihak ketiga di Internet secara otomatis. Kami hanya menyediakan antarmuka untuk menelusuri dan menemukan konten tersebut.",
      "Kami tidak mengendalikan, memverifikasi, atau bertanggung jawab atas isi, kualitas, maupun ketersediaan konten dari pihak ketiga.",
    ],
  },
  {
    title: "Akun Pengguna",
    paragraphs: [
      "Jika fitur akun tersedia, kamu bertanggung jawab atas keamanan akun dan semua aktivitas yang terjadi di dalamnya.",
    ],
    items: [
      "Berikan informasi yang benar saat mendaftar.",
      "Jaga kerahasiaan kata sandi dan jangan bagikan akun ke orang lain.",
      "Segera laporkan jika akun kamu diakses tanpa izin.",
      "Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini.",
    ],
  },
  {
    title: "Aturan Penggunaan",
    paragraphs: ["Saat menggunakan Senplay, kamu setuju untuk tidak:"],
    items: [
      "Mengganggu, membebani, atau mencoba meretas server maupun API kami.",
      "Melakukan scraping massal, otomatisasi berlebihan, atau menyalin layanan tanpa izin.",
      "Menyebarkan malware, spam, atau konten yang melanggar hukum.",
      "Menggunakan layanan untuk tujuan yang melanggar hukum di Indonesia.",
      "Mencoba mengakses akun atau data milik pengguna lain.",
    ],
  },
  {
    title: "Hak Kekayaan Intelektual",
    paragraphs: [
      "Seluruh film, serial, poster, dan materi lain yang ditampilkan adalah milik pemegang hak ciptanya masing-masing. Desain, kode, dan merek Senplay adalah milik pengelola Senplay.",
      "Jika kamu pemegang hak cipta dan menemukan konten yang melanggar hak kamu, hubungi kami dengan menyertakan tautan konten dan bukti kepemilikan. Kami akan menindaklanjuti dengan menghapus tautan terkait dari layanan kami.",
    ],
  },
  {
    title: "Tanpa Jaminan",
    paragraphs: [
      "Layanan disediakan apa adanya. Kami tidak menjamin layanan akan selalu tersedia, bebas gangguan, atau bebas dari kesalahan. Fitur dapat berubah, dihentikan, atau dibatasi sewaktu-waktu.",
    ],
  },
  {
    title: "Batasan Tanggung Jawab",
    paragraphs: [
      "Sejauh diizinkan hukum, Senplay tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan, termasuk akibat konten pihak ketiga, tautan eksternal, atau gangguan layanan.",
    ],
  },
  {
    title: "Perubahan Ketentuan",
    paragraphs: [
      "Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terbaru tercantum di bagian atas halaman. Penggunaan layanan setelah perubahan berarti kamu menerima ketentuan yang baru.",
    ],
  },
  {
    title: "Hukum yang Berlaku",
    paragraphs: ["Ketentuan ini diatur berdasarkan hukum Republik Indonesia."],
  },
  {
    title: "Hubungi Kami",
    paragraphs: ["Pertanyaan tentang ketentuan ini dapat dikirim ke:"],
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

export default function KetentuanLayananPage() {
  return (
    <LegalPage
      title="Ketentuan Layanan"
      updatedAt="23 November 2026"
      intro="Selamat datang di Senplay. Harap baca ketentuan berikut sebelum menggunakan layanan kami."
      sections={SECTIONS}
    />
  );
}
