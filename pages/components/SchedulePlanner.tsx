import React, { useState, useEffect } from 'react';
import { View, Heading, Button, Flex, Card } from '@aws-amplify/ui-react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import { useAuth } from '../context/AuthContext';
import AddEventDialog from './AddEventDialog';
import DeleteEventDialog from './DeleteEventDialog';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

/** The shape returned by Amplify’s `Schedule.list()`. Update if your model has more fields. */
interface AmplifySchedule {
  id: string;
  title: string | null;
  start: string | null;
  end: string | null;
  type: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
  // If your schema has more fields, add them here
}

const SchedulePlanner = () => {
  const [currentScheduleType, setCurrentScheduleType] = useState<'recurring' | 'temporary'>('recurring');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [pendingSelection, setPendingSelection] = useState<any>(null);

  /**
   * FullCalendar requires `EventInput[]`.
   * We'll fetch from Amplify and convert to `EventInput[]` by replacing `null` with `undefined`.
   */
  const [events, setEvents] = useState<EventInput[]>([]);

  const { userEmail } = useAuth();

  /**
   * Fetch personal events when userEmail or currentScheduleType changes.
   * Convert `null` start/end to `undefined` for FullCalendar.
   */
  useEffect(() => {
    // Skip if there's no userEmail
    if (!userEmail) return;

    const fetchEvents = async () => {
      try {
        const response = await client.models.Schedule.list({
          filter: { username: { eq: userEmail } },
        });

        // Convert each AmplifySchedule to FullCalendar's EventInput
        const mapped: EventInput[] = response.data.map((item: AmplifySchedule) => ({
          id: item.id,
          title: item.title ?? '',
          start: item.start ?? undefined, // null => undefined
          end: item.end ?? undefined,     // null => undefined
          backgroundColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
          borderColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
          // If you want to store custom data, put it in `extendedProps`
          // extendedProps: { type: item.type, ...etc },
        }));

        setEvents(mapped);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [userEmail, currentScheduleType]);

  /**
   * Called when user selects a timeslot on the calendar. 
   * We store it in `pendingSelection` and open the AddEventDialog.
   */
  const handleDateSelect = (selectInfo: any) => {
    setPendingSelection({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setShowEventDialog(true);
  };

  /**
   * Called when user clicks an existing event in the calendar.
   * We store that event and open the DeleteEventDialog.
   */
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setShowDeleteDialog(true);
  };

  /**
   * Handle saving a new event (or multiple recurring events) to the backend.
   * Then re-fetch from Amplify to refresh FullCalendar events.
   */
  const handleEventSave = async (eventData: any) => {
    try {
      if (!userEmail) return;

      const baseDate = new Date(pendingSelection?.start);

      // Parse start time from dialog (e.g. "09:30")
      const [startHours, startMinutes] = eventData.startTime.split(':');
      const startDate = new Date(baseDate);
      startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0);

      // Parse end time
      const [endHours, endMinutes] = eventData.endTime.split(':');
      const endDate = new Date(baseDate);
      endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0);

      let eventsToCreate = [];

      // If user selected recurring + days of week
      if (eventData.isRecurring && eventData.selectedDays?.length > 0) {
        const numberOfWeeks = 12; // e.g. next 12 weeks
        const selectedDays = eventData.selectedDays;

        for (let week = 0; week < numberOfWeeks; week++) {
          for (const dayOfWeek of selectedDays) {
            const eventStart = new Date(startDate);
            const eventEnd = new Date(endDate);

            // e.g. offset to the next occurrence of dayOfWeek
            const daysToAdd =
              (dayOfWeek - startDate.getDay() + 7 * week + 7) % 7 + 7 * Math.floor(week);

            eventStart.setDate(startDate.getDate() + daysToAdd);
            eventEnd.setDate(endDate.getDate() + daysToAdd);

            eventsToCreate.push({
              title: eventData.title,
              start: eventStart.toISOString(),
              end: eventEnd.toISOString(),
              type: currentScheduleType,
              username: userEmail,
              isRecurring: true,
              selectedDays: JSON.stringify(selectedDays),
            });
          }
        }
      } else {
        // Otherwise, one-time event
        eventsToCreate.push({
          title: eventData.title,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          type: currentScheduleType,
          username: userEmail,
          isRecurring: false,
          selectedDays: '[]',
        });
      }

      // Create each event in the backend
      for (const evt of eventsToCreate) {
        await client.models.Schedule.create(evt);
      }

      // Close dialog + reset selection
      setShowEventDialog(false);
      setPendingSelection(null);

      // Now re-fetch to see new events in the calendar
      const response = await client.models.Schedule.list({
        filter: { username: { eq: userEmail } },
      });

      // Map them to valid FullCalendar events (null => undefined)
      const mapped: EventInput[] = response.data.map((item: AmplifySchedule) => ({
        id: item.id,
        title: item.title ?? '',
        start: item.start ?? undefined,
        end: item.end ?? undefined,
        backgroundColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
        borderColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
      }));

      setEvents(mapped);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  /**
   * Handle deleting the currently selected event from the backend, then re-fetch.
   */
  const handleEventDelete = async () => {
    try {
      if (!selectedEvent || !userEmail) return;

      await client.models.Schedule.delete({
        id: selectedEvent.id, // FullCalendar's event has { id, ... }
      });

      setShowDeleteDialog(false);
      setSelectedEvent(null);

      // Re-fetch to refresh the UI
      const response = await client.models.Schedule.list({
        filter: { username: { eq: userEmail } },
      });

      const mapped: EventInput[] = response.data.map((item: AmplifySchedule) => ({
        id: item.id,
        title: item.title ?? '',
        start: item.start ?? undefined,
        end: item.end ?? undefined,
        backgroundColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
        borderColor: currentScheduleType === 'recurring' ? '#1a73e8' : '#ea4335',
      }));

      setEvents(mapped);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <View padding="2rem">
      <Card>
        <Flex direction="column" gap="2rem">
          {/* Schedule Type Selector */}
          <Flex justifyContent="center" gap="1rem">
            <Button
              onClick={() => setCurrentScheduleType('recurring')}
              variation={currentScheduleType === 'recurring' ? 'primary' : undefined}
            >
              Recurring Schedule
            </Button>
            <Button
              onClick={() => setCurrentScheduleType('temporary')}
              variation={currentScheduleType === 'temporary' ? 'primary' : undefined}
            >
              Temporary Schedule
            </Button>
          </Flex>

          {/* Calendar */}
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            slotMinTime="08:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            selectable
            selectMirror
            editable
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            select={handleDateSelect}
            eventClick={handleEventClick}
            events={events} // Now typed + processed for FullCalendar
          />

          {/* Add Event Dialog */}
          {showEventDialog && (
            <AddEventDialog
              onClose={() => {
                setShowEventDialog(false);
                setPendingSelection(null);
              }}
              onSave={handleEventSave}
              selection={pendingSelection}
              scheduleType={currentScheduleType}
            />
          )}

          {/* Delete Event Dialog */}
          {showDeleteDialog && (
            <DeleteEventDialog
              onClose={() => {
                setShowDeleteDialog(false);
                setSelectedEvent(null);
              }}
              onDelete={handleEventDelete}
              event={selectedEvent}
            />
          )}
        </Flex>
      </Card>
    </View>
  );
};

export default SchedulePlanner;
