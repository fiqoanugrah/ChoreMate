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
import axiosInstance from '../api/axios'
import LoadingPage from './LoadingPage'
import ConfirmationPage from './ConfirmationPage'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'

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

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()
  const [eventName, setEventName] = useState('')
  const [teammates, setTeammates] = useState<string[]>([])
  const [jobs, setJobs] = useState<string[]>([])
  const [jobAssignments, setJobAssignments] = useState<Record<string, Record<string, boolean>>>({})
  const [jobLimits, setJobLimits] = useState<Record<string, number>>({})
  const [description, setDescription] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  })
  const [alert, setAlert] = useState("none")
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateDescriptionTemplate()
  }, [jobAssignments, teammates, jobs, jobLimits, dateRange, eventName])

  const generateDescriptionTemplate = () => {
    const startDate = dateRange?.from ? new Date(dateRange.from).toLocaleDateString() : 'TBD'
    const endDate = dateRange?.to ? new Date(dateRange.to).toLocaleDateString() : 'TBD'

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
    setError('')

    console.log('Submitting form with the following data:');
    console.log('Event Name:', eventName);
    console.log('Teammates:', teammates);
    console.log('Jobs:', jobs);
    console.log('Date Range:', dateRange);
    console.log('Job Assignments:', jobAssignments);
    console.log('Job Limits:', jobLimits);

    if (!eventName.trim()) {
      setError('Please enter an event name');
      setIsLoading(false);
      return;
    }

    if (teammates.length === 0) {
      setError('Please add at least one teammate');
      setIsLoading(false);
      return;
    }

    if (jobs.length === 0) {
      setError('Please add at least one job');
      setIsLoading(false);
      return;
    }

    if (!dateRange || !dateRange.from || !dateRange.to) {
      setError('Please select a date range');
      setIsLoading(false);
      return;
    }

    // Check if all jobs have at least one assignee
    const missingAssignments = jobs.filter(job => 
      !Object.values(jobAssignments[job] || {}).some(assigned => assigned)
    );

    if (missingAssignments.length > 0) {
      setError(`Please assign at least one person to: ${missingAssignments.join(', ')}`);
      setIsLoading(false);
      return;
    }

    try {
      const eventData = {
        name: eventName,
        teammates: teammates,
        jobs: jobs.map(job => ({
          name: job,
          assigneesPerDay: jobLimits[job] || 1,
          assignees: teammates.filter(teammate => jobAssignments[job]?.[teammate])
        })),
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        description: customDescription || description,
        alert: alert
      };

      console.log('Sending event data:', JSON.stringify(eventData, null, 2));

      const response = await axiosInstance.post('/events', eventData);
      console.log('Event saved successfully:', response.data);
      setIsLoading(false);
      setIsConfirmed(true);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Error saving event:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error('Request:', err.request);
        setError('No response received from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError(`Error: ${err.message}`);
      }
    }
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
    return <ConfirmationPage />
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
              <Label htmlFor="teammates">Teammates/Roommates</Label>
              <InputTags
                id="teammates"
                value={teammates}
                onChange={setTeammates}
                placeholder="Add teammate"
              />
            </div>

            <div>
              <Label htmlFor="jobs">What are the jobs?</Label>
              <InputTags
                id="jobs"
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
                                id={`${teammate}-${job}`}
                                checked={jobAssignments[job]?.[teammate] || false}
                                onCheckedChange={(checked) => handleJobAssignment(job, teammate, checked as boolean)}
                                aria-label={`Assign ${teammate} to ${job}`}
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <Checkbox
                              id={`${teammate}-all`}
                              onCheckedChange={(checked) => handleAllAssignment(teammate, checked as boolean)}
                              aria-label={`Assign ${teammate} to all jobs`}
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
              <Label htmlFor="dateRange">How about the schedules?</Label>
              <DatePickerWithRange
                id="dateRange"
                date={dateRange}
                setDate={(newDateRange) => {
                  console.log('New date range:', newDateRange);
                  setDateRange(newDateRange);
                }}
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
              <Label htmlFor="customDescription">Additional Details</Label>
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
                <SelectTrigger id="alert">
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

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit">Save Schedule</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateEventPage