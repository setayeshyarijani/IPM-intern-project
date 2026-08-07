import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setError(null);
    setLoading(true);
    try {
      await register(values.fullName, values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'EMAIL_EXISTS') setError(t('auth.emailExists'));
      else setError(t('table.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
        {t('auth.registerTitle')}
      </Typography.Title>

      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item name="fullName" label={t('auth.fullName')} rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, type: 'email' }]}>
          <Input prefix={<MailOutlined />} autoComplete="email" dir="ltr" />
        </Form.Item>
        <Form.Item name="password" label={t('auth.password')} rules={[{ required: true, min: 6 }]}>
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label={t('auth.confirmPassword')}
          dependencies={['password']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error(t('auth.passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('auth.register')}
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
        {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
      </Typography.Paragraph>
    </Card>
  );
}
