#! /bin/python
import secrets
bits = secrets.randbits(256)
bits_hex = hex(bits)
private_key = bits_hex[2:]
print(private_key)

