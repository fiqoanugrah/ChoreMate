import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PlusCircle, Download, Mail, LogOut } from 'lucide-react';
import axiosInstance from '../api/axios';

interface Event {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  schedules: {
    date: string;
    jobs: {
      name: string;
      assignee: string;
    }[];
  }[];
}

const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Event[]>('/events');
      setEvents(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events');
      setLoading(false);
    }
  };

  const handleAddNewEvent = () => {
    navigate('/create-event');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGenerateICS = async () => {
    try {
      const response = await axiosInstance.get('/events/generate-ics', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'events.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error generating ICS:', err);
      setError('Failed to generate ICS file');
    }
  };

  const handleSendEmail = async () => {
    try {
      await axiosInstance.post('/events/send-email');
      alert('Email sent successfully');
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <Button onClick={handleGenerateICS} className="mr-2">
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

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-lg font-semibold">No events found. Create a new event to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event._id} className="bg-secondary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{event.description}</p>
                <p className="text-xs mt-2">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold mb-2">Upcoming Schedules:</h4>
                  <ul className="text-xs">
                    {event.schedules.slice(0, 3).map((schedule, index) => (
                      <li key={index} className="mb-1">
                        {new Date(schedule.date).toLocaleDateString()}: 
                        {schedule.jobs.map(job => ` ${job.assignee} (${job.name})`).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;