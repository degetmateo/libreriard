import { Request, Response } from 'express';
import { MongoProductRepository } from '../../infrastructure/database/repositories/mongo-product.repository';

export class SitemapController {
  private readonly productRepo = new MongoProductRepository();

  public generate = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { items: products } = await this.productRepo.findMany({ isActive: true, limit: 1000 });
      const baseUrl = 'https://libreriard.com.ar';
      const today = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static routes
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/terms-and-conditions</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/privacy-policy</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

      // Active Catalog Products
      for (const p of products) {
        const lastMod = p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : today;
        const prodId = p.id ? p.id.toValue() : '';
        if (prodId) {
          xml += `  <url>\n    <loc>${baseUrl}/?product=${prodId}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }
      }

      xml += '</urlset>';

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      res.status(200).send(xml);
    } catch (err) {
      console.error('Error al generar sitemap.xml:', err);
      res.status(500).send('Error generating sitemap');
    }
  };
}
