"use client";

import { Button, Checkbox, Dropdown, message } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

export default function MasterDataToolbar({
  columns = [],
  visibleColumns = [],
  onChangeVisibleColumns,
  onAddNew,
  onRefresh,
}) {
  const columnItems = [
    {
      key: "column-display",
      label: (
        <div className="min-w-[220px] p-1">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Column Display
          </p>

          <Checkbox.Group
            value={visibleColumns}
            onChange={(checkedValues) => {
              if (checkedValues.length === 0) {
                message.warning("At least one column must remain visible");
                return;
              }
              onChangeVisibleColumns?.(checkedValues);
            }}
            className="flex flex-col gap-2"
          >
            {columns.map((col) => (
              <Checkbox key={col.key} value={col.key}>
                {col.title}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew}>
        Add New
      </Button>

      <Button icon={<ReloadOutlined />} onClick={onRefresh} />

      <Dropdown
        menu={{ items: columnItems }}
        trigger={["click"]}
        placement="bottomLeft"
      >
        <Button icon={<SettingOutlined />} />
      </Dropdown>
    </div>
  );
}
