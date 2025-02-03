import { useState, useEffect } from 'react';
import {
  Table,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Card,
  Select,
  TextInput,
  Stack,
  Pagination,
} from '@mantine/core';
import {
  IconDownload,
  IconTrash,
  IconEye,
  IconDotsVertical,
  IconSearch,
} from '@tabler/icons-react';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  status: string;
  file_size: number;
  metadata: {
    processing_time?: number;
    confidence_score?: number;
  };
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS = {
  completed: 'green',
  processing: 'blue',
  error: 'red',
  pending: 'yellow',
} as const;

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: ((page - 1) * ITEMS_PER_PAGE).toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('document_type', typeFilter);

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, searchQuery, statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      // Refresh the list
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
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

  return (
    <Stack gap="md">
      <Card shadow="sm">
        <Group gap="md">
          <TextInput
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: 'completed', label: 'Completed' },
              { value: 'processing', label: 'Processing' },
              { value: 'error', label: 'Error' },
              { value: 'pending', label: 'Pending' },
            ]}
            clearable
          />
          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={setTypeFilter}
            data={[
              { value: 'rent_roll', label: 'Rent Roll' },
              { value: 'operating_statement', label: 'Operating Statement' },
              { value: 'lease', label: 'Lease' },
              { value: 'pl_statement', label: 'P&L Statement' },
              { value: 'other', label: 'Other' },
            ]}
            clearable
          />
        </Group>
      </Card>

      <Card shadow="sm">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Uploaded</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((doc) => (
              <Table.Tr key={doc.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {doc.filename}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{doc.document_type}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS]}>
                    {doc.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={0}>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleDownload(doc.id, doc.filename)}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                    <Menu
                      shadow="md"
                      width={200}
                      position="bottom-end"
                      offset={4}
                      withArrow
                      arrowPosition="center"
                    >
                      <Menu.Label>Actions</Menu.Label>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Group justify="center" mt="md">
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            siblings={1}
            boundaries={1}
          />
        </Group>
      </Card>
    </Stack>
  );
}
