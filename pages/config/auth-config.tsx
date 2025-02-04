import { Button, Heading, Image, Text, View } from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.medium}>
        <Image
          alt="SASE logo"
          src="logo.png"
          width="200px"
          height="auto"
        />
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.medium}>
        <Text color={tokens.colors.neutral[80]}>
          &copy; All Rights Reserved
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Sign in to your account
        </Heading>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
          >
            Reset Password
          </Button>
        </View>
      );
    },
  },

  SignUp: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Create a new account
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
          >
            Back to Sign In
          </Button>
        </View>
      );
    },
  },

  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },

  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },

  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },

  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },

  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={{ base: `${tokens.space.medium} 0 0 ${tokens.space.medium}`, medium: `${tokens.space.xl} 0 0 ${tokens.space.xl}` }}
          level={3}
          fontSize={{ base: '1.5rem', medium: '2rem' }}
          textAlign={{ base: 'center', medium: 'left' }} // Centered on mobile, left on larger screens
        >
          Enter Information:
        </Heading>
      );
    },
    Footer() {
      return <Text>Footer Information</Text>;
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
      label: 'Email',
    },
    password: {
      label: 'Password',
    }
  },
  signUp: {
    email: {
      label: 'Email',
      placeholder: 'Enter your email',
      order: 1,
    },
    password: {
      label: 'Password',
      placeholder: 'Create a password',
      order: 2,
    },
    confirm_password: {
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      order: 3,
    },
  },
  forceNewPassword: {
    password: {
      label: 'New Password',
      placeholder: 'Enter new password',
    },
  },
  forgotPassword: {
    username: {
      label: 'Email',
      placeholder: 'Enter your email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      label: 'Confirmation Code',
      placeholder: 'Enter confirmation code',
      isRequired: true,
    },
    password: {
      label: 'New Password',
      placeholder: 'Enter new password',
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: 'SASE UC Merced',
      totpUsername: '@sase.org',
    },
    confirmation_code: {
      label: 'Confirmation Code',
      placeholder: 'Enter authentication code',
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: 'Confirmation Code',
      placeholder: 'Enter authentication code',
    },
  },
};

export { components, formFields };

export default function AuthUI() {
  return null;
}