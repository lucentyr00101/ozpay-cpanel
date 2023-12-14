/* eslint-disable no-param-reassign */
import { getDictionaryByCode } from '../service';

import { STATUS_COLOR, STATUS, LOCALE } from '@/components/enums/dictionary/dictionary.enum';

export async function fetchStatusByDictionaryCode(code: string, selectedLang: string) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = {};
  if (data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .reduce((prev: any, curr: any) => {
        if (curr.status === STATUS.ENABLE) {
          prev[curr.value] = {
            text: selectedLang === LOCALE.EN ? curr.value : curr.chineseValue,
            color: STATUS_COLOR[curr.value] || '#fff',
          };
        }
        return prev;
      }, {});
  }

  return statusEnum;
}

export async function fetchMerchantMemberStatusByDictionaryCode(
  code: string,
  selectedLang: string,
) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = {};
  if (data && data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .reduce((prev: any, curr: any) => {
        let name = curr.value;

        if (curr.status === STATUS.ENABLE) {
          if (curr.value === 'Enabled') {
            name = STATUS.ENABLE;
          }
          if (curr.value === 'Disabled') {
            name = STATUS.DISABLE;
          }

          prev[name] = {
            text: selectedLang === LOCALE.EN ? curr.value : curr.chineseValue,
            status: curr.status,
            value: name,
          };
        }
        return prev;
      }, {});
  }

  return statusEnum;
}

export async function fetchPrivateMessageStatusByDictionaryCode(
  code: string,
  selectedLang: string,
) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = {};
  if (data && data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .reduce((prev: any, curr: any) => {
        let name = curr.value;

        if (curr.status === STATUS.ENABLE) {
          if (curr.value === 'Enabled') {
            name = STATUS.ENABLE;
          }
          if (curr.value === 'Disabled') {
            name = STATUS.DISABLE;
          }

          prev[name] = {
            text: selectedLang === LOCALE.EN ? curr.value : curr.chineseValue,
            status: curr.status,
          };
        }
        return prev;
      }, {});
  }

  return statusEnum;
}

export async function fetchUserTypeByDictionaryCode(code: string, selectedLang: string) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = {};
  if (data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .reduce((prev: any, curr: any) => {
        if (curr.status === STATUS.ENABLE) {
          prev[curr.value] = selectedLang === LOCALE.EN ? curr.value : curr.chineseValue;
        }
        return prev;
      }, {});
  }

  return statusEnum;
}

export async function fetchTransactionTypeByDictionaryCode(code: string, selectedLang: string) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = {};
  if (data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .reduce((prev: any, curr: any) => {
        if (curr.status === STATUS.ENABLE) {
          prev[curr.value] = {
            text: selectedLang === LOCALE.EN ? curr.value : curr.chineseValue,
            value: curr.value,
          };
        }
        return prev;
      }, {});
  }

  return statusEnum;
}

export async function fetchAutoRefreshRateByDictionaryCode(code: string, selectedLang: string) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = [];
  if (data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .map((val) => {
        if (val.status === STATUS.ENABLE) {
          return {
            key: val.value,
            label: selectedLang === LOCALE.EN ? val.value : val.chineseValue,
          };
        }
      })
      .filter((filterData: any) => filterData !== undefined);
  }

  return statusEnum;
}

export async function fetchMerchantLevelByDictionaryCode(code: string, selectedLang: string) {
  const { data } = await getDictionaryByCode(code);
  let statusEnum = [];
  if (data.status === STATUS.ENABLE) {
    statusEnum = data.sysDictDataList
      .sort((a, b) => {
        return a.sort - b.sort;
      })
      .map((val) => {
        console.log(val);
        if (val.status === STATUS.ENABLE) {
          return {
            label: selectedLang === LOCALE.EN ? val.value : val.chineseValue,
            value: val.value,
          };
        }
      })
      .filter((filterData: any) => filterData !== undefined);
  }

  return statusEnum;
}

export async function fetchMemberPlatformLinkByDictionaryCode(code: string) {
  const { data } = await getDictionaryByCode(code);
  const memberPlatformLink = data.sysDictDataList
    .sort((a, b) => {
      return a.sort - b.sort;
    })
    .filter((val) => {
      return val.code === 'URL' ? val.value : '';
    });

  return memberPlatformLink[0].value;
}

export async function fetchAcceptedOrPaymentTimeLimitByDictionaryCode(code: string) {
  const { data } = await getDictionaryByCode(code);
  let max;

  if (data.status === STATUS.ENABLE) {
    const acceptedTimeLimitList = data.sysDictDataList
      .map((val: any) => {
        return { ...val, value: val.value.match(/(\d+)/)?.[0] };
      })
      .filter((filterVal: any) => {
        return filterVal.value !== undefined && filterVal.status === STATUS.ENABLE;
      });

    max = Math.ceil(
      acceptedTimeLimitList.reduce(
        (acc: number, shot: any) => (acc = acc > Number(shot.value) ? acc : shot.value),
        0,
      ),
    );
  }

  return max;
}
