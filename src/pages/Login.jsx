import { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Ltr from '../components/Ltr';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onFinish(values) {
    setError(null);
    setLoading(true);
    try {
      const user = await login(values.email, values.password);
      navigate(user.role === 'admin' ? '/admin/reports' : '/dashboard');
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Typography.Title level={3} style={{ textAlign: 'center', marginTop: 0 }}>
        {t('auth.loginTitle')}
      </Typography.Title>

      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="email"
          label={t('auth.email')}
          rules={[{ required: true, type: 'email' }]}
        >
          <Input prefix={<MailOutlined />} autoComplete="email" dir="ltr" />
        </Form.Item>
        <Form.Item name="password" label={t('auth.password')} rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('auth.login')}
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 4 }}>
        {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
        {t('auth.adminLogin')}: <Ltr>admin@example.com / admin123</Ltr>
      </Typography.Paragraph>
    </Card>
  );
}
