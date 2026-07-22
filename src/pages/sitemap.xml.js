import prisma from '../lib/prisma';

const generateSiteMap = (services) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Halaman Utama -->
     <url>
       <loc>https://www.divusglobal.com</loc>
     </url>
     <url>
       <loc>https://www.divusglobal.com/tentang-kami</loc>
     </url>
     <url>
       <loc>https://www.divusglobal.com/kontak</loc>
     </url>
     <url>
       <loc>https://www.divusglobal.com/produk</loc>
     </url>
     <url>
       <loc>https://www.divusglobal.com/proyek</loc>
     </url>
     <url>
       <loc>https://www.divusglobal.com/layanan</loc>
     </url>
     
     <!-- Halaman Detail Layanan Dinamis -->
     ${services
       .map(({ id }) => {
         return `
       <url>
           <loc>https://www.divusglobal.com/layanan/${id}</loc>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  try {
    const services = await prisma.services.findMany({ select: { id: true } });
    const sitemap = generateSiteMap(services);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("Gagal generate sitemap:", error);
    res.setHeader('Content-Type', 'text/xml');
    res.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    res.end();
  }

  return {
    props: {},
  };
}

export default function SiteMap() {
    // getServerSideProps handles the response
}
