import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

const portfolioImages = [
	{ src: Assets.Banner1, alt: 'Laporan 2013' },
	{ src: Assets.Port2, alt: 'Breeding Resources' },
	{ src: Assets.Port3, alt: 'Source Vulnerability' },
	{ src: Assets.Port4, alt: 'Flowers 2013' },
	{ src: Assets.Port5, alt: 'Senjata 2016' },
	{ src: Assets.Port6, alt: 'Semangat Unggul' },
	{ src: Assets.Port7, alt: 'ICT Insight' },
	{ src: Assets.Port8, alt: 'Keep Flowing' },
	{ src: Assets.PortBMW, alt: 'BMW Landscape', isWide: true },
];

export default function TentangKami() {
	return (
		<div className="relative w-full bg-white overflow-hidden">
			<header className="relative w-full">
				{/* Hero Banner */}
				<section className="w-full bg-slate-50 py-14 md:py-2 px-6 border-b border-slate-200">
					<div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-12">
						{/* Logo */}
						<div className="flex-shrink-0">
							<img
								src={Assets.Hero3}
								alt="Logo Divus"
								className="w-80 h-80 object-contain "
							/>
						</div>

						{/* Text Content */}
						<div className="flex flex-col justify-center">
							<h1 className="text-zinc-800 text-xl md:text-3xl font-bold font-['Poppins'] leading-tight">
								PT Divus Global Mediacomm
							</h1>
							<p className="text-zinc-500 text-base md:text-xl font-medium italic font-['Poppins']">
								- Kontak
							</p>
						</div>
					</div>
				</section>

				{/* Breadcrumb */}
				<div className="w-full bg-zinc-300 py-3 px-6 md:px-20 mb-4">
					<p className="text-zinc-800 text-base">
						<Link href="/User/Home" className="hover:underline">
							Beranda
						</Link>
						<span className="text-red-600"> {' > '} Tentang Kami</span>
					</p>
				</div>
			</header>

			{/* PROFIL PERUSAHAAN SECTION */}
			<section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
				<div className="flex flex-col lg:flex-row gap-12 items-start">
					<div className="w-full">
						<h2 className="text-xl md:text-2xl font-bold text-zinc-800 mb-6 capitalize">
							Lebih dari Puluhan instansi dan perusahaan telah mempercayakan berbagai kebutuhan konsultansi, perencanaan, dan pengembangan solusi kepada kami.
						</h2>
						<p className="text-zinc-800 text-base font-normal leading-loose text-justify">
							Kami telah bekerja sama dalam beragam proyek, mulai dari kajian manajemen, bantuan teknis, perencanaan arsitektur, telematika, hingga penyusunan studi dan laporan resmi di berbagai sektor. Dengan layanan yang profesional dan solusi yang disesuaikan, kami membantu klien meningkatkan efektivitas, akurasi perencanaan, serta kualitas pengambilan keputusan.
						</p>
					</div>
				</div>
			</section>

			{/* Floating WhatsApp Button */}
			<a
				href="https://wa.me/6285220203453"
				target="_blank"
				rel="noopener noreferrer"
				className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
			>
				<FaWhatsapp size={32} className="text-white" />
			</a>

			{/* PORTFOLIO GALLERY SECTION */}
			<section className="w-full py-16 px-6 md:px-20 bg-white">
				<div className="max-w-[1440px] mx-auto">
					<div className="flex flex-wrap justify-center gap-4 md:gap-6">
						{portfolioImages.map((item, index) => (
							<div
								key={index}
								className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
							>
								<img
									src={item.src}
									alt={item.alt}
									className="h-64 md:h-80 lg:h-96 w-auto object-cover"
								/>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA SECTION */}
			<section className="w-full px-4 md:px-20 py-4 mb-6">
				<div className="max-w-[1440px] mx-auto">
					<div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-gradient-to-b from-green-500 to-lime-500 px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
						{/* Background Pattern */}
						<div
							className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
							style={{
								backgroundImage: `url(${Assets.Banner1})`,
								backgroundRepeat: 'no-repeat',
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							}}
						></div>

						{/* Judul */}
						<h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10">
							PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" />
							terpercaya untuk bisnis Anda!
						</h2>

						{/* Subjudul */}
						<p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">
							Hubungi kami dan dapatkan panduan dari konsultan berpengalaman
						</p>

						{/* Tombol CTA */}
						<a
							href="https://wa.me/62812345678"
							className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group"
						>
							<FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
							<span className="text-black text-base md:text-lg font-semibold font-['Poppins'] capitalize">
								Konsultasi Sekarang
							</span>
						</a>
					</div>
				</div>
			</section>
		</div>
	);
}