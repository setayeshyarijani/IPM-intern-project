import { useState } from 'react';
import { Typography, Tag, Button, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DataTable from '../../components/DataTable';
import { apiListUsers, apiSetUserStatus } from '../../mock/api';
import Ltr from '../../components/Ltr';

export default function UsersPage() {
  const { t } = useTranslation();
  const [reloadKey, setReloadKey] = useState(0);

  async function toggleStatus(record) {
    const next = record.status === 'active' ? 'disabled' : 'active';
    await apiSetUserStatus(record.id, next);
    setReloadKey((k) => k + 1);
  }

  const columns = [
    { title: t('users.name'), dataIndex: 'fullName', sorter: true },
    {
      title: t('users.email'),
      dataIndex: 'email',
      sorter: true,
      responsive: ['md'],
      render: (val) => <Ltr>{val}</Ltr>,
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      sorter: true,
      render: (val) => <Tag color={val === 'admin' ? 'gold' : 'blue'}>{t(`users.${val}`)}</Tag>,
    },
    {
      title: t('users.status'),
      dataIndex: 'status',
      sorter: true,
      render: (val) => <Tag color={val === 'active' ? 'green' : 'red'}>{val === 'active' ? t('dashboard.active') : t('users.disabled')}</Tag>,
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'createdAt',
      sorter: true,
      responsive: ['lg'],
      render: (val) => <Ltr>{dayjs(val).format('YYYY-MM-DD')}</Ltr>,
    },
    {
      title: t('users.actions'),
      dataIndex: 'actions',
      render: (_, record) =>
        record.role === 'admin' ? null : (
          <Popconfirm
            title={record.status === 'active' ? t('users.disable') : t('users.enable')}
            onConfirm={() => toggleStatus(record)}
          >
            <Button size="small" danger={record.status === 'active'}>
              {record.status === 'active' ? t('users.disable') : t('users.enable')}
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>{t('users.title')}</Typography.Title>
      <DataTable fetchPage={apiListUsers} columns={columns} rowKey="id" reloadKey={reloadKey} />
    </div>
  );
}
