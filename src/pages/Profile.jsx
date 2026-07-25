import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Descriptions, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import Ltr from '../components/Ltr';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success(t('profile.updateSuccess'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Typography.Title level={3}>{t('profile.title')}</Typography.Title>

      <Card title={t('profile.accountInfo')} style={{ marginBottom: 24 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('profile.fullName')}>
            {user.fullName}
          </Descriptions.Item>
          <Descriptions.Item label={t('auth.email')}>
            <Ltr>{user.email}</Ltr>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.role')}>
            <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>
              {t(`users.${user.role}`)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.active')}>
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status === 'active' ? t('dashboard.active') : t('users.disabled')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.joined')}>
            <Ltr>{dayjs(user.createdAt).format('YYYY-MM-DD')}</Ltr>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('profile.editProfile')}>
        <Form
          layout="vertical"
          initialValues={{ fullName: user.fullName, email: user.email }}
          onFinish={onFinish}
        >
          <Form.Item 
            name="fullName" 
            label={t('auth.fullName')} 
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('auth.email')}>
            <Input dir="ltr" style={{ textAlign: 'start' }} disabled />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('profile.save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}