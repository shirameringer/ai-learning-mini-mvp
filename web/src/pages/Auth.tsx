// web/src/pages/Auth.tsx
import { useState } from 'react';
import { Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { AuthAPI } from '../api/client';
import { setUser } from '../lib/auth';

/* Inline SVG icons – no external packages */
function IconPhone({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011-.25 11.36 11.36 0 003.56.57 1 1 0 011 1v3.61a1 1 0 01-1 1A17.36 17.36 0 013 4a1 1 0 011-1h3.61a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1z"/>
    </svg>
  );
}
function IconUser({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm0 2c-4 0-8 2-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-3-4-5-8-5z"/>
    </svg>
  );
}

/* Normalize phone: supports +972 and local */
function normalizePhone(raw: string): string {
  const d = (raw || '').replace(/\D+/g, '');
  if (d.startsWith('972') && d.length >= 11) return '0' + d.slice(3);
  if (d.length === 9 && !d.startsWith('0')) return '0' + d;
  return d;
}

/* Extract user safely from API response */
function extractUser(payload: any) {
  const data = payload?.ok === true ? payload?.data : payload;
  if (data && typeof data.id === 'number' && typeof data.phone === 'string' && data.phone.length > 0) {
    return { id: data.id, name: data.name ?? '', phone: data.phone };
  }
  return null;
}

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [needName, setNeedName] = useState(false); // false = Sign In, true = Sign Up
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const norm = normalizePhone(phone);
    try {
      if (!needName) {
        // Sign In (check)
        const { data } = await AuthAPI.check(norm);
        const u = extractUser(data);
        if (u) { setUser(u); window.location.href = '/app'; return; }
        setNeedName(true); // not found -> Sign Up
      } else {
        // Sign Up (register)
        const { data } = await AuthAPI.register(name.trim(), norm);
        const u = extractUser(data);
        if (u) { setUser(u); window.location.href = '/app'; return; }
        setErr('Registration response was not a valid user.');
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message;

      if (!needName && status === 404) setNeedName(true);
      else if (needName && status === 409) {
        try {
          const { data } = await AuthAPI.check(norm);
          const u = extractUser(data);
          if (u) { setUser(u); window.location.href = '/app'; return; }
          setErr('Phone exists but user could not be retrieved.');
        } catch { setErr('Login retry failed after 409.'); }
      } else if (status === 400 || status === 422) {
        setErr(message || 'Invalid input. Please check your phone number.');
      } else if (status === 500 || status === 0 || status === undefined) {
        setErr('Cannot reach server. Make sure the API is running and the URL is correct.');
      } else {
        setErr(message || 'An error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  const isSignUp = needName;
  const canSubmit =
    (!isSignUp && normalizePhone(phone).length >= 9) ||
    (isSignUp && normalizePhone(phone).length >= 9 && name.trim().length >= 2);

  return (
    <div className="auth-wrap">
      <div className="auth-container">
        <Card className="auth-card p-4 p-md-5">
          <Card.Body>
            {/* Dynamic title */}
            <div className="text-center mb-4">
              <h2 className="title-electro mb-1">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
              <div className="subtle">
                {isSignUp ? 'Create your account with phone number' : 'Sign in with your phone number'}
              </div>
            </div>

            {err && <Alert variant="danger" className="py-2">{err}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Label>Phone number</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text><IconPhone /></InputGroup.Text>
                <Form.Control
                  type="tel"
                  placeholder=""   /* no example text */
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoFocus
                />
              </InputGroup>

              {isSignUp && (
                <>
                  <Form.Label>Full name</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text><IconUser /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </InputGroup>
                </>
              )}

              <Button type="submit" disabled={loading || !canSubmit} className="w-100 btn-pill">
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Continue'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
