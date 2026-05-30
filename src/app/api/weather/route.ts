import { NextRequest, NextResponse } from 'next/server'

// Coordenadas de Dom Eliseu, PA
const LAT = -3.3728
const LON = -47.3556

// Códigos WMO → descrições em português e ícones
const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Céu limpo', icon: 'sun' },
  1: { condition: 'Predominantemente limpo', icon: 'sun' },
  2: { condition: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { condition: 'Nublado', icon: 'cloud' },
  45: { condition: 'Nevoeiro', icon: 'cloud-fog' },
  48: { condition: 'Nevoeiro com geada', icon: 'cloud-fog' },
  51: { condition: 'Chuvisco leve', icon: 'cloud-drizzle' },
  53: { condition: 'Chuvisco moderado', icon: 'cloud-drizzle' },
  55: { condition: 'Chuvisco intenso', icon: 'cloud-drizzle' },
  56: { condition: 'Chuvisco congelante leve', icon: 'cloud-drizzle' },
  57: { condition: 'Chuvisco congelante intenso', icon: 'cloud-drizzle' },
  61: { condition: 'Chuva leve', icon: 'cloud-rain' },
  63: { condition: 'Chuva moderada', icon: 'cloud-rain' },
  65: { condition: 'Chuva forte', icon: 'cloud-rain-wind' },
  66: { condition: 'Chuva congelante leve', icon: 'cloud-hail' },
  67: { condition: 'Chuva congelante forte', icon: 'cloud-hail' },
  71: { condition: 'Neve leve', icon: 'snowflake' },
  73: { condition: 'Neve moderada', icon: 'snowflake' },
  75: { condition: 'Neve forte', icon: 'snowflake' },
  77: { condition: 'Granizo', icon: 'cloud-hail' },
  80: { condition: 'Pancadas leves', icon: 'cloud-rain' },
  81: { condition: 'Pancadas moderadas', icon: 'cloud-rain' },
  82: { condition: 'Pancadas fortes', icon: 'cloud-rain-wind' },
  85: { condition: 'Neve leve (pancadas)', icon: 'snowflake' },
  86: { condition: 'Neve forte (pancadas)', icon: 'snowflake' },
  95: { condition: 'Tempestade', icon: 'cloud-lightning' },
  96: { condition: 'Tempestade com granizo leve', icon: 'cloud-lightning' },
  99: { condition: 'Tempestade com granizo forte', icon: 'cloud-lightning' },
}

function getWeatherInfo(code: number): { condition: string; icon: string } {
  return WMO_CODES[code] ?? { condition: 'Indisponível', icon: 'cloud' }
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    is_day: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || String(LAT))
    const lon = parseFloat(searchParams.get('lon') || String(LON))

    // Validar coordenadas
    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 }
      )
    }

    // Consulta Open-Meteo (gratuito, sem API key)
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lon))
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day')
    url.searchParams.set('timezone', 'America/Belem')

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 1800 }, // Cache por 30 minutos
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao consultar o serviço de clima' },
        { status: 502 }
      )
    }

    const data: OpenMeteoResponse = await response.json()
    const current = data.current
    const weatherInfo = getWeatherInfo(current.weather_code)

    return NextResponse.json({
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      isDay: current.is_day === 1,
      lat,
      lon,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    console.error('Erro na consulta de clima:', message)
    return NextResponse.json(
      { error: 'Erro ao consultar clima. Tente novamente.' },
      { status: 500 }
    )
  }
}
