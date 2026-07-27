import { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Tag, 
  Row, 
  Col, 
  Avatar, 
  Space, 
  Divider,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  SafetyOutlined, 
  EditOutlined, 
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  CrownOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import Ltr from '../components/Ltr';

const { Title, Text } = Typography;

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  async function onFinish(values) {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success({
        content: t('profile.updateSuccess'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
    } catch (error) {
      message.error({
        content: error.message || t('profile.updateError'),
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setLoading(false);
    }
  }

  async function onPasswordChange(values) {
    setPasswordLoading(true);
    try {
      // در اینجا تغییر رمز عبور را پیاده‌سازی کنید
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success({
        content: t('profile.passwordChanged'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error({
        content: error.message || t('profile.passwordChangeError'),
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  const getRoleTag = (role) => {
    const config = {
      admin: { color: 'gold', icon: <CrownOutlined /> },
      manager: { color: 'purple', icon: <TeamOutlined /> },
      user: { color: 'blue', icon: <UserOutlined /> }
    };
    const { color, icon } = config[role] || config.user;
    return (
      <Tag color={color} icon={icon} className="px-3 py-1 text-sm rounded-full">
        {t(`users.${role}`)}
      </Tag>
    );
  };

  const getStatusTag = (status) => {
    const config = {
      active: { color: 'success', icon: <CheckCircleOutlined /> },
      inactive: { color: 'error', icon: <CloseCircleOutlined /> },
      pending: { color: 'warning', icon: <ClockCircleOutlined /> }
    };
    const { color, icon } = config[status] || config.inactive;
    return (
      <Tag color={color} icon={icon} className="px-3 py-1 text-sm rounded-full">
        {status === 'active' ? t('dashboard.active') : t('users.disabled')}
      </Tag>
    );
  };

  // اگر user وجود نداشت، نمایش placeholder
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="text-center">
          <Text type="secondary">{t('profile.loading')}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Title level={2} className="mb-6 flex items-center gap-3">
        <UserOutlined className="text-blue-500" />
        {t('profile.title')}
      </Title>

      {/* Header Card with User Info */}
      <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} md={6} className="text-center">
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg"
            />
            <div className="mt-4">
              <Text strong className="text-lg block">{user.fullName}</Text>
              <Text type="secondary" className="text-sm">{user.email}</Text>
            </div>
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block">نقش</Text>
                  <div className="mt-1">{getRoleTag(user.role)}</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block">وضعیت</Text>
                  <div className="mt-1">{getStatusTag(user.status)}</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block">تاریخ عضویت</Text>
                  <div className="mt-1">
                    <Space>
                      <CalendarOutlined className="text-gray-400" />
                      <Ltr>{dayjs(user.createdAt).format('YYYY/MM/DD')}</Ltr>
                    </Space>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text type="secondary" className="text-xs block">آخرین ورود</Text>
                  <div className="mt-1">
                    <Space>
                      <CalendarOutlined className="text-gray-400" />
                      <Ltr>{user.lastLogin ? dayjs(user.lastLogin).format('YYYY/MM/DD HH:mm') : '---'}</Ltr>
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <EditOutlined className="text-blue-500" />
                {t('profile.editProfile')}
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{ fullName: user.fullName, email: user.email }}
              onFinish={onFinish}
              className="space-y-4"
            >
              <Form.Item 
                name="fullName" 
                label={
                  <Space>
                    <UserOutlined />
                    {t('auth.fullName')}
                  </Space>
                }
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Input 
                  size="large" 
                  placeholder={t('auth.fullName')}
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item 
                name="email" 
                label={
                  <Space>
                    <MailOutlined />
                    {t('auth.email')}
                  </Space>
                }
              >
                <Input 
                  size="large" 
                  dir="ltr" 
                  style={{ textAlign: 'start' }} 
                  disabled 
                  className="rounded-lg bg-gray-50"
                />
              </Form.Item>

              <Divider />

              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block 
                  size="large"
                  className="rounded-lg h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Space>
                    <EditOutlined />
                    {t('profile.save')}
                  </Space>
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <SafetyOutlined className="text-green-500" />
                {t('profile.security')}
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl h-full"
          >
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <Space direction="vertical" className="w-full">
                  <Text strong className="text-blue-700">تغییر رمز عبور</Text>
                  <Text type="secondary" className="text-sm">
                    برای افزایش امنیت حساب خود، رمز عبور خود را به‌روز کنید
                  </Text>
                  <Button 
                    type="default" 
                    icon={<KeyOutlined />} 
                    onClick={() => setIsPasswordModalVisible(true)}
                    className="mt-2 w-full rounded-lg border-blue-300 hover:border-blue-500 hover:text-blue-500"
                  >
                    تغییر رمز عبور
                  </Button>
                </Space>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <Space direction="vertical" className="w-full">
                  <Text strong className="text-green-700">احراز هویت دو مرحله‌ای</Text>
                  <Text type="secondary" className="text-sm">
                    حساب خود را با فعال‌سازی احراز هویت دو مرحله‌ای ایمن‌تر کنید
                  </Text>
                  <Button 
                    type="default" 
                    className="mt-2 w-full rounded-lg border-green-300 hover:border-green-500 hover:text-green-500"
                  >
                    فعال‌سازی
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Password Change Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined className="text-blue-500" />
            تغییر رمز عبور
          </Space>
        }
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        className="rounded-xl"
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onPasswordChange}
          className="mt-4"
        >
          <Form.Item
            name="currentPassword"
            label="رمز عبور فعلی"
            rules={[{ required: true, message: 'لطفاً رمز عبور فعلی را وارد کنید' }]}
          >
            <Input.Password size="large" placeholder="رمز عبور فعلی" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="رمز عبور جدید"
            rules={[
              { required: true, message: 'لطفاً رمز عبور جدید را وارد کنید' },
              { min: 6, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
            ]}
          >
            <Input.Password size="large" placeholder="رمز عبور جدید" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="تکرار رمز عبور جدید"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'لطفاً رمز عبور را تکرار کنید' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('رمز عبور با تکرار آن مطابقت ندارد'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="تکرار رمز عبور جدید" />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space className="w-full" direction="vertical">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={passwordLoading} 
                block 
                size="large"
                className="rounded-lg h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0"
              >
                تغییر رمز عبور
              </Button>
              <Button 
                onClick={() => {
                  setIsPasswordModalVisible(false);
                  passwordForm.resetFields();
                }} 
                block 
                size="large"
                className="rounded-lg"
              >
                انصراف
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* استایل‌های سفارشی */}
      <style>{`
        .ant-card {
          border-radius: 12px !important;
        }
        .ant-card-head {
          border-bottom: 2px solid #f0f0f0 !important;
        }
        .ant-form-item-label > label {
          font-weight: 500 !important;
        }
        .ant-input-affix-wrapper {
          border-radius: 8px !important;
        }
        .ant-btn {
          border-radius: 8px !important;
        }
        .ant-tag {
          border-radius: 20px !important;
        }
        .ant-modal-content {
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
}