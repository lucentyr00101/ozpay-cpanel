import React, { useEffect } from 'react';
import { useState } from 'react';
import { ModalForm, ProFormGroup } from '@ant-design/pro-form';
import Tree from 'antd/lib/tree';
import { getLocale, useIntl } from 'umi';
interface CollectionCreateFormProps {
  visible: boolean;
  permissionData: any;
  existingKeys: any;
  onHandleCheckedPermissions: (checkedKeys: any, halfCheckedKeys: any) => void;
  onCancel: () => void;
}

const SetPermission: React.FC<CollectionCreateFormProps> = ({
  existingKeys,
  permissionData,
  visible,
  onHandleCheckedPermissions,
  onCancel,
}) => {
  const t = useIntl();
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState([]);
  // const [permissionCheckedKey, setPermissionCheckedKey] = useState<any>([]);
  const [isClickCheckedKeyValue, setIsClickCheckedKeyValue] = useState(false);
  const selectedLang = getLocale();

  const mapPermissionData = (menuDatas: any) => {
    return menuDatas.map((menuData: any)=>{
      const menuName = JSON.parse(menuData.name);
      return {
        ...menuData,
        name: menuName[selectedLang],
        children: menuData.children ? mapPermissionData(menuData.children) : undefined,
      }
    })
  }

 const filterPermissionData= mapPermissionData(permissionData);

  useEffect(() => {
    if (visible && !isClickCheckedKeyValue) {
      setCheckedKeys(existingKeys);
    }

    if (!visible) {
      setIsClickCheckedKeyValue(false);
      setCheckedKeys([]);
    }
  }, [existingKeys, isClickCheckedKeyValue, visible]);

  return (
    <ModalForm
      width={600}
      modalProps={{
        onCancel: () => onCancel(),
      }}
      title={t.formatMessage({ id: 'modal.setPermission' })}
      visible={visible}
      onFinish={() => onHandleCheckedPermissions(checkedKeys, halfCheckedKeys)}
      submitter={{
        searchConfig: {
          submitText: t.formatMessage({ id: 'modal.confirm' }),
          resetText: t.formatMessage({ id: 'modal.cancel' }),
        },
      }}
    >
      <ProFormGroup>
        <div>{t.formatMessage({ id: 'modal.confirm' })}</div>
        <Tree
          checkedKeys={[...checkedKeys]}
          checkable
          onCheck={(_checkedKeys: any, { halfCheckedKeys }: any) => {
            // const allCheckedKey = [..._checkedKeys, ...halfCheckedKeys];
            // console.log("check",_checkedKeys);
            // console.log("half",halfCheckedKeys);
            // setPermissionCheckedKey(allCheckedKey)
            setHalfCheckedKeys(halfCheckedKeys);
            setCheckedKeys(_checkedKeys);
            setIsClickCheckedKeyValue(true);
          }}
          treeData={filterPermissionData}
          fieldNames={{ title: 'name', key: 'id', children: 'children' }}
        />
      </ProFormGroup>
    </ModalForm>
  );
};

export default SetPermission;
