import { NextRequest, NextResponse } from 'next/server'

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean | string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  try {
    const { cep } = await params

    if (!cep) {
      return NextResponse.json(
        { error: 'CEP não informado' },
        { status: 400 }
      )
    }

    // Strip only digits
    const digitsOnly = cep.replace(/\D/g, '')

    // Validate CEP format (8 digits)
    if (!/^\d{8}$/.test(digitsOnly)) {
      return NextResponse.json(
        { error: 'CEP inválido. O CEP deve conter 8 dígitos.' },
        { status: 400 }
      )
    }

    // Consulta ViaCEP (gratuito, sem API key)
    const response = await fetch(
      `https://viacep.com.br/ws/${digitsOnly}/json/`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 }, // Cache por 24h
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao consultar o serviço de CEP' },
        { status: 502 }
      )
    }

    const data: ViaCEPResponse = await response.json()

    // ViaCEP retorna erro: true quando não encontra
    if (data.erro === true || data.erro === 'true') {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      street: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zip: data.cep || digitsOnly,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('Erro na consulta de CEP:', message)
    return NextResponse.json(
      { error: 'Erro ao consultar CEP. Tente novamente.' },
      { status: 500 }
    )
  }
}
