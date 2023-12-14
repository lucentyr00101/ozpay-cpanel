export type MerchantCryptoPaymentItem = {
    key: number;
    name: string;
    networkName: string;
    exchangeRate: number;
    operatingHours: string[];
    repeatDays: string[];
    status: string;
}


export type MemberCryptoPaymentItem = {
    key: number;
    logo: string;
    cryptoName: string;
    networkChain: string;
    exchangeRate: number;
    operatingHours: string[];
    repeat: {
        name: string;
        color: string;
        background: string;
        borderColor: string;
    }[];
    status: string;
}

export type Pagination = {
total: number;
pageSize: number;
current: number;
};