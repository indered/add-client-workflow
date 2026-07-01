import { Button, Card, Form, Heading, Input, InputOTP, Label, Typography } from '@heroui/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type AdvisorLoginProps = {
  onLogin: (email: string) => void;
};

export function AdvisorLogin({ onLogin }: AdvisorLoginProps) {
  const [email, setEmail] = useState('advisor@waterlily.com');
  const [otp, setOtp] = useState('000000');
  const [isOtpStep, setIsOtpStep] = useState(false);

  const sendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otp) {
      setOtp('000000');
    }
    setIsOtpStep(true);
  };

  const verifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.trim()) {
      onLogin(email);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-default p-4 text-foreground">
      <Card className="w-full max-w-md">
        <Card.Content className="grid gap-6 p-6">
          <div className="grid gap-2 text-center">
            <Heading level={1}>Waterlily</Heading>
            <Typography type="body-xs" color="muted">
              {isOtpStep ? 'Enter the OTP to finish signing in.' : 'Sign in to manage clients and intake progress.'}
            </Typography>
          </div>
          <Form className="grid gap-4" onSubmit={isOtpStep ? verifyOtp : sendOtp}>
            {isOtpStep ? (
              <>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input aria-label="Email" name="email" value={email} readOnly />
                </div>
                <div className="grid gap-1.5">
                  <Label>OTP</Label>
                  <InputOTP aria-label="OTP" autoFocus maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTP.Group className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 6 }, (_, index) => (
                        <InputOTP.Slot className="size-12" index={index} key={index} />
                      ))}
                    </InputOTP.Group>
                  </InputOTP>
                </div>
                <Button className="bg-black text-white hover:bg-black/90" fullWidth isDisabled={!otp.trim()} type="submit" variant="primary">
                  Verify OTP
                </Button>
                <Button fullWidth type="button" variant="ghost" onPress={() => {
                  setOtp('');
                  setIsOtpStep(false);
                }}>
                  Change email
                </Button>
              </>
            ) : (
              <>
                <Input aria-label="Email" name="email" placeholder="advisor@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <Button className="bg-black text-white hover:bg-black/90" fullWidth type="submit" variant="primary">
                  Send OTP
                </Button>
              </>
            )}
          </Form>
          <Typography className="text-center" type="body-xs" color="muted">
            Any email and any OTP will work for now.
          </Typography>
        </Card.Content>
      </Card>
    </main>
  );
}
