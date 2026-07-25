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

export default function ReportsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetReports()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (!stats) return <Skeleton active />;

  const closedPercent = stats.totalTickets > 0 
    ? Math.round((stats.closedTickets / stats.totalTickets) * 100) 
    : 0;
  const openPercent = stats.totalTickets > 0 
    ? Math.round((stats.openTickets / stats.totalTickets) * 100) 
    : 0;

  const cards = [
    { 
      title: t('reports.totalUsers'), 
      value: stats.totalUsers, 
      icon: <UserOutlined />, 
      color: '#1677ff' 
    },
    { 
      title: t('reports.totalTickets'), 
      value: stats.totalTickets, 
      icon: <IdcardOutlined />, 
      color: '#722ed1' 
    },
    { 
      title: t('reports.openTickets'), 
      value: stats.openTickets, 
      icon: <FolderOpenOutlined />, 
      color: '#faad14' 
    },
    { 
      title: t('reports.closedTickets'), 
      value: stats.closedTickets, 
      icon: <CheckCircleOutlined />, 
      color: '#52c41a' 
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('reports.title')}
        </Typography.Title>
        <Space>
          <Typography.Text type="secondary">
            {t('reports.lastUpdated', 'آخرین بروزرسانی')}: <Ltr>{new Date().toLocaleString('fa-IR')}</Ltr>
          </Typography.Text>
        </Space>
      </div>

      {/* کارت‌های آماری بالا - ساده مثل قبل */}
      <Row gutter={[16, 16]}>
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

      {/* بخش پایین - سمت چپ: وضعیت تیکت‌ها */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card 
            title={t('reports.ticketStatus', 'وضعیت تیکت‌ها')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{t('reports.openTickets')}</span>
                  <span style={{ fontWeight: 600 }}>{stats.openTickets}</span>
                </div>
                <Progress 
                  percent={openPercent} 
                  strokeColor="#faad14" 
                  strokeWidth={8} 
                  showInfo={false}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{t('reports.closedTickets')}</span>
                  <span style={{ fontWeight: 600 }}>{stats.closedTickets}</span>
                </div>
                <Progress 
                  percent={closedPercent} 
                  strokeColor="#52c41a" 
                  strokeWidth={8} 
                  showInfo={false}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: 8,
                borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{ color: '#8c8c8c' }}>{t('reports.totalTickets')}</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{stats.totalTickets}</span>
              </div>
            </Space>
          </Card>
        </Col>

        {/* بخش پایین - سمت راست: آمار سریع */}
        <Col xs={24} md={12}>
          <Card 
            title={t('reports.quickStats', 'آمار سریع')}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} /> 
                  {t('reports.totalUsers')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{stats.totalUsers.toLocaleString()}</span>
              </div>
              <Divider style={{ margin: 4 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <IdcardOutlined style={{ marginRight: 8, color: '#722ed1' }} /> 
                  {t('reports.totalTickets')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{stats.totalTickets.toLocaleString()}</span>
              </div>
              <Divider style={{ margin: 4 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <FolderOpenOutlined style={{ marginRight: 8, color: '#faad14' }} /> 
                  {t('reports.openTickets')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{stats.openTickets.toLocaleString()}</span>
              </div>
              <Divider style={{ margin: 4 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} /> 
                  {t('reports.closedTickets')}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{stats.closedTickets.toLocaleString()}</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}