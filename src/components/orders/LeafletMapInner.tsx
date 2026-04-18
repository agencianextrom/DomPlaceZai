'use client'

import { useEffect, useRef } from 'react'

// Import Leaflet and CSS client-side only
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons for webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Center of Dom Eliseu, PA
const MAP_CENTER: [number, number] = [-3.44, -47.36]
const MAP_ZOOM = 15

// Generate mock route points (real coordinates around Dom Eliseu)
function generateRoutePoints(): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const lat = -3.44 + t * 0.012 + Math.sin(t * Math.PI * 2) * 0.002
    const lng = -47.36 + t * 0.008 + Math.cos(t * Math.PI * 2.5) * 0.001
    points.push([lat, lng])
  }
  return points
}

const routePoints = generateRoutePoints()

function createCustomIcon(color: string, iconHtml: string): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:10;position:relative;">
          ${iconHtml}
        </div>
        <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:10px;height:10px;background:${color};transform:translateX(-50%) rotate(45deg);z-index:-1;"></div>
        <div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color}40;animation:pulse 2s infinite;"></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

interface LeafletMapInnerProps {
  storeName: string
  driverProgress: number
}

export default function LeafletMapInner({ storeName, driverProgress }: LeafletMapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const isReadyRef = useRef(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    })

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Store marker (start of route)
    const storeIcon = createCustomIcon(
      'rgb(16, 185, 129)',
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`
    )
    L.marker(routePoints[0], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<b>${storeName}</b>`)

    // Destination marker (end of route)
    const destIcon = createCustomIcon(
      'rgb(239, 68, 68)',
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`
    )
    L.marker(routePoints[routePoints.length - 1], { icon: destIcon })
      .addTo(map)
      .bindPopup('<b>Sua casa</b>')

    // Route polyline (dashed - remaining)
    L.polyline(routePoints, {
      color: 'rgb(16, 185, 129)',
      weight: 3,
      opacity: 0.3,
      dashArray: '8, 6',
    }).addTo(map)

    // Completed route (solid - will be updated)
    const completedRoute = L.polyline([routePoints[0]], {
      color: 'rgb(16, 185, 129)',
      weight: 3,
      opacity: 1,
    }).addTo(map)
    routeLayerRef.current = completedRoute

    // Driver marker
    const driverIcon = createCustomIcon(
      'rgb(245, 158, 11)',
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/></svg>`
    )
    const driverMarker = L.marker(routePoints[0], { icon: driverIcon })
      .addTo(map)
      .bindPopup('<b>Carlos Entregas</b><br>Moto Honda CG 150')
    driverMarkerRef.current = driverMarker

    // Fit bounds
    const bounds = L.latLngBounds(routePoints)
    map.fitBounds(bounds.pad(0.3))

    mapInstanceRef.current = map
    isReadyRef.current = true

    return () => {
      map.remove()
      mapInstanceRef.current = null
      routeLayerRef.current = null
      driverMarkerRef.current = null
    }
  }, [storeName])

  // Update driver position as progress changes
  useEffect(() => {
    if (!isReadyRef.current || !routeLayerRef.current || !driverMarkerRef.current) return

    const idx = Math.min(
      Math.floor(driverProgress * (routePoints.length - 1)),
      routePoints.length - 1
    )
    const currentPoint = routePoints[idx]
    const completedPoints = routePoints.slice(0, idx + 1)

    // Update completed route
    routeLayerRef.current.setLatLngs(completedPoints)

    // Update driver marker position
    driverMarkerRef.current.setLatLng(currentPoint)
  }, [driverProgress])

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 z-0"
      style={{ height: '100%', width: '100%' }}
    />
  )
}
