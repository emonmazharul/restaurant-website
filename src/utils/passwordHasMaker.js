import bcrypt from "bcryptjs";

export function passwordHashMaker(newPassword) {
    const salt = bcrypt.genSaltSync(8);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    return passwordHash;
}

export function passwordChecker(givenPassword, passwordHash) {
    const isPasswordCorrect = bcrypt.compareSync(givenPassword, passwordHash);
    return isPasswordCorrect;
}