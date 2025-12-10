import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { scrapeRealEstateSite } from '@/services/scraper';


export async function POST(req: Request) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape the URL
        console.log(`Analyzing URL: ${url}`);
        const listings = await scrapeRealEstateSite(url);

        if (!listings || listings.length === 0) {
            return NextResponse.json({ error: 'Failed to scrape listing or no data found' }, { status: 404 });
        }

        const listing = listings[0]; // Assuming single property page for now logic

        // 2. Analyze with OpenAI
        const prompt = `
      Atue como um Consultor de Investimentos Imobiliários de alto nível.
      Analise os dados do anúncio do imóvel abaixo e forneça um relatório detalhado em Português do Brasil.
      
      Dados do Imóvel:
      Título: ${listing.title}
      Preço: ${listing.price}
      Localização: ${listing.location || 'Desconhecida'}
      Descrição: ${listing.description}
      Características: ${listing.features.join(', ')}
      
      Por favor, forneça:
      1. **Avaliação de Valor**: O preço é justo? (Estime com base no conhecimento geral se a localização for conhecida, caso contrário, analise preço/m² se disponível).
      2. **Potencial de Investimento**: Estimativa de ROI, potencial de aluguel (faça suposições educadas com base nos padrões do mercado).
      3. **Destaques Principais**: O que faz este imóvel se destacar?
      4. **Pontos de Atenção**: O que o comprador deve observar (Red Flags)?
      5. **Estratégia de Negociação**: Preço de oferta recomendado e estratégia.
      
      Formate a resposta em Markdown.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o',
        });

        const analysis = completion.choices[0].message.content;

        return NextResponse.json({
            listing,
            analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
