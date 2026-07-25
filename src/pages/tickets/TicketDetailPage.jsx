import { useCallback, useEffect, useState } from 'react';
import { Card, Typography, Tag, List, Input, Button, Select, Skeleton, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { apiGetTicket, apiReplyTicket, apiSetTicketStatus } from '../../mock/api';
import { useAuth } from '../../context/AuthContext';
import Ltr from '../../components/Ltr';

const statusColor = { open: 'blue', inProgress: 'gold', closed: 'green' };
const priorityColor = { low: 'default', medium: 'orange', high: 'red' };

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiGetTicket(ticketId);
    setTicket(data);
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const updated = await apiReplyTicket(ticketId, {
        authorId: user.id,
        authorName: user.fullName,
        body: reply.trim(),
      });
      setTicket(updated);
      setReply('');
      message.success(t('tickets.replySuccess'));
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(status) {
    const updated = await apiSetTicketStatus(ticketId, status);
    setTicket(updated);
    message.success(t('tickets.statusUpdated'));
  }

  if (loading || !ticket) return <Skeleton active />;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate('/tickets')} style={{ paddingInlineStart: 0 }}>
        {t('tickets.backToList')}
      </Button>

      <Card
        title={ticket.subject}
        extra={
          <Space>
            <Tag color={priorityColor[ticket.priority]}>{t(`tickets.${ticket.priority}`)}</Tag>
            {user.role === 'admin' ? (
              <Select
                size="small"
                value={ticket.status}
                style={{ width: 140 }}
                onChange={changeStatus}
                options={['open', 'inProgress', 'closed'].map((s) => ({ value: s, label: t(`tickets.${s}`) }))}
              />
            ) : (
              <Tag color={statusColor[ticket.status]}>{t(`tickets.${ticket.status}`)}</Tag>
            )}
          </Space>
        }
      >
        <Typography.Paragraph type="secondary">
          {ticket.authorName} · <Ltr>{dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm')}</Ltr>
        </Typography.Paragraph>

        <Typography.Title level={5}>{t('tickets.conversation')}</Typography.Title>
        <List
          dataSource={ticket.messages}
          renderItem={(msg) => (
            <List.Item>
              <List.Item.Meta
                title={msg.authorName}
                description={<Ltr>{dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm')}</Ltr>}
              />
              <Typography.Paragraph style={{ maxWidth: 480 }}>{msg.body}</Typography.Paragraph>
            </List.Item>
          )}
        />

        <Input.TextArea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t('tickets.replyPlaceholder')}
          style={{ marginTop: 16 }}
        />
        <Button type="primary" onClick={sendReply} loading={sending} style={{ marginTop: 8 }}>
          {t('tickets.reply')}
        </Button>
      </Card>
    </div>
  );
}
