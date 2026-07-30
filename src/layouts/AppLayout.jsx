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

// پالت رنگی بهینه‌شده
const COLORS = {
  primary: "#f2e660",
  accent: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  darkBg: "#0F172A",
  darkSider: "#111827",
  darkCard: "#1E293B",
  darkHover: "#334155",
  darkBorder: "rgba(148,163,184,.12)",
  lightBg: "#F8FAFC",
  lightSider: "#3157c8c3", 
  lightCard: "#FFFFFF",
  lightBorder: "rgba(15,23,42,.08)",
};

// Theme های بهینه‌شده
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
    borderRadius: 16, // افزایش radius
  },
  components: {
    Layout: {
      headerBg: 'rgba(15,23,42,.75)', // Glass effect
      siderBg: COLORS.darkSider,
      bodyBg: COLORS.darkBg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(79,142,247,.15)',
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverBg: 'rgba(79,142,247,.08)',
      darkItemColor: '#94A3B8',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,.22)',
    },
    Button: {
      borderRadius: 12,
    },
  },
};

const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: COLORS.primary,
    colorBgContainer: COLORS.lightCard,
    colorBgLayout: COLORS.lightBg,
    colorBorderSecondary: COLORS.lightBorder,
    colorText: '#1A2234',
    colorTextSecondary: '#64748B',
    borderRadius: 16,
  },
  components: {
    Layout: {
      headerBg: COLORS.lightCard,
      siderBg: COLORS.lightSider,
      bodyBg: COLORS.lightBg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(79,142,247,.15)',
      darkItemSelectedColor: COLORS.primary,
      darkItemHoverBg: 'rgba(79,142,247,.08)',
      darkItemColor: 'rgba(255,255,255,0.65)',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,.08)',
    },
    Button: {
      borderRadius: 12,
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

  // استایل داینامیک منو با Hover افکت
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
              backgroundColor: isDark ? COLORS.accent : COLORS.primary,
              color: '#fff',
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
      // استایل سفارشی برای Hover و Active
      className="custom-menu"
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
            <span>ᴇɴ</span> English
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

  // برند با گرادینت و Glow
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
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            boxShadow: `0 0 25px rgba(79,142,247,.35)`, // Glow اضافه شد
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

  // هدر با دکمه‌های بهینه‌شده
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
              background: isDark ? 'rgba(255,255,255,.03)' : 'transparent',
              border: isDark ? '1px solid rgba(255,255,255,.05)' : 'none',
              transition: 'all .25s ease',
            }}
            className="header-btn"
          />
        </Badge>
      </Tooltip>

      <Tooltip title={mode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}>
        <Button
          type="text"
          icon={mode === 'dark' ? <SunOutlined style={{ fontSize: 18, color: COLORS.accent }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
          onClick={toggleMode}
          style={{ 
            width: 40, 
            height: 40,
            borderRadius: '50%',
            color: isDark ? COLORS.accent : '#64748B',
            background: isDark ? 'rgba(34,197,94,.12)' : 'transparent',
            border: isDark ? '1px solid rgba(34,197,94,.2)' : 'none',
            transition: 'all .25s ease',
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
            background: isDark ? 'rgba(255,255,255,.03)' : 'transparent',
            border: isDark ? '1px solid rgba(255,255,255,.05)' : 'none',
            transition: 'all .25s ease',
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
            borderRadius: 16,
            transition: 'all .25s ease',
          }}
        >
          <Badge >
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                color: '#fff',
                width: 36,
                height: 36,
                boxShadow: `0 0 25px rgba(79,142,247,.35)`, // Glow آواتار
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

  // سایدبار با گرادینت
  const siderStyle = {
    position: 'sticky',
    insetBlockStart: 0,
    height: '100vh',
    overflow: 'auto',
    boxShadow: isDark ? '2px 0 8px rgba(0,0,0,0.5)' : '2px 0 8px rgba(0,0,0,0.1)',
    background: isDark 
      ? 'linear-gradient(180deg, #111827 0%, #0F172A 100%)' 
      : COLORS.lightSider,
  };

  // هدر با Glass Effect
  const headerStyle = {
    position: 'static',
    top: 0,
    background: isDark 
      ? 'rgba(15,23,42,.75)' 
      : COLORS.lightCard,
    backdropFilter: isDark ? 'blur(18px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(18px)' : 'none',
    borderBottom: `1px solid ${isDark ? COLORS.darkBorder : COLORS.lightBorder}`,
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'flex-end',
    gap: 12,
    height: 72,
    boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
  };

  // محتوای اصلی با فاصله‌های جدید
  const contentStyle = {
    background: isDark ? COLORS.darkBg : COLORS.lightBg,
    margin: 32,
    padding: 0,
    minHeight: 'calc(100vh - 136px)',
  };

  // کارت با Shadow و Radius بیشتر
  const cardStyle = {
    background: isDark ? COLORS.darkCard : COLORS.lightCard,
    padding: 28,
    borderRadius: 16,
    minHeight: '100%',
    boxShadow: isDark 
      ? '0 10px 30px rgba(0,0,0,.22)' 
      : '0 10px 30px rgba(0,0,0,.08)',
    border: `1px solid ${isDark ? COLORS.darkBorder : COLORS.lightBorder}`,
  };

  const drawerStyle = {
    body: { 
      padding: 0, 
      background: isDark 
        ? 'linear-gradient(180deg, #111827 0%, #0F172A 100%)' 
        : COLORS.lightSider,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    header: {
      background: isDark 
        ? 'rgba(17,24,39,.8)' 
        : COLORS.lightSider,
      borderBottom: isDark ? `1px solid ${COLORS.darkBorder}` : '1px solid rgba(255,255,255,0.1)',
      padding: '16px 20px',
    },
  };

  return (
    <ConfigProvider theme={currentTheme}>
      {/* اضافه کردن استایل‌های سفارشی */}
      <style>{`
        /* منوی سفارشی با Hover و Active */
        .custom-menu .ant-menu-item {
          transition: all .25s ease !important;
          margin: 4px 12px !important;
          border-radius: 12px !important;
        }
        
        .custom-menu .ant-menu-item:hover {
          transform: translateX(${dir === 'rtl' ? '4px' : '-4px'}) !important;
          background: rgba(79,142,247,.08) !important;
        }
        
        .custom-menu .ant-menu-item-selected {
          background: linear-gradient(90deg, rgba(79,142,247,.22), rgba(79,142,247,.08)) !important;
          border-right: 4px solid ${COLORS.primary} !important;
        }
        
        .custom-menu .ant-menu-item-selected::after {
          display: none !important;
        }

        /* دکمه‌های هدر */
        .header-btn:hover {
          background: rgba(79,142,247,.12) !important;
          transform: scale(1.05);
        }

        /* اسکرول سایدبار */
        .ant-layout-sider::-webkit-scrollbar {
          width: 4px;
        }
        .ant-layout-sider::-webkit-scrollbar-track {
          background: transparent;
        }
        .ant-layout-sider::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .ant-layout-sider::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>

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
                  borderRadius: 12,
                  color: isDark ? '#E8EDF5' : '#1A2234',
                  transition: 'all .25s ease',
                }}
                className="header-btn"
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