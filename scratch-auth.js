const { AuthError } = require("next-auth");

class CredentialsSignin extends AuthError {
    constructor(message) {
        super(message);
        this.type = "CredentialsSignin";
        this.name = "CredentialsSignin";
    }
}

const err = new CredentialsSignin();
console.log(err.name, err.message, err.type);
