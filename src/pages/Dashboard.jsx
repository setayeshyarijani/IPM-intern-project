// Dashboard.jsx - نسخه نهایی با کارت‌های مورد نظر
import { useEffect, useState } from 'react';
import { 
  Typography, 
  Descriptions, 
  Tag, 
  Card, 
  List, 
  Skeleton,
  Row,
  Col,
  Statistic,
  Space,
  Badge,
  Avatar,
  Button,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  PlusOutlined,
  FireOutlined,
  IdcardOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../context/AuthContext';
import Ltr from '../components/Ltr';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// API Mock
const apiListTickets = (params, filter) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: [
          { 
            id: 1, 
            subject: 'مشکل در ورود به سیستم', 
            status: 'open', 
            createdAt: new Date().toISOString(),
            priority: 'high'
          },
          { 
            id: 2, 
            subject: 'درخواست تغییر رمز عبور', 
            status: 'inProgress', 
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            priority: 'medium'
          },
          { 
            id: 3, 
            subject: 'مشکل در آپلود فایل', 
            status: 'resolved', 
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            priority: 'low'
          },
        ],
        total: 3,
      });
    }, 500);
  });
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        const res = await apiListTickets(
          { page: 1, pageSize: 5, sortField: 'createdAt', sortOrder: 'descend' },
          { onlyUserId: user.id }
        );
        
        if (isMounted && res?.items) {
          setRecent(res.items);
          
          // محاسبه آمار
          const statsData = {
            total: res.items.length,
            open: res.items.filter(item => item.status === 'open').length,
            inProgress: res.items.filter(item => item.status === 'inProgress').length,
            resolved: res.items.filter(item => item.status === 'resolved').length,
          };
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        if (isMounted) {
          setRecent([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // وضعیت‌های تیکت
  const statusConfig = {
    open: { 
      color: 'processing', 
      icon: <ClockCircleOutlined />, 
      label: 'باز',
      bgColor: '#e6f7ff',
      textColor: '#1890ff'
    },
    inProgress: { 
      color: 'warning', 
      icon: <CheckCircleOutlined />, 
      label: 'در حال بررسی',
      bgColor: '#fff7e6',
      textColor: '#fa8c16'
    },
    resolved: { 
      color: 'success', 
      icon: <CheckCircleOutlined />, 
      label: 'پاسخ داده شده',
      bgColor: '#f6ffed',
      textColor: '#52c41a'
    },
    closed: { 
      color: 'default', 
      icon: <CloseCircleOutlined />, 
      label: 'بسته شده',
      bgColor: '#fafafa',
      textColor: '#d9d9d9'
    },
  };

  // کارت‌های آماری با فرمت مورد نظر
  const cards = [
    { 
      title: t('reports.totalUsers') || 'کل کاربران', 
      value: stats.total, 
      icon: <UserOutlined />, 
      color: '#1677ff' 
    },
    { 
      title: t('reports.totalTickets') || 'کل تیکت‌ها', 
      value: stats.total, 
      icon: <IdcardOutlined />, 
      color: '#722ed1' 
    },
    { 
      title: t('reports.openTickets') || 'تیکت‌های باز', 
      value: stats.open, 
      icon: <FolderOpenOutlined />, 
      color: '#faad14' 
    },
    { 
      title: t('reports.closedTickets') || 'تیکت‌های بسته', 
      value: stats.resolved, 
      icon: <CheckCircleOutlined />, 
      color: '#52c41a' 
    },
  ];

  // اگر user وجود نداشت
  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Empty 
            description="لطفاً وارد حساب کاربری خود شوید"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/login')}>
              ورود به حساب
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* هدر خوش‌آمدگویی */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '24px',
          borderRadius: 8,
          marginBottom: 24,
          color: '#fff',
        }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <Space size="large" align="center">
              <Avatar 
                size={64} 
                icon={<UserOutlined />}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                }}
              />
              <div>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {t('dashboard.welcome', { name: user?.fullName || 'کاربر' })}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {dayjs().locale('fa').format('dddd، D MMMM YYYY')}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              ghost 
              icon={<PlusOutlined />}
              onClick={() => navigate('/tickets/new')}
              style={{ 
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#fff',
              }}
            >
              تیکت جدید
            </Button>
          </Col>
        </Row>
      </div>

      {/* کارت‌های آماری با فرمت جدید */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card>
              <Statistic 
                title={c.title} 
                value={c.value} 
                valueStyle={{ color: c.color }} 
                prefix={c.icon} 
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* اطلاعات کاربری */}
      <Card 
        title="اطلاعات حساب کاربری"
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="نقش کاربری">
            <Tag color={user?.role === 'admin' ? 'gold' : 'blue'}>
              {user?.role === 'admin' ? 'مدیر' : 'کاربر'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="وضعیت حساب">
            <Badge 
              status={user?.status === 'active' ? 'success' : 'error'}
              text={user?.status === 'active' ? 'فعال' : 'غیرفعال'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="تاریخ عضویت">
            <Ltr>
              {user?.createdAt ? dayjs(user.createdAt).format('YYYY/MM/DD') : 'N/A'}
            </Ltr>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* تیکت‌های اخیر */}
      <Card 
        title={
          <Space>
            <FireOutlined style={{ color: '#1890ff' }} />
            <span>تیکت‌های اخیر</span>
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => navigate('/tickets')}
          >
            مشاهده همه
          </Button>
        }
      >
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        ) : recent.length > 0 ? (
          <List
            dataSource={recent}
            renderItem={(item) => {
              const status = statusConfig[item.status] || statusConfig.open;
              return (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => navigate(`/tickets/${item.id}`)}
                    >
                      مشاهده
                    </Button>
                  ]}
                  style={{ 
                    padding: '12px 16px',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/tickets/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<FileOutlined />}
                        style={{ 
                          background: status.bgColor,
                          color: status.textColor,
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.subject}</Text>
                        <Tag 
                          color={status.color}
                          icon={status.icon}
                        >
                          {status.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size="middle">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          <Ltr>{dayjs(item.createdAt).format('YYYY/MM/DD HH:mm')}</Ltr>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="هیچ تیکتی ثبت نشده است"
          >
            <Button type="primary" onClick={() => navigate('/tickets/new')}>
              ثبت تیکت جدید
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
}