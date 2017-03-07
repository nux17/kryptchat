from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto import Random
import hashlib, base64, hmac
import json

BS = 16
pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS)
unpad = lambda s : s[0:-ord(s[-1])]
pw = 'nljq}:b;4IqOHt.hnljq};b,azerty31'



def encode(message):
    pkey = open('public.pem').read()
    key = RSA.importKey(pkey)

    message = pad(message)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(pw, AES.MODE_CBC, iv)
    aes_crypted = iv + cipher.encrypt(message)

    signature = hmac.new(
        pw,
        aes_crypted,
        hashlib.sha256
    ).hexdigest()

    payload = PKCS1_OAEP.new(key).encrypt(pw + signature)

    ret = {
        'aes': base64.b64encode(aes_crypted),
        'hmac': base64.b64encode(signature),
        'rsa': base64.b64encode(payload)
    }
    return ret


def decode(json, key):
    key = RSA.importKey(open(key).read())
    decoded = PKCS1_OAEP.new(key).decrypt(base64.b64decode(json['rsa']))
    secret = decoded[:32]
    hmac_tag = decoded[32:]
    enc = base64.b64decode(json['aes'])
    signature = hmac.new(
        secret,
        enc,
        hashlib.sha256
    ).hexdigest()
    if hmac_tag != signature:
        print 'Can\'t verify message authentiticty'
        exit(1)
    iv = enc[:16]
    enc = enc[16:]
    cipher = AES.new(secret, AES.MODE_CBC, iv)
    message = unpad(cipher.decrypt(enc))
    print message
    return message

if __name__ == '__main__':
    json = encode('H3ll0 W0RlD')
    decode(json, 'private.pem')