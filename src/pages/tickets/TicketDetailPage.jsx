import { useCallback, useEffect, useState } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  List, 
  Input, 
  Button, 
  Select, 
  Skeleton, 
  Space, 
  message,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Alert,
  Descriptions,
  Modal,
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  MailOutlined,
  TagOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { apiGetTicket, apiReplyTicket, apiSetTicketStatus, apiDeleteTicket } from '../../mock/api';
import { useAuth } from '../../context/AuthContext';
import Ltr from '../../components/Ltr';

dayjs.extend(relativeTime);

const statusColor = { 
  open: 'processing', 
  inProgress: 'warning', 
  closed: 'success' 
};

const statusIcon = {
  open: <ExclamationCircleOutlined />,
  inProgress: <ClockCircleOutlined />,
  closed: <CheckCircleOutlined />,
};

const statusLabel = {
  open: 'باز',
  inProgress: 'در حال بررسی',
  closed: 'بسته شده',
};

const priorityColor = { 
  low: 'default', 
  medium: 'warning', 
  high: 'error' 
};

const priorityLabel = {
  low: 'کم',
  medium: 'متوسط',
  high: 'بالا',
};

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetTicket(ticketId);
      setTicket(data);
    } catch (error) {
      message.error('خطا در دریافت اطلاعات تیکت');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // ارسال پاسخ
  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const updated = await apiReplyTicket(ticketId, {
        authorId: user.id,
        authorName: user.fullName,
        body: reply.trim(),
      });
      setTicket(updated);
      setReply('');
      message.success(t('tickets.replySuccess'));
    } catch (error) {
      message.error('خطا در ارسال پاسخ');
    } finally {
      setSending(false);
    }
  }

  // تغییر وضعیت تیکت
  async function changeStatus(status) {
    setStatusChangeLoading(true);
    try {
      const updated = await apiSetTicketStatus(ticketId, status);
      setTicket(updated);
      message.success(`وضعیت تیکت به "${statusLabel[status]}" تغییر یافت`);
      setEditModalVisible(false);
    } catch (error) {
      message.error('خطا در تغییر وضعیت');
    } finally {
      setStatusChangeLoading(false);
    }
  }

  // حذف تیکت
  async function handleDelete() {
    try {
      await apiDeleteTicket(ticketId);
      message.success('تیکت با موفقیت حذف شد');
      setDeleteModalVisible(false);
      navigate('/tickets');
    } catch (error) {
      message.error('خطا در حذف تیکت');
    }
  }

  // باز کردن مودال ویرایش
  const showEditModal = () => {
    setNewStatus(ticket?.status || 'open');
    setEditModalVisible(true);
  };

  // تغییر وضعیت از طریق مودال
  const handleStatusChange = () => {
    if (newStatus !== ticket?.status) {
      changeStatus(newStatus);
    } else {
      setEditModalVisible(false);
      message.info('وضعیت تغییری نکرده است');
    }
  };

  if (loading || !ticket) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // بررسی دسترسی برای حذف و ویرایش
  const canModify = user.role === 'admin' || user.id === ticket.userId;

  return (
    <div style={{ 
      padding: '24px',
      maxWidth: 1000,
      margin: '0 auto',
    }}>
      {/* دکمه بازگشت */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        type="link" 
        onClick={() => navigate('/tickets')} 
        style={{ 
          paddingInlineStart: 0,
          marginBottom: 16,
          fontSize: 16,
        }}
      >
        {t('tickets.backToList')}
      </Button>

      {/* هدر تیکت */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)',
          marginBottom: 24,
        }}
        title={
          <Space size={12}>
            <Badge 
              status={ticket.status === 'closed' ? 'default' : ticket.status === 'open' ? 'processing' : 'warning'}
              text={
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {ticket.subject}
                </Typography.Title>
              }
            />
          </Space>
        }
        extra={
          <Space size="small">
            {/* دکمه‌های ویرایش و حذف */}
            {canModify && (
              <>
                <Tooltip title="ویرایش وضعیت">
                  <Button 
                    type="text"
                    icon={<EditOutlined />}
                    onClick={showEditModal}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
                
                <Tooltip title="حذف تیکت">
                  <Button 
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteModalVisible(true)}
                    danger
                  />
                </Tooltip>
              </>
            )}
          </Space>
        }
      >
        {/* اطلاعات اصلی تیکت */}
        <Descriptions 
          column={{ xs: 1, sm: 2, md: 3 }}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label={<TagOutlined />} labelStyle={{ fontWeight: 600 }}>
            <Tag color={priorityColor[ticket.priority]}>
              {priorityLabel[ticket.priority]}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={<UserOutlined />} labelStyle={{ fontWeight: 600 }}>
            {ticket.authorName}
          </Descriptions.Item>
          
          <Descriptions.Item label={<ClockCircleOutlined />} labelStyle={{ fontWeight: 600 }}>
            <Ltr>{dayjs(ticket.createdAt).format('YYYY/MM/DD HH:mm')}</Ltr>
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              ({dayjs(ticket.createdAt).fromNow()})
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        {/* وضعیت فعلی */}
        <Alert
          message="وضعیت فعلی"
          description={
            <Space>
              <Tag 
                color={statusColor[ticket.status]} 
                icon={statusIcon[ticket.status]}
                style={{ 
                  borderRadius: 12,
                  padding: '4px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {statusLabel[ticket.status]}
              </Tag>
              {user.role === 'admin' && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={showEditModal}
                  icon={<EditOutlined />}
                >
                  تغییر وضعیت
                </Button>
              )}
            </Space>
          }
          type={ticket.status === 'closed' ? 'success' : ticket.status === 'open' ? 'info' : 'warning'}
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* گفتگو */}
        <Divider orientation="left">
          <Space>
            <MailOutlined />
            <Typography.Text strong>گفتگو</Typography.Text>
            <Badge count={ticket.messages?.length || 0} size="small" />
          </Space>
        </Divider>

        <List
          dataSource={ticket.messages || []}
          renderItem={(msg, index) => (
            <List.Item
              style={{
                padding: '16px 0',
                borderBottom: index < ticket.messages.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: msg.authorId === user.id ? '#f6f9ff' : 'transparent',
                borderRadius: 8,
                paddingLeft: msg.authorId === user.id ? 16 : 0,
                paddingRight: msg.authorId === user.id ? 16 : 0,
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{
                      background: msg.authorId === user.id ? '#1890ff' : '#52c41a',
                    }}
                  />
                }
                title={
                  <Space>
                    <Typography.Text strong>{msg.authorName}</Typography.Text>
                    {msg.authorId === user.id && (
                      <Tag color="blue" size="small">شما</Tag>
                    )}
                    {msg.authorId === 'admin' && (
                      <Tag color="red" size="small">ادمین</Tag>
                    )}
                  </Space>
                }
                description={
                  <Ltr>
                    {dayjs(msg.createdAt).format('YYYY/MM/DD HH:mm')}
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                      ({dayjs(msg.createdAt).fromNow()})
                    </Typography.Text>
                  </Ltr>
                }
              />
              <Typography.Paragraph style={{ 
                margin: '8px 0 0 0',
                padding: '8px 12px',
                background: msg.authorId === user.id ? '#f0f7ff' : '#fafafa',
                borderRadius: 8,
                maxWidth: 480,
              }}>
                {msg.body}
              </Typography.Paragraph>
            </List.Item>
          )}
          locale={{ emptyText: 'هیچ پیامی در این تیکت وجود ندارد' }}
        />

        {/* بخش ارسال پاسخ */}
        {ticket.status !== 'closed' && (
          <div style={{ marginTop: 24 }}>
            <Divider orientation="left">ارسال پاسخ</Divider>
            <Input.TextArea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="پاسخ خود را وارد کنید..."
              style={{ 
                marginBottom: 12,
                borderRadius: 8,
              }}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                sendReply();
              }}
            />
            <Button 
              type="primary" 
              onClick={sendReply} 
              loading={sending}
              icon={<SendOutlined />}
              disabled={!reply.trim()}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              ارسال پاسخ
            </Button>
            <Typography.Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
              Shift + Enter برای خط جدید
            </Typography.Text>
          </div>
        )}

        {ticket.status === 'closed' && (
          <Alert
            message="این تیکت بسته شده است"
            description="شما نمی‌توانید به تیکت بسته شده پاسخ دهید"
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        )}
      </Card>

      {/* مودال ویرایش وضعیت */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>ویرایش وضعیت تیکت</span>
          </Space>
        }
        open={editModalVisible}
        onOk={handleStatusChange}
        onCancel={() => setEditModalVisible(false)}
        okText="تغییر وضعیت"
        cancelText="انصراف"
        confirmLoading={statusChangeLoading}
        okButtonProps={{
          style: { borderRadius: 8 }
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <Typography.Text strong>وضعیت فعلی: </Typography.Text>
          <Tag 
            color={statusColor[ticket.status]} 
            icon={statusIcon[ticket.status]}
            style={{ borderRadius: 12, padding: '2px 12px' }}
          >
            {statusLabel[ticket.status]}
          </Tag>
          
          <Divider />
          
          <div>
            <Typography.Text>وضعیت جدید را انتخاب کنید:</Typography.Text>
            <Select
              value={newStatus}
              onChange={setNewStatus}
              style={{ 
                width: '100%',
                marginTop: 8,
              }}
              size="large"
              options={['open', 'inProgress', 'closed'].map((s) => ({
                value: s,
                label: (
                  <Space>
                    {statusIcon[s]}
                    <span>{statusLabel[s]}</span>
                    <Tag color={statusColor[s]} style={{ borderRadius: 12, padding: '0 8px' }}>
                      {s === 'open' ? 'باز' : s === 'inProgress' ? 'در حال بررسی' : 'بسته'}
                    </Tag>
                  </Space>
                ),
              }))}
            />
          </div>
        </div>
      </Modal>

      {/* مودال حذف */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <span>حذف تیکت</span>
          </Space>
        }
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="حذف"
        cancelText="انصراف"
        okButtonProps={{
          danger: true,
          style: { borderRadius: 8 }
        }}
        cancelButtonProps={{
          style: { borderRadius: 8 }
        }}
      >
        <Alert
          message="آیا از حذف این تیکت مطمئن هستید؟"
          description="این عملیات غیرقابل بازگشت است و تمام پیام‌های این تیکت نیز حذف خواهند شد."
          type="warning"
          showIcon
          style={{ margin: '16px 0' }}
        />
        
        <Descriptions column={1} size="small">
          <Descriptions.Item label="عنوان">{ticket.subject}</Descriptions.Item>
          <Descriptions.Item label="وضعیت">
            <Tag color={statusColor[ticket.status]}>
              {statusLabel[ticket.status]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
}