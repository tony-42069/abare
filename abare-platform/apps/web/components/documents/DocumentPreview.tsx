import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  Stack,
  Center,
  Loader,
  Button,
} from '@mantine/core';
import {
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPreviewProps {
  documentId: string;
  filename: string;
  fileType: string;
}

export function DocumentPreview({ documentId, filename, fileType }: DocumentPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (err: Error) => {
    setError(err.message);
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Failed to download document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
    }
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  if (!fileType.includes('pdf')) {
    return (
      <Card shadow="sm" p="xl">
        <Stack align="center" gap="md">
          <Text size="lg">Preview not available for this file type</Text>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
          >
            Download File
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      <Card shadow="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <ActionIcon
              variant="light"
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Text>
              Page {pageNumber} of {numPages || '?'}
            </Text>
            <ActionIcon
              variant="light"
              onClick={handleNextPage}
              disabled={pageNumber >= (numPages || 1)}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="light" onClick={handleZoomOut}>
              <IconZoomOut size={16} />
            </ActionIcon>
            <Text>{Math.round(scale * 100)}%</Text>
            <ActionIcon variant="light" onClick={handleZoomIn}>
              <IconZoomIn size={16} />
            </ActionIcon>
            <ActionIcon variant="light" onClick={handleDownload}>
              <IconDownload size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>

      <Card shadow="sm" style={{ minHeight: '600px' }}>
        {loading && (
          <Center style={{ height: '600px' }}>
            <Loader size="lg" />
          </Center>
        )}
        {error && (
          <Center style={{ height: '600px' }}>
            <Text c="red">Error loading document: {error}</Text>
          </Center>
        )}
        <Document
          file={`/api/documents/${documentId}/content`}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={null}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </Card>
    </Stack>
  );
}
