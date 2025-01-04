import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface WelcomeEmailProps {
    username: string;
  }
  
  export const WelcomeEmail = ({ username }: WelcomeEmailProps) => (
    <Html>
      <Head />
      <Preview>Welcome to Our Platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {username}!</Heading>
          <Text style={text}>
            We&apos;re thrilled to have you on board. Get ready to explore all the amazing features our platform has to offer.
          </Text>
          <Section style={buttonContainer}>
            <Button
              style={{ ...button, padding: '12px 20px' }}
              href=""
            >
              Get Started
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, feel free to reply to this email. We&apos;re here to help!
          </Text>
          <Text style={footer}>
            Best regards,<br />
            The Your Platform Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default WelcomeEmail;
  
  // Styles
  const main = {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
  };
  
  const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    paddingBottom: '20px',
  };
  
  const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
  };
  
  const buttonContainer = {
    padding: '27px 0 27px',
  };
  
  const button = {
    backgroundColor: '#0070f3',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '170px',
  };
  
  const footer = {
    color: '#898989',
    fontSize: '14px',
    lineHeight: '24px',
    marginTop: '20px',
  };
  
  