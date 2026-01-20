import argon2 from "argon2"

const hashPassword = async ( password : string ) => {
    try {
        const hash = await argon2.hash(password, {
            type : argon2.argon2id
        });
        return hash;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error;
    }
}

const verifyPassword = async ( password : string, hash : string ) => {
    try {
        const result = await argon2.verify(hash, password);
        return result;
    } catch (error) {
        console.error("Error verifying password:", error);
        return false;
    }
}

export { hashPassword, verifyPassword };