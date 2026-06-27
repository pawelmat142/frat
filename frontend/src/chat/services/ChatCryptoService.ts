import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';
import { httpClient } from 'global/services/http';

const E2E_PREFIX = 'e2e:';
const STORAGE_KEY_PRIVATE = 'chat_e2e_private_key';
const STORAGE_KEY_PUBLIC = 'chat_e2e_public_key';

export interface KeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}

const ChatCryptoService = {

    isE2EEnabled(): boolean {
        return process.env.REACT_APP_CHAT_E2E_ENABLED === 'true';
    },

    generateKeyPair(): KeyPair {
        return nacl.box.keyPair();
    },

    saveKeyPair(keyPair: KeyPair): void {
        localStorage.setItem(STORAGE_KEY_PRIVATE, encodeBase64(keyPair.secretKey));
        localStorage.setItem(STORAGE_KEY_PUBLIC, encodeBase64(keyPair.publicKey));
    },

    loadKeyPair(): KeyPair | null {
        const privB64 = localStorage.getItem(STORAGE_KEY_PRIVATE);
        const pubB64 = localStorage.getItem(STORAGE_KEY_PUBLIC);
        if (!privB64 || !pubB64) return null;
        return {
            secretKey: decodeBase64(privB64),
            publicKey: decodeBase64(pubB64),
        };
    },

    /**
     * Encrypts plaintext for the recipient.
     * Returns a string with the 'e2e:' prefix followed by base64(nonce + box).
     * The backend detects this prefix and stores a placeholder in latestMessageContent.
     */
    encrypt(plaintext: string, recipientPublicKey: Uint8Array, mySecretKey: Uint8Array): string {
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const message = decodeUTF8(plaintext);
        const box = nacl.box(message, nonce, recipientPublicKey, mySecretKey);

        const combined = new Uint8Array(nonce.length + box.length);
        combined.set(nonce);
        combined.set(box, nonce.length);

        return E2E_PREFIX + encodeBase64(combined);
    },

    /**
     * Decrypts an E2E-encrypted message content string.
     * Returns the plaintext string, or null if decryption fails (wrong key / corrupted data).
     * Callers must handle null gracefully — never render raw ciphertext.
     */
    decrypt(ciphertext: string, senderPublicKey: Uint8Array, mySecretKey: Uint8Array): string | null {
        try {
            if (!ciphertext.startsWith(E2E_PREFIX)) return null;

            const combined = decodeBase64(ciphertext.slice(E2E_PREFIX.length));
            const nonce = combined.slice(0, nacl.box.nonceLength);
            const box = combined.slice(nacl.box.nonceLength);

            const decrypted = nacl.box.open(box, nonce, senderPublicKey, mySecretKey);
            if (!decrypted) return null;

            return encodeUTF8(decrypted);
        } catch {
            return null;
        }
    },

    isE2EContent(content: string): boolean {
        return content?.startsWith(E2E_PREFIX) ?? false;
    },

    async publishPublicKey(publicKey: Uint8Array): Promise<void> {
        await httpClient.put('/chat/e2e/public-key', { publicKey: encodeBase64(publicKey) });
    },

    async getRecipientPublicKey(uid: string): Promise<Uint8Array | null> {
        const response = await httpClient.get<{ publicKey: string | null }>(`/chat/e2e/public-key/${uid}`);
        if (!response.publicKey) return null;
        return decodeBase64(response.publicKey);
    },
};

export default ChatCryptoService;
