import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Assets } from '../../../assets';
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/router';

const reasons = [
	{
		number: 1,
		title: 'KONSULTAN BERPENGALAMAN & TERPERCAYA',
		desc: 'PT Divus diisi oleh para profesional berpengalaman yang memahami kebutuhan bisnis modern. Kami menghadirkan solusi cepat, tepat, dan berorientasi hasil untuk mendukung pertumbuhan perusahaan Anda.',
	},
	{
		number: 2,
		title: 'AHLI PROFESIONAL DI BERBAGAI BIDANG',
		desc: 'PT Divus diisi oleh para profesional berpengalaman yang memahami kebutuhan bisnis modern. Kami menghadirkan solusi cepat, tepat, dan berorientasi hasil untuk mendukung pertumbuhan perusahaan Anda.',
	},
	{
		number: 3,
		title: 'HASIL TERUKUR, CEPAT, & ANDAL',
		desc: 'PT Divus berkomitmen memberikan output berkualitas tinggi dengan proses yang efisien. Setiap rekomendasi disusun berbasis data dan insights sehingga menghasilkan keputusan bisnis yang lebih akurat dan efektif.',
	},
];

// Small responsive highlights row (used under the hero text)
const ServiceHighlights = ({ items }) => (
	<div className="w-full mt-6">
		<div className="max-w-6xl mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 justify-center">
				{items.map((text, idx) => (
					<div
						key={idx}
						className="w-full h-full min-h-[60px] bg-white rounded-2xl shadow-md outline outline-black p-4 flex justify-center items-center transition-transform hover:-translate-y-1"
					>
						<div className="text-black text-base md:text-lg font-normal text-center capitalize leading-tight whitespace-nowrap" title={text}>
							{text}
						</div>
					</div>
				))}
			</div>
		</div>
	</div>
);

