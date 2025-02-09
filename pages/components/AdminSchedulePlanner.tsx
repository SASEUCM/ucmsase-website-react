import React, { useState, useEffect } from 'react';
import { View, Heading, Flex, Card, Text } from '@aws-amplify/ui-react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import type { EventInput } from '@fullcalendar/core'; // Correct import from '@fullcalendar/core'

const client = generateClient<Schema>();

type AmplifySchedule = {
  id: string;
  title: string | null;
  start: string | null;
  end: string | null;
  type: string | null;
  username: string | null;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
};

const getColorForUser = (username: string | null | undefined) => {
  const colors = [
    '#4285f4',
    '#ea4335',
    '#fbbc05',
    '#34a853',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#009688',
    '#ff5722',
    '#795548',
  ];
  const index = (username || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const AdminSchedulePlanner = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const { userEmail } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await client.models.Schedule.list();
        const validUsernames = response.data
          .map((schedule: AmplifySchedule) => schedule.username)
          .filter((username): username is string => !!username);

        const uniqueUsers = Array.from(new Set(validUsernames));
        setAllUsers(uniqueUsers);
        setSelectedUsers(uniqueUsers); // default: show all
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await client.models.Schedule.list();
        const schedules: AmplifySchedule[] = response.data;

        const filteredSchedules = schedules.filter(
          (schedule) => schedule.username && selectedUsers.includes(schedule.username)
        );

        const mappedEvents: EventInput[] = filteredSchedules.map((schedule) => ({
          id: schedule.id,
          title: `${schedule.username}: ${schedule.title ?? ''}`,
          backgroundColor: getColorForUser(schedule.username),
          borderColor: getColorForUser(schedule.username),
          start: schedule.start ? new Date(schedule.start) : undefined,
          end: schedule.end ? new Date(schedule.end) : undefined,
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [selectedUsers]);

  const handleUserFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Collect multiple selected options into an array
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedUsers(selectedOptions);
  };

  return (
    <View padding="2rem">
      <Card>
        <Flex direction="column" gap="2rem">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={3}>All User Schedules</Heading>

            {/* Replace SelectField with native <select multiple> */}
            <View width="300px">
              <View
                as="select"
                multiple
                size={Math.min(allUsers.length, 6)} // show up to 6 visible options
                value={selectedUsers}
                onChange={handleUserFilterChange}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                {allUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </View>
            </View>
          </Flex>

          {/* User Legend */}
          <Flex gap="1rem" wrap="wrap">
            {selectedUsers.map((user) => (
              <Flex
                key={user}
                alignItems="center"
                gap="0.5rem"
                padding="0.5rem"
                backgroundColor={`${getColorForUser(user)}15`}
                borderRadius="medium"
              >
                <View
                  width="12px"
                  height="12px"
                  backgroundColor={getColorForUser(user)}
                  borderRadius="50%"
                />
                <Text fontSize="small">{user}</Text>
              </Flex>
            ))}
          </Flex>

          {/* Calendar */}
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            slotMinTime="08:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            height="auto"
            eventContent={renderEventContent}
          />
        </Flex>
      </Card>
    </View>
  );
};

const renderEventContent = (eventInfo: any) => {
  const { event } = eventInfo;
  return (
    <Flex direction="column" gap="0.25rem" padding="0.25rem">
      <Text fontSize="small" fontWeight="bold">
        {event.title}
      </Text>
      <Text fontSize="x-small">
        {new Date(event.start).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Flex>
  );
};

export default AdminSchedulePlanner;
