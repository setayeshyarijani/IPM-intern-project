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
  Flex,
  ConfigProvider
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

// پالت رنگی سفارشی
const COLORS = {
  primary: '#77BEF0',
  secondary: '#FFCB61',
  tertiary: '#FF894F',
  accent: '#EA5B6F',
  darkBg: '#0A0E1A',
  darkSider: '#111827',
  darkCard: '#1A2234',
  darkBorder: 'rgba(255,255,255,0.08)',
  lightBg: '#F5F7FA',
  lightSider: '#001529',
  lightCard: '#FFFFFF',
  lightBorder: 'rgba(0,0,0,0.06)',
};

// تم سفارشی برای دارک مود
const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: COLORS.primary,
    colorBgContainer: COLORS.darkCard,
    colorBgElevated: COLORS.darkSider,
    colorBgLayout: COLORS.darkBg,
    colorBorderSecondary: COLORS.darkBorder,
    colorText: '#E8EDF5',
    colorTextSecondary: '#94A3B8',
    colorTextBase: '#E8EDF5',
    colorBgSpotlight: COLORS.darkSider,
  },
  components: {
    Layout: {
      headerBg: COLORS.darkCard,
      siderBg: COLORS.darkSider,
      bodyBg: COLORS.darkBg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: `rgba(119, 190, 240, 0.15)`,
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverBg: `rgba(119, 190, 240, 0.08)`,
      darkItemColor: '#94A3B8',
    },
  },
};

