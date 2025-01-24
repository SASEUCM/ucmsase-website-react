import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

import { Authenticator } from '@aws-amplify/ui-react'

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
      
    <Authenticator>
      <Component {...pageProps} />;
    </Authenticator>
  );
}
