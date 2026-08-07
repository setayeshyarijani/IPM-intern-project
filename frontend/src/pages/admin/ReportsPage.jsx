// Dashboard.jsx - با نمودار دوناتی
import { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  List, 
  Skeleton,
  Row,
  Col,
  Space,
  Avatar,
  Button,
  Empty,
  Divider,
  Progress,
  message,
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
  FolderOpenOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { apiListTickets, apiListUsers } from '../../api/client';
import { getDb } from '../../mock/database';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import Ltr from '../../components/Ltr';
import { formatCalendarDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

// Import برای نمودار دوناتی
import ReactECharts from 'echarts-for-react';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export default function Dashboard() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalUsers: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  const isPersian = i18n.language === 'fa';

  const texts = {
    welcome: isPersian 
      ? `خوش آمدید ${user?.fullName || 'کاربر'}`
      : `Welcome ${user?.fullName || 'User'}`,
    newTicket: isPersian ? 'تیکت جدید' : 'New Ticket',
    totalUsers: isPersian ? 'کل کاربران' : 'Total Users',
    totalTickets: isPersian ? 'کل تیکت‌ها' : 'Total Tickets',
    openTickets: isPersian ? 'تیکت‌های باز' : 'Open Tickets',
    resolvedTickets: isPersian ? 'تیکت‌های بسته شده' : 'Resolved Tickets',
    closedTickets: isPersian ? 'تیکت‌های بسته' : 'Closed Tickets',
    recentTickets: isPersian ? 'تیکت‌های اخیر' : 'Recent Tickets',
    viewAll: isPersian ? 'مشاهده همه' : 'View All',
    view: isPersian ? 'مشاهده' : 'View',
    noTickets: isPersian ? 'هیچ تیکتی ثبت نشده است' : 'No tickets found',
    createNew: isPersian ? 'ثبت تیکت جدید' : 'Create New Ticket',
    notLoggedIn: isPersian ? 'لطفاً وارد حساب کاربری خود شوید' : 'Please log in to your account',
    login: isPersian ? 'ورود به حساب' : 'Login',
    statusOpen: isPersian ? 'باز' : 'Open',
    statusInProgress: isPersian ? 'در حال بررسی' : 'In Progress',
    statusResolved: isPersian ? 'پاسخ داده شده' : 'Resolved',
    statusClosed: isPersian ? 'بسته شده' : 'Closed',
    ticketStatus: isPersian ? 'وضعیت تیکت‌ها' : 'Ticket Status',
  };

  const statusConfig = {
    open: { 
      label: texts.statusOpen,
      bgColor: isDark ? 'rgba(24,144,255,0.15)' : '#e6f7ff',
      textColor: isDark ? '#69c0ff' : '#1890ff',
      dotColor: '#1890ff',
      chartColor: '#1890ff'
    },
    inProgress: { 
      label: texts.statusInProgress,
      bgColor: isDark ? 'rgba(250,173,20,0.15)' : '#fff7e6',
      textColor: isDark ? '#ffd666' : '#fa8c16',
      dotColor: '#fa8c16',
      chartColor: '#fa8c16'
    },
    resolved: { 
      label: texts.statusResolved,
      bgColor: isDark ? 'rgba(82,196,26,0.15)' : '#f6ffed',
      textColor: isDark ? '#95de64' : '#52c41a',
      dotColor: '#52c41a',
      chartColor: '#52c41a'
    },
    closed: { 
      label: texts.statusClosed,
      bgColor: isDark ? 'rgba(148,163,184,0.15)' : '#fafafa',
      textColor: isDark ? '#94A3B8' : '#d9d9d9',
      dotColor: '#94A3B8',
      chartColor: '#94A3B8'
    },
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        // If user is admin, fetch global data; otherwise only user's tickets
        try {
          if (user.role === 'admin') {
            const [ticketsRes, usersRes] = await Promise.all([
              apiListTickets({ page: 1, pageSize: 1000, sortField: 'createdAt', sortOrder: 'descend' }),
              apiListUsers({ page: 1, pageSize: 1 }),
            ]);

            const allTickets = ticketsRes.items || [];
            setRecent(allTickets.slice(0, 5));

            setStats({
              total: ticketsRes.total ?? allTickets.length,
              open: allTickets.filter(item => item.status === 'open').length,
              inProgress: allTickets.filter(item => item.status === 'inProgress').length,
              resolved: allTickets.filter(item => item.status === 'resolved').length,
              closed: allTickets.filter(item => item.status === 'closed').length,
            });

            // total users from usersRes if provided, otherwise we'll fallback later
            if (usersRes && typeof usersRes.total === 'number') {
              setStats((s) => ({ ...s, totalUsers: usersRes.total }));
            }
          } else {
            const res = await apiListTickets(
              { page: 1, pageSize: 5, sortField: 'createdAt', sortOrder: 'descend' },
              { onlyUserId: user.id }
            );
            if (isMounted && res?.items) {
              setRecent(res.items);
              setStats({
                total: res.total ?? res.items.length,
                open: res.items.filter(item => item.status === 'open').length,
                inProgress: res.items.filter(item => item.status === 'inProgress').length,
                resolved: res.items.filter(item => item.status === 'resolved').length,
                closed: res.items.filter(item => item.status === 'closed').length,
              });
            }
          }
        } catch (apiError) {
          // API failed; fall back to local mock DB
          try {
            const db = getDb();
            const allTickets = db.tickets || [];
            const allUsers = db.users || [];
            setRecent(allTickets.slice(0, 5));
            setStats({
              total: allTickets.length,
              open: allTickets.filter(item => item.status === 'open').length,
              inProgress: allTickets.filter(item => item.status === 'inProgress').length,
              resolved: allTickets.filter(item => item.status === 'resolved').length,
              closed: allTickets.filter(item => item.status === 'closed').length,
              totalUsers: allUsers.length,
            });
            message.info(isPersian ? 'داده‌ها از mock محلی بارگذاری شدند' : 'Data loaded from local mock');
          } catch (dbError) {
            console.error('Fallback DB error:', dbError);
          }
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

  const cards = [
    { 
      title: texts.totalUsers,
      value: stats.totalUsers || stats.total, 
      icon: <UserOutlined />, 
      color: '#1677ff',
      bg: isDark ? 'rgba(22,119,255,0.1)' : '#e6f7ff'
    },
    { 
      title: texts.totalTickets,
      value: stats.total, 
      icon: <IdcardOutlined />, 
      color: '#722ed1',
      bg: isDark ? 'rgba(114,46,209,0.1)' : '#f9f0ff'
    },
    { 
      title: texts.openTickets,
      value: stats.open, 
      icon: <FolderOpenOutlined />, 
      color: '#faad14',
      bg: isDark ? 'rgba(250,173,20,0.1)' : '#fff7e6'
    },
    { 
      title: texts.resolvedTickets,
      value: stats.resolved, 
      icon: <CheckCircleOutlined />, 
      color: '#52c41a',
      bg: isDark ? 'rgba(82,196,26,0.1)' : '#f6ffed'
    },
  ];

  const totalTickets = stats.total || 1;
  const openPercent = Math.round((stats.open / totalTickets) * 100);
  const closedPercent = Math.round((stats.closed / totalTickets) * 100);
  const inProgressPercent = Math.round((stats.inProgress / totalTickets) * 100);
  const resolvedPercent = Math.round((stats.resolved / totalTickets) * 100);

  const getDonutOption = () => {
    const chartData = [
      { 
        name: texts.statusOpen, 
        value: stats.open || 0,
        itemStyle: { color: '#1890ff' }
      },
      { 
        name: texts.statusInProgress, 
        value: stats.inProgress || 0,
        itemStyle: { color: '#fa8c16' }
      },
      { 
        name: texts.statusResolved, 
        value: stats.resolved || 0,
        itemStyle: { color: '#52c41a' }
      },
      { 
        name: texts.statusClosed, 
        value: stats.closed || 0,
        itemStyle: { color: '#94A3B8' }
      },
    ].filter(item => item.value > 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          return `<strong>${params.name}</strong><br/>${isPersian ? 'تعداد' : 'Count'}: ${params.value}<br/>${isPersian ? 'درصد' : 'Percent'}: ${params.percent}%`;
        },
        backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(148,163,184,0.2)' : '#f0f0f0',
        textStyle: {
          color: isDark ? '#E8EDF5' : '#1A2234'
        }
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 13,
        },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 12,
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '75%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDark ? '#1E293B' : '#fff',
            borderWidth: 3,
          },
          label: {
            show: true,
            formatter: '{d}%',
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 12,
            fontWeight: 500,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            }
          },
          labelLine: {
            lineStyle: {
              color: isDark ? 'rgba(148,163,184,0.3)' : '#d9d9d9',
            }
          },
          data: chartData,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };
  };

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{
          borderRadius: 16,
          background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
          border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
        }}>
          <Empty 
            description={texts.notLoggedIn}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/login')}>
              {texts.login}
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const getFormattedDate = () => {
    return formatCalendarDate(new Date(), isPersian ? 'fa' : 'en', {
      withTime: false,
      weekday: true,
    });
  };

  return (
    <div style={{ padding: 24 }}>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card 
              style={{
                borderRadius: 16,
                background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
                border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
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
                  <Text style={{ 
                    fontSize: 13,
                    color: isDark ? '#94A3B8' : '#64748B'
                  }}>
                    {c.title}
                  </Text>
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: 700,
                    color: c.color
                  }}>
                    {c.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Donut Chart Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <PieChartOutlined style={{ color: isDark ? '#4F8EF7' : '#1890ff' }} />
                <span style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>
                  {texts.ticketStatus}
                </span>
              </Space>
            }
            style={{
              borderRadius: 16,
              background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
              border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
              height: '100%',
            }}
          >
            {stats.total > 0 ? (
              <div style={{ height: 320 }}>
                <ReactECharts 
                  option={getDonutOption()} 
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            ) : (
              <div style={{ 
                height: 280, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Empty description={texts.noTickets} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Card>
        </Col>

        {/* Progress Stats */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <span style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>
                {isPersian ? 'آمار دقیق' : 'Detailed Stats'}
              </span>
            }
            style={{
              borderRadius: 16,
              background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
              border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
              height: '100%',
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
                    {stats.open.toLocaleString()}
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
                  <span>{texts.statusInProgress}</span>
                  <span style={{ fontWeight: 600, color: isDark ? '#E8EDF5' : '#1A2234' }}>
                    {stats.inProgress.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  percent={inProgressPercent} 
                  strokeColor="#fa8c16" 
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
                  <span>{texts.statusResolved}</span>
                  <span style={{ fontWeight: 600, color: isDark ? '#E8EDF5' : '#1A2234' }}>
                    {stats.resolved.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  percent={resolvedPercent} 
                  strokeColor="#52c41a" 
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
                    {stats.closed.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  percent={closedPercent} 
                  strokeColor="#94A3B8" 
                  strokeWidth={8} 
                  showInfo={false}
                  trailColor={isDark ? 'rgba(148,163,184,0.2)' : '#f0f0f0'}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Tickets */}
      <Card 
        title={
          <Space>
            <FireOutlined style={{ color: isDark ? '#4F8EF7' : '#1890ff' }} />
            <span style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>
              {texts.recentTickets}
            </span>
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => navigate('/tickets')}
            style={{ 
              fontWeight: 500,
              color: isDark ? '#4F8EF7' : '#1890ff'
            }}
          >
            {texts.viewAll} <ArrowRightOutlined style={{ fontSize: 12 }} />
          </Button>
        }
        style={{
          borderRadius: 16,
          background: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
          border: isDark ? '1px solid rgba(148,163,184,.12)' : '1px solid #f0f0f0',
        }}
      >
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        ) : recent.length > 0 ? (
          <List
            dataSource={recent}
            renderItem={(item) => {
              const status = statusConfig[item.status] || statusConfig.open;
              const formatDate = (date) => {
                return formatCalendarDate(date, isPersian ? 'fa' : 'en');
              };
              const getRelativeTime = (date) => {
                if (isPersian) {
                  return dayjs(date).locale('fa').fromNow();
                }
                return dayjs(date).locale('en').fromNow();
              };
              return (
                <List.Item
                  actions={[
                    <Space size="middle" align="center">
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 14px',
                          borderRadius: 20,
                          background: status.bgColor,
                          color: status.textColor,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <span 
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: status.dotColor,
                          }}
                        />
                        {status.label}
                      </span>
                      
                      <Button 
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${item.id}`);
                        }}
                        style={{
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        {texts.view}
                      </Button>
                    </Space>
                  ]}
                  style={{ 
                    padding: '16px 20px',
                    borderRadius: 12,
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    borderBottom: isDark 
                      ? '1px solid rgba(148,163,184,.08)' 
                      : '1px solid #f0f0f0',
                  }}
                  onClick={() => navigate(`/tickets/${item.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark 
                      ? 'rgba(255,255,255,0.03)' 
                      : '#fafafa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
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
                      <Text strong style={{ 
                        fontSize: 15,
                        color: isDark ? '#E8EDF5' : '#1A2234'
                      }}>
                        {item.subject}
                      </Text>
                    }
                    description={
                      <Space size="middle" wrap>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined style={{ marginLeft: 4 }} />
                          <Ltr>
                            {formatDate(item.createdAt)}
                          </Ltr>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined style={{ marginLeft: 4 }} />
                          <Ltr>
                            {getRelativeTime(item.createdAt)}
                          </Ltr>
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
            description={texts.noTickets}
          >
            <Button type="primary" onClick={() => navigate('/tickets/new')}>
              {texts.createNew}
            </Button>
          </Empty>
        )}
      </Card>

      <style>{`
        .ant-card-hoverable:hover {
          box-shadow: ${isDark 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.08)'} !important;
          transform: translateY(-2px);
        }
        .ant-list-item {
          transition: all 0.25s ease !important;
        }
        .ant-empty-description {
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
      `}</style>
    </div>
  );
}