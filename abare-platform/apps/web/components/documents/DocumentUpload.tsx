import { useState } from 'react';
import { Dropzone } from '@mantine/dropzone';
import {
  Text,
  Group,
  Button,
  Stack,
  Select,
  Progress,
  Alert,
  rem,
} from '@mantine/core';
import {
  IconUpload,
  IconX,
  IconFile,
  IconAlertCircle,
} from '@tabler/icons-react';

const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const DOCUMENT_TYPES = [
  { value: 'rent_roll', label: 'Rent Roll' },
  { value: 'operating_statement', label: 'Operating Statement' },
  { value: 'lease', label: 'Lease' },
  { value: 'pl_statement', label: 'P&L Statement' },
  { value: 'other', label: 'Other' },
];

export function DocumentUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (droppedFiles: File[]) => {
    setFiles(droppedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Update progress
        setProgress((prev) => prev + (100 / files.length));
      }

      // Reset form after successful upload
      setFiles([]);
      setDocumentType(null);
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      )}

      <Select
        label="Document Type"
        placeholder="Select document type"
        data={DOCUMENT_TYPES}
        value={documentType}
        onChange={setDocumentType}
        required
      />

      <Dropzone
        onDrop={handleDrop}
        onReject={() => setError('Invalid file type')}
        maxSize={20 * 1024 * 1024} // 20MB
        accept={ACCEPTED_MIME_TYPES}
        multiple={true}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-blue-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-red-6)',
              }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile
              style={{
                width: rem(52),
                height: rem(52),
                color: 'var(--mantine-color-dimmed)',
              }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <Stack gap="xs" style={{ textAlign: 'center' }}>
            <Text size="xl" inline>
              Drag files here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline>
              Supported formats: PDF, DOC, DOCX, XLS, XLSX (max 20MB)
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <Stack gap="xs">
          <Text fw={500}>Selected files:</Text>
          {files.map((file, index) => (
            <Text key={index} size="sm">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
            </Text>
          ))}
        </Stack>
      )}

      {uploading && <Progress value={progress} animated />}

      <Button
        onClick={handleUpload}
        loading={uploading}
        disabled={files.length === 0 || !documentType}
        leftSection={<IconUpload size={14} />}
      >
        Upload Documents
      </Button>
    </Stack>
  );
}
