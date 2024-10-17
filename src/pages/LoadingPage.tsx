import React from 'react'
import { Card, CardContent } from "../components/ui/card"

const LoadingPage = () => {
  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">
            Loading.. we are generating your schedules...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoadingPage