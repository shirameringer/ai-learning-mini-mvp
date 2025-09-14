// web/src/components/LessonHistoryList.tsx
import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

// Matches your Prisma schema
export type Lesson = {
  id: number;
  title?: string;
  content?: string;
  contentMarkdown?: string | null;
  contentJson?: { markdown?: string; text?: string; content?: string } | null;
  createdAt: string;
  categoryId: number;
  subCategoryId: number;
};

// --- Display helpers ---
function getTitle(l: Lesson) {
  return l?.title ?? '';
}
function getBody(l: Lesson) {
  return (
    l?.contentMarkdown ??
    l?.content ??
    l?.contentJson?.markdown ??
    l?.contentJson?.text ??
    l?.contentJson?.content ??
    ''
  );
}
function getSnippet(l: Lesson, len = 100) {
  const body = (getBody(l) || '').replace(/\s+/g, ' ').trim();
  if (body.length <= len) return body;
  return body.slice(0, len).trimEnd() + '…';
}

type Props = {
  items: Lesson[];
  onOpen: (id: number) => void; // Action to open a lesson
  emptyText?: string;           // Custom text when there are no lessons
};

export default function LessonHistoryList({ items, onOpen, emptyText }: Props) {
  if (!items || items.length === 0) {
    return <div className="text-muted">{emptyText || 'No lessons yet.'}</div>;
  }

  return (
    <ListGroup variant="flush">
      {items.map((lesson) => (
        <ListGroup.Item key={lesson.id} className="py-3">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div className="me-3" style={{ minWidth: 260 }}>
              <div className="fw-semibold text-truncate" style={{ maxWidth: 520 }}>
                {getTitle(lesson) || '(Untitled)'}
              </div>
              <small className="text-muted d-block" style={{ maxWidth: 520 }}>
                {getSnippet(lesson, 100) || '—'}
              </small>
              <small className="text-muted">
                {dayjs(lesson.createdAt).format('DD.MM.YYYY HH:mm')}
              </small>
            </div>

            <div className="d-flex align-items-start">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onOpen(lesson.id)}
              >
                Open lesson
              </Button>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
