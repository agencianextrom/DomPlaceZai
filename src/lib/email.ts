import Resend from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Criar cliente Resend apenas se a chave existir
let resendClient: Resend | null = null
if (RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY)
}

const FROM_EMAIL = 'DomPlace <notificacoes@domplace.com.br>'
const BRAND_COLOR = '#059669' // Verde esmeralda

function emailTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DomPlace</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; padding:20px 0;">
    <!-- Header -->
    <tr>
      <td style="background-color:${BRAND_COLOR}; padding:30px 40px; border-radius:12px 12px 0 0; text-align:center;">
        <h1 style="margin:0; color:white; font-size:28px; font-weight:700;">🏪 DomPlace</h1>
        <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">Dom Eliseu, Pará — Seu marketplace local</p>
      </td>
    </tr>
    <!-- Conteúdo -->
    <tr>
      <td style="background-color:white; padding:40px; border-left:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">
        ${content}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color:#f1f5f9; padding:24px 40px; border-radius:0 0 12px 12px; text-align:center; border-left:1px solid #e2e8f0; border-right:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 8px; color:#64748b; font-size:13px;">
          Recebido automaticamente por <strong style="color:${BRAND_COLOR};">DomPlace</strong>
        </p>
        <p style="margin:0; color:#94a3b8; font-size:12px;">
          Dom Eliseu, Pará, Brasil • <a href="#" style="color:${BRAND_COLOR}; text-decoration:none;">www.domplace.com.br</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

interface SendResult {
  success: boolean
  sent: boolean
  error?: string
  messageId?: string
}

