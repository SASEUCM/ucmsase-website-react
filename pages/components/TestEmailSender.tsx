// components/TestEmailSender.tsx
import React, { useState } from 'react';
import {
  Button,
  Alert,
  Flex,
  Text,
  Loader,
} from '@aws-amplify/ui-react';

export default function TestEmailSender() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const sendTestEmails = async () => {
    if (!confirm('Are you sure you want to send test emails to all active subscribers?')) {
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test emails');
      }

      setStatus({
        type: 'success',
        message: `Successfully sent test emails to ${data.recipientCount} subscribers`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send test emails'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" gap="1rem">
      <Button
        onClick={sendTestEmails}
        isDisabled={loading}
        variation="primary"
        className="blue-button"
      >
        {loading ? <Loader /> : 'Send Test Emails'}
      </Button>

      {status.type && (
        <Alert
          variation={status.type}
          isDismissible={true}
          hasIcon={true}
        >
          <Text>{status.message}</Text>
        </Alert>
      )}
    </Flex>
  );
}