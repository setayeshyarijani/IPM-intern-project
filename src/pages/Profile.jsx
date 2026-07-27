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
  Modal,
  Badge,
  Statistic,
  Tooltip,
  Progress,
  Switch,
  Descriptions,
  Tabs
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
  ClockCircleOutlined,
  GlobalOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  StarOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import dayjs from 'dayjs';
import Ltr from '../components/Ltr';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Profile() {
  const { i18n } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // تشخیص زبان فارسی یا انگلیسی
  const isPersian = i18n.language === 'fa';

  // متن‌های فارسی یا انگلیسی
  const texts = {
    // Header
    editProfile: isPersian ? 'ویرایش پروفایل' : 'Edit Profile',
    role: isPersian ? 'نقش کاربری' : 'User Role',
    status: isPersian ? 'وضعیت' : 'Status',
    memberSince: isPersian ? 'تاریخ عضویت' : 'Member Since',
    lastLogin: isPersian ? 'آخرین ورود' : 'Last Login',
    
    // Tabs
    personalInfo: isPersian ? 'اطلاعات شخصی' : 'Personal Information',
    security: isPersian ? 'امنیت' : 'Security',
    settings: isPersian ? 'تنظیمات' : 'Settings',
    
    // Personal Info
    fullName: isPersian ? 'نام کامل' : 'Full Name',
    email: isPersian ? 'ایمیل' : 'Email',
    
    // Security
    changePassword: isPersian ? 'تغییر رمز عبور' : 'Change Password',
    updatePassword: isPersian ? 'رمز عبور خود را به‌روز کنید' : 'Update your password',
    twoFactorAuth: isPersian ? 'احراز هویت دو مرحله‌ای' : 'Two-Factor Authentication',
    enhanceSecurity: isPersian ? 'امنیت حساب خود را افزایش دهید' : 'Enhance your account security',
    activate: isPersian ? 'فعال‌سازی' : 'Activate',
    currentPassword: isPersian ? 'رمز عبور فعلی' : 'Current Password',
    newPassword: isPersian ? 'رمز عبور جدید' : 'New Password',
    confirmPassword: isPersian ? 'تکرار رمز عبور جدید' : 'Confirm New Password',
    passwordMinLength: isPersian ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters',
    passwordMismatch: isPersian ? 'رمز عبور با تکرار آن مطابقت ندارد' : 'Passwords do not match',
    
    // Settings
    notifications: isPersian ? 'اعلان‌ها' : 'Notifications',
    receiveNotifications: isPersian ? 'دریافت اعلان‌های سیستمی' : 'Receive system notifications',
    language: isPersian ? 'زبان' : 'Language',
    changeLanguage: isPersian ? 'تغییر زبان رابط کاربری' : 'Change UI language',
    
    // Buttons
    save: isPersian ? 'ذخیره تغییرات' : 'Save Changes',
    cancel: isPersian ? 'انصراف' : 'Cancel',
    changePasswordBtn: isPersian ? 'تغییر رمز عبور' : 'Change Password',
    confirm: isPersian ? 'تایید' : 'Confirm',
    
    // Messages
    updateSuccess: isPersian ? 'پروفایل با موفقیت به‌روز شد' : 'Profile updated successfully',
    updateError: isPersian ? 'خطا در به‌روزرسانی پروفایل' : 'Error updating profile',
    passwordChanged: isPersian ? 'رمز عبور با موفقیت تغییر کرد' : 'Password changed successfully',
    passwordChangeError: isPersian ? 'خطا در تغییر رمز عبور' : 'Error changing password',
    loading: isPersian ? 'در حال بارگذاری...' : 'Loading...',
    required: isPersian ? 'لطفاً این فیلد را پر کنید' : 'Please fill in this field',
    enterFullName: isPersian ? 'لطفاً نام کامل را وارد کنید' : 'Please enter full name',
    enterCurrentPassword: isPersian ? 'لطفاً رمز عبور فعلی را وارد کنید' : 'Please enter current password',
    enterNewPassword: isPersian ? 'لطفاً رمز عبور جدید را وارد کنید' : 'Please enter new password',
    confirmNewPassword: isPersian ? 'لطفاً رمز عبور را تکرار کنید' : 'Please confirm your password',
    
    // Status
    active: isPersian ? 'فعال' : 'Active',
    inactive: isPersian ? 'غیرفعال' : 'Inactive',
    pending: isPersian ? 'در انتظار' : 'Pending',
    
    // Roles
    admin: isPersian ? 'مدیر' : 'Admin',
    manager: isPersian ? 'مدیر' : 'Manager',
    user: isPersian ? 'کاربر' : 'User',
  };

  async function onFinish(values) {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success({
        content: texts.updateSuccess,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setIsEditModalVisible(false);
    } catch (error) {
      message.error({
        content: error.message || texts.updateError,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setLoading(false);
    }
  }

  async function onPasswordChange(values) {
    setPasswordLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success({
        content: texts.passwordChanged,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error({
        content: error.message || texts.passwordChangeError,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  const getRoleTag = (role) => {
    const config = {
      admin: { color: '#faad14', bg: 'rgba(250, 173, 20, 0.15)', icon: <CrownOutlined />, label: texts.admin },
      manager: { color: '#722ed1', bg: 'rgba(114, 46, 209, 0.15)', icon: <TeamOutlined />, label: texts.manager },
      user: { color: '#1890ff', bg: 'rgba(24, 144, 255, 0.15)', icon: <UserOutlined />, label: texts.user }
    };
    const { color, bg, icon, label } = config[role] || config.user;
    return (
      <Tag 
        style={{ 
          background: bg, 
          color: color,
          border: `1px solid ${color}33`,
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
        icon={icon}
      >
        {label}
      </Tag>
    );
  };

  const getStatusTag = (status) => {
    const config = {
      active: { color: '#52c41a', bg: 'rgba(82, 196, 26, 0.15)', icon: <CheckCircleOutlined />, label: texts.active },
      inactive: { color: '#ff4d4f', bg: 'rgba(255, 77, 79, 0.15)', icon: <CloseCircleOutlined />, label: texts.inactive },
      pending: { color: '#faad14', bg: 'rgba(250, 173, 20, 0.15)', icon: <ClockCircleOutlined />, label: texts.pending }
    };
    const { color, bg, icon, label } = config[status] || config.inactive;
    return (
      <Tag 
        style={{ 
          background: bg, 
          color: color,
          border: `1px solid ${color}33`,
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }}
        icon={icon}
      >
        {label}
      </Tag>
    );
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Card>
          <Text type="secondary">{texts.loading}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      {/* Profile Header Card */}
      <Card 
        style={{
          marginBottom: 24,
          borderRadius: 20,
          background: isDark 
            ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: isDark 
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(102, 126, 234, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />

        <Row gutter={[24, 24]} align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col xs={24} md={8} lg={6} style={{ textAlign: 'center' }}>
            <Badge 
              status="success" 
              offset={[-10, 10]}
              style={{ 
                border: '3px solid #fff',
                borderRadius: '50%'
              }}
            >
              <Avatar 
                size={140} 
                icon={<UserOutlined />} 
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  fontSize: 48,
                  color: '#fff'
                }}
              />
            </Badge>
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                ghost 
                icon={<EditOutlined />}
                onClick={() => setIsEditModalVisible(true)}
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '0 20px',
                  height: 40
                }}
              >
                {texts.editProfile}
              </Button>
            </div>
          </Col>
          <Col xs={24} md={16} lg={18}>
            <div>
              <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
                {user.fullName}
                {user.role === 'admin' && (
                  <Tag 
                    style={{ 
                      marginRight: 12,
                      background: 'rgba(255,215,0,0.2)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      color: '#ffd700'
                    }}
                  >
                    <CrownOutlined /> VIP
                  </Tag>
                )}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, display: 'block', marginBottom: 16 }}>
                <MailOutlined style={{ marginRight: 8 }} />
                {user.email}
              </Text>

              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '12px 16px'
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{texts.role}</Text>
                    <div style={{ marginTop: 4 }}>{getRoleTag(user.role)}</div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '12px 16px'
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{texts.status}</Text>
                    <div style={{ marginTop: 4 }}>{getStatusTag(user.status)}</div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '12px 16px'
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{texts.memberSince}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 13 }}>
                        <Ltr>{dayjs(user.createdAt).format('YYYY/MM/DD')}</Ltr>
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '12px 16px'
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{texts.lastLogin}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 13 }}>
                        <Ltr>{user.lastLogin ? dayjs(user.lastLogin).format('YYYY/MM/DD HH:mm') : '---'}</Ltr>
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs Section */}
      <Card 
        style={{
          borderRadius: 20,
          background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
          border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
          backdropFilter: isDark ? 'blur(10px)' : 'none',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.04)'
        }}
      >
        <Tabs defaultActiveKey="1" style={{ marginTop: -8 }}>
          <TabPane 
            tab={<Space><UserOutlined />{texts.personalInfo}</Space>} 
            key="1"
          >
            <Descriptions 
              column={{ xs: 1, sm: 2, md: 2 }} 
              bordered
              style={{
                background: isDark ? 'rgba(30,41,59,0.3)' : 'transparent'
              }}
            >
              <Descriptions.Item label={texts.fullName}>{user.fullName}</Descriptions.Item>
              <Descriptions.Item label={texts.email}>{user.email}</Descriptions.Item>
              <Descriptions.Item label={texts.role}>{getRoleTag(user.role)}</Descriptions.Item>
              <Descriptions.Item label={texts.status}>{getStatusTag(user.status)}</Descriptions.Item>
              <Descriptions.Item label={texts.memberSince}>
                <Ltr>{dayjs(user.createdAt).format('YYYY/MM/DD HH:mm')}</Ltr>
              </Descriptions.Item>
              <Descriptions.Item label={texts.lastLogin}>
                <Ltr>{user.lastLogin ? dayjs(user.lastLogin).format('YYYY/MM/DD HH:mm') : '---'}</Ltr>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane 
            tab={<Space><SafetyOutlined />{texts.security}</Space>} 
            key="2"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{
                  padding: '20px',
                  background: isDark ? 'rgba(30,41,59,0.3)' : '#f8f9fa',
                  borderRadius: 16,
                  border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0'
                }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(255,77,79,0.15)' : '#fff1f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: '#ff4d4f'
                      }}>
                        <KeyOutlined />
                      </div>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: 16 }}>{texts.changePassword}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>{texts.updatePassword}</Text>
                      </div>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<KeyOutlined />} 
                      onClick={() => setIsPasswordModalVisible(true)}
                      style={{
                        borderRadius: 12,
                        height: 44,
                        background: isDark ? '#1890ff' : undefined
                      }}
                      block
                    >
                      {texts.changePasswordBtn}
                    </Button>
                  </Space>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{
                  padding: '20px',
                  background: isDark ? 'rgba(30,41,59,0.3)' : '#f8f9fa',
                  borderRadius: 16,
                  border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0'
                }}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: isDark ? 'rgba(82,196,26,0.15)' : '#f6ffed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: '#52c41a'
                      }}>
                        <SafetyOutlined />
                      </div>
                      <div>
                        <Text strong style={{ display: 'block', fontSize: 16 }}>{texts.twoFactorAuth}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>{texts.enhanceSecurity}</Text>
                      </div>
                    </div>
                    <Button 
                      icon={<SafetyOutlined />}
                      style={{
                        borderRadius: 12,
                        height: 44,
                        background: isDark ? 'rgba(82,196,26,0.1)' : '#f6ffed',
                        borderColor: isDark ? 'rgba(82,196,26,0.3)' : '#b7eb8f',
                        color: '#52c41a'
                      }}
                      block
                    >
                      {texts.activate}
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={<Space><SettingOutlined />{texts.settings}</Space>} 
            key="3"
          >
            <div style={{ 
              padding: '20px',
              background: isDark ? 'rgba(30,41,59,0.3)' : '#f8f9fa',
              borderRadius: 16
            }}>
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                    borderRadius: 12,
                    border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0'
                  }}>
                    <Space>
                      <NotificationOutlined style={{ fontSize: 20 }} />
                      <div>
                        <Text strong style={{ display: 'block' }}>{texts.notifications}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{texts.receiveNotifications}</Text>
                      </div>
                    </Space>
                    <Switch defaultChecked />
                  </div>
                </Col>
                <Col xs={24}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
                    borderRadius: 12,
                    border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0'
                  }}>
                    <Space>
                      <GlobalOutlined style={{ fontSize: 20 }} />
                      <div>
                        <Text strong style={{ display: 'block' }}>{texts.language}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{texts.changeLanguage}</Text>
                      </div>
                    </Space>
                    <Button>{isPersian ? 'فارسی' : 'English'}</Button>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#1890ff' }} />
            {texts.editProfile}
          </Space>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={480}
        style={{ borderRadius: 20 }}
        modalRender={(node) => (
          <div style={{ borderRadius: 20, overflow: 'hidden' }}>
            {node}
          </div>
        )}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ fullName: user.fullName, email: user.email }}
          onFinish={onFinish}
          style={{ marginTop: 8 }}
        >
          <Form.Item 
            name="fullName" 
            label={texts.fullName}
            rules={[{ required: true, message: texts.enterFullName }]}
          >
            <Input 
              size="large" 
              placeholder={texts.fullName}
              style={{ borderRadius: 12 }}
            />
          </Form.Item>

          <Form.Item 
            name="email" 
            label={texts.email}
          >
            <Input 
              size="large" 
              dir="ltr" 
              disabled 
              style={{ 
                borderRadius: 12,
                background: isDark ? 'rgba(30,41,59,0.3)' : '#f5f5f5'
              }}
            />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{
                  borderRadius: 12,
                  height: 44,
                  flex: 1
                }}
              >
                {texts.save}
              </Button>
              <Button 
                onClick={() => {
                  setIsEditModalVisible(false);
                  form.resetFields();
                }}
                style={{ borderRadius: 12, height: 44 }}
              >
                {texts.cancel}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: '#faad14' }} />
            {texts.changePassword}
          </Space>
        }
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={440}
        style={{ borderRadius: 20 }}
        modalRender={(node) => (
          <div style={{ borderRadius: 20, overflow: 'hidden' }}>
            {node}
          </div>
        )}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onPasswordChange}
          style={{ marginTop: 8 }}
        >
          <Form.Item
            name="currentPassword"
            label={texts.currentPassword}
            rules={[{ required: true, message: texts.enterCurrentPassword }]}
          >
            <Input.Password size="large" placeholder={texts.currentPassword} style={{ borderRadius: 12 }} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={texts.newPassword}
            rules={[
              { required: true, message: texts.enterNewPassword },
              { min: 6, message: texts.passwordMinLength }
            ]}
          >
            <Input.Password size="large" placeholder={texts.newPassword} style={{ borderRadius: 12 }} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={texts.confirmPassword}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: texts.confirmNewPassword },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(texts.passwordMismatch));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder={texts.confirmPassword} style={{ borderRadius: 12 }} />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={passwordLoading}
                style={{
                  borderRadius: 12,
                  height: 44,
                  flex: 1,
                  background: '#faad14',
                  borderColor: '#faad14'
                }}
              >
                {texts.changePasswordBtn}
              </Button>
              <Button 
                onClick={() => {
                  setIsPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}
                style={{ borderRadius: 12, height: 44 }}
              >
                {texts.cancel}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Styles */}
      <style>{`
        .ant-tabs-nav {
          margin-bottom: 24px !important;
        }
        .ant-tabs-tab {
          padding: 12px 20px !important;
          font-size: 15px !important;
        }
        .ant-tabs-tab-active {
          background: ${isDark ? 'rgba(79,142,247,0.1)' : 'rgba(24,144,255,0.05)'} !important;
          border-radius: 12px !important;
        }
        .ant-tabs-ink-bar {
          height: 3px !important;
          border-radius: 4px !important;
          background: ${isDark ? '#4F8EF7' : '#1890ff'} !important;
        }
        .ant-descriptions-item-label {
          background: ${isDark ? 'rgba(30,41,59,0.5)' : '#fafafa'} !important;
          font-weight: 600 !important;
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
        .ant-descriptions-item-content {
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
        }
        .ant-modal-content {
          border-radius: 20px !important;
          background: ${isDark ? '#1E293B' : '#fff'} !important;
        }
        .ant-modal-header {
          border-radius: 20px 20px 0 0 !important;
          background: ${isDark ? 'rgba(30,41,59,0.8)' : '#fff'} !important;
          border-bottom: 1px solid ${isDark ? 'rgba(148,163,184,.12)' : '#f0f0f0'} !important;
        }
        .ant-modal-title {
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
        }
        .ant-statistic-title {
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
      `}</style>
    </div>
  );
}