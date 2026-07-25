import { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiCreateTicket } from '../../mock/api';
import { useAuth } from '../../context/AuthContext';

export default function NewTicketPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      const ticket = await apiCreateTicket({
        subject: values.subject,
        description: values.description,
        priority: values.priority,
        authorId: user.id,
        authorName: user.fullName,
      });
      message.success(t('tickets.createSuccess'));
      navigate(`/tickets/${ticket.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card style={{ maxWidth: 560 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('tickets.newTicket')}
      </Typography.Title>
      <Form layout="vertical" onFinish={onFinish} initialValues={{ priority: 'medium' }}>
        <Form.Item name="subject" label={t('tickets.subject')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="priority" label={t('tickets.priority')} rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'low', label: t('tickets.low') },
              { value: 'medium', label: t('tickets.medium') },
              { value: 'high', label: t('tickets.high') },
            ]}
          />
        </Form.Item>
        <Form.Item name="description" label={t('tickets.description')} rules={[{ required: true }]}>
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('tickets.submit')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
