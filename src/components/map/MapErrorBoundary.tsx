"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="h-full flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border-red-500/30">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Map Error</h3>
            <p className="text-white/70 mb-4">
              Something went wrong while loading the map. This might be due to network issues or a configuration problem.
            </p>
            {this.state.error && (
              <details className="text-left mb-4 text-sm text-white/60 bg-black/20 p-3 rounded">
                <summary className="cursor-pointer hover:text-white/80">Technical Details</summary>
                <pre className="mt-2 text-xs overflow-auto">{this.state.error.message}</pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
