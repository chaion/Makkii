import { CameraRoll, Dimensions, Platform, StatusBar } from 'react-native';
import blake2b from 'blake2b';
import wallet from 'react-native-aion-hw-wallet';
import * as RNFS from 'react-native-fs';
import BigNumber from 'bignumber.js';
import { encode } from 'bip21';
import { strings } from '../locales/i18n';
import { navigate, popCustom } from './dva';
import { COINS } from '../client/support_coin_list';
import { hexutil} from 'lib-common-util-js';

const tripledes = require('crypto-js/tripledes');
const CryptoJS = require('crypto-js');

function accountKey(symbol, address, tokenSymbol) {
    if (tokenSymbol) {
        return `${symbol}+${address}+${tokenSymbol}`;
    }
    return `${symbol}+${address}`;
}

function encrypt(plain, seed) {
    return tripledes.encrypt(plain, seed).toString();
}

function decrypt(encrypted, seed) {
    return tripledes.decrypt(encrypted, seed).toString(CryptoJS.enc.Utf8);
}

function validatePassword(password) {
    const reg = /^[A-Za-z0-9!?#]{8,16}$/;
    return reg.test(password);
}

function validatePrivateKey(privateKey, symbol = 'AION') {
    if (symbol === 'AION') {
        privateKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
        const reg = /^[0-9a-fA-F]{128}$/;
        return reg.test(privateKey);
    }
    if (symbol === 'BTC') {
        // TODO:
    } else if (symbol === 'EOS') {
        // TODO:
    } else if (symbol === 'LTC') {
        // TODO:
    } else if (symbol === 'TRX') {
        // TODO:
    }
    return true;
}

function validateAdvancedAmount(amount) {
    // support match 1.
    const reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]*)?))$/;
    return reg.test(amount);
}

function hashPassword(password) {
    return blake2b(32)
        .update(Buffer.from(password, 'utf8'))
        .digest('hex');
}

function getLedgerMessage(errorCode) {
    if (errorCode === wallet.APP_INACTIVATED) {
        return strings('ledger.error_application_inactive');
    }
    if (errorCode === wallet.INVALID_DEVICE_NUMBER) {
        return strings('ledger.error_device_count');
    }
    if (errorCode === wallet.USER_REJECTED) {
        return strings('ledger.error_user_rejected');
    }
    if (errorCode === wallet.NO_PERMISSION) {
        return strings('ledger.error_permission_denied');
    }
    if (errorCode === wallet.GENERAL_ERROR || errorCode === wallet.INVALID_ACCOUNT_TYPE || errorCode === wallet.INVALID_TX_PAYLOAD || errorCode === wallet.OPEN_DEVICE_FAIL) {
        return strings('ledger.error_general');
    }
    if (errorCode === 'error.wrong_device') {
        return strings('ledger.error_wrong_device');
    }
    return strings('ledger.error_general');
}

function generateQRCode(amount, address, coin = 'AION') {
    return encode(address, { amount }, COINS[coin].name.toLowerCase());
}

function saveImage(base64, imageFileName) {
    const storeLocation = Platform.OS === 'ios' ? `${RNFS.DocumentDirectoryPath}` : `${RNFS.PicturesDirectoryPath}`;
    const filePath = `${storeLocation}/${imageFileName}`;
    return new Promise((resolve, reject) => {
        RNFS.writeFile(filePath, base64, 'base64').then(
            () => {
                const filePath_ = Platform.OS === 'ios' ? filePath : `file://${filePath}`;
                CameraRoll.saveToCameraRoll(filePath_)
                    .then(result => {
                        deleteFile(filePath);
                        resolve(result);
                    })
                    .catch(error => {
                        deleteFile(filePath);
                        console.log(`save image fail: ${error}`);
                        reject(error);
                    });
            },
            error => {
                console.log('save image failed: ', error);
                reject(error);
            },
        );
    });
}

function deleteFile(filePath) {
    RNFS.unlink(filePath)
        .then(() => {
            console.log(`delete ${filePath} succeed`);
        })
        .catch(err => {
            console.log(`delete ${filePath} failed: ${err}`);
        });
}

function isIphoneX() {
    const dimen = Dimensions.get('window');
    return Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (dimen.height === 812 || dimen.width === 812 || (dimen.height === 896 || dimen.width === 896));
}

function ifIphoneX(iphoneXStyle, regularStyle) {
    if (isIphoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight,
    });
}

function strLen(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        // 单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
}

const navigationSafely = (pinCodeEnabled, hashedPassword, { routeName, params, onVerifySuccess = undefined }) => ({ dispatch }) => {
    pinCodeEnabled ||
        popCustom.show(
            strings('alert_title_warning'),
            strings('warning_dangerous_operation'),
            [
                {
                    text: strings('cancel_button'),
                    onPress: () => {
                        popCustom.hide();
                    },
                },
                {
                    text: strings('alert_ok_button'),
                    onPress: text => {
                        const _hashedPassword = hashPassword(text);
                        if (_hashedPassword === hashedPassword) {
                            popCustom.hide();
                            onVerifySuccess && onVerifySuccess();
                            onVerifySuccess || navigate(routeName, params)({ dispatch });
                        } else {
                            popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'));
                        }
                    },
                },
            ],
            {
                cancelable: false,
                type: 'input',
                canHide: false,
            },
        );
    pinCodeEnabled &&
        navigate('unlock', {
            targetScreen: routeName,
            targetScreenArgs: params,
            onUnlockSuccess: onVerifySuccess,
        })({ dispatch });
};

function range(start, end, step) {
    const arr = [];
    for (let i = start; i < end; i++) {
        if (i % step === 0) {
            arr.push(i);
        }
    }
    return arr;
}

function toHex(value) {
    if (!value) {
        return '0x00';
    }
    if (typeof value === 'string') {
        return hexutil.appendHexStart(value);
    }
    if (value instanceof Buffer) {
        return hexutil.appendHexStart(value.toString('hex'));
    }
    if (typeof value === 'number') {
        return hexutil.appendHexStart(value.toString(16));
    }
    if (value instanceof Uint8Array) {
        return hexutil.appendHexStart(Buffer.from(value).toString('hex'));
    }
    if (BigNumber.isBigNumber(value)) {
        return hexutil.appendHexStart(value.toString(16));
    }
    throw value;
}

const isJsonString = data => {
    try {
        if (typeof JSON.parse(data) === 'object') {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
};

module.exports = {
    encrypt,
    decrypt,
    validatePassword,
    hashPassword,
    getLedgerMessage,
    validatePrivateKey,
    generateQRCode,
    validateAdvancedAmount,
    saveImage,
    getStatusBarHeight,
    strLen,
    navigationSafely,
    range,
    accountKey,
    toHex,
    isJsonString,
};
