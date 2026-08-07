import { useState } from 'react';
import { Typography, Tag, Button, Popconfirm, Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import DataTable from '../../components/DataTable';
import { apiListUsers, apiSetUserStatus } from '../../api/client';
import Ltr from '../../components/Ltr';
import { useThemeMode } from '../../context/ThemeModeContext';
import { formatCalendarDate } from '../../utils/date';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  MailOutlined,
  MoreOutlined
} from '@ant-design/icons';

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const isPersian = i18n.language === 'fa';
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [reloadKey, setReloadKey] = useState(0);

  async function toggleStatus(record) {
    const next = record.status === 'active' ? 'disabled' : 'active';
    await apiSetUserStatus(record.id, next);
    setReloadKey((k) => k + 1);
  }

  // پالت رنگی بهینه برای دارک مود
  const tagColors = {
    admin: {
      light: { background: '#fff7e6', color: '#d48806', border: '#ffd591' },
      dark: { background: 'rgba(250, 173, 20, 0.2)', color: '#ffd666', border: 'rgba(250, 173, 20, 0.3)' }
    },
    user: {
      light: { background: '#e6f7ff', color: '#096dd9', border: '#91d5ff' },
      dark: { background: 'rgba(24, 144, 255, 0.2)', color: '#69c0ff', border: 'rgba(24, 144, 255, 0.3)' }
    },
    active: {
      light: { background: '#f6ffed', color: '#389e0d', border: '#b7eb8f' },
      dark: { background: 'rgba(82, 196, 26, 0.2)', color: '#95de64', border: 'rgba(82, 196, 26, 0.3)' }
    },
    disabled: {
      light: { background: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
      dark: { background: 'rgba(255, 77, 79, 0.2)', color: '#ff7875', border: 'rgba(255, 77, 79, 0.3)' }
    }
  };

  // استایل‌های داینامیک برای تگ‌ها
  const getTagStyle = (type) => {
    const colors = tagColors[type]?.[isDark ? 'dark' : 'light'] || tagColors.admin.light;
    return {
      background: colors.background,
      color: colors.color,
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      padding: '2px 12px',
      fontSize: '13px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.3s ease',
    };
  };

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          {t('users.name')}
        </Space>
      ),
      dataIndex: 'fullName',
      sorter: true,
      render: (val, record) => (
        <Space>
          
          <span style={{ fontWeight: 500 }}>{val}</span>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <MailOutlined />
          {t('users.email')}
        </Space>
      ),
      dataIndex: 'email',
      sorter: true,
      responsive: ['md'],
      render: (val) => (
        <Ltr>
          <span style={{ 
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: '13px'
          }}>
            {val}
          </span>
        </Ltr>
      ),
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      sorter: true,
      render: (val) => {
        const isAdmin = val === 'admin';
        const style = getTagStyle(isAdmin ? 'admin' : 'user');
        return (
          <span style={style}>
            {isAdmin ? <CrownOutlined style={{ fontSize: 12 }} /> : <UserOutlined style={{ fontSize: 12 }} />}
            {t(`users.${val}`)}
          </span>
        );
      },
    },
    {
      title: t('users.status'),
      dataIndex: 'status',
      sorter: true,
      render: (val) => {
        const isActive = val === 'active';
        const style = getTagStyle(isActive ? 'active' : 'disabled');
        return (
          <span style={style}>
            {isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            {isActive ? t('dashboard.active') : t('users.disabled')}
          </span>
        );
      },
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          {t('users.createdAt')}
        </Space>
      ),
      dataIndex: 'createdAt',
      sorter: true,
      responsive: ['lg'],
      render: (val) => (
        <Ltr>
          <span style={{ 
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: '13px'
          }}>
            {formatCalendarDate(val, isPersian ? 'fa' : 'en', { withTime: false })}
          </span>
        </Ltr>
      ),
    },
    {
      title: t('users.actions'),
      dataIndex: 'actions',
      render: (_, record) =>
        record.role === 'admin' ? (
          <Tooltip title="ادمین قابل غیرفعال‌سازی نیست">
            <Button 
              size="small" 
              disabled 
              icon={<CrownOutlined />}
              style={{ 
                opacity: 0.5,
                cursor: 'not-allowed',
                borderRadius: '6px',
              }}
            >
              ادمین
            </Button>
          </Tooltip>
        ) : (
          <Popconfirm
            title={
              <div style={{ maxWidth: 250 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {record.status === 'active' ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر'}
                </div>
                <div style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
                  {record.status === 'active' 
                    ? `آیا از غیرفعال‌سازی "${record.fullName}" اطمینان دارید؟`
                    : `آیا از فعال‌سازی "${record.fullName}" اطمینان دارید؟`
                  }
                </div>
              </div>
            }
            onConfirm={() => toggleStatus(record)}
            okText="تأیید"
            cancelText="انصراف"
            okButtonProps={{ 
              danger: record.status === 'active',
              style: { borderRadius: '6px' }
            }}
            cancelButtonProps={{ style: { borderRadius: '6px' } }}
          >
            <Tooltip title={record.status === 'active' ? 'غیرفعال‌سازی' : 'فعال‌سازی'}>
              <Button 
                size="small"
                type={record.status === 'active' ? 'default' : 'primary'}
                danger={record.status === 'active'}
                icon={record.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                style={{ 
                  borderRadius: '6px',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
              >
                {record.status === 'active' ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
              </Button>
            </Tooltip>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('users.title')}
        </Typography.Title>
        
        <Space>
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '4px 12px',
            background: isDark ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
            borderRadius: '8px',
            fontSize: 12,
            color: isDark ? '#94A3B8' : '#64748B',
          }}>
            <span>کل کاربران: <strong style={{ color: isDark ? '#E8EDF5' : '#1A2234' }}>12</strong></span>
          </div>
        </Space>
      </div>

      {/* استایل‌های اضافی برای دارک مود */}
      <style>{`
        /* بهبود نمایش تگ‌ها در دارک مود */
        .ant-table {
          background: ${isDark ? 'transparent' : 'transparent'} !important;
        }
        
        .ant-table-thead > tr > th {
          background: ${isDark ? 'rgba(255,255,255,0.03)' : '#fafafa'} !important;
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
          border-bottom: 2px solid ${isDark ? 'rgba(148,163,184,.12)' : '#f0f0f0'} !important;
          font-weight: 600 !important;
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${isDark ? 'rgba(148,163,184,.08)' : '#f0f0f0'} !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: ${isDark ? 'rgba(255,255,255,0.03)' : '#fafafa'} !important;
        }
        
        /* بهبود Popconfirm */
        .ant-popover-inner {
          background: ${isDark ? '#1E293B' : '#fff'} !important;
          border: 1px solid ${isDark ? 'rgba(148,163,184,.12)' : '#f0f0f0'} !important;
          border-radius: 12px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '.5' : '.15'}) !important;
        }
        
        .ant-popover-title {
          border-bottom: none !important;
          padding: 16px 16px 8px !important;
          color: ${isDark ? '#E8EDF5' : '#1A2234'} !important;
        }
        
        .ant-popover-inner-content {
          padding: 8px 16px 16px !important;
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
        
        /* بهبود دکمه‌ها */
        .ant-btn {
          border-radius: 6px !important;
          transition: all 0.3s ease !important;
        }
        
        .ant-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* بهبود تگ‌ها در حالت Hover */
        .ant-tag {
          transition: all 0.3s ease !important;
          cursor: default !important;
        }
        
        .ant-tag:hover {
          transform: scale(1.02);
        }
        
        /* بهبود LTR */
        .ltr-text {
          direction: ltr;
          unicode-bidi: embed;
          display: inline-block;
        }
      `}</style>

      <DataTable 
        fetchPage={apiListUsers} 
        columns={columns} 
        rowKey="id" 
        reloadKey={reloadKey}
        style={{
          background: isDark ? 'rgba(30,41,59,0.5)' : 'transparent',
          borderRadius: 16,
          overflow: 'hidden',
          backdropFilter: isDark ? 'blur(10px)' : 'none',
        }}
      />
    </div>
  );
}