export async function sendOrderConfirmation(
  to: string,
  orderData: {
    orderNumber: string
    storeName: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    paymentMethod: string
  }
): Promise<SendResult> {
  const { orderNumber, storeName, items, total, paymentMethod } = orderData

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; color:#334155;">
          ${item.name}
        </td>
        <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; color:#64748b; text-align:center;">
          ${item.quantity}x
        </td>
        <td style="padding:8px 0; border-bottom:1px solid #f1f5f9; color:#334155; text-align:right;">
          R$ ${item.price.toFixed(2).replace('.', ',')}
        </td>
      </tr>`
    )
    .join('')

  const htmlContent = `
    <h2 style="margin:0 0 16px; color:#1e293b; font-size:22px;">✅ Pedido Confirmado!</h2>
    <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
      Olá! Seu pedido foi recebido com sucesso e está sendo processado pela loja.
    </p>

    <div style="background-color:#f0fdf4; border-left:4px solid ${BRAND_COLOR}; padding:16px 20px; border-radius:0 8px 8px 0; margin:0 0 24px;">
      <p style="margin:0 0 4px; color:#64748b; font-size:13px;">Número do Pedido</p>
      <p style="margin:0; color:#1e293b; font-size:18px; font-weight:700;">#${orderNumber}</p>
    </div>

    <p style="margin:0 0 8px; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Loja</p>
    <p style="margin:0 0 20px; color:#1e293b; font-size:16px; font-weight:600;">${storeName}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <thead>
        <tr>
          <th style="text-align:left; padding:8px 0; color:#64748b; font-size:13px; font-weight:600; border-bottom:2px solid #e2e8f0;">Produto</th>
          <th style="text-align:center; padding:8px 0; color:#64748b; font-size:13px; font-weight:600; border-bottom:2px solid #e2e8f0;">Qtd</th>
          <th style="text-align:right; padding:8px 0; color:#64748b; font-size:13px; font-weight:600; border-bottom:2px solid #e2e8f0;">Preço</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="background-color:#f8fafc; padding:16px 20px; border-radius:8px; text-align:right; margin:0 0 20px;">
      <p style="margin:0 0 4px; color:#64748b; font-size:13px;">Total</p>
      <p style="margin:0; color:${BRAND_COLOR}; font-size:24px; font-weight:700;">R$ ${total.toFixed(2).replace('.', ',')}</p>
      <p style="margin:4px 0 0; color:#94a3b8; font-size:12px;">${paymentMethod}</p>
    </div>

    <p style="margin:0; color:#475569; font-size:14px; line-height:1.6;">
      Acompanhe o status do seu pedido em tempo real pelo DomPlace. 📦
    </p>
  `

  return sendEmail(to, 'Confirmação de Pedido — DomPlace', htmlContent)
}

export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const htmlContent = `
    <h2 style="margin:0 0 16px; color:#1e293b; font-size:22px;">🎉 Bem-vindo ao DomPlace!</h2>
    <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
      Olá, <strong>${name}</strong>! Que bom ter você por aqui. O DomPlace conecta você aos melhores negócios de Dom Eliseu e região.
    </p>

    <div style="background-color:linear-gradient(135deg, #f0fdf4, #ecfdf5); padding:20px; border-radius:12px; margin:0 0 24px; border:1px solid #bbf7d0;">
      <p style="margin:0 0 8px; color:${BRAND_COLOR}; font-size:16px; font-weight:700;">🎁 Presente de boas-vindas!</p>
      <p style="margin:0; color:#334155; font-size:14px; line-height:1.5;">
        Você recebeu <strong style="color:${BRAND_COLOR};">500 pontos de fidelidade</strong> para começar!
        Acumule pontos a cada compra e troque por descontos exclusivos.
      </p>
    </div>

    <div style="margin:0 0 24px;">
      <p style="margin:0 0 12px; color:#1e293b; font-size:15px; font-weight:600;">O que você pode fazer:</p>
      <ul style="margin:0; padding:0 0 0 20px; color:#475569; font-size:14px; line-height:2;">
        <li>🔍 Encontrar produtos e serviços locais</li>
        <li>🛒 Fazer pedidos com entrega rápida</li>
        <li>⭐ Avaliar lojas e produtos</li>
        <li>🎁 Acumular e trocar pontos de fidelidade</li>
      </ul>
    </div>

    <p style="margin:0; color:#475569; font-size:14px; line-height:1.6;">
      Explore o DomPlace e descubra tudo que a nossa cidade tem a oferecer! 🌟
    </p>
  `

  return sendEmail(to, 'Bem-vindo ao DomPlace! 🎉', htmlContent)
}

export async function sendPasswordReset(to: string, resetToken: string): Promise<SendResult> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://domplace.com.br'}/reset-password?token=${resetToken}`

  const htmlContent = `
    <h2 style="margin:0 0 16px; color:#1e293b; font-size:22px;">🔐 Redefinição de Senha</h2>
    <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
      Recebemos uma solicitação para redefinir a senha da sua conta no DomPlace.
    </p>

    <div style="background-color:#fffbeb; border-left:4px solid #f59e0b; padding:16px 20px; border-radius:0 8px 8px 0; margin:0 0 24px;">
      <p style="margin:0; color:#92400e; font-size:14px; line-height:1.5;">
        ⏰ Este link é válido por <strong>24 horas</strong>. Se você não solicitou a redefinição, ignore este e-mail.
      </p>
    </div>

    <div style="text-align:center; margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block; background-color:${BRAND_COLOR}; color:white; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:600;">
        Redefinir minha senha
      </a>
    </div>

    <p style="margin:0 0 8px; color:#94a3b8; font-size:13px; text-align:center;">
      Se o botão não funcionar, copie e cole este link no navegador:
    </p>
    <p style="margin:0 0 24px; color:#64748b; font-size:12px; text-align:center; word-break:break-all;">
      ${resetUrl}
    </p>

    <p style="margin:0; color:#475569; font-size:14px;">
      Equipe DomPlace 🏪
    </p>
  `

  return sendEmail(to, 'Redefinição de Senha — DomPlace', htmlContent)
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  // Se não há API key, logar e retornar sucesso simulado
  if (!RESEND_API_KEY || !resendClient) {
    console.log(`[Resend] Modo mock — email não enviado:`)
    console.log(`  Para: ${to}`)
    console.log(`  Assunto: ${subject}`)
    return { success: true, sent: false, error: 'no_resend_config' }
  }

  try {
    const result = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: emailTemplate(html),
    })

    if (result.error) {
      console.error('[Resend] Erro ao enviar email:', result.error)
      return { success: false, sent: false, error: result.error.message }
    }

    return { success: true, sent: true, messageId: result.data?.id }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Resend] Erro ao enviar email:', message)
    return { success: false, sent: false, error: message }
  }
}
