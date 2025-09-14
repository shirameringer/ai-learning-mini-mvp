// web/src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, clearUser } from '../lib/auth';
import { CatalogAPI, LessonsAPI } from '../api/client';
import type { Category, SubCategory } from '../types';
import dayjs from 'dayjs';

type Lesson = {
  id: number;
  title?: string;
  content?: string;
  contentMarkdown?: string | null;
  contentJson?: { markdown?: string; text?: string; content?: string } | null;
  createdAt: string;
};

function extractBody(l: Lesson) {
  return (
    l?.contentMarkdown ??
    l?.content ??
    l?.contentJson?.markdown ??
    l?.contentJson?.text ??
    l?.contentJson?.content ??
    ''
  );
}

export default function Dashboard() {
  const me = getUser()!;
  const navigate = useNavigate();

  // catalog
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [loadingCats, setLoadingCats] = useState(true);
  const [catErr, setCatErr] = useState<string | null>(null);

  // create
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  // history
  const [history, setHistory] = useState<Lesson[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [histErr, setHistErr] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    (async () => {
      setCatErr(null);
      setLoadingCats(true);
      try {
        const { data } = await CatalogAPI.getCategories();
        setCategories(data?.data ?? data ?? []);
      } catch (e: any) {
        setCatErr(e?.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // Load user history (with auto-redirect on 404 User not found)
  useEffect(() => {
    (async () => {
      setHistErr(null);
      setLoadingHistory(true);
      try {
        const res = await LessonsAPI.listByUser(me.id);
        setHistory((res.data?.data ?? res.data ?? []) as Lesson[]);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 404) {
          // User was deleted (likely after DB seed) -> clear and re-auth
          clearUser();
          navigate('/auth', { replace: true });
          return;
        }
        setHistErr(e?.response?.data?.message || 'Failed to load history');
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [me.id, navigate]);

  const subs: SubCategory[] =
    categories.find((c) => c.id === categoryId)?.subCategories || [];

  const canSubmit = useMemo(
    () => !!(me?.id && categoryId && subCategoryId && prompt.trim().length >= 5),
    [me?.id, categoryId, subCategoryId, prompt]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setCreateErr(null);
    setCreating(true);
    try {
      // Create lesson
      const { data } = await LessonsAPI.create({
        userId: me.id,
        categoryId: categoryId as number,
        subCategoryId: subCategoryId as number,
        prompt: prompt.trim(),
      });
      const created = (data?.data ?? data) as { id: number };

      // Fetch full lesson and prepend to history
      const full = await LessonsAPI.getOne(created.id);
      const fullLesson = (full.data?.data ?? full.data) as Lesson;
      setHistory((prev) => [fullLesson, ...prev]);
      setPrompt('');
      // Optional: navigate(`/lesson/${fullLesson.id}`);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404 || status === 401) {
        // user missing/unauthorized -> require re-auth
        clearUser();
        navigate('/auth', { replace: true });
        return;
      }
      setCreateErr(e?.response?.data?.message || 'Failed to create lesson');
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <h2 className="page-title">Learning Platform</h2>

      <div className="container">
        {/* Welcome */}
        <Card className="welcome-bar mb-3">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>Welcome, {me.name}!</div>
            <div />
          </Card.Body>
        </Card>

        {/* Select */}
        <Card className="panel mb-3">
          <Card.Body>
            <div className="panel-header mb-2">Select What You Want to Learn</div>
            {catErr && <Alert variant="danger" className="py-2">{catErr}</Alert>}
            {loadingCats ? (
              <Spinner animation="border" />
            ) : (
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={categoryId || ''}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : '';
                      setCategoryId(v);
                      setSubCategoryId('');
                    }}
                  >
                    <option value="">Choose a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Sub-Category</Form.Label>
                  <Form.Select
                    value={subCategoryId || ''}
                    onChange={(e) =>
                      setSubCategoryId(e.target.value ? Number(e.target.value) : '')
                    }
                    disabled={!categoryId}
                  >
                    <option value="">Choose a sub-category…</option>
                    {subs.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Prompt */}
        <Card className="panel mb-3">
          <Card.Body>
            <div className="panel-header mb-2">Send a Prompt</div>
            {createErr && <Alert variant="danger" className="py-2">{createErr}</Alert>}
            <Form onSubmit={handleCreate}>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Your prompt *"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-3"
                disabled={!categoryId || !subCategoryId}
              />
              <Button
                type="submit"
                className="w-100"
                disabled={!canSubmit || creating}
              >
                {creating ? 'Creating…' : 'SUBMIT'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* History - symmetric compact grid */}
        <Card className="panel mb-4">
          <Card.Body>
            <div className="panel-header mb-3">Learning History</div>
            {histErr && <Alert variant="danger" className="py-2">{histErr}</Alert>}
            {loadingHistory ? (
              <Spinner animation="border" />
            ) : history.length === 0 ? (
              <div className="text-muted">No lessons yet.</div>
            ) : (
              <div className="history-grid">
                {history.map((l) => {
                  const snippet = (extractBody(l) || '')
                    .replace(/\s+/g, ' ')
                    .slice(0, 160);
                  return (
                    <Link
                      key={l.id}
                      to={`/lesson/${l.id}`}
                      className="history-card text-decoration-none"
                    >
                      <div className="title" title={l.title || 'Lesson'}>
                        {l.title || 'Lesson'}
                      </div>
                      <div className="snippet">{snippet}</div>
                      <div className="meta">
                        <span>{dayjs(l.createdAt).format('DD.MM.YYYY, HH:mm')}</span>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/lesson/${l.id}`);
                          }}
                        >
                          Open
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
