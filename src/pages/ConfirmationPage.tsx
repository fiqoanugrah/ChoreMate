import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"

const ConfirmationPage = () => {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">ICS GENERATED</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfirmationPage