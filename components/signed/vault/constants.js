const SORT = [
    {
        title: 'sort.balance',
        image: require('../../../assets/sort_by_balance.png'),
    },
    {
        title: 'sort.transaction',
        image: require('../../../assets/sort_by_transactions.png'),
    },
];

const FILTER = [
    {
        title: 'filter.all',
        image: require('../../../assets/account_all_symbol.png'),
    },
    {
        title: 'filter.masterKey',
        image: require('../../../assets/account_mk_symbol.png'),
    },
    {
        title: 'filter.privateKey',
        image: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'filter.ledger',
        image: require('../../../assets/account_le_symbol.png'),
    },
];

const MENU = [
    {
        title: 'wallet.menu_master_key',
        image: require('../../../assets/account_mk_symbol.png'),
    },
    {
        title: 'wallet.menu_private_key',
        image: require('../../../assets/account_pk_symbol.png'),
    },
    {
        title: 'wallet.menu_ledger',
        image: require('../../../assets/account_le_symbol.png'),
    },
];

module.exports={
    SORT: SORT,
    FILTER: FILTER,
    MENU: MENU,
};