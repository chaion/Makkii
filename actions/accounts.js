export const ACCOUNTS = 'ACCOUNTS';
export const ADD_ACCOUNTS = 'ADD_ACCOUNTS';
export const UPDATE_ACCOUNT_NAME = 'UPDATE_ACCOUNT_NAME';
export function accounts(accounts){
	return {
		type: ACCOUNTS,
		accounts
	};
}

export function add_accounts(accounts){
	return {
		type: ADD_ACCOUNTS,
		accounts
	}
}

export function update_account_name(key, newName){
	return {
		type: UPDATE_ACCOUNT_NAME,
		key,
		newName
	}
}