import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { DatePickerWithRange } from "../components/ui/date-picker-with-range"
import { InputTags } from "../components/ui/input-tags"
import { Checkbox } from "../components/ui/checkbox"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const alertOptions = [
  { value: "none", label: "None" },
  { value: "at_time", label: "At time of event" },
  { value: "5_min", label: "5 minutes before" },
  { value: "10_min", label: "10 minutes before" },
  { value: "15_min", label: "15 minutes before" },
  { value: "30_min", label: "30 minutes before" },
  { value: "1_hour", label: "1 hour before" },
  { value: "2_hours", label: "2 hours before" },
  { value: "1_day", label: "1 day before" },
  { value: "2_days", label: "2 days before" },
]

const LoadingPage = () => (
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

const ConfirmationPage = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => (
  <div className="container mx-auto p-4 h-screen flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">ICS GENERATED</h2>
        <Button onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  </div>
)

const CreateEventPage = () => {
  const navigate = useNavigate()
  const [eventName, setEventName] = useState('')
  const [teammates, setTeammates] = useState<string[]>([])
  const [jobs, setJobs] = useState<string[]>([])
  const [jobAssignments, setJobAssignments] = useState<Record<string, Record<string, boolean>>>({})
  const [jobLimits, setJobLimits] = useState<Record<string, number>>({})
  const [description, setDescription] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  const [alert, setAlert] = useState("none")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    generateDescriptionTemplate()
  }, [jobAssignments, teammates, jobs, jobLimits, dateRange])

  const generateDescriptionTemplate = () => {
    const startDate = dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'TBD'
    const endDate = dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'TBD'

    let template = `Event: ${eventName}\n`
    template += `Duration: ${startDate} to ${endDate}\n\n`
    template += `Daily Chore Assignments:\n`
    
    jobs.forEach(job => {
      const limit = jobLimits[job] || 0
      const assignedTeammates = Object.entries(jobAssignments[job] || {})
        .filter(([_, isAssigned]) => isAssigned)
        .map(([teammate, _]) => teammate)
      
      template += `${job}:\n`
      template += `  - ${limit} person(s) per day\n`
      template += `  - Assigned pool: ${assignedTeammates.join(', ')}\n\n`
    })

    template += 'Note: Daily assignments will be randomized from the assigned pool for each job.\n'
    template += 'The system will ensure fair distribution over time.\n\n'
    template += 'Additional Details:\n'
    template += '[Your custom description will appear here]\n\n'
    template += 'This schedule is subject to change. Please check regularly for updates.'

    setDescription(template)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    const finalDescription = description.replace('[Your custom description will appear here]', customDescription)
    console.log('New event:', { eventName, teammates, jobs, jobAssignments, jobLimits, description: finalDescription, dateRange, alert })
    setIsLoading(false)
    setIsConfirmed(true)
  }

  const handleJobAssignment = (job: string, teammate: string, checked: boolean) => {
    setJobAssignments(prev => ({
      ...prev,
      [job]: {
        ...prev[job],
        [teammate]: checked
      }
    }))
  }

  const handleAllAssignment = (teammate: string, checked: boolean) => {
    const newAssignments = { ...jobAssignments }
    jobs.forEach(job => {
      if (!newAssignments[job]) newAssignments[job] = {}
      newAssignments[job][teammate] = checked
    })
    setJobAssignments(newAssignments)
  }

  const handleJobLimitChange = (job: string, limit: number) => {
    setJobLimits(prev => ({
      ...prev,
      [job]: limit
    }))
  }

  if (isLoading) {
    return <LoadingPage />
  }

  if (isConfirmed) {
    return <ConfirmationPage onBackToDashboard={() => navigate('/dashboard')} />
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input 
                id="eventName" 
                value={eventName} 
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Teammates/Roommates</Label>
              <InputTags
                value={teammates}
                onChange={setTeammates}
                placeholder="Add teammate"
              />
            </div>

            <div>
              <Label>What are the jobs?</Label>
              <InputTags
                value={jobs}
                onChange={setJobs}
                placeholder="Add job"
              />
            </div>

            {jobs.length > 0 && teammates.length > 0 && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left font-medium">Teammates</th>
                        {jobs.map(job => (
                          <th key={job} className="p-2 text-center font-medium">{job}</th>
                        ))}
                        <th className="p-2 text-center font-medium">ALL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teammates.map((teammate, index) => (
                        <tr key={teammate} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                          <td className="p-2 font-medium">{teammate}</td>
                          {jobs.map(job => (
                            <td key={`${teammate}-${job}`} className="p-2 text-center">
                              <Checkbox
                                checked={jobAssignments[job]?.[teammate] || false}
                                onCheckedChange={(checked) => handleJobAssignment(job, teammate, checked as boolean)}
                                className="mx-auto"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <Checkbox
                              onCheckedChange={(checked) => handleAllAssignment(teammate, checked as boolean)}
                              className="mx-auto"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {jobs.map(job => (
                    <div key={job} className="flex items-center space-x-2">
                      <Label htmlFor={`limit-${job}`}>{job} (per day):</Label>
                      <Input
                        id={`limit-${job}`}
                        type="number"
                        min="1"
                        max={teammates.length}
                        value={jobLimits[job] || ''}
                        onChange={(e) => handleJobLimitChange(job, parseInt(e.target.value, 10))}
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>How about the schedules?</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={(newDateRange) => setDateRange(newDateRange as { from: Date | undefined; to: Date | undefined })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                readOnly
                className="mb-2 h-64"
              />
              <Textarea
                id="customDescription"
                placeholder="Add any additional description here"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="alert">Alert</Label>
              <Select value={alert} onValueChange={setAlert}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert time" />
                </SelectTrigger>
                <SelectContent>
                  {alertOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">Generate Schedule</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateEventPage