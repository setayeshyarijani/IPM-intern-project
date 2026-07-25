import { useEffect, useState } from 'react';
import { Typography, Descriptions, Tag, Card, List, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { apiListTickets } from '../mock/api';
import Ltr from '../components/Ltr';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiListTickets({ page: 1, pageSize: 5, sortField: 'createdAt', sortOrder: 'descend' }, { onlyUserId: user.id })
      .then((res) => {
        if (active) setRecent(res.items);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <div>
      <Typography.Title level={3}>{t('dashboard.welcome', { name: user.fullName })}</Typography.Title>

      <Card title={t('dashboard.accountStatus')} style={{ marginBottom: 24 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label={t('dashboard.role')}>
            <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>{t(`users.${user.role}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.active')}>
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status === 'active' ? t('dashboard.active') : t('users.disabled')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('dashboard.joined')}>
            <Ltr>{dayjs(user.createdAt).format('YYYY-MM-DD')}</Ltr>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('dashboard.recentItems')}>
        {loading ? (
          <Skeleton active />
        ) : (
          <List
            dataSource={recent}
            locale={{ emptyText: t('table.empty') }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.subject}
                  description={<Ltr>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</Ltr>}
                />
                <Tag>{t(`tickets.${item.status}`)}</Tag>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
