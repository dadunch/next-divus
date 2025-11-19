import { useRouter } from "next/router";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaDownload, FaWhatsapp } from "react-icons/fa";
import { Assets } from "../assets";

export default function Footer2() {
  const router = useRouter();
  
  // Layanan
  const services = ["Management Consulting", "Research & Survey", "Corporate ID", "Product & Service Knowledge", "Report & Jurnal"];

  // Kontak
  const contacts = [
    { icon: Phone, text: "+62-8522-0203-453" },
    { icon: Mail, text: "divusgm@gmail.com" },
    {
      icon: MapPin,
      text: "Jl. Terusan Kapten Halim, Kampung Sukamulya, Kel. Salammulya, Kec. Pondoksalam, Kab. Purwakarta, Prov. Jawa Barat 41115",
    },
  ];

  const getFooterConfig = () => {
    const path = router.pathname;
    
    if (path === "/layanan") {
      return {
        title: "Tertarik dengan layanan kami?",
        buttonText: "Hubungi Kami",
        buttonIcon: FaWhatsapp,
        buttonLink: "https://wa.me/6285220203453?text=Halo,%20saya%20tertarik%20dengan%20layanan%20PT%20Divus%20Global%20Mediacomm",
        isDownload: false
      };
    } else if (path === "/proyek") {
      return {
        title: "Wujudkan proyek Anda dengan Kami",
        buttonText: "Hubungi Kami",
        buttonIcon: FaWhatsapp,
        buttonLink: "https://wa.me/6285220203453?text=Halo,%20saya%20ingin%20berdiskusi%20tentang%20proyek%20dengan%20PT%20Divus%20Global%20Mediacomm",
        isDownload: false
      };
    } else if (path === "/tentang") {
      return {
        title: "Company Profile",
        buttonText: "Download",
        buttonIcon: FaDownload,
        buttonLink: "#", 
        isDownload: true
      };
    }
    
    // Default (untuk halaman lain)
    return {
      title: "Company Profile",
      buttonText: "Download",
      buttonIcon: FaDownload,
      buttonLink: "#",
      isDownload: true
    };
  };

  const footerConfig = getFooterConfig();
  const ButtonIcon = footerConfig.buttonIcon;

  return (
    <>
      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-20 mb-[-130px] z-50 relative" >
        <div className="w-full bg-zinc-900 rounded-tr-2xl rounded-bl-2xl p-8 md:p-11 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-white text-2xl md:text-4xl font-bold capitalize text-center md:text-left">
              {footerConfig.title}
            </h2>
            <a 
              href={footerConfig.buttonLink}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full md:w-80 px-5 py-2.5 bg-white rounded-tr-xl rounded-bl-xl inline-flex justify-center items-center gap-3 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ButtonIcon className="w-8 h-8 text-zinc-800" />
              <span className="text-zinc-800 text-xl font-bold capitalize">
                {footerConfig.buttonText}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-zinc-800 pt-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-4">
          {/* Bagian Atas Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 pb-8">
            {/* Kolom 1: Logo & Deskripsi */}
            <div className="flex flex-col gap-4">
              <img
                className="w-40 h-auto filter brightness-0 invert"
                src={Assets.Logo}
                alt="PT Divus Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/154x80/000/fff?text=LOGO";
                }}
              />
              <p className="text-white/90 text-base font-light font-['Poppins'] leading-6 text-justify">
                PT Divus Global Mediacomm menghadirkan layanan konsultasi manajemen, riset, laporan, dan komunikasi korporat untuk mendukung pertumbuhan serta nilai strategis bisnis di berbagai sektor.
              </p>
            </div>

            {/* Kolom 2: Layanan */}
            <div>
              <h4 className="text-white/90 text-xl font-semibold font-['Poppins'] capitalize leading-7 pt-4 mb-4">Layanan</h4>
              <div className="flex flex-col space-y-2">
                {services.map((service) => (
                  <Link 
                    key={service} 
                    href={`/${service.toLowerCase().replace(/\s/g, "-")}`} 
                    className="text-white/90 text-base font-light font-['Poppins'] leading-6 hover:text-lime-500 transition-colors"
                  >
                    {service}
                  </Link>
                ))}
              </div>
            </div>

            {/* Kolom 3: Kontak */}
            <div>
              <h4 className="text-white/90 text-xl font-semibold font-['Poppins'] capitalize leading-7 pt-4 mb-4">Kontak</h4>
              <div className="flex flex-col space-y-4">
                {contacts.map((contact, index) => (
                  <ContactItem key={index} icon={contact.icon} text={contact.text} />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full border-t border-white/20"></div>

          {/* Bagian Bawah Footer */}
          <div className="pt-8 text-center">
            <p className="text-zinc-300 text-base md:text-xl font-light font-['Poppins'] capitalize leading--10">
              © 2022 PT Divus Global Mediacomm. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

// Sub-komponen untuk item kontak
const ContactItem = ({ icon: Icon, text }) => (
  <div className="flex justify-start items-start gap-3.5">
    <Icon size={24} className="text-white mt-0.5 min-w-[24px]" />
    <div className="text-justify text-white text-base font-light font-['Poppins'] leading-6 flex-1">{text}</div>
  </div>
);