// تم سفارشی برای لایت مود
const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: COLORS.primary,
    colorBgContainer: COLORS.lightCard,
    colorBgLayout: COLORS.lightBg,
    colorBorderSecondary: COLORS.lightBorder,
    colorText: '#1A2234',
    colorTextSecondary: '#64748B',
  },
  components: {
    Layout: {
      headerBg: COLORS.lightCard,
      siderBg: COLORS.lightSider,
      bodyBg: COLORS.lightBg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: `rgba(119, 190, 240, 0.15)`,
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverBg: `rgba(119, 190, 240, 0.08)`,
      darkItemColor: 'rgba(255,255,255,0.65)',
    },
  },
};

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

  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;
  const isDark = mode === 'dark';

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

  // استایل‌های داینامیک برای آیتم‌های منو
  const getMenuItemStyle = (item) => ({
    ...item,
    label: (
      <Flex justify="space-between" align="center">
        <span>{item.label}</span>
        {item.badge && (
          <Badge 
            count={item.badge} 
            size="small" 
            style={{ 
              backgroundColor: isDark ? COLORS.secondary : COLORS.primary,
              color: isDark ? '#1A2234' : '#fff',
            }}
          />
        )}
      </Flex>
    )
  });

  const menuNode = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items.map(getMenuItemStyle)}
      onClick={({ key }) => goTo(key)}
      style={{
        borderRight: 0,
        padding: '8px 0',
        background: 'transparent',
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
        borderBottom: isDark ? `1px solid ${COLORS.darkBorder}` : '1px solid rgba(255,255,255,0.1)',
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
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            boxShadow: `0 2px 8px rgba(119, 190, 240, 0.3)`,
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
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
              color: isDark ? '#94A3B8' : '#64748B',
            }}
          />
        </Badge>
      </Tooltip>

      <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
        <Button
          type="text"
          icon={mode === 'dark' ? <SunOutlined style={{ fontSize: 18, color: COLORS.secondary }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
          onClick={toggleMode}
          style={{ 
            width: 40, 
            height: 40,
            borderRadius: '50%',
            color: isDark ? COLORS.secondary : '#64748B',
            background: isDark ? 'rgba(255, 203, 97, 0.1)' : 'transparent',
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
            color: isDark ? '#94A3B8' : '#64748B',
          }}
        />
      </Dropdown>

      <Divider type="vertical" style={{ height: 32, margin: 0, borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder }} />

      <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
        <Flex 
          align="center" 
          gap={10}
          style={{ 
            cursor: 'pointer', 
            padding: '4px 12px 4px 8px',
            borderRadius: token.borderRadiusLG,
            transition: 'all 0.3s',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'transparent',
            border: isDark ? `1px solid ${COLORS.darkBorder}` : 'none',
            '&:hover': {
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
            }
          }}
        >
          <Badge dot status="success" offset={[-2, 2]}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: '#fff',
                width: 36,
                height: 36,
                boxShadow: `0 2px 8px rgba(119, 190, 240, 0.2)`,
              }}
            />
          </Badge>
          <div style={{ lineHeight: 1.4 }}>
            <Text strong style={{ display: 'block', fontSize: 14, color: isDark ? '#E8EDF5' : '#1A2234' }}>
              {user?.fullName}
            </Text>
            <Text style={{ 
              fontSize: 12, 
              display: 'block',
              color: isDark ? '#94A3B8' : '#64748B',
            }}>
              {user?.role === 'admin' ? 'مدیر' : 'کاربر'}
            </Text>
          </div>
        </Flex>
      </Dropdown>
    </Space>
  );

  const siderStyle = {
    position: 'sticky',
    insetBlockStart: 0,
    height: '100vh',
    overflow: 'auto',
    boxShadow: isDark ? '2px 0 8px rgba(0,0,0,0.5)' : '2px 0 8px rgba(0,0,0,0.1)',
    background: isDark ? COLORS.darkSider : COLORS.lightSider,
  };

  const headerStyle = {
    background: isDark ? COLORS.darkCard : COLORS.lightCard,
    borderBottom: `1px solid ${isDark ? COLORS.darkBorder : COLORS.lightBorder}`,
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'flex-end',
    gap: 12,
    height: 72,
    boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
  };

  const contentStyle = {
    background: isDark ? COLORS.darkBg : COLORS.lightBg,
    margin: 24,
    padding: 0,
    minHeight: 'calc(100vh - 120px)',
  };

  const cardStyle = {
    background: isDark ? COLORS.darkCard : COLORS.lightCard,
    padding: 24,
    borderRadius: token.borderRadiusLG,
    minHeight: '100%',
    boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? COLORS.darkBorder : COLORS.lightBorder}`,
  };

  const drawerStyle = {
    body: { 
      padding: 0, 
      background: isDark ? COLORS.darkSider : COLORS.lightSider,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    header: {
      background: isDark ? COLORS.darkSider : COLORS.lightSider,
      borderBottom: isDark ? `1px solid ${COLORS.darkBorder}` : '1px solid rgba(255,255,255,0.1)',
      padding: '16px 20px',
    },
  };

  return (
    <ConfigProvider theme={currentTheme}>
      <Layout style={{ minHeight: '100vh', background: isDark ? COLORS.darkBg : COLORS.lightBg }}>
        {!isMobile && (
          <Sider width={260} theme="dark" style={siderStyle}>
            {brand}
            {menuNode}
            
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '16px',
                borderTop: isDark ? `1px solid ${COLORS.darkBorder}` : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Flex align="center" gap={10}>
                <Avatar 
                  size="small"
                  icon={<UserSwitchOutlined />}
                  style={{ 
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    v2.0.0
                  </Text>
                </div>
              </Flex>
            </div>
          </Sider>
        )}

        <Layout>
          <Header style={headerStyle}>
            {isMobile && (
              <Button 
                type="text" 
                size="large" 
                icon={<MenuOutlined style={{ fontSize: 20, color: isDark ? '#E8EDF5' : '#1A2234' }} />} 
                onClick={() => setDrawerOpen(true)} 
                aria-label={t('app.title')}
                style={{ 
                  width: 44, 
                  height: 44,
                  borderRadius: token.borderRadiusLG,
                  color: isDark ? '#E8EDF5' : '#1A2234',
                }}
              />
            )}
            {headerControls}
          </Header>

          <Content style={contentStyle}>
            <div style={cardStyle}>
              <Outlet />
            </div>
          </Content>
        </Layout>

        <Drawer
          placement={dir === 'rtl' ? 'right' : 'left'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={drawerStyle}
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
    </ConfigProvider>
  );
}