export default function LayananProduk() {
	const router = useRouter();
	const { id } = router.query;
	
	const [serviceData, setServiceData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch data from API
	useEffect(() => {
		if (!id) return;

		const fetchServiceData = async () => {
			try {
				setLoading(true);
				const response = await fetch(`http://localhost:3000/api/services/${id}`);
				
				if (!response.ok) {
					throw new Error('Failed to fetch service data');
				}
				
				const data = await response.json();
                // console.log('Fetched service data:', data);
				setServiceData(data);
				setError(null);
			} catch (err) {
				setError(err.message);
				console.error('Error fetching service:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchServiceData();
	}, [id]);

	// Parse description to extract services list
	const parseServices = (description) => {
		if (!description) return [];
		
		// Extract items from markdown list format
		const match = description.match(/\*\*Layanan yang ditawarkan:\*\*\n((?:- .+\n?)+)/);
		if (!match) return [];
		
		return match[1]
			.split('\n')
			.filter(line => line.startsWith('- '))
			.map(line => line.replace('- ', '').trim());
	};

	// Loading state
	if (loading) {
		return (
			<div className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center">
				<div className="text-xl text-gray-600">Loading...</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center">
				<div className="text-xl text-red-600">Error: {error}</div>
			</div>
		);
	}

	// No data state
	if (!serviceData) {
		return (
			<div className="relative w-full bg-white overflow-hidden min-h-screen flex items-center justify-center">
				<div className="text-xl text-gray-600">Service not found</div>
			</div>
		);
	}

	const services = parseServices(serviceData.description);

	return (
		<div className="relative w-full bg-white overflow-hidden">

			<header className="relative w-full">
				{/* Hero Banner */}
				<section className="w-full bg-slate-50 py-14 md:py-30 px-6 border-b border-slate-200">
					<div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-20">

						{/* Text Content */}
						<div className="flex flex-col justify-center">
							<h1 className="text-zinc-800 text-xl md:text-3xl font-bold leading-tight">
								Layanan {serviceData.title}
							</h1>
							<p className="text-zinc-500 text-sm md:text-base text-center font-medium italic">
								Jasa Konsultan Di Bidang {serviceData.title}
							</p>
						</div>
					</div>
				</section>

				{/* Breadcrumb */}
				<div className="w-full bg-zinc-300 py-3 mb-4">
					<div className="max-w-7xl mx-auto">
						<p className="text-zinc-800 text-base">
							{/* Level 1: Beranda */}
							<Link href="/User/Home" className="hover:underline hover:text-green-600 transition-colors">
								Beranda
							</Link>

							{/* Separator */}
							<span className="mx-2 text-zinc-500">{'>'}</span>

							{/* Level 2: Kategori (Misal: Layanan) */}
							<Link href="/User/Layanan" className="hover:underline hover:text-green-600 transition-colors">
								Layanan
							</Link>

							{/* Separator */}
							<span className="mx-2 text-zinc-500">{'>'}</span>

							{/* Level 3: Halaman Aktif (Merah) */}
							<span className="text-red-600 font-medium">
								{serviceData.title}
							</span>
						</p>
					</div>
				</div>
			</header>

			{/* TENTANG KAMI SECTION */}
			<section className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 flex flex-col lg:flex-row lg:items-center gap-10">
				<div className="w-full lg:w-1/2 flex justify-center">
					<div className="w-[635px] h-96 overflow-hidden rounded-2xl">
						<img
							className="w-full h-full object-cover rounded-2xl"
							src={serviceData.image_url || Assets.ServicePlaceholder}
							alt={`Foto Layanan ${serviceData.title}`}
						/>
					</div>
				</div>

				<div className="w-full lg:w-1/2 flex flex-col justify-center items-start gap-8">
					<h1 className="text-zinc-800 text-2xl lg:text-3xl font-bold leading-tight">
						Apa Itu {serviceData.title}?
					</h1>
					<p
					className="text-zinc-800 text-base font-normal leading-6 text-justify"
					dangerouslySetInnerHTML={{
						__html: serviceData.description
						.replace(/\*\*Layanan yang ditawarkan:\*\*\n((?:- .+\n?)+)/, '')
						.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
						.trim()
					}}
					/>

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
					Layanan {serviceData.title} Apa Yang Kami Tawarkan?
				</p>
				{/* Highlights row under hero text */}
				{services.length > 0 ? (
					<ServiceHighlights items={services} />
				) : (
					<p className="text-center text-gray-500">Tidak ada layanan yang tersedia</p>
				)}
			</section>

			{/* MENGAPA PILIH KAMI SECTION */}
			<section className="px-6 md:px-20 py-20 bg-white">
				<p className='text-lime-500 text-lg md:text-xl text-center font-medium leading-tight mb-4'>
					Alasan Anda Menggunakan Layanan Kami
				</p>
				<h2 className="text-center text-3xl md:text-4xl font-bold text-zinc-800 mb-10">
					Kenapa harus Kami?
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

							<h3 className="text-xl font-semibold text-zinc-800">
								{item.title}
							</h3>
							<p className="text-zinc-600">{item.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA SECTION */}
							<section className="px-6 md:px-20 py-16 md:py-6 overflow-hidden">
								<div className="max-w-7xl mx-auto">
									<div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
										{/* Background layer for gradient and image */}
										<div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
											{/* Background image 1 with low opacity */}
											<div
												className="absolute inset-0 opacity-10 pointer-events-none"
												style={{
													backgroundImage: `url(${Assets.Banner1})`,
													backgroundRepeat: 'no-repeat',
													backgroundSize: 'cover',
													backgroundPosition: 'center',
												}}
											></div>
										</div>
										{/* Content layer */}
										<div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
											{/* Judul */}
											<h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10 ">
												PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" />
												terpercaya untuk bisnis Anda!
											</h2>
											{/* Subjudul */}
											<p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">
												Hubungi kami dan dapatkan panduan dari konsultan berpengalaman
											</p>
											{/* Tombol CTA */}
											<a href="https://wa.me/62812345678" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
												<FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
												<span className="text-black text-base md:text-lg font-semibold font-['Poppins'] capitalize">
													Konsultasi Sekarang
												</span>
											</a>
										</div>
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