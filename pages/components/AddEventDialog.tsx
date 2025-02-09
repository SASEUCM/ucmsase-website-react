import React, { useState } from 'react';
import {
  View,
  Heading,
  TextField,
  Button,
  Flex,
  CheckboxField,
  SelectField,
  Text,
} from '@aws-amplify/ui-react';

interface AddEventDialogProps {
  onClose: () => void;
  onSave: (eventData: any) => void;
  selection: {
    start: Date;
    end: Date;
  };
  scheduleType: 'recurring' | 'temporary';
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({
  onClose,
  onSave,
  selection,
  scheduleType
}) => {
  const [title, setTitle] = useState('');
  const [repeatType, setRepeatType] = useState('none');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(
    selection?.start?.toTimeString().substring(0, 5) || ''
  );
  const [endTime, setEndTime] = useState(
    selection?.end?.toTimeString().substring(0, 5) || ''
  );

  const weekdays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      title,
      startTime,
      endTime,
      isRecurring: scheduleType === 'recurring' && repeatType === 'weekly',
      selectedDays: selectedDays,
      originalStart: selection.start,
      originalEnd: selection.end,
    };

    onSave(eventData);
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
          zIndex: 10000,
        }}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <Heading level={3}>Add Schedule Block</Heading>

            <TextField
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter title (e.g., CS 101, Club Meeting)"
              required
              size="large"
            />

            <Flex gap="1rem">
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
                size="large"
                flex="1"
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
                size="large"
                flex="1"
              />
            </Flex>

            {scheduleType === 'recurring' && (
              <>
                <SelectField
                  label="Repeat"
                  value={repeatType}
                  onChange={e => setRepeatType(e.target.value)}
                  size="large"
                >
                  <option value="none">Does not repeat</option>
                  <option value="weekly">Weekly</option>
                </SelectField>

                {repeatType === 'weekly' && (
                  <View>
                    <Text>Repeat on:</Text>
                    <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem">
                      {weekdays.map(day => (
                        <CheckboxField
                          key={day.value}
                          label={day.label}
                          name={`day-${day.value}`}
                          value={String(day.value)} // Changed here: Convert number to string
                          checked={selectedDays.includes(day.value)}
                          onChange={() => handleDayToggle(day.value)}
                          size="large"
                        />
                      ))}
                    </Flex>
                  </View>
                )}
              </>
            )}

            <Flex gap="1rem" justifyContent="flex-end" marginTop="1rem">
              <Button 
                onClick={onClose} 
                variation="link"
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variation="primary"
                size="large"
              >
                Save
              </Button>
            </Flex>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AddEventDialog;