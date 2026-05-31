import { NextRequest, NextResponse } from 'next/server'

// In-memory cache: 1 hora
const cepCache = new Map<string, {
  data: Record<string, unknown>
  timestamp: number
}>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hora

// Limpar cache expirado periodicamente (a cada 5 min)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCacheCleanup = Date.now()

function cleanExpiredCache() {
  const now = Date.now()
  if (now - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
    for (const [key, entry] of cepCache) {
      if (now - entry.timestamp > CACHE_TTL) {
        cepCache.delete(key)
      }
    }
    lastCacheCleanup = now
  }
}

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

    // Manter apenas dígitos
    const digitsOnly = cep.replace(/\D/g, '')

    // Validar formato do CEP (8 dígitos)
    if (!/^\d{8}$/.test(digitsOnly)) {
      return NextResponse.json(
        { error: 'CEP inválido. O CEP deve conter 8 dígitos.' },
        { status: 400 }
      )
    }

    // Verificar cache em memória
    cleanExpiredCache()
    const cached = cepCache.get(digitsOnly)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Consulta ViaCEP (gratuito, sem API key)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    let response: Response
    try {
      response = await fetch(
        `https://viacep.com.br/ws/${digitsOnly}/json/`,
        {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }
      )
    } catch (fetchError) {
      clearTimeout(timeout)
      // Retornar cache expirado se a API estiver fora do ar
      if (cached) {
        return NextResponse.json(cached.data)
      }
      return NextResponse.json(
        { error: 'Serviço de consulta de CEP indisponível. Tente novamente.' },
        { status: 502 }
      )
    }

    clearTimeout(timeout)

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

    const result = {
      street: data.logradouro || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      stateFull: data.estado || '',
      zip: data.cep || digitsOnly,
      ddd: data.ddd || '',
      ibge: data.ibge || '',
    }

    // Salvar no cache
    cepCache.set(digitsOnly, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('Erro na consulta de CEP:', message)
    return NextResponse.json(
      { error: 'Erro ao consultar CEP. Tente novamente.' },
      { status: 500 }
    )
  }
}
