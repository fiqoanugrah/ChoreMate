import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { PlusCircle, Download, Mail, Star } from 'lucide-react'

// Mock data for saved events
const savedEvents = [
  { id: 1, title: 'Weekly Cleaning', description: 'Regular house cleaning schedule' },
  { id: 2, title: 'Monthly Groceries', description: 'Grocery shopping and restocking' },
  { id: 3, title: 'Rent Payment', description: 'Monthly rent payment reminder' },
  { id: 4, title: 'Utility Bills', description: 'Payment for electricity, water, and internet' },
]

const DashboardPage = () => {
  const navigate = useNavigate()

  const handleDownloadICS = () => {
    console.log('Downloading ICS file')
  }

  const handleSendEmail = () => {
    console.log('Sending ICS file via email')
  }

  const handleAddNewEvent = () => {
    navigate('/create-event')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard list of events</h1>
      
      <div className="flex justify-between mb-4">
        <div>
          <Button onClick={handleDownloadICS} className="mr-2">
            <Download className="mr-2 h-4 w-4" /> Download ICS
          </Button>
          <Button onClick={handleSendEmail} variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Send to Email
          </Button>
        </div>
        <Button onClick={handleAddNewEvent}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedEvents.map((event) => (
          <Card key={event.id} className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {event.title}
              </CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage