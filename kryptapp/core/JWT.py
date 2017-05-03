from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
import hashlib, base64, hmac
import json
import base64
from io import StringIO

def unpad(data):
    return data.replace("=", "")

def pad(data):
    missing_padding = len(data) % 4
    if missing_padding != 0:
        data += b'='* (4 - missing_padding)
    return data

def getHeader(alg):
    return unpad(base64.urlsafe_b64encode(json.dumps({
        "alg": alg,
        "typ": "JWT"
    }, separators=(',', ':'))))

def jwtencode_none(payload):
    header = getHeader("none")
    payloadString = unpad(base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':'))))
    return header + "." + payloadString + "."

def jwtdecode_none(jwt):
    header, payload, signature = jwt.split(".")
    return json.loads(base64.urlsafe_b64decode(pad(payload)))

def jwtencode_hs256(payload, secret):
    header = getHeader("HS256")
    payloadString = unpad(base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':'))))
    signature = unpad(base64.urlsafe_b64encode(hmac.new(secret, header + "." + payloadString, digestmod=hashlib.sha256).digest()))
    return header + "." + payloadString + "." + signature

def jwtdecode_hs256(jwt, secret):
    header, payload, signature = jwt.split(".")

    decodedHeader = json.loads(base64.urlsafe_b64decode(pad(header)))
    if decodedHeader["alg"] != "HS256":
        raise Exception("Bad encryption algorithm.")
    if decodedHeader["typ"] != "JWT":
        raise Exception("Bad token type.")

    signature = pad(signature)
    if signature != base64.urlsafe_b64encode(hmac.new(secret, header + "." + payload, digestmod=hashlib.sha256).digest()):
        raise Exception("Signature doesn't match!")
    return json.loads(base64.urlsafe_b64decode(pad(payload)))

def jwtencode_rs256(payload, privateKey):
    header = getHeader("RS256")
    payloadString = unpad(base64.urlsafe_b64encode(json.dumps(payload, separators=(',', ':'))))

    key = RSA.importKey(open(privateKey).read())
    message = SHA256.new(header + "." + payloadString)
    signer = PKCS1_v1_5.new(key)
    signature = unpad(base64.urlsafe_b64encode(signer.sign(message)))

    return header + "." + payloadString + "." + signature

def jwtdecode_rs256(jwt, publicKey):
    header, payload, signature = jwt.split(".")

    decodedHeader = json.loads(base64.urlsafe_b64decode(pad(header)))
    if decodedHeader["alg"] != "RS256":
        raise Exception("Bad encryption algorithm.")
    if decodedHeader["typ"] != "JWT":
        raise Exception("Bad token type.")

    key = RSA.importKey(open(publicKey).read())
    verifier = PKCS1_v1_5.new(key)

    signature = base64.urlsafe_b64decode(pad(signature))
    message = SHA256.new(header + "." + payload)

    if not verifier.verify(message, signature):
        raise Exception("Signature doesn't match!")

    return json.loads(base64.urlsafe_b64decode(pad(payload)))

def jwtencode(payload, algorithm = "HS256", secret = "", key = ""):
    if algorithm == "none":
        return jwtencode_none(payload)
    if algorithm == "HS256":
        return jwtencode_hs256(payload, secret)
    if algorithm == "RS256":
        return jwtencode_rs256(payload, key)
    raise Exception("Algorithm not found.")

def jwtdecode(jwt, algorithms = ["HS256", "RS256"], secret = "", key = ""):
    try:
        header, payload, signature = jwt.split(".")
    except ValueError:
        raise Exception("Malformed JWT string!")

    decodedHeader = json.loads(base64.urlsafe_b64decode(pad(header)))
    if decodedHeader["typ"] != "JWT":
        raise Exception("Bad token type.")

    if decodedHeader["alg"] == "none" and "none" in algorithms:
        return jwtdecode_none(jwt)
    if decodedHeader["alg"] == "HS256" and "HS256" in algorithms:
        return jwtdecode_hs256(jwt, secret)
    if decodedHeader["alg"] == "RS256" and "RS256" in algorithms:
        return jwtdecode_rs256(jwt, key)
    raise Exception("Bad algorithm type: \"" + decodedHeader["alg"] + "\".")
