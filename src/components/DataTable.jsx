import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, Input, Alert, Button, Space } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

/**
 * Generic server-driven table.
 *
 * Never loads the full record set: every page change, search, or sort
 * triggers a fresh call to `fetchPage`, and only that page's rows are
 * held in memory. This is deliberate — it's the pattern the whole
 * project follows for any list that could grow large.
 *
 * Props:
 *  - fetchPage({ page, pageSize, search, sortField, sortOrder }) => Promise<{ items, total }>
 *  - columns: antd column definitions (add `sorter: true` to make a column sortable).
 *    Columns are center-aligned by default; pass `align` on a column to override.
 *  - rowKey: string | function
 *  - searchPlaceholder: string (optional override)
 *  - extra: React node rendered next to the search box (e.g. an "add new" button)
 *  - reloadKey: change this value to force a refetch of the current page
 *  - onRow: standard antd Table onRow(record) handler, e.g. for row click navigation
 */
export default function DataTable({ fetchPage, columns, rowKey = 'id', searchPlaceholder, extra, reloadKey, onRow }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState(undefined);
  const [sortOrder, setSortOrder] = useState(undefined);

  const requestIdRef = useRef(0);

  const alignedColumns = useMemo(
    () => columns.map((col) => ({ align: 'center', ...col })),
    [columns]
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPage({ page, pageSize, search, sortField, sortOrder });
      if (requestId !== requestIdRef.current) return; // a newer request superseded this one
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || 'ERROR');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, sortField, sortOrder, reloadKey]);

  useEffect(() => {
    load();
  }, [load]);

  function handleTableChange(pagination, _filters, sorter) {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
  }

  function handleSearch(value) {
    setPage(1);
    setSearch(value);
  }

  return (
    <div>
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
        wrap
        size={[12, 12]}
      >
        <Input.Search
          allowClear
          placeholder={searchPlaceholder || t('table.search')}
          prefix={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => {
            if (e.target.value === '') handleSearch('');
          }}
          style={{ flex: '1 1 320px', minWidth: 260, maxWidth: 480 }}
        />
        <Space wrap>
          {extra}
          <Button icon={<ReloadOutlined />} onClick={load} />
        </Space>
      </Space>

      {error ? (
        <Alert
          type="error"
          message={t('table.error')}
          action={
            <Button size="small" danger onClick={load}>
              {t('table.retry')}
            </Button>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Table
        rowKey={rowKey}
        columns={alignedColumns}
        dataSource={items}
        loading={loading}
        onChange={handleTableChange}
        onRow={onRow}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: loading ? t('table.loading') : t('table.empty') }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          responsive: true,
          showTotal: (t_) => t('table.totalItems', { total: t_ }),
        }}
      />
    </div>
  );
}
