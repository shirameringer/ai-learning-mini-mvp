import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { LessonsAPI } from '../api/client';

type Lesson = {
  id: number;
  title?: string | null;
  content?: string | null;
  contentMarkdown?: string | null;
  contentJson?: { markdown?: string; text?: string; content?: string } | null;
  createdAt: string;
  category?: { name: string } | null;
  subCategory?: { name: string } | null;
};

function pickMarkdown(l: Lesson | null): string {
  if (!l) return '';
  return (
    l.contentMarkdown ??
    l.contentJson?.markdown ??
    l.contentJson?.content ??
    l.contentJson?.text ??
    l.content ??
    ''
  );
}

function mdToPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^- \s*/gm, '• ')
    .trim();
}

export default function LessonView() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await LessonsAPI.getOne(Number(id));
        setLesson((res.data?.data ?? res.data) as Lesson);
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const md = useMemo(() => pickMarkdown(lesson), [lesson]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(mdToPlain(md));
    } catch {}
  };

  return (
    <div className="lesson-container">
      {/* thin gradient strip */}
      <div className="lesson-topbar"></div>

      {/* toolbar */}
      <div className="lesson-toolbar">
        <Link to="/app" className="back-link">← Back</Link>
        <Button className="copy-btn" onClick={handleCopyText}>Copy Text</Button>
      </div>

      {loading ? (
        <div className="center"><Spinner animation="border" /></div>
      ) : err ? (
        <div className="center error">{err}</div>
      ) : !lesson ? (
        <div className="center">Lesson not found.</div>
      ) : (
        /* single large card */
        <div className="card-glow" style={{ paddingTop: 16 }}>
          {/* header row (chips + date) */}
          <div className="d-flex align-items-center gap-2 mb-3">
            {lesson.category?.name && (
              <Badge bg="light" text="dark" className="chip chip-gradient">
                {lesson.category.name}
              </Badge>
            )}
            {lesson.subCategory?.name && (
              <Badge bg="light" text="dark" className="chip chip-outline">
                {lesson.subCategory.name}
              </Badge>
            )}
            <div className="ms-auto lesson-date">
              {dayjs(lesson.createdAt).format('DD.MM.YYYY, HH:mm:ss')}
            </div>
          </div>

          {/* markdown content (single block) */}
          <div className="markdown-body lesson-single-markdown">
            <ReactMarkdown>{md}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
