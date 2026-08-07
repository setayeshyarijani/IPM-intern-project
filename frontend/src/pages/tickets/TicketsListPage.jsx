import { useCallback, useMemo, useState } from 'react';
import { Button, Tag, Typography, Space, Dropdown, message, Popconfirm, Tooltip, Select } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DataTable from '../../components/DataTable';
import { apiListTickets, apiDeleteTicket } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Ltr from '../../components/Ltr';
import { formatCalendarDate } from '../../utils/date';

dayjs.extend(relativeTime);

const statusColor = { 
  open: 'processing', 
  inProgress: 'warning', 
  closed: 'success' 
};

const statusIcon = {
  open: <ClockCircleOutlined />,
  inProgress: <ExclamationCircleOutlined />,
  closed: <CheckCircleOutlined />,
};

const priorityColor = { 
  low: 'default', 
  medium: 'warning', 
  high: 'error' 
};

export default function TicketsListPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPersian = i18n.language === 'fa';
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [statusFilter, setStatusFilter] = useState();
  const [priorityFilter, setPriorityFilter] = useState();

  const exportRows = useMemo(
    () => dataSource.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      authorName: ticket.authorName,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: formatCalendarDate(ticket.createdAt, isPersian ? 'fa' : 'en'),
    })),
    [dataSource]
  );

  const fetchPage = useCallback(
    async (params) => {
      const result = await apiListTickets(
        {
          ...params,
          status: statusFilter,
          priority: priorityFilter,
        }, 
        user.role === 'admin' ? {} : { onlyUserId: user.id }
      );
      setDataSource(result.items || []);
      setTotalTickets(result.total || 0);
      return result;
    },
    [user, statusFilter, priorityFilter]
  );

  const handleExportCsv = () => {
    const headers = ['ID', 'Subject', 'Author', 'Status', 'Priority', 'Created At'];
    const rows = exportRows.map((row) => [row.id, row.subject, row.authorName || '-', row.status, row.priority, row.createdAt]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-page-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success(t('tickets.exportSuccess', 'CSV exported successfully'));
  };

  const handleResetFilters = () => {
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
  };

  // حذف تیکت
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await apiDeleteTicket(record.id);
      message.success(t('tickets.deleteSuccess'));
      // رفرش لیست
      await fetchPage({ page: 1, pageSize: 10 });
    } catch (error) {
      message.error(t('tickets.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  // ویرایش تیکت
  const handleEdit = (record) => {
    navigate(`/tickets/edit/${record.id}`);
  };

  // مشاهده تیکت
  const handleView = (record) => {
    navigate(`/tickets/${record.id}`);
  };

  // ستون اکشن‌ها
  const actionColumn = {
    title: t('tickets.actions'),
    key: 'actions',
    fixed: 'right',
    width: 120,
    render: (_, record) => (
      <Space size="small">
        <Tooltip title={t('tickets.view')}>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            style={{ color: '#1890ff' }}
          />
        </Tooltip>
        
        <Tooltip title={t('tickets.edit')}>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ color: '#52c41a' }}
          />
        </Tooltip>

        <Popconfirm
          title={t('tickets.deleteConfirmTitle')}
          description={t('tickets.deleteConfirmDesc')}
          onConfirm={() => handleDelete(record)}
          okText={t('common.yes')}
          cancelText={t('common.no')}
          placement="topRight"
        >
          <Tooltip title={t('tickets.delete')}>
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              danger
            />
          </Tooltip>
        </Popconfirm>

        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: t('tickets.view'),
                onClick: () => handleView(record),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: t('tickets.edit'),
                onClick: () => handleEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: t('tickets.delete'),
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
          />
        </Dropdown>
      </Space>
    ),
  };

  const columns = [
    { 
      title: '#', 
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    { 
      title: t('tickets.subject'), 
      dataIndex: 'subject', 
      sorter: true,
      ellipsis: true,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('tickets.id')}: #{record.id.slice(0, 8)}
          </Typography.Text>
        </Space>
      ),
    },
    ...(user.role === 'admin' ? [{ 
      title: t('users.name'), 
      dataIndex: 'authorName', 
      responsive: ['md'],
      render: (text) => (
        <Space>
          <span>{text}</span>
          {text === 'Admin' && <Tag color="red">Admin</Tag>}
        </Space>
      ),
    }] : []),
    {
      title: t('tickets.status'),
      dataIndex: 'status',
      sorter: true,
      width: 130,
      render: (val) => (
        <Tag 
          color={statusColor[val]} 
          icon={statusIcon[val]}
          style={{ 
            borderRadius: 12,
            padding: '2px 12px',
            fontWeight: 500,
          }}
        >
          {t(`tickets.${val}`)}
        </Tag>
      ),
    },
    {
      title: t('tickets.priority'),
      dataIndex: 'priority',
      sorter: true,
      responsive: ['md'],
      width: 110,
      render: (val) => (
        <Tag 
          color={priorityColor[val]} 
          style={{ 
            borderRadius: 12,
            padding: '2px 12px',
            fontWeight: 500,
          }}
        >
          {t(`tickets.${val}`)}
        </Tag>
      ),
    },
    {
      title: t('tickets.createdAt'),
      dataIndex: 'createdAt',
      sorter: true,
      responsive: ['lg'],
      render: (val) => (
        <Space direction="vertical" size={0}>
          <Ltr>{formatCalendarDate(val, isPersian ? 'fa' : 'en')}</Ltr>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(val).fromNow()}
          </Typography.Text>
        </Space>
      ),
    },
    actionColumn,
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('tickets.title')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('tickets.totalTickets', { count: totalTickets })}
          </Typography.Text>
        </div>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/tickets/new')}
          size="large"
          style={{
            height: 44,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
          }}
        >
          {t('tickets.newTicket')}
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder={t('tickets.status')}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          options={[
            { value: 'open', label: t('tickets.open') },
            { value: 'inProgress', label: t('tickets.inProgress') },
            { value: 'closed', label: t('tickets.closed') },
          ]}
        />
        <Select
          allowClear
          placeholder={t('tickets.priority')}
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 160 }}
          options={[
            { value: 'low', label: t('tickets.low') },
            { value: 'medium', label: t('tickets.medium') },
            { value: 'high', label: t('tickets.high') },
          ]}
        />
        <Button onClick={handleResetFilters}>
          {t('common.clear', isPersian ? 'پاک کردن فیلترها' : 'Reset filters')}
        </Button>
        <Button onClick={handleExportCsv}>
          {isPersian ? 'خروجی CSV' : 'Export CSV'}
        </Button>
      </Space>

      <DataTable
        fetchPage={fetchPage}
        columns={columns}
        rowKey="id"
        loading={loading}
        reloadKey={`${statusFilter || 'all'}-${priorityFilter || 'all'}`}
        scroll={{ x: 800 }}
        onRow={(record) => ({
          className: 'table-row-hover',
          style: { cursor: 'pointer' },
          onClick: () => navigate(`/tickets/${record.id}`),
        })}
        components={{
          header: {
            cell: (props) => (
              <th {...props} style={{ 
                ...props.style, 
                fontWeight: 600,
                background: '#fafafa',
                borderBottom: '2px solid #e8e8e8',
              }} />
            ),
          },
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} از ${total} تیکت`,
        }}
      />

      <style jsx>{`
        :global(.table-row-hover:hover) {
          background: #f0f7ff !important;
          transition: all 0.3s ease;
        }
        :global(.ant-table-tbody > tr.ant-table-row:hover > td) {
          background: #f0f7ff !important;
        }
      `}</style>
    </div>
  );
}