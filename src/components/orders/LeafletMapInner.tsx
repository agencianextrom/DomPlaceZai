'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons for webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Fallback center of Dom Eliseu, PA
const DEFAULT_CENTER: [number, number] = [-3.3917, -50.3558]
const DEFAULT_ZOOM = 16

interface Coordinate {
  lat: number
  lng: number
}

interface LeafletMapInnerProps {
  storeName?: string
  driverLocation?: Coordinate | null
  storeLocation?: Coordinate & { name?: string } | null
  destinationLocation?: Coordinate & { address?: string } | null
  driverName?: string
  driverVehicle?: string
  progress?: number
  // Legacy props for fallback (when no real tracking data)
  driverProgress?: number
}

function createCustomIcon(color: string, iconSvg: string, pulse?: boolean): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:10;position:relative;">
          ${iconSvg}
        </div>
        <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:10px;height:10px;background:${color};transform:translateX(-50%) rotate(45deg);z-index:-1;"></div>
        ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;border:2px solid ${color}40;animation:pulse 2s infinite;"></div>` : ''}
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

const storeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`
const destIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`
const driverIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/></svg>`

export default function LeafletMapInner({
  storeName = 'Loja',
  driverLocation,
  storeLocation,
  destinationLocation,
  driverName = 'Entregador',
  driverVehicle = '',
  progress,
  driverProgress,
}: LeafletMapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const storeMarkerRef = useRef<L.Marker | null>(null)
  const destMarkerRef = useRef<L.Marker | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const hasInitializedRef = useRef(false)

  // Determine if we have real tracking data
  const hasRealData = !!(driverLocation && storeLocation && destinationLocation)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      storeMarkerRef.current = null
      destMarkerRef.current = null
      driverMarkerRef.current = null
      routeLayerRef.current = null
      hasInitializedRef.current = false
    }
  }, [])

  // Place markers and route when real tracking data is available
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (hasRealData && driverLocation && storeLocation && destinationLocation) {
      // Clear previous markers if re-initializing
      if (storeMarkerRef.current) {
        map.removeLayer(storeMarkerRef.current)
        storeMarkerRef.current = null
      }
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current)
        destMarkerRef.current = null
      }
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current)
        driverMarkerRef.current = null
      }
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current)
        routeLayerRef.current = null
      }

      const storeCoord: L.LatLngExpression = [storeLocation.lat, storeLocation.lng]
      const destCoord: L.LatLngExpression = [destinationLocation.lat, destinationLocation.lng]
      const driverCoord: L.LatLngExpression = [driverLocation.lat, driverLocation.lng]

      // Store marker
      const sIcon = createCustomIcon('rgb(16, 185, 129)', storeIconSvg)
      const sMarker = L.marker(storeCoord, { icon: sIcon })
        .addTo(map)
        .bindPopup(`<b>${storeLocation.name || storeName}</b>`)
      storeMarkerRef.current = sMarker

      // Destination marker
      const dIcon = createCustomIcon('rgb(239, 68, 68)', destIconSvg)
      const dMarker = L.marker(destCoord, { icon: dIcon })
        .addTo(map)
        .bindPopup(`<b>${destinationLocation.address || 'Seu endereço'}</b>`)
      destMarkerRef.current = dMarker

      // Route polyline (store -> destination)
      const routePoints: L.LatLngExpression[] = [storeCoord, driverCoord, destCoord]
      const route = L.polyline(routePoints, {
        color: 'rgb(16, 185, 129)',
        weight: 3,
        opacity: 0.3,
        dashArray: '8, 6',
      }).addTo(map)
      routeLayerRef.current = route

      // Driver marker with pulse
      const drIcon = createCustomIcon('rgb(245, 158, 11)', driverIconSvg, true)
      const drMarker = L.marker(driverCoord, { icon: drIcon })
        .addTo(map)
        .bindPopup(`<b>${driverName}</b><br>${driverVehicle}`)
      driverMarkerRef.current = drMarker

      // Fit bounds around all points
      const bounds = L.latLngBounds([storeCoord, driverCoord, destCoord])
      map.fitBounds(bounds.pad(0.4))

      hasInitializedRef.current = true
    }
  }, [hasRealData, storeName, driverName, driverVehicle])

  // Update driver position on location updates
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !driverMarkerRef.current || !driverLocation) return

    // Only update if map was initialized with real data
    if (!hasInitializedRef.current) return

    const newCoord: L.LatLngExpression = [driverLocation.lat, driverLocation.lng]
    driverMarkerRef.current.setLatLng(newCoord)

    // Update route polyline to include current driver position
    if (routeLayerRef.current && storeLocation && destinationLocation) {
      routeLayerRef.current.setLatLngs([
        [storeLocation.lat, storeLocation.lng],
        newCoord,
        [destinationLocation.lat, destinationLocation.lng],
      ])
    }
  }, [driverLocation, storeLocation, destinationLocation])

  // Fallback: legacy mock route with driverProgress
  useEffect(() => {
    if (hasRealData) return // Skip if we have real data

    const map = mapInstanceRef.current
    if (!map) return

    if (driverProgress === undefined) return

    if (hasInitializedRef.current) return

    // Legacy mock behavior
    const routePoints: [number, number][] = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const lat = DEFAULT_CENTER[0] + t * 0.005 + Math.sin(t * Math.PI * 2) * 0.001
      const lng = DEFAULT_CENTER[1] + t * 0.003 + Math.cos(t * Math.PI * 2.5) * 0.0005
      routePoints.push([lat, lng])
    }

    // Store marker
    const sIcon = createCustomIcon('rgb(16, 185, 129)', storeIconSvg)
    L.marker(routePoints[0], { icon: sIcon })
      .addTo(map)
      .bindPopup(`<b>${storeName}</b>`)

    // Destination marker
    const dIcon = createCustomIcon('rgb(239, 68, 68)', destIconSvg)
    L.marker(routePoints[routePoints.length - 1], { icon: dIcon })
      .addTo(map)
      .bindPopup('<b>Seu endereço</b>')

    // Route dashed
    L.polyline(routePoints, {
      color: 'rgb(16, 185, 129)',
      weight: 3,
      opacity: 0.3,
      dashArray: '8, 6',
    }).addTo(map)

    // Completed route solid
    const completedRoute = L.polyline([routePoints[0]], {
      color: 'rgb(16, 185, 129)',
      weight: 3,
      opacity: 1,
    }).addTo(map)
    routeLayerRef.current = completedRoute

    // Driver marker
    const drIcon = createCustomIcon('rgb(245, 158, 11)', driverIconSvg, true)
    const drMarker = L.marker(routePoints[0], { icon: drIcon })
      .addTo(map)
      .bindPopup(`<b>${driverName}</b>`)
    driverMarkerRef.current = drMarker

    const bounds = L.latLngBounds(routePoints)
    map.fitBounds(bounds.pad(0.3))
    hasInitializedRef.current = true

    // Update driver position in fallback mode
    const updateFallback = () => {
      if (!routeLayerRef.current || !driverMarkerRef.current) return
      const idx = Math.min(
        Math.floor((driverProgress ?? 0) * (routePoints.length - 1)),
        routePoints.length - 1
      )
      const currentPoint = routePoints[idx]
      const completedPoints = routePoints.slice(0, idx + 1)
      routeLayerRef.current.setLatLngs(completedPoints)
      driverMarkerRef.current.setLatLng(currentPoint)
    }

    updateFallback()

    return () => {
      // Cleanup on unmount
    }
  }, [hasRealData, driverProgress, storeName, driverName])

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 z-0"
      style={{ height: '100%', width: '100%' }}
    />
  )
}
