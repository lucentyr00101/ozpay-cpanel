import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import {
  Button,
  Divider,
  Switch,
  Space,
  Modal,
  Result,
  notification,
  Popconfirm,
  message,
} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type { DictionaryItem, Pagination, DictionaryValuesItem, DictionaryType } from './data';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import {
  addDictionaryData,
  addDictionaryType,
  deleteDictionaryType,
  deleteDictData,
  fetchDictionaryList,
  updateDictionaryData,
  updateDictionaryType,
  getDictionaryValues,
} from './service';
import type { Values } from '@/components/Dictionary/DictionaryForm';
import DictionaryForm from '@/components/Dictionary/DictionaryForm';
import type { DictionaryDataForm } from '@/components/Dictionary/ValuesForm';
import ValuesForm from '@/components/Dictionary/ValuesForm';
import { Access, getLocale, useAccess, useIntl } from 'umi';
import Cookies from 'universal-cookie';
import { maxLength, filterCookieMap, setFilters } from '@/global';
import type { ProFormInstance } from '@ant-design/pro-form';

const Dictionary: FC = () => {
  const t = useIntl();
  const cookies = new Cookies();
  const access: any = useAccess();
  const selectedLang = getLocale();
  const tableRef = useRef<ActionType>();
  const valuesTableRef = useRef<ActionType>();
  const filterRef = useRef<ProFormInstance>();

  const [selecteDictionaryType, setSelectedDictionaryType] = useState({} as DictionaryType);
  const [showValues, setShowValues] = useState(false);
  const [pageAccess, setPageAccess] = useState<boolean>(false);
  const [showDictionForm, setShowDictionaryForm] = useState(false);
  const [showValuesForm, setShowValuesForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false);
  const [selectedDictionaryData, setSelectedDictionaryData] = useState({} as DictionaryDataForm);
  // const [isEnglish, setIsEnglish] = useState(true);

  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 20,
    showTotal: (total: number) =>
      `${t.formatMessage({ id: 'table.pagination.total' })} ${total} ${
        total > 1
          ? `${t.formatMessage({ id: 'table.pagination.items' })}`
          : `${t.formatMessage({ id: 'table.pagination.item' })}`
      }`,
  };

  // useEffect(() => {
  //   setIsEnglish(window.localStorage.getItem('umi_locale') !== 'zh-CN');
  //   window.addEventListener('languagechange', () => {
  //     setIsEnglish(window.localStorage.getItem('umi_locale') !== 'zh-CN');
  //   });
  // }, []);

  const showNotification = (notifMsg: string) => {
    notification.success({
      message: notifMsg,
      duration: 2,
    });
  };

  const handleFetchDictList = async (values: any) => {
    const { name, code, pageSize: size, current: page, chineseName } = values;
    const filter: any = {
      size,
      page: page - 1,
      name,
      code,
      chineseName,
    };

    const data = await fetchDictionaryList(filter);
    return data;
  };

  const handleCreateDictionary = async (values: Values, _isEditing: boolean) => {
    const dictionaryValue = await handleFetchDictList({ current: 1, pageSize: 1 });
    const status = dictionaryValue.data[0].status;

    try {
      if (_isEditing) {
        await updateDictionaryType({
          ...values,
          id: selecteDictionaryType.id,
          status: status || 'Enable',
        });
      } else {
        await addDictionaryType({
          ...values,
          status: 'Enable',
        });
      }
      setShowDictionaryForm(false);
      if (_isEditing) {
        message.success(t.formatMessage({ id: 'messages.editDic' }));
      } else {
        message.success(t.formatMessage({ id: 'messages.addDic' }));
      }

      tableRef.current?.reloadAndRest?.();
    } catch (e: any) {
      if (e?.data?.code == 2016003) {
        message.error(t.formatMessage({ id: 'messages.sortExist' }));
      } else {
        message.error(e?.data?.message || 'Something went wrong.');
      }
    }
  };

  const fetchDictionaryValues = async (values: any) => {
    const { value, code, pageSize: size, current: page, chineseValue } = values;
    const filter: any = {
      sysDictTypeId: selecteDictionaryType.id,
      size,
      page: page - 1,
      value,
      chineseValue,
      code,
    };

    const data = await getDictionaryValues(filter);

    return data;
  };

  const handleCreateDictionaryData = async (
    values: DictionaryDataForm,
    _isEditingData: boolean,
  ) => {
    try {
      let data = { success: false };
      if (_isEditingData) {
        const dictionaryValue = await fetchDictionaryValues({ current: 1, pageSize: 1 });
        const status = dictionaryValue.data[0].status;

        data = await updateDictionaryData({
          ...values,
          id: selectedDictionaryData.id,
          sysDictTypeId: selecteDictionaryType.id,
          status: status || 'Enable',
        });
      } else {
        data = await addDictionaryData({
          ...values,
          sysDictTypeId: selecteDictionaryType.id,
          status: 'Enable',
        });
      }

      if (data.success) {
        setShowValuesForm(false);
        if (_isEditingData) {
          message.success(t.formatMessage({ id: 'messages.editDic' }));
        } else {
          message.success(t.formatMessage({ id: 'messages.setAddDic' }));
        }
        valuesTableRef?.current?.reloadAndRest?.();
        tableRef?.current?.reloadAndRest?.();
      }
    } catch (error: any) {
      if (error?.data?.code == 2015004) {
        message.error(t.formatMessage({ id: 'messages.sortExist' }));
      } else {
        message.error(error?.data?.message || 'Something went wrong.');
      }
    }
  };

  const handleUpdateDictionaryStatus = async (values: Values, checked: boolean) => {
    const data = await updateDictionaryType({
      ...values,
      status: checked ? 'Enable' : 'Disable',
    });

    if (data.success) {
      setShowDictionaryForm(false);
      showNotification(t.formatMessage({ id: 'messages.editDic' }));
      // tableRef.current?.reloadAndRest();
    }
  };

  const handleUpdateDictionaryDataStatus = async (values: Values, checked: boolean) => {
    const data = await updateDictionaryData({
      value: values.value,
      chineseValue: values.chineseValue,
      code: values.code,
      id: values.id,
      remark: values.remark,
      sort: values.sort,
      sysDictTypeId: values.sysDictType.id,
      status: checked ? 'Enable' : 'Disable',
    });

    if (data.success) {
      showNotification(t.formatMessage({ id: 'messages.editDic' }));
      // tableRef.current?.reloadAndRest();
    }
  };

  const handleDeleteDictData = async (_dictionary: DictionaryValuesItem) => {
    const data = await deleteDictData({
      id: _dictionary.id,
    } as any);

    if (data.success) {
      message.success(t.formatMessage({ id: 'messages.setDeleteDic' }));
      valuesTableRef?.current?.reloadAndRest?.();
    }
  };

  const handleDeleteDictionary = async (_dictionary: DictionaryType) => {
    const data = await deleteDictionaryType({
      id: _dictionary.id,
    } as any);

    if (data.success) {
      message.success(t.formatMessage({ id: 'messages.deleteDic' }));
      tableRef.current?.reloadAndRest?.();
    }
  };

  const columns: ProColumns<DictionaryItem>[] = [
    {
      title: t.formatMessage({ id: 'table.typeName' }),
      dataIndex: selectedLang === 'en-US' ? 'name' : 'chineseName',
      ellipsis: true,
      order: 4,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'table.code' }),
      dataIndex: 'code',
      order: 3,
    },
    {
      title: t.formatMessage({ id: 'table.sort' }),
      dataIndex: 'sort',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.status' }),
      dataIndex: 'status',
      search: false,
      render: (_, value) => {
        return (
          <Access
            accessible={access?.SystemSettings.Dictionary.UpdateStatus}
            fallback={
              <Switch
                disabled
                checkedChildren="&#10003;"
                unCheckedChildren="&#x2715;"
                defaultChecked={value.status === 'Enable'}
                onChange={(checked) => {
                  handleUpdateDictionaryStatus(value, checked);
                }}
              />
            }
          >
            <Switch
              checkedChildren="&#10003;"
              unCheckedChildren="&#x2715;"
              defaultChecked={value.status === 'Enable'}
              onChange={(checked) => {
                handleUpdateDictionaryStatus(value, checked);
              }}
            />
          </Access>
        );
      },
    },
    {
      title: t.formatMessage({ id: 'table.remarks' }),
      dataIndex: 'remark',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'table.action' }),
      dataIndex: 'action',
      valueType: 'option',
      order: 6,
      search: false,
      render: (_: any, value: DictionaryType) => (
        <Space split={<Divider type="vertical" />}>
          <Access
            accessible={access?.SystemSettings.Dictionary.SetValues}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setShowValues(true);
                  setSelectedDictionaryType(value);
                }}
              >
                {t.formatMessage({ id: 'modal.setvalue' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setShowValues(true);
                setSelectedDictionaryType(value);
              }}
            >
              {t.formatMessage({ id: 'modal.setvalue' })}
            </a>
          </Access>
          <Access
            accessible={access?.SystemSettings.Dictionary.Edit}
            fallback={
              <a
                style={{ pointerEvents: 'none', color: '#ddd' }}
                onClick={() => {
                  setIsEditing(true);
                  setShowDictionaryForm(true);
                  setSelectedDictionaryType(value);
                }}
              >
                {t.formatMessage({ id: 'modal.edit' })}
              </a>
            }
          >
            <a
              onClick={() => {
                setIsEditing(true);
                setShowDictionaryForm(true);
                setSelectedDictionaryType(value);
              }}
            >
              {t.formatMessage({ id: 'modal.edit' })}
            </a>
          </Access>
          <Access
            accessible={access?.SystemSettings.Dictionary.Delete}
            fallback={
              <Popconfirm
                placement="topRight"
                title={t.formatMessage({ id: 'modal.deletemsg' })}
                okText={t.formatMessage({ id: 'modal.yes' })}
                onConfirm={() => handleDeleteDictionary(value)}
                cancelText={t.formatMessage({ id: 'modal.no' })}
              >
                <a style={{ pointerEvents: 'none', color: '#ddd' }}>
                  {t.formatMessage({ id: 'modal.delete' })}
                </a>
              </Popconfirm>
            }
          >
            <Popconfirm
              placement="topRight"
              title={t.formatMessage({ id: 'modal.deletemsg' })}
              okText={t.formatMessage({ id: 'modal.yes' })}
              onConfirm={() => handleDeleteDictionary(value)}
              cancelText={t.formatMessage({ id: 'modal.no' })}
            >
              <a>{t.formatMessage({ id: 'modal.delete' })}</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const valuesColumns: ProColumns<DictionaryValuesItem>[] = [
    {
      title: t.formatMessage({ id: 'table.dictionaryValue' }),
      dataIndex: selectedLang === 'en-US' ? 'value' : 'chineseValue',
      ellipsis: true,
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'modal.code' }),
      dataIndex: 'code',
      fieldProps: {
        maxLength: maxLength.NAME,
      },
    },
    {
      title: t.formatMessage({ id: 'modal.sort' }),
      dataIndex: 'sort',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'modal.remarks' }),
      dataIndex: 'remark',
      search: false,
    },
    {
      title: t.formatMessage({ id: 'modal.status' }),
      dataIndex: 'status',
      search: false,
      render: (_, value) => {
        return (
          <Switch
            checkedChildren="&#10003;"
            unCheckedChildren="&#x2715;"
            defaultChecked={value.status === 'Enable'}
            onChange={(checked) => {
              handleUpdateDictionaryDataStatus(value, checked);
            }}
          />
        );
      },
    },
    {
      title: t.formatMessage({ id: 'modal.action' }),
      dataIndex: 'action',
      valueType: 'option',
      search: false,
      render: (_, value) => (
        <Space split={<Divider type="vertical" />}>
          <a
            onClick={() => {
              setIsEditingData(true);
              setSelectedDictionaryData(value as any);
              setShowValuesForm(true);
            }}
          >
            {t.formatMessage({ id: 'modal.edit' })}
          </a>
          <Access
            accessible={access?.SystemSettings.Dictionary.Delete}
            fallback={
              <Popconfirm
                placement="topRight"
                title={t.formatMessage({ id: 'modal.deletemsg' })}
                okText={t.formatMessage({ id: 'modal.yes' })}
                onConfirm={() => handleDeleteDictData(value)}
                cancelText={t.formatMessage({ id: 'modal.no' })}
              >
                <a style={{ pointerEvents: 'none', color: '#ddd' }}>
                  {t.formatMessage({ id: 'modal.delete' })}
                </a>
              </Popconfirm>
            }
          >
            <Popconfirm
              placement="topRight"
              title={t.formatMessage({ id: 'modal.deletemsg' })}
              okText={t.formatMessage({ id: 'modal.yes' })}
              onConfirm={() => handleDeleteDictData(value)}
              cancelText={t.formatMessage({ id: 'modal.no' })}
            >
              <a>{t.formatMessage({ id: 'modal.delete' })}</a>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];
  //   <Alert
  //   message="Info Text"
  //   description="Info Description Info Description Info Description Info Description"
  //   type="info"
  //   action={
  //     <Space direction="vertical">
  //       <Button size="small" type="primary">
  //         Accept
  //       </Button>
  //       <Button size="small" danger type="ghost">
  //         Decline
  //       </Button>
  //     </Space>
  //   }
  //   closable
  // />

  const handleValuesFormCancel = () => {
    setIsEditingData(false);
    setShowValuesForm(false);
  };

  const handleDictionaryFormCancel = () => {
    setIsEditing(false);
    setShowDictionaryForm(false);
  };

  useEffect(() => {
    const currMenuAccess = access?.SystemSettings.Dictionary;
    const dictionary = Object.keys(currMenuAccess).filter((key) => {
      return currMenuAccess[key] === true;
    });
    setPageAccess(dictionary.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterRef) {
      setFilters('settings-dictionary', filterRef);
    }
  }, [filterRef]);

  return (
    <Access
      accessible={pageAccess}
      fallback={
        <Result
          status="404"
          style={{
            height: '100%',
            background: '#fff',
          }}
          title={t.formatMessage({ id: 'messages.sorry' })}
          subTitle={t.formatMessage({ id: 'messages.notAuthorizedAccess' })}
        />
      }
    >
      <PageContainer title={false}>
        <ProTable<DictionaryItem, Pagination>
          // headerTitle="查询表格"
          actionRef={tableRef}
          rowKey="key"
          cardBordered={true}
          pagination={paginationProps}
          request={handleFetchDictList}
          columns={access?.SystemSettings.Dictionary.List ? columns : []}
          formRef={filterRef}
          onSubmit={(v: any) =>
            cookies.set(filterCookieMap['settings-dictionary'], v, { path: '/' })
          }
          onReset={() => cookies.remove(filterCookieMap['settings-dictionary'], { path: '/' })}
          options={false}
          toolBarRender={() => [
            <Access key="add" accessible={access?.SystemSettings.Dictionary.Add}>
              <Button type="primary" key="add" onClick={() => setShowDictionaryForm(true)}>
                {t.formatMessage({ id: 'modal.add' })}
              </Button>
            </Access>,
          ]}
        />

        <DictionaryForm
          isEditing={isEditing}
          dictionaryType={selecteDictionaryType}
          visible={showDictionForm}
          onCancel={() => handleDictionaryFormCancel()}
          onCreate={(values: Values, _isEditing: boolean) =>
            handleCreateDictionary(values, _isEditing)
          }
        />

        <ValuesForm
          isEditingData={isEditingData}
          dictionaryData={selectedDictionaryData}
          visible={showValuesForm}
          onCancel={() => handleValuesFormCancel()}
          onCreate={(values: DictionaryDataForm, _isEditing: boolean) => {
            handleCreateDictionaryData(values, _isEditing);
          }}
        />

        <Modal
          visible={showValues}
          width="800"
          title={t.formatMessage({ id: 'modal.setvalue' })}
          onCancel={() => setShowValues(false)}
          destroyOnClose
          footer={
            <Button type="primary" onClick={() => setShowValues(false)}>
              {t.formatMessage({ id: 'modal.close' })}
            </Button>
          }
        >
          {/* request={() => getDictionaryList(selecteDictionaryType.id as any)} */}
          <ProTable<DictionaryValuesItem, Pagination>
            rowKey="id"
            actionRef={valuesTableRef}
            cardBordered={true}
            pagination={paginationProps}
            columns={valuesColumns}
            options={false}
            request={fetchDictionaryValues}
            toolBarRender={() => [
              <Button
                key="add"
                onClick={() => {
                  setShowValuesForm(true);
                }}
              >
                {t.formatMessage({ id: 'modal.add' })}
              </Button>,
            ]}
          />
        </Modal>
      </PageContainer>
    </Access>
  );
};

export default Dictionary;
