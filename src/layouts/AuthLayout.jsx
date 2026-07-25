import { Outlet } from 'react-router-dom';
import { Dropdown, Space, Typography, Switch, theme as antdTheme } from 'antd';
import { GlobalOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useLocale } from '../context/LocaleContext';
import { useThemeMode } from '../context/ThemeModeContext';

export default function AuthLayout() {
  const { lang, setLang } = useLocale();
  const { mode, toggleMode } = useThemeMode();
  const { token } = antdTheme.useToken();

  const langMenu = {
    items: [
      { key: 'fa', label: 'فارسی' },
      { key: 'en', label: 'English' },
    ],
    onClick: ({ key }) => setLang(key),
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: token.colorBgLayout,
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 16, insetInlineEnd: 16 }}>
        <Space size="middle">
          <Switch
            checked={mode === 'dark'}
            onChange={toggleMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
          <Dropdown menu={langMenu} placement="bottomEnd">
            <Space style={{ cursor: 'pointer' }}>
              <GlobalOutlined />
              <Typography.Text>{lang === 'fa' ? 'فارسی' : 'English'}</Typography.Text>
            </Space>
          </Dropdown>
        </Space>
      </div>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <Outlet />
      </div>
    </div>
  );
}
