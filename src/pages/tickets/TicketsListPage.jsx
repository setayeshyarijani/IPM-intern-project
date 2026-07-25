import { useCallback } from 'react';
import { Button, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DataTable from '../../components/DataTable';
import { apiListTickets } from '../../mock/api';
import { useAuth } from '../../context/AuthContext';
import Ltr from '../../components/Ltr';

const statusColor = { open: 'blue', inProgress: 'gold', closed: 'green' };
const priorityColor = { low: 'default', medium: 'orange', high: 'red' };

export default function TicketsListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPage = useCallback(
    (params) => apiListTickets(params, user.role === 'admin' ? {} : { onlyUserId: user.id }),
    [user]
  );

  const columns = [
    { title: t('tickets.subject'), dataIndex: 'subject', sorter: true },
    ...(user.role === 'admin' ? [{ title: t('users.name'), dataIndex: 'authorName', responsive: ['md'] }] : []),
    {
      title: t('tickets.status'),
      dataIndex: 'status',
      sorter: true,
      render: (val) => <Tag color={statusColor[val]}>{t(`tickets.${val}`)}</Tag>,
    },
    {
      title: t('tickets.priority'),
      dataIndex: 'priority',
      sorter: true,
      responsive: ['md'],
      render: (val) => <Tag color={priorityColor[val]}>{t(`tickets.${val}`)}</Tag>,
    },
    {
      title: t('tickets.createdAt'),
      dataIndex: 'createdAt',
      sorter: true,
      responsive: ['lg'],
      render: (val) => <Ltr>{dayjs(val).format('YYYY-MM-DD HH:mm')}</Ltr>,
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>{t('tickets.title')}</Typography.Title>
      <DataTable
        fetchPage={fetchPage}
        columns={columns}
        rowKey="id"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/new')}>
            {t('tickets.newTicket')}
          </Button>
        }
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onClick: () => navigate(`/tickets/${record.id}`),
        })}
      />
    </div>
  );
}
