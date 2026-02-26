import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the sidebar to manage categories, products, and orders.
        </CardContent>
      </Card>
    </div>
  )
}

