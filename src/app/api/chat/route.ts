import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `Você é o assistente virtual do DomPlace, o marketplace local de Dom Eliseu, Pará, Brasil.
Você ajuda clientes com:
- Informações sobre lojas, produtos e preços
- Status de pedidos e entregas
- Promoções e cupons de desconto
- Funcionamento e horários das lojas
- Formas de pagamento (Pix, cartão, dinheiro)
- Políticas de devolução e troca
- Como usar o app

Responda sempre em português brasileiro de forma amigável e prestativa.
Seja conciso mas completo. Use emojis ocasionalmente.
Se não souber algo, diga que pode verificar e ofereça ajuda.

Dom Eliseu é uma pequena cidade no Pará, Brasil.
Lojas principais: Mercado do Zé (mercearia), Açaí da Boa (açaí), Padaria Pão Quente (padaria),
Agropecuária São Paulo (agrícola), Farmácia Vida (farmácia), Loja do Eletrônico,
Pet Shop Amigo Fiel, Salão da Bella (beleza).
Formas de pagamento: Pix (preferencial), Cartão de crédito/débito, Dinheiro na entrega.
Taxa de entrega varia por loja (R$0 a R$8). Frete grátis acima de R$25-50 em algumas lojas.`

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('entrega') || msg.includes('frete') || msg.includes('tempo')) {
    return '🚚 A entrega em Dom Eliseu é rápida! Geralmente de 20min a 1h dependendo da loja. Algumas lojas oferecem frete grátis acima de R$25-50. Aceitamos Pix, cartão e dinheiro!'
  }
  if (msg.includes('pagamento') || msg.includes('pix') || msg.includes('cartão')) {
    return '💳 Aceitamos **Pix** (preferencial, aprovação instantânea), **Cartão** de crédito/débito, e **Dinheiro** na entrega. O pagamento é seguro e protegido!'
  }
  if (msg.includes('devolução') || msg.includes('troca') || msg.includes('reclamação')) {
    return '🔄 Se não ficou satisfeito, entre em contato com a loja pelo chat do pedido. Aceitamos devoluções em até 24h para produtos perecíveis e 7 dias para demais itens. Seu dinheiro é devolvido via Pix.'
  }
  if (msg.includes('horário') || msg.includes('funciona') || msg.includes('aberto')) {
    return '🕐 A maioria das lojas funciona de 7h às 21h. A Padaria abre às 5h! Farmácia Vida e Mercado do Zé abrem todos os dias. Verifique a página da loja para horários específicos.'
  }
  if (msg.includes('promoção') || msg.includes('desconto') || msg.includes('cupom')) {
    return '🎉 Cupons ativos: **ACAI10** (10% desconto Açaí da Boa), **FRETE5** (R$5 desconto frete), **GRATIS** (frete grátis acima R$30). Use no checkout! Algumas lojas têm promoções na página delas.'
  }
  if (msg.includes('loja') || msg.includes('produtos')) {
    return '🏪 Temos 8 lojas: Mercado do Zé, Açaí da Boa, Padaria Pão Quente, Agropecuária SP, Farmácia Vida, Loja do Eletrônico, Pet Shop Amigo Fiel e Salão da Bella. Use a busca para encontrar produtos específicos!'
  }
  if (msg.includes('olá') || msg.includes('ola') || msg.includes('oi') || msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite')) {
    return '👋 Olá! Bem-vindo ao DomPlace! Sou seu assistente virtual e posso ajudar com informações sobre lojas, produtos, entregas, pagamentos e muito mais. Como posso ajudar?'
  }

  return 'Posso ajudar com informações sobre lojas, produtos, pedidos, promoções e muito mais! Pergunte-me sobre entregas, pagamentos, horários ou cupons de desconto. 😊'
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'Por favor, envie uma mensagem válida.' }, { status: 400 })
    }

    // Format conversation history for context
    const historyMessages = (history || []).slice(-6).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'bot' ? 'assistant' : 'user',
      content: msg.content,
    }))

    const messages = [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
      ...historyMessages,
      { role: 'user' as const, content: message },
    ]

    // Call LLM using the SDK
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ reply: getFallbackResponse(message) })
    }

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    console.error('Chat API error:', error)

    // Fallback to keyword-based responses if SDK fails
    let message = ''
    try {
      const body = await request.clone().json()
      message = body.message || ''
    } catch {
      // ignore parse error
    }

    const reply = getFallbackResponse(message)
    return NextResponse.json({ reply })
  }
}
