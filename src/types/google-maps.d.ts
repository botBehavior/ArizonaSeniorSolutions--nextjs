declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions)
      panTo(latLng: LatLng | LatLngLiteral): void
      fitBounds(bounds: LatLngBounds, padding?: number | { top: number; right: number; bottom: number; left: number }): void
      setCenter(latLng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getZoom(): number | undefined
    }

    class Marker {
      constructor(opts?: MarkerOptions)
      setMap(map: Map | null): void
      addListener(eventName: string, handler: () => void): void
      setIcon(icon: string | Icon | Symbol): void
      setZIndex(zIndex: number): void
      setAnimation(animation: Animation | null): void
      getTitle(): string | undefined
    }

    class LatLngBounds {
      constructor()
      extend(point: LatLng | LatLngLiteral): void
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions)
      open(map?: Map, anchor?: Marker): void
      close(): void
      setContent(content: string | HTMLElement): void
    }

    interface Point {
      x: number
      y: number
      equals(other: Point): boolean
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      styles?: MapTypeStyle[]
      mapTypeControl?: boolean
      fullscreenControl?: boolean
      streetViewControl?: boolean
      zoomControl?: boolean
      zoomControlOptions?: ZoomControlOptions
      gestureHandling?: string
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral
      map?: Map
      title?: string
      icon?: string | Icon | Symbol
      zIndex?: number
      animation?: Animation
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement
    }

    interface ZoomControlOptions {
      position?: ControlPosition
    }

    interface LatLng {
      lat(): number
      lng(): number
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface MapTypeStyle {
      featureType?: string
      elementType?: string
      stylers?: object[]
    }

    interface Icon {
      path: string
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
      scale?: number
      anchor?: Point
    }

    interface Symbol {
      path: string
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
      scale?: number
      anchor?: Point
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2
    }

    enum ControlPosition {
      RIGHT_BOTTOM = 4
    }
  }
}

declare global {
  interface Window {
    google: typeof google
  }
}
