import crypto from 'crypto';

const secretKeyHex = process.env.ENCRYPTION_KEY;
const secretKey = Buffer.from(secretKeyHex as string, 'hex');
const iv = crypto.randomBytes(16);

export function encrypt(text: string) {
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string) {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString();
}


