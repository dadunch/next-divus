import prisma from '../../../../lib/prisma';
import { serialize } from '../../../../lib/utils';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method tidak diizinkan" });
    }

    const { servicesId } = req.query;


    // Validasi serviceId
    if (!servicesId || isNaN(servicesId)) {
        return res.status(400).json({ 
            error: `Service ID tidak valid: ${servicesId}` 
        });    
    }

    try {
        const subServices = await prisma.sub_services.findMany({
        where: { services_id: BigInt(servicesId) },
        orderBy: { id: 'asc' }
        });

        return res.status(200).json(serialize(subServices));
    } catch (error) {
        console.error('Error fetching sub_services by service:', error);
        return res.status(500).json({ error: "Gagal mengambil data sub layanan" });
    }
}