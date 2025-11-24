import { useState } from 'react';
import Link from 'next/link';
import { Assets } from '../../assets';
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Data layanan dan produk
const servicesData = [
    { title: 'Management Konsulting', items: ['Business Feasibility & Evaluation', 'Marketing Plan & Communications', 'Strategic Planning'], icon: Assets.Icon1 },
    { title: 'Research & Survey', items: ['Market Survey', 'Customer Satisfaction', 'Social Mapping'], icon: Assets.Icon2 },
    { title: 'Corporate ID', items: ['Website', 'Logo', 'Stationery', 'Company Profile', 'Kalender', 'Agenda', 'Video Profile'], icon: Assets.Icon4 },
    { title: 'Product & Service Knowledge', items: ['Brosur', 'Booklet', 'Banner', 'Backdrop', 'Merchandise', 'Event'], icon: Assets.Icon5 },
    { title: 'Report & Journal', items: ['Annual Plan', 'Monitoring Report', 'Annual Report', 'Newsletter'], icon: Assets.Icon3 }
];

const reasons = [
	{
		number: 1,
		title: 'KONSULTAN BERPENGALAMAN & TERPERCAYA',
		desc: 'PT Divus diisi oleh para profesional berpengalaman yang memahami kebutuhan bisnis modern.',
	},
	{
		number: 2,
		title: 'AHLI PROFESIONAL DI BERBAGAI BIDANG',
		desc: 'Tim ahli dari berbagai bidang dengan pendekatan yang relevan dan profesional.',
	},
	{
		number: 3,
		title: 'HASIL TERUKUR, CEPAT, & ANDAL',
		desc: 'Output berkualitas tinggi berdasarkan data, insight yang akurat, dan proses efisien.',
	},
];

// Small responsive highlights row (used under the hero text)
const ServiceHighlights = ({ items }) => (
	<div className="w-full mt-6">
		<div className="max-w-4xl mx-auto">
			<div className="flex flex-wrap gap-6 py-2 justify-center">
					{items.map((text, idx) => (
						<div
							key={idx}
							className="px-16 py-6 bg-white rounded-2xl shadow-md outline outline-black p-4 md:p-6 flex items-center"
						>
								<div className=" text-black text-base md:text-lg font-normal text-center capitalize leading-tight whitespace-nowrap truncate" title={text}>
									{text}
								</div>
						</div>
					))}
			</div>
		</div>
	</div>
);

export default function LayananProduk() {
    const [activeTab, setActiveTab] = useState('layanan');

    return (
        <div className="relative w-full bg-white overflow-hidden">

            <header className="relative w-full">
				{/* Hero Banner */}
				<section className="w-full bg-slate-50 py-14 md:py-30 px-6 border-b border-slate-200">
					<div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-20">

						{/* Text Content */}
						<div className="flex flex-col justify-center">
							<h1 className="text-zinc-800 text-xl md:text-3xl font-bold leading-tight">
								Layanan Management Consulting
							</h1>
							<p className="text-zinc-500 text-sm md:text-base text-center font-medium italic">
								Jasa Konsultan Di Bidang Management Consulting 
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
						<span className="text-red-600"> {' > '} Managemen Consulting</span>
					</p>
				</div>
			</header>

            {/* TENTANG KAMI SECTION */}
				<section className="px-6 md:px-20 py-16 md:py-20 flex flex-col lg:flex-row lg:items-center gap-10">
					<div className="w-full lg:w-1/2 flex justify-center">
						<div className="w-[635px] h-96  overflow-hidden rounded-2xl">
							<img
								className="w-full h-full object-cover rounded-2xl"
								src={Assets.Hero4}
								alt="Tentang Kami"
							/>
						</div>
					</div>

					<div className="w-full lg:w-1/2 flex flex-col justify-center items-start gap-8">
						<h1 className="text-zinc-800 text-2xl lg:text-3xl font-bold leading-tight">
							Apa Itu PT Divus Global Mediacomm?
						</h1>

						<p className="text-zinc-800 text-base font-normal leading-6 text-justify">
							PT Divus Global Mediacomm adalah perusahaan konsultan yang
							bergerak di bidang manajemen, komunikasi korporat, dan desain
							grafis. Kami menyediakan layanan mulai dari studi kelayakan,
							perencanaan strategis, riset pasar, hingga identitas korporasi dan
							media promosi. Dengan pengalaman beragam proyek, Divus berkomitmen
							menjadi mitra terpercaya dalam menghadirkan solusi profesional dan
							inovatif.
						</p>

						<Link
							href="/User/Contact"
							className="inline-flex justify-start items-center px-5 py-3 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
						>
							<span className="text-white text-base font-semibold leading-6">
								Konsultasi Sekarang
							</span>
						</Link>
					</div>
				</section>

            <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-12">
                <h2 className="text-lime-500 text-lg md:text-2xl text-center font-medium capitalize mb-4">
                    Kembangkan Bisnis Anda Bersama Kami
                </h2>
                <p className="text-zinc-700 text-2xl md:text-3xl font-semibold text-center leading-relaxed mb-8">
                   Layanan Management Consulting Apa Yang Kami Tawarkan?
                </p>
                {/* Highlights row under hero text */}
						<ServiceHighlights items={[
							'business feasibility & evaluation',
							'Marketing Plan & Communications',
							'Strategic Planning'
						]} />
            </section>

            {/* MENGAPA PILIH KAMI SECTION */}
				<section className="px-6 md:px-20 py-20 bg-white">
					<h2 className="text-center text-3xl md:text-4xl font-bold text-zinc-800 mb-10">
						Mengapa Memilih PT Divus Global Mediacomm?
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
						{reasons.map((item) => (
							<div
								key={item.number}
								className="flex flex-col items-center text-center gap-5"
							>
								<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
									<span className="text-4xl font-bold text-green-500">
										{item.number}
									</span>
								</div>
                                <span className="inline-block ml-3 w-32 md:w-48 h-0.5 bg-zinc-300 rounded-full"></span>
								<h3 className="text-xl font-semibold text-zinc-800">
									{item.title}
								</h3>
								<p className="text-zinc-600">{item.desc}</p>
							</div>
						))}
					</div>
				</section>

            {/* CTA SECTION */}
			<section className="w-full px-4 md:px-24 py-4 mb-6">
				<div className="max-w-[1440px] mx-auto">
					<div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-gradient-to-b from-green-500 to-lime-500 px-4 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
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

            {/* WA Button */}
            <a
                href="https://wa.me/6285220203453"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
            >
                <FaWhatsapp size={32} className="text-white" />
            </a>
        </div>
    )
}