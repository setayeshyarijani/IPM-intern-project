import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Skeleton, Space, Divider, Progress } from 'antd';
import { 
  UserOutlined, 
  IdcardOutlined, 
  FolderOpenOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { apiGetReports } from '../../mock/api';
import Ltr from '../../components/Ltr';
import { useThemeMode } from '../../context/ThemeModeContext';

export default function ReportsPage() {
  const { i18n } = useTranslation();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // تشخیص زبان فارسی یا انگلیسی
  const isPersian = i18n.language === 'fa';

  // متن‌های فارسی یا انگلیسی
  const texts = {
    title: isPersian ? 'گزارش‌ها' : 'Reports',
    lastUpdated: isPersian ? 'آخرین بروزرسانی' : 'Last Updated',
    totalUsers: isPersian ? 'کل کاربران' : 'Total Users',
    totalTickets: isPersian ? 'کل تیکت‌ها' : 'Total Tickets',
    openTickets: isPersian ? 'تیکت‌های باز' : 'Open Tickets',
    closedTickets: isPersian ? 'تیکت‌های بسته شده' : 'Closed Tickets',
    ticketStatus: isPersian ? 'وضعیت تیکت‌ها' : 'Ticket Status',
    quickStats: isPersian ? 'آمار سریع' : 'Quick Stats',
    noData: isPersian ? 'داده‌ای موجود نیست' : 'No data available',
  };

  useEffect(() => {
    apiGetReports()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Typography.Text type="secondary">{texts.noData}</Typography.Text>
        </Card>
      </div>
    );
  }

  const closedPercent = stats.totalTickets > 0 
    ? Math.round((stats.closedTickets / stats.totalTickets) * 100) 
    : 0;
  const openPercent = stats.totalTickets > 0 
    ? Math.round((stats.openTickets / stats.totalTickets) * 100) 
    : 0;

  const cards = [
    { 
      title: texts.totalUsers, 
      value: stats.totalUsers, 
      icon: <UserOutlined />, 
      color: '#1677ff',
      bg: isDark ? 'rgba(22,119,255,0.1)' : '#e6f7ff'
    },
    { 
      title: texts.totalTickets, 
      value: stats.totalTickets, 
      icon: <IdcardOutlined />, 
      color: '#722ed1',
      bg: isDark ? 'rgba(114,46,209,0.1)' : '#f9f0ff'
    },
    { 
      title: texts.openTickets, 
      value: stats.openTickets, 
      icon: <FolderOpenOutlined />, 
      color: '#faad14',
      bg: isDark ? 'rgba(250,173,20,0.1)' : '#fff7e6'
    },
    { 
      title: texts.closedTickets, 
      value: stats.closedTickets, 
      icon: <CheckCircleOutlined />, 
      color: '#52c41a',
      bg: isDark ? 'rgba(82,196,26,0.1)' : '#f6ffed'
    },
  ];

  // تاریخ بر اساس زبان
  const getFormattedDate = () => {
    const now = new Date();
    if (isPersian) {
      return now.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {texts.title}
        </Typography.Title>
        <Space>
          <Typography.Text type="secondary">
            {texts.lastUpdated}: <Ltr>{getFormattedDate()}</Ltr>
          </Typography.Text>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card 
              style={{
                borderRadius: 16,
                background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
                border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
                backdropFilter: isDark ? 'blur(10px)' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  color: c.color
                }}>
                  {c.icon}
                </div>
                <div>
                  <Typography.Text style={{ 
                    fontSize: 13,
                    color: isDark ? '#94A3B8' : '#64748B'
                  }}>
                    {c.title}
                  </Typography.Text>
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: 700,
                    color: c.color
                  }}>
                    {c.value.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bottom Section - Left: Ticket Status */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <span style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>
                {texts.ticketStatus}
              </span>
            }
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
              border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
              backdropFilter: isDark ? 'blur(10px)' : 'none',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 4,
                  color: isDark ? '#94A3B8' : '#64748B'
                }}>
                  <span>{texts.openTickets}</span>
                  <span style={{ fontWeight: 600, color: isDark ? '#E8EDF5' : '#1A2234' }}>
                    {stats.openTickets.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  percent={openPercent} 
                  strokeColor="#faad14" 
                  strokeWidth={8} 
                  showInfo={false}
                  trailColor={isDark ? 'rgba(148,163,184,0.2)' : '#f0f0f0'}
                />
              </div>
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 4,
                  color: isDark ? '#94A3B8' : '#64748B'
                }}>
                  <span>{texts.closedTickets}</span>
                  <span style={{ fontWeight: 600, color: isDark ? '#E8EDF5' : '#1A2234' }}>
                    {stats.closedTickets.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  percent={closedPercent} 
                  strokeColor="#52c41a" 
                  strokeWidth={8} 
                  showInfo={false}
                  trailColor={isDark ? 'rgba(148,163,184,0.2)' : '#f0f0f0'}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: 12,
                borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.12)' : '#f0f0f0'}`
              }}>
                <span style={{ color: isDark ? '#94A3B8' : '#8c8c8c' }}>{texts.totalTickets}</span>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: 16,
                  color: isDark ? '#E8EDF5' : '#1A2234'
                }}>
                  {stats.totalTickets.toLocaleString()}
                </span>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Bottom Section - Right: Quick Stats */}
        <Col xs={24} md={12}>
          <Card 
            title={
              <span style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>
                {texts.quickStats}
              </span>
            }
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
              border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
              backdropFilter: isDark ? 'blur(10px)' : 'none',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '4px 0'
              }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} /> 
                  {texts.totalUsers}
                </span>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: isDark ? '#E8EDF5' : '#1A2234'
                }}>
                  {stats.totalUsers.toLocaleString()}
                </span>
              </div>
              <Divider style={{ 
                margin: 4,
                borderColor: isDark ? 'rgba(148,163,184,0.12)' : '#f0f0f0'
              }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '4px 0'
              }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  <IdcardOutlined style={{ marginRight: 8, color: '#722ed1' }} /> 
                  {texts.totalTickets}
                </span>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: isDark ? '#E8EDF5' : '#1A2234'
                }}>
                  {stats.totalTickets.toLocaleString()}
                </span>
              </div>
              <Divider style={{ 
                margin: 4,
                borderColor: isDark ? 'rgba(148,163,184,0.12)' : '#f0f0f0'
              }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '4px 0'
              }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  <FolderOpenOutlined style={{ marginRight: 8, color: '#faad14' }} /> 
                  {texts.openTickets}
                </span>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: isDark ? '#E8EDF5' : '#1A2234'
                }}>
                  {stats.openTickets.toLocaleString()}
                </span>
              </div>
              <Divider style={{ 
                margin: 4,
                borderColor: isDark ? 'rgba(148,163,184,0.12)' : '#f0f0f0'
              }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '4px 0'
              }}>
                <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} /> 
                  {texts.closedTickets}
                </span>
                <span style={{ 
                  fontSize: 18, 
                  fontWeight: 600,
                  color: isDark ? '#E8EDF5' : '#1A2234'
                }}>
                  {stats.closedTickets.toLocaleString()}
                </span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Custom Styles for Dark Mode */}
      <style>{`
        .ant-statistic-title {
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
        .ant-statistic-content {
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
        }
        .ant-card-head-title {
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
        }
        .ant-card-hoverable:hover {
          box-shadow: ${isDark 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.08)'} !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}