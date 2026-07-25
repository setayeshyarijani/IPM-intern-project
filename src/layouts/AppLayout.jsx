import { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Dropdown, 
  Avatar, 
  Space, 
  Typography, 
  Drawer, 
  Button, 
  Switch, 
  Grid, 
  theme as antdTheme,
  Badge,
  Tooltip,
  Divider,
  Flex
} from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  IdcardOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  GlobalOutlined,
  MoonOutlined,
  SunOutlined,
  SettingOutlined,
  BellOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useThemeMode } from '../context/ThemeModeContext';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

export default function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { lang, setLang, dir } = useLocale();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token } = antdTheme.useToken();

  const items = [
    { 
      key: '/dashboard', 
      icon: <DashboardOutlined />, 
      label: t('nav.dashboard'),
    },
    { 
      key: '/tickets', 
      icon: <IdcardOutlined />, 
      label: t('nav.tickets'),
      badge: 3,
    },
    { 
      key: '/profile', 
      icon: <UserOutlined />, 
      label: t('nav.profile') 
    },
  ];

  if (user?.role === 'admin') {
    items.push(
      { 
        key: '/admin/users', 
        icon: <TeamOutlined />, 
        label: t('nav.users') 
      },
      { 
        key: '/admin/reports', 
        icon: <BarChartOutlined />, 
        label: t('nav.reports') 
      }
    );
  }

  const selectedKey = items.find((i) => location.pathname.startsWith(i.key))?.key || '/dashboard';

  const goTo = (key) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const menuNode = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items.map(item => ({
        ...item,
        label: (
          <Flex justify="space-between" align="center">
            <span>{item.label}</span>
            {item.badge && (
              <Badge 
                count={item.badge} 
                size="small" 
                style={{ backgroundColor: token.colorPrimary }}
              />
            )}
          </Flex>
        )
      }))}
      onClick={({ key }) => goTo(key)}
      style={{
        borderRight: 0,
        padding: '8px 0',
      }}
    />
  );

  const langMenu = {
    items: [
      { 
        key: 'fa', 
        label: (
          <Flex align="center" gap={8}>
            <span>🇮🇷</span> فارسی
          </Flex>
        )
      },
      { 
        key: 'en', 
        label: (
          <Flex align="center" gap={8}>
            <span>🇬🇧</span> English
          </Flex>
        )
      },
    ],
    onClick: ({ key }) => setLang(key),
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: t('nav.profile'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'تنظیمات',
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: t('nav.logout'),
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        logout();
        navigate('/login');
      } else if (key === 'profile') {
        navigate('/profile');
      } else if (key === 'settings') {
        navigate('/settings');
      }
    },
  };

  const brand = (
    <Flex 
      align="center" 
      justify="center" 
      style={{ 
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#fff',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: token.borderRadiusLG,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {t('app.title').charAt(0)}
        </div>
        <Text 
          style={{ 
            color: '#fff', 
            fontSize: 18, 
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          {t('app.title')}
        </Text>
      </div>
    </Flex>
  );

  const headerControls = (
    <Space size="middle" wrap>
      <Tooltip title="اعلان‌ها">
        <Badge count={5} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            style={{ 
              width: 40, 
              height: 40,
              borderRadius: '50%',
            }}
          />
        </Badge>
      </Tooltip>

      <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
        <Button
          type="text"
          icon={mode === 'dark' ? <SunOutlined style={{ fontSize: 18 }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
          onClick={toggleMode}
          style={{ 
            width: 40, 
            height: 40,
            borderRadius: '50%',
          }}
        />
      </Tooltip>

      <Dropdown menu={langMenu} placement="bottomRight" trigger={['click']}>
        <Button 
          type="text" 
          icon={<GlobalOutlined style={{ fontSize: 18 }} />}
          style={{ 
            width: 40, 
            height: 40,
            borderRadius: '50%',
          }}
        />
      </Dropdown>

      <Divider type="vertical" style={{ height: 32, margin: 0 }} />

      <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
        <Flex 
          align="center" 
          gap={10}
          style={{ 
            cursor: 'pointer', 
            padding: '4px 12px 4px 8px',
            borderRadius: token.borderRadiusLG,
            transition: 'all 0.3s',
          }}
        >
          <Badge >
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                color: '#fff',
                width: 36,
                height: 36,
              }}
            />
          </Badge>
          <div style={{ lineHeight: 1.4 }}>
            <Text strong style={{ display: 'block', fontSize: 14 }}>
              {user?.fullName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              {user?.role === 'admin' ? 'مدیر' : 'کاربر'}
            </Text>
          </div>
        </Flex>
      </Dropdown>
    </Space>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          width={260} 
          theme="dark" 
          style={{ 
            position: 'sticky', 
            insetBlockStart: 0, 
            height: '100vh', 
            overflow: 'auto',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          {brand}
          {menuNode}
          
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Flex align="center" gap={10}>
              <Avatar 
                size="small"
                icon={<UserSwitchOutlined />}
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
              <div>
              </div>
            </Flex>
          </div>
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: 12,
            height: 72,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {isMobile && (
            <Button 
              type="text" 
              size="large" 
              icon={<MenuOutlined style={{ fontSize: 20 }} />} 
              onClick={() => setDrawerOpen(true)} 
              aria-label={t('app.title')}
              style={{ 
                width: 44, 
                height: 44,
                borderRadius: token.borderRadiusLG,
              }}
            />
          )}
          {headerControls}
        </Header>

        <Content style={{ 
          margin: 24,
          padding: 0,
          minHeight: 'calc(100vh - 120px)',
        }}>
          <div
            style={{
              background: token.colorBgContainer,
              padding: 24,
              borderRadius: token.borderRadiusLG,
              minHeight: '100%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Drawer
        placement={dir === 'rtl' ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        styles={{ 
          body: { 
            padding: 0, 
            background: '#001529',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
          header: {
            background: '#001529',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 20px',
          },
        }}
        title={
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {t('app.title')}
          </Text>
        }
        closeIcon={<Text style={{ color: 'rgba(255,255,255,0.6)' }}>✕</Text>}
      >
        {menuNode}
      </Drawer>
    </Layout>
  